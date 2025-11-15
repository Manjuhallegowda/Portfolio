import achieveBackground from '@/assets/achive-background.jpg';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '@/hooks/useLoading';
import {
  Award,
  Briefcase,
  Globe,
  TrendingUp,
  Code,
  Users,
  Star,
  Target,
  Cloud,
  Palette,
  Settings,
  LucideIcon,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  items: string[];
  icon: string;
  category: string;
  order: number;
  isPublished: boolean;
}

interface SectionContent {
  title?: string;
  content?: string; // For the introductory paragraph
}

const iconMap: { [key: string]: LucideIcon } = {
  award: Award,
  briefcase: Briefcase,
  globe: Globe,
  'trending-up': TrendingUp,
  code: Code,
  users: Users,
  star: Star,
  target: Target,
  cloud: Cloud,
  palette: Palette,
  settings: Settings,
  // Add other icons as needed
};

const AchievementsSection = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchAchievementsAndSection = async () => {
      showLoading();
      try {
        // Fetch section content
        const sectionResponse = await fetch(
          'http://localhost:5000/api/sections/achievements-section'
        );
        if (!sectionResponse.ok) {
          throw new Error(`HTTP error! status: ${sectionResponse.status}`);
        }
        const sectionData = await sectionResponse.json();
        setSectionContent(sectionData);

        // Fetch achievements
        const achievementsResponse = await fetch(
          'http://localhost:5000/api/achievements'
        );
        if (!achievementsResponse.ok) {
          throw new Error(
            `HTTP error! status: ${achievementsResponse.status}`
          );
        }
        const achievementsData = await achievementsResponse.json();
        if (achievementsData.success) {
          setAchievements(achievementsData.data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        hideLoading();
      }
    };

    fetchAchievementsAndSection();
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  if (error) {
    return (
      <section className="py-20 relative bg-secondary flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  if (!sectionContent || !achievements) {
    return null; // Or a placeholder
  }

  return (
    <section
      className="py-20 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${achieveBackground})` }}
      ref={ref}
        >
          {/* Overlay to darken the background image and improve text readability */}
          <div className="absolute inset-0 bg-black opacity-70"></div>
    
          <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-6">
            {sectionContent?.title?.split(' ')[0] || 'Skills'}{' '}
            <span className="text-accent">
              {sectionContent?.title?.split(' ').slice(1).join(' ') ||
                '& Technologies'}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {sectionContent?.content ||
              'Modern tech stack and proven methodologies for building scalable digital products.'}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {achievements.map((achievement, cardIndex) => {
            const IconComponent =
              iconMap[achievement.icon as keyof typeof iconMap] || Award;
            return (
              <motion.div
                key={achievement.id}
                className="bg-background p-8 border border-border hover:border-accent transition-all duration-300 group hover-lift"
                variants={cardVariants}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="w-10 h-10 text-accent mb-6"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <IconComponent className="w-full h-full" />
                </motion.div>

                <motion.h3
                  className="text-xl font-bold mb-6 border-b border-border pb-4"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + cardIndex * 0.1 }}
                >
                  {achievement.title}
                </motion.h3>

                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.3 + cardIndex * 0.1,
                      },
                    },
                  }}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                >
                  {achievement.items.map((item, index) => (
                    <motion.span
                      key={index}
                      className="bg-accent/10 text-accent text-xs font-medium px-2.5 py-1 rounded-full"
                      variants={listItemVariants}
                    >
                      {item}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default AchievementsSection;
