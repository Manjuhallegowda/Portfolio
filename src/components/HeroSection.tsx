import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLoading } from '@/hooks/useLoading';
// import heroBackground from '@/assets/hero-background.jpg';

interface SectionMetadata {
  tagline?: string;
  [key: string]: any;
}

interface SectionContent {
  title?: string;
  subtitle?: string;
  content?: string;
  images?: { url: string; alt?: string }[];
  metadata?: SectionMetadata;
}

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sectionData, setSectionData] = useState<SectionContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -100]);

  useEffect(() => {
    setIsVisible(true);

    const fetchHeroSection = async () => {
      showLoading();
      try {
        const sectionResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sections/hero-section`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as SectionContent;
        setSectionData(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load hero section.';
        setError(message);
      } finally {
        hideLoading();
      }
    };

    fetchHeroSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <section className="relative min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (!sectionData) {
    return null;
  }

  const heroBackgroundUrl =
    sectionData.images && sectionData.images.length > 0
      ? sectionData.images[0].url
      : '/src/assets/hero.jpg'; // make sure this path or import exists

  const titleWords = sectionData.title?.trim().split(' ') || [];
  const firstWord = titleWords[0] || 'Building';
  const restWords =
    titleWords.length > 1 ? titleWords.slice(1).join(' ') : 'Digital Products';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax Background Image */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url(${heroBackgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark + luxury gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-background/95 to-background" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.4)_1px,transparent_1px)] bg-[size:120px_120px]" />
        </div>
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 pt-28 pb-16">
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Tagline / pill */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="inline-flex items-center gap-3 rounded-full border border-accent/40 bg-black/40 px-4 py-2 backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-100">
                  {sectionData.metadata?.tagline ||
                    'Startup Founder · Full-Stack Engineer'}
                </span>
              </motion.div>

              <motion.div
                className="h-[2px] bg-gradient-to-r from-accent via-amber-400 to-transparent mt-4 mx-auto w-24"
                initial={{ scaleX: 0 }}
                animate={isVisible ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </motion.div>

            {/* Main heading */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.span
                className="block text-white"
                initial={{ opacity: 0, x: -40 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 1.0 }}
              >
                {firstWord}
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-accent via-amber-400 to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, x: 40 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 1.2 }}
              >
                {restWords}
              </motion.span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="text-lg md:text-xl text-slate-200/90 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              {sectionData.content ||
                'From concept to deployment, I craft high-performance web apps, Android experiences, and SEO-optimized sites that drive measurable results.'}
            </motion.p>
          </motion.div>

          {/* Floating accent dots */}
          <motion.div
            className="absolute top-1/4 left-6 w-2 h-2 bg-accent rounded-full opacity-60"
            animate={{
              y: [0, -20, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-1/3 right-12 w-1 h-1 bg-accent rounded-full opacity-40"
            animate={{
              y: [0, -15, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-16 w-3 h-3 bg-accent rounded-full opacity-30"
            animate={{
              y: [0, -25, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
