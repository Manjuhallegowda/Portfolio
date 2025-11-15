import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '@/hooks/useLoading';

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: string;
  images?: { public_id: string; url: string; alt: string }[];
  featuredImage?: { public_id: string; url: string; alt: string };
  demoUrl?: string;
  sourceUrl?: string;
  status: string;
  isFeatured: boolean;
  order: number;
  isPublished?: boolean; // Assuming this field exists based on backend routes
  metrics?: string; // Custom field for metrics
}

interface SectionContent {
  title?: string;
  content?: string; // For the introductory paragraph
}

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [visibleProjectsCount, setVisibleProjectsCount] = useState(3); // Initial number of projects to show
  const [totalProjects, setTotalProjects] = useState(0);
  const { showLoading, hideLoading } = useLoading();

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchProjectsAndSection = async () => {
      showLoading();
      try {
        // Fetch section content
        const sectionResponse = await fetch(
          'http://localhost:5000/api/sections/projects-section'
        );
        if (!sectionResponse.ok) {
          throw new Error(`HTTP error! status: ${sectionResponse.status}`);
        }
        const sectionData = await sectionResponse.json();
        setSectionContent(sectionData);

        // Fetch projects
        const projectsResponse = await fetch(
          `http://localhost:5000/api/projects?limit=${visibleProjectsCount}`
        );
        if (!projectsResponse.ok) {
          throw new Error(`HTTP error! status: ${projectsResponse.status}`);
        }
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.data);
        setTotalProjects(projectsData.pagination.total);
      } catch (err: any) {
        setError(err.message);
      } finally {
        hideLoading();
      }
    };

    fetchProjectsAndSection();
  }, [visibleProjectsCount]); // Refetch when visibleProjectsCount changes

  const showMoreProjects = () => {
    setVisibleProjectsCount((prevCount) => prevCount + 3); // Load 3 more projects
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  if (error) {
    return (
      <section className="py-20 relative flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  if (!sectionContent || !projects) {
    return null; // Or a placeholder
  }

  return (
    <section className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-6">
            {sectionContent?.title?.split(' ')[0] || 'Featured'}{' '}
            <span className="text-accent">
              {sectionContent?.title?.split(' ').slice(1).join(' ') ||
                'Projects'}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {sectionContent?.content ||
              'Real-world applications and successful campaigns - from MVPs to production-ready platforms serving thousands of users.'}
          </p>
        </motion.div>

        <div className="space-y-16">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="grid lg:grid-cols-2 gap-8 items-center"
              variants={itemVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div
                className={`lg:order-${
                  index % 2 === 0 ? '1' : '2'
                } relative group`}
              >
                <div className="absolute -inset-0.5 bg-gradient-gold rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                {project.featuredImage ? (
                  <img
                    src={project.featuredImage.url}
                    alt={project.featuredImage.alt || project.title}
                    className="rounded-lg shadow-lg w-full h-auto object-cover relative"
                  />
                ) : (
                  <div className="rounded-lg shadow-lg w-full h-64 bg-secondary flex items-center justify-center relative">
                    <span className="text-muted-foreground">
                      No Image Available
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`lg:order-${
                  index % 2 === 0 ? '2' : '1'
                } flex flex-col`}
              >
                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 mb-4 self-start">
                  {project.category}
                </span>
                <h3 className="text-3xl font-bold mb-4">{project.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(project.technologies || []).map((tech, techIndex) => (
                    <span
                      key={`${tech}-${techIndex}`}
                      className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground border border-border"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 pt-4 border-t border-border">
                  {project.demoUrl && (
                    <Button
                      key={`${project.id}-demo-button`}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      asChild
                    >
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {project.sourceUrl && (
                    <Button
                      key={`${project.id}-source-button`}
                      variant="outline"
                      size="sm"
                      className="border-border hover:border-accent hover:text-accent"
                      asChild
                    >
                      <a
                        href={project.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        {projects.length < totalProjects && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground glow-on-hover"
                onClick={showMoreProjects}
              >
                View More Projects
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Background Accent */}
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
};

export default ProjectsSection; // Added comment to force re-evaluation
