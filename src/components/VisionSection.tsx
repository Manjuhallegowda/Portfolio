import React, { useEffect, useState } from 'react';
import {
  motion,
  useAnimation,
  useMotionTemplate,
  useMotionValue,
  type Variants,
} from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Mail,
  Linkedin,
  GithubIcon,
  Twitter,
  Instagram,
  type LucideIcon,
} from 'lucide-react';
import fallbackImage from '@/assets/image.png';

interface SectionContent {
  title?: string;
  content?: string;
  images?: { url: string; alt?: string }[];
  links?: { text: string; url: string; target?: '_self' | '_blank' }[];
  metadata?: {
    projectsCount?: number;
    codeCount?: number;
    startupsCount?: number;
    companyName?: string;
    companyUrl?: string;
  };
}

interface VisionSectionProps {
  sectionData: SectionContent | null;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const VisionSection: React.FC<VisionSectionProps> = ({ sectionData }) => {
  const [counters, setCounters] = useState({
    projects: 0,
    code: 0,
    startups: 0,
  });

  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const controls = useAnimation();

  // Subtle glowing cursor-follow highlight
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(600px at ${cursorX}px ${cursorY}px, rgba(250, 204, 21, 0.18), transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  useEffect(() => {
    if (!inView || !sectionData) return;

    controls.start('visible');

    const targets = {
      projects: sectionData.metadata?.projectsCount ?? 0,
      code: sectionData.metadata?.codeCount ?? 0,
      startups: sectionData.metadata?.startupsCount ?? 0,
    };

    const duration = 1200; // ms
    const start = performance.now();

    let frameId: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);

      setCounters({
        projects: Math.floor(targets.projects * progress),
        code: Math.floor(targets.code * progress),
        startups: Math.floor(targets.startups * progress),
      });

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [inView, controls, sectionData]);

  const formatStat = (n: number): string => {
    const num = Math.floor(n);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 10000) {
      return `${Math.floor(num / 1000)}k`;
    }
    return num.toLocaleString();
  };

  if (!sectionData) return null;

  const quoteImageUrl =
    sectionData?.images && sectionData.images.length > 0
      ? sectionData.images[0].url
      : fallbackImage;
  const companyName =
    sectionData?.metadata?.companyName || 'RanStack Solutions';
  const companyUrl =
    sectionData?.metadata?.companyUrl || 'http://www.ranstacksolutions.com';

  const renderContent = () => {
    if (!sectionData?.content) {
      return (
        <>
          {`As a founder who codes, I bridge the gap between vision and execution. At my company `}
          <motion.a
            href={companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-semibold"
            whileHover={{ scale: 1.05 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
            }}
          >
            {companyName}
          </motion.a>
          {`, I don't just manage development — I build it. From first prototype to production launches, I'm hands-on in creating products that solve real problems and drive measurable growth.`}
        </>
      );
    }

    if (sectionData.content.includes('RanStack Solutions')) {
      const [before, after] = sectionData.content.split('RanStack Solutions');
      return (
        <>
          {before}
          <motion.a
            href={companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-semibold"
            whileHover={{ scale: 1.05 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
            }}
          >
            {companyName}
          </motion.a>
          {after}
        </>
      );
    }

    return sectionData.content;
  };

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-20 bg-gradient-to-b from-background via-background/95 to-background overflow-x-hidden overflow-y-visible"
      onMouseMove={handleMouseMove}
    >
      {/* Background layers wrapped so they never cause side-scroll */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute inset-0 opacity-70"
          style={{ backgroundImage: spotlight }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background/30" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-accent/10 to-transparent" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#ffffff20,_transparent_55%),_linear-gradient(90deg,_rgba(255,255,255,0.08)_1px,_transparent_1px),_linear-gradient(180deg,_rgba(255,255,255,0.08)_1px,_transparent_1px)] bg-[length:100%_100%,120px_120px,120px_120px]" />
        </div>
      </div>

      {/* Content container – responsive, centered, no horizontal overflow */}
      <motion.div
        className="relative z-10 container mx-auto px-6"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Narrative */}
          <motion.div
            className="lg:col-span-7 space-y-8"
            variants={itemVariants}
          >
            {/* Eyebrow + pill row */}
            <div className="flex flex-wrap items-center gap-3">
              <motion.span
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 px-4 py-1 text-xs font-medium tracking-[0.18em] uppercase text-accent"
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Vision & Craft
              </motion.span>

              <motion.span
                className="text-xs text-muted-foreground/80 backdrop-blur-sm border border-border/60 rounded-full px-3 py-1"
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                Founder-led · Product-minded · Code-first
              </motion.span>
            </div>

            {/* Heading / main card */}
            <motion.div className="space-y-7" variants={itemVariants}>
              <motion.div
                className="relative w-full max-w-2xl mr-auto rounded-[2.5rem] border border-border/70 bg-gradient-to-br from-background/90 via-background/70 to-background/60 backdrop-blur-xl p-8 sm:p-10 shadow-xl shadow-black/20"
                initial={{ opacity: 0, x: -40, scale: 0.96 }}
                animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.25,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Glow shadow */}
                <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-accent/30 via-amber-400/20 to-transparent blur-2xl opacity-60" />

                <div className="relative rounded-[2rem] border border-border/70 bg-gradient-to-br from-background/90 via-background/70 to-background/60 backdrop-blur-xl p-6 sm:p-7 shadow-xl shadow-black/20">
                  {/* Avatar + text + Social icons */}
                  <div className="mb-5 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                    {/* IMAGE */}
                    <div className="relative flex h-50 w-40 items-center justify-center overflow-hidden rounded-2xl bg-accent/10">
                      <img
                        src={quoteImageUrl}
                        alt={sectionData?.images?.[0]?.alt || 'Vision'}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-accent/20" />
                    </div>

                    {/* TEXT AREA */}
                    <div className="flex-1 flex-col pt-1">
                      {/* Product Title + Icons Row */}
                      <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-between">
                        <div>
                          <div className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
                            Product Philosophy
                          </div>
                          <div className="text-sm font-semibold text-foreground">
                            From 0 → 1 → Scale
                          </div>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 pl-4 sm:ml-auto">
                          <a
                            href="https://twitter.com"
                            target="_blank"
                            className="hover:text-foreground text-muted-foreground"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                          <a
                            href="https://linkedin.com"
                            target="_blank"
                            className="hover:text-foreground text-muted-foreground"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                          <a
                            href="https://github.com"
                            target="_blank"
                            className="hover:text-foreground text-muted-foreground"
                          >
                            <GithubIcon className="h-5 w-5" />
                          </a>
                        </div>
                      </div>

                      {/* Center Quote */}
                      <p className="mt-4 text-center mx-auto max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed italic whitespace-pre-wrap">
                        {sectionData?.title ? (
                          <>“{sectionData.title}”</>
                        ) : (
                          <>
                            “Great products aren&apos;t{' '}
                            <span className="bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">
                              assembled
                            </span>
                            —they&apos;re{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-accent bg-clip-text text-transparent">
                              engineered
                            </span>{' '}
                            through code, strategy & relentless iteration.”
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      <span>Hands-on founder in every release cycle</span>
                    </div>

                    <a
                      href={companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Visit {companyName} ↗
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="h-1.5 w-28 rounded-full bg-gradient-to-r from-accent via-amber-400 to-transparent"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.25 }}
              />
            </motion.div>
          </motion.div>

          {/* Right: Visual + Stats stack */}
          <motion.div
            className="lg:col-span-5 relative"
            variants={itemVariants}
          >
            {/* Founder badge */}
            <motion.div
              className="flex items-center gap-4 pt-4 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              <div className="h-10 w-10 rounded-2xl bg-accent/10 border border-accent/40 flex items-center justify-center text-lg">
                ⚙️
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold tracking-wide uppercase text-foreground/80">
                  Founder • Builder • Engineer
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping production-grade products, not just prototypes.
                </p>
              </div>
            </motion.div>

            {/* Content */}
            <motion.p
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-4 sm:mb-6 whitespace-pre-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              {renderContent()}
            </motion.p>

            {/* Links as chips / CTA row */}
            {sectionData?.links && sectionData.links.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                {sectionData.links.map((link, idx) => (
                  <motion.a
                    key={idx}
                    href={link.url}
                    target={link.target || '_blank'}
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-xs sm:text-sm text-foreground/90 hover:border-accent/60 hover:bg-accent/5 transition-colors"
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{link.text}</span>
                    <span className="text-accent group-hover:translate-x-0.5 transition-transform">
                      ↗
                    </span>
                  </motion.a>
                ))}
              </motion.div>
            )}

            {/* Stats cards cluster */}
            <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-5">
              {/* Projects */}
              <motion.div
                className="col-span-1 rounded-2xl border border-border/60 bg-background/70 backdrop-blur-md px-4 py-4 sm:py-5 shadow-md shadow-black/10"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                  Projects
                </div>
                <div className="flex items-baseline gap-1">
                  <motion.span
                    className="text-2xl sm:text-3xl font-bold text-accent"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.35, type: 'spring' }}
                  >
                    {formatStat(counters.projects)}+
                  </motion.span>
                </div>
                <p className="mt-2 text-[0.7rem] text-muted-foreground leading-snug">
                  Designed, built & shipped across SaaS, internal tools & growth
                  experiments.
                </p>
              </motion.div>

              {/* Code */}
              <motion.div
                className="col-span-1 rounded-2xl border border-border/60 bg-gradient-to-br from-accent/10 via-background/80 to-background/60 backdrop-blur-md px-4 py-4 sm:py-5 shadow-lg shadow-black/15"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                  Lines of Code
                </div>
                <div className="flex items-baseline gap-1">
                  <motion.span
                    className="text-2xl sm:text-3xl font-bold text-accent"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.45, type: 'spring' }}
                  >
                    {formatStat(counters.code)}+
                  </motion.span>
                </div>
                <p className="mt-2 text-[0.7rem] text-muted-foreground leading-snug">
                  Full-stack ownership: architecture, APIs, frontends &
                  deployment.
                </p>
              </motion.div>

              {/* Startups */}
              <motion.div
                className="col-span-1 rounded-2xl border border-border/60 bg-background/80 backdrop-blur-md px-4 py-4 sm:py-5 shadow-md shadow-black/10"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                  Startups
                </div>
                <div className="flex items-baseline gap-1">
                  <motion.span
                    className="text-2xl sm:text-3xl font-bold text-accent"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.55, type: 'spring' }}
                  >
                    {formatStat(counters.startups)}+
                  </motion.span>
                </div>
                <p className="mt-2 text-[0.7rem] text-muted-foreground leading-snug">
                  Founder experience that informs every product & technical
                  decision.
                </p>
              </motion.div>
            </div>

            {/* Timeline strip / tag */}
            <motion.div
              className="mt-6 flex flex-wrap items-center justify-end gap-3 text-[0.7rem]"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-background/70 border border-border/80 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Shipping fast without breaking trust.
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-background/70 border border-border/80 px-3 py-1">
                <span className="font-mono">
                  TypeScript · React · Node · Cloud
                </span>
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default VisionSection;
