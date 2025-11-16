import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
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
  type LucideIcon,
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
  content?: string;
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
};

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.15,
      duration: 0.4,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const chipVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const AchievementsSection = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      showLoading();
      try {
        const sectionResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sections/achievements-section`
        );
        if (!sectionResponse.ok) throw new Error('Failed fetching section');
        setSectionContent(await sectionResponse.json());

        const dataResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/achievements`
        );
        const achievementsData = await dataResponse.json();
        if (achievementsData.success)
          setAchievements(
            achievementsData.data.sort(
              (a: Achievement, b: Achievement) => a.order - b.order
            )
          );
      } catch (err: any) {
        setError(err.message);
      } finally {
        hideLoading();
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <section className="py-20 flex justify-center">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (!sectionContent) return null;

  const [first, ...rest] = sectionContent.title?.split(' ') || [
    'Skills',
    'Stack',
  ];

  return (
    <section ref={ref} className="py-20 md:py-24 relative bg-muted/30">
      {/* Soft subtle gradient top accent */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent/10 to-transparent" />

      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.17em] px-4 py-1 border border-border rounded-full text-muted-foreground mb-3">
            <span className="w-2 h-2 bg-accent rounded-full" />
            Achievements
          </span>

          <h2 className="text-4xl font-bold mb-3">
            {first}{' '}
            <span className="text-accent">
              {rest.join(' ') || ' & Experience'}
            </span>
          </h2>

          <p className="text-muted-foreground text-lg">
            {sectionContent.content ||
              'A record of shipped products, proven skills, and modern tooling.'}
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {achievements.map((item, index) => {
            const Icon = iconMap[item.icon] || Award;

            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="group p-6 rounded-2xl border border-border bg-card backdrop-blur-md shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-xs text-muted-foreground tracking-wide uppercase">
                      {item.category}
                    </p>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                    {item.description}
                  </p>
                )}

                <motion.div
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.07,
                        delayChildren: 0.2 + index * 0.05,
                      },
                    },
                  }}
                  className="flex flex-wrap gap-2"
                >
                  {item.items.map((chip, i) => (
                    <motion.span
                      key={i}
                      variants={chipVariants}
                      className="px-2.5 py-1 text-xs rounded-full bg-accent/10 text-accent border border-accent/20"
                    >
                      {chip}
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
