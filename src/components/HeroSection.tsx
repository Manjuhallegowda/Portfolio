import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLoading } from '@/hooks/useLoading';
// import heroBackground from '@/assets/hero-background.jpg'; // Will be fetched from CMS

interface SectionContent {
  title?: string;
  subtitle?: string;
  content?: string;
  images?: { url: string; alt?: string }[];
  metadata?: Record<string, any>;
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
        const response = await fetch(
          'http://localhost:5000/api/sections/hero-section'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSectionData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        hideLoading();
      }
    };

    fetchHeroSection();
  }, []);

  if (error) {
    return (
      <section className="relative min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  if (!sectionData) {
    return null; // Or a placeholder
  }

  const heroBackgroundUrl =
    sectionData?.images && sectionData.images.length > 0
      ? sectionData.images[0].url
      : '/src/assets/hero-background.jpg'; // Fallback to local asset

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax Background Image */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBackgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y,
        }}
      >
        <div className="absolute inset-0 bg-background/90" />
      </motion.div>

      {/* Diagonal Accent 
      <motion.div
        className="absolute top-0 right-0 w-1/3 h-full bg-gradient-gold opacity-10"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />*/}

      <div className="container mx-auto px-6 relative z-10 pt-28">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="inline-block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <span className="text-accent font-semibold tracking-wider uppercase text-sm">
                  {sectionData?.metadata?.tagline ||
                    'Startup Founder & Full-Stack Developer'}
                </span>
                <motion.div
                  className="h-0.5 bg-gradient-gold mt-2 mx-auto"
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: '100%' } : {}}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </motion.div>

              <motion.h1
                className="text-6xl lg:text-8xl font-bold leading-none"
                initial={{ opacity: 0, y: 50 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.span
                  className="block"
                  initial={{ opacity: 0, x: -50 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 1.0 }}
                >
                  {sectionData?.title?.split(' ')[0] || 'Building'}
                </motion.span>
                <motion.span
                  className="block text-accent"
                  initial={{ opacity: 0, x: 50 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  {sectionData?.title?.split(' ').slice(1).join(' ') ||
                    'Digital Products'}
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                {sectionData?.content ||
                  'From concept to deployment - I craft high-performance web apps, Android applications, and SEO-optimized websites that drive real business results.'}
              </motion.p>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              className="absolute top-1/4 left-10 w-2 h-2 bg-accent rounded-full opacity-60"
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
              className="absolute top-1/3 right-16 w-1 h-1 bg-accent rounded-full opacity-40"
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
              className="absolute bottom-1/4 left-20 w-3 h-3 bg-accent rounded-full opacity-30"
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
