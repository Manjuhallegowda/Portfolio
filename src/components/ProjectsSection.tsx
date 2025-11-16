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
  images?: string[];
  featured_image_url?: string;
  demo_url?: string;
  github_url?: string;
  status: string;
  isFeatured: boolean;
  order: number;
  isPublished?: boolean;
  metrics?: string;
}

interface SectionContent {
  title?: string;
  content?: string;
}

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [visibleProjectsCount, setVisibleProjectsCount] = useState(3);
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
          `${import.meta.env.VITE_API_URL}/api/sections/projects-section`
        );
        if (!sectionResponse.ok) {
          throw new Error(`HTTP error! status: ${sectionResponse.status}`);
        }
        const sectionData = await sectionResponse.json();
        setSectionContent(sectionData);

        // Fetch projects
        const projectsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/projects?limit=${visibleProjectsCount}`
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
  }, [visibleProjectsCount]);

  const showMoreProjects = () => {
    setVisibleProjectsCount((prevCount) => prevCount + 3);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
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
    return null;
  }

  const titleParts = sectionContent.title?.split(' ') || [];
  const firstWord = titleParts[0] || 'Featured';
  const restWords =
    titleParts.length > 1 ? titleParts.slice(1).join(' ') : 'Projects';

  return (
    <section
      className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background"
      ref={ref}
    >
      {/* subtle luxury background accents */}
      <div className="pointer-events-none absolute -top-32 -right-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.25)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Selected Work
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {firstWord}{' '}
            <span className="bg-gradient-to-r from-accent via-amber-400 to-accent bg-clip-text text-transparent">
              {restWords}
            </span>
          </h2>

          <div className="mx-auto h-[2px] w-24 rounded-full bg-gradient-to-r from-accent via-amber-400 to-transparent mb-5" />

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {sectionContent.content ||
              'Real-world applications and successful campaigns — from MVPs to production-ready platforms serving thousands of users.'}
          </p>
        </motion.div>

        {/* Projects list */}
        <motion.div
          className="space-y-16"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="relative"
              variants={itemVariants}
            >
              <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 md:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.6)]">
                {/* subtle gradient border glow */}
                <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 md:group-hover:opacity-100" />

                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Image side */}
                  <div
                    className={`relative group ${
                      index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-accent/40 via-amber-400/30 to-transparent blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
                    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/60">
                      {project.featured_image_url ? (
                        <img
                          src={project.featured_image_url}
                          alt={project.title}
                          className="w-full h-[320px] md:h-[360px] object-cover"
                        />
                      ) : (
                        <div className="w-full h-[320px] md:h-[360px] flex items-center justify-center bg-secondary text-muted-foreground">
                          No Image Available
                        </div>
                      )}

                      {/* category & status chip */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-amber-200 border border-amber-300/40">
                          {project.category}
                        </span>
                        {project.status && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-slate-200 border border-slate-500/60">
                            {project.status}
                          </span>
                        )}
                      </div>

                      {/* metrics tag if present */}
                      {project.metrics && (
                        <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-[0.7rem] text-amber-200 border border-amber-300/40">
                          {project.metrics}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text side */}
                  <div
                    className={`flex flex-col ${
                      index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {project.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent border border-accent/40">
                          Featured
                        </span>
                      )}
                      {project.isPublished && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-emerald-400 border border-emerald-400/40">
                          Live
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-semibold mb-4 tracking-tight">
                      {project.title}
                    </h3>

                    <p className="text-muted-foreground mb-5 leading-relaxed whitespace-pre-wrap">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(project.technologies || []).map((tech, techIndex) => (
                        <span
                          key={`${tech}-${techIndex}`}
                          className="text-[0.72rem] bg-background/80 px-3 py-1 rounded-full text-muted-foreground border border-border/80 uppercase tracking-[0.12em]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border/70">
                      {project.demo_url && (
                        <Button
                          key={`${project.id}-demo-button`}
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[150px] border-accent/70 text-accent hover:bg-accent hover:text-accent-foreground"
                          asChild
                        >
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                      {project.github_url && (
                        <Button
                          key={`${project.id}-source-button`}
                          variant="outline"
                          size="sm"
                          className="border-border/80 hover:border-accent/70 hover:text-accent"
                          asChild
                        >
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="w-4 h-4 mr-2" />
                            GitHub
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More Button */}
        {projects.length < totalProjects && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/70 text-accent hover:bg-accent hover:text-accent-foreground px-8 rounded-full"
                onClick={showMoreProjects}
              >
                View More Projects
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
