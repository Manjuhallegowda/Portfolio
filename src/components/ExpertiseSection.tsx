import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '@/hooks/useLoading';
import { Globe, Smartphone, TrendingUp, Code, LucideIcon } from 'lucide-react';

// Map string icon names to LucideIcon components
const iconMap: { [key: string]: LucideIcon } = {
  Globe: Globe,
  Smartphone: Smartphone,
  TrendingUp: TrendingUp,
  Code: Code,
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

const ExpertiseSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
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
        const data = await response.json();
        setSectionData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        hideLoading();
      }
    };

    fetchExpertiseSection();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  if (error) {
    return (
      <section className="py-20 relative overflow-hidden flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  if (!sectionData) {
    return null; // Or a placeholder
  }

  const expertiseAreas = sectionData?.metadata?.expertiseAreas || [];

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Diagonal Background */}
      <motion.div
        className="absolute inset-0 bg-secondary transform -skew-y-3 scale-110"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-6">
            {sectionData?.title ? (
              (() => {
                const words = sectionData.title.split(' ');
                const lastWord = words.pop();
                return (
                  <>
                    {words.join(' ')}
                    {words.length > 0 ? ' ' : ''}
                    <span className="text-accent">{lastWord}</span>
                  </>
                );
              })()
            ) : (
              <>
                Technical <span className="text-accent">Expertise</span>
              </>
            )}
          </h2>
          <p className="text-xl text-muted-foreground">
            {sectionData?.content ||
              'From ideation to deployment, I handle every aspect of building digital products that scale and perform.'}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {expertiseAreas.map((area, index) => {
            const IconComponent = iconMap[area.iconName];
            return (
              <motion.div
                key={area.title}
                className="group relative bg-card p-8 border border-border hover:border-accent transition-all duration-300 hover-lift"
                variants={cardVariants}
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Gold accent bar */}
                <motion.div
                  className="absolute top-0 left-0 w-1 h-0 bg-gradient-gold group-hover:h-full transition-all duration-500"
                  initial={{ height: 0 }}
                  whileHover={{ height: '100%' }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className="w-12 h-12 text-accent mb-6"
                  whileHover={{
                    scale: 1.2,
                    rotate: 10,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  {IconComponent && <IconComponent className="w-full h-full" />}
                </motion.div>

                <motion.h3
                  className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  {area.title}
                </motion.h3>

                <motion.p
                  className="text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  {area.description}
                </motion.p>

                {/* Corner accent */}
                <motion.div
                  className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute bottom-0 right-0 w-full h-0.5 bg-accent"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute bottom-0 right-0 w-0.5 h-full bg-accent"
                    initial={{ height: 0 }}
                    whileHover={{ height: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
