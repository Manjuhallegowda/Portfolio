import React, { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '@/hooks/useLoading';
import {
  Globe,
  Smartphone,
  TrendingUp,
  Code,
  type LucideIcon,
} from 'lucide-react';

// Map string icon names to LucideIcon components
const iconMap: { [key: string]: LucideIcon } = {
  Globe,
  Smartphone,
  TrendingUp,
  Code,
  // Add other icons as needed
};

interface ExpertiseArea {
  iconName: string; // Store icon name as string
  title: string;
  description: string;
}

interface SectionContent {
  title?: string;
  content?: string; // For the introductory paragraph
  metadata?: {
    expertiseAreas?: ExpertiseArea[];
  };
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      when: 'beforeChildren',
      staggerChildren: 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const ExpertiseSection: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: true,
  });

  const [sectionData, setSectionData] = useState<SectionContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const fetchExpertiseSection = async () => {
      showLoading();
      try {
        const response = await fetch(
          'http://localhost:5000/api/sections/expertise-section'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as SectionContent;
        setSectionData(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load expertise section.';
        setError(message);
      } finally {
        hideLoading();
      }
    };

    fetchExpertiseSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <section className="py-20 relative overflow-hidden flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  if (!sectionData) {
    return null; // You could render a skeleton loader here if you want
  }

  const expertiseAreas = sectionData.metadata?.expertiseAreas || [];

  const renderTitle = () => {
    if (!sectionData.title) {
      return (
        <>
          Technical <span className="text-accent">Expertise</span>
        </>
      );
    }

    const words = sectionData.title.split(' ');
    const lastWord = words.pop();
    return (
      <>
        {words.join(' ')}
        {words.length > 0 ? ' ' : ''}
        <span className="text-accent">{lastWord}</span>
      </>
    );
  };

  return (
    <section className="relative py-20 md:py-24 overflow-hidden" ref={ref}>
      {/* Background angled band */}
      <motion.div
        className="absolute inset-0 bg-secondary/60 -skew-y-3 origin-top"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Subtle grid + glow */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#ffffff25,_transparent_55%),_linear-gradient(90deg,_rgba(255,255,255,0.12)_1px,_transparent_1px),_linear-gradient(180deg,_rgba(255,255,255,0.12)_1px,_transparent_1px)] bg-[length:100%_100%,140px_140px,140px_140px]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/70 to-transparent" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1 text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-accent mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Core Capabilities
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            {renderTitle()}
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {sectionData.content ||
              'From ideation to deployment, I handle every aspect of building digital products that scale, perform, and feel crafted rather than cobbled together.'}
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {expertiseAreas.length === 0 && (
            <motion.div
              variants={cardVariants}
              className="md:col-span-2 lg:col-span-3 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md p-8 text-center"
            >
              <p className="text-muted-foreground">
                Expertise areas will appear here once configured in your CMS.
              </p>
            </motion.div>
          )}

          {expertiseAreas.map((area, index) => {
            const IconComponent = iconMap[area.iconName];

            return (
              <motion.div
                key={`${area.title}-${index}`}
                className="group relative rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-7 shadow-[0_18px_45px_rgba(15,23,42,0.35)] hover:shadow-[0_22px_60px_rgba(15,23,42,0.55)] transition-shadow duration-300"
                variants={cardVariants}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
              >
                {/* Glow border */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-full w-full rounded-2xl bg-gradient-to-br from-accent/40 via-amber-400/25 to-transparent blur-2xl" />
                </div>

                {/* Gold accent strip */}
                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-60" />

                <div className="relative">
                  {/* Icon + label */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 border border-accent/40 group-hover:bg-accent/15 transition-colors">
                      {IconComponent && (
                        <IconComponent className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Expertise Area
                      </span>
                      <h3 className="text-lg sm:text-xl font-semibold group-hover:text-accent transition-colors">
                        {area.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-[0.95rem] text-muted-foreground leading-relaxed mb-5 whitespace-pre-wrap">
                    {area.description}
                  </p>

                  {/* Footer microcopy */}
                  <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground/80">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Battle-tested in real products</span>
                    </span>
                    <span className="font-mono opacity-80">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Corner accent */}
                <div className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 right-4 h-px w-10 bg-accent/80" />
                  <div className="absolute bottom-4 right-0 h-10 w-px bg-accent/80" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
