import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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

  useEffect(() => {
    if (inView && sectionData) {
      controls.start('visible');

      const animateCounter = (target: number, key: keyof typeof counters) => {
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setCounters((prev) => ({ ...prev, [key]: Math.floor(current) }));
        }, 16);
      };

      setTimeout(() => {
        animateCounter(sectionData.metadata?.projectsCount || 0, 'projects');
        animateCounter(sectionData.metadata?.codeCount || 0, 'code');
        animateCounter(sectionData.metadata?.startupsCount || 0, 'startups');
      }, 500);
    }
  }, [inView, controls, sectionData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  if (!sectionData) {
    return null; // Or a placeholder
  }

  const quoteImageUrl =
    sectionData?.images && sectionData.images.length > 0
      ? sectionData.images[0].url
      : '/src/assets/image.png'; // Fallback to local asset

  const companyName =
    sectionData?.metadata?.companyName || 'RanStack Solutions';
  const companyUrl =
    sectionData?.metadata?.companyUrl || 'http://www.ranstacksolutions.com';

  return (
    <section className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          className="grid lg:grid-cols-5 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Large Quote Mark / Illustration */}
          <motion.div
            className="lg:col-span-2 flex items-center justify-center"
            variants={itemVariants}
          >
            <motion.img
              src={quoteImageUrl}
              alt={sectionData?.images?.[0]?.alt || 'quote'}
              className="w-48 sm:w-64 md:w-72 lg:w-80 xl:w-[26rem] object-contain mx-auto transform lg:-translate-y-18 xl:-translate-y-18"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ duration: 1, delay: 0.2 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            />
          </motion.div>

          {/* Vision Statement */}
          <motion.div
            className="lg:col-span-3 space-y-8"
            variants={itemVariants}
          >
            <motion.div className="space-y-6" variants={itemVariants}>
              <motion.h2
                className="text-4xl lg:text-5xl font-bold leading-tight"
                initial={{ opacity: 0, x: -50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {sectionData?.title ||
                  "Great products aren't built in isolation they're crafted through code, strategy, and relentless iteration."}
              </motion.h2>

              <motion.div
                className="w-24 h-1 bg-gradient-gold"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
              />

              <motion.p
                className="text-xl text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {sectionData?.content ? (
                  sectionData.content.includes('RanStack Solutions') ? (
                    <>
                      {sectionData.content.split('RanStack Solutions')[0]}
                      <motion.a
                        href={companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                        whileHover={{ scale: 1.05 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        {companyName}
                      </motion.a>
                      {sectionData.content.split('RanStack Solutions')[1]}
                    </>
                  ) : (
                    sectionData.content
                  )
                ) : (
                  <>
                    {`As a founder who codes, I bridge the gap between vision and
                execution. At my company `}
                    <motion.a
                      href={companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      {companyName}
                    </motion.a>
                    {`, I don't just manage development I build it. From writing the
                first line of code to deploying at scale, I'm hands-on in
                creating products that solve real problems and drive measurable
                growth.`}
                  </>
                )}
              </motion.p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 pt-6"
              variants={itemVariants}
            >
              <motion.div
                className="space-y-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <motion.div
                  className="text-4xl font-bold text-accent"
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.0, type: 'spring' }}
                >
                  {counters.projects}+
                </motion.div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  Projects Delivered
                </div>
              </motion.div>
              <motion.div
                className="space-y-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <motion.div
                  className="text-4xl font-bold text-accent"
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.2, type: 'spring' }}
                >
                  {counters.code.toLocaleString()}+
                </motion.div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  Lines of Code
                </div>
              </motion.div>
              <motion.div
                className="space-y-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <motion.div
                  className="text-4xl font-bold text-accent"
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.4, type: 'spring' }}
                >
                  {counters.startups}+
                </motion.div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  Startups Founded
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Geometric Accent */}
      <motion.div
        className="absolute top-1/2 left-0 w-64 h-64 bg-accent/5 transform -translate-y-1/2 -translate-x-1/2 rotate-45"
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 0.1, scale: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
    </section>
  );
};

export default VisionSection;
