import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '@/hooks/useLoading';

import { Blog } from '@/interfaces/Blog';

interface SectionContent {
  title?: string;
  content?: string;
}

const BlogsSection = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [hasMore, setHasMore] = useState(true);
  const { isLoading, showLoading, hideLoading } = useLoading();

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchBlogsAndSection = async () => {
      showLoading();
      try {
        // Fetch section content
        const sectionResponse = await fetch(
          'http://localhost:5000/api/sections/blogs-section'
        );
        if (!sectionResponse.ok) {
          throw new Error(`HTTP error! status: ${sectionResponse.status}`);
        }
        const sectionData = (await sectionResponse.json()) as SectionContent;
        setSectionContent(sectionData);

        // Fetch blogs
        const blogsResponse = await fetch(
          `http://localhost:5000/api/blogs?page=${page}&limit=${limit}`
        );
        if (!blogsResponse.ok) {
          throw new Error(`HTTP error! status: ${blogsResponse.status}`);
        }
        const blogsData = await blogsResponse.json();

        if (blogsData.success && Array.isArray(blogsData.data)) {
          // Assume backend already returns the shape matching Blog
          const fetchedBlogs = blogsData.data as Blog[];

          setBlogs((prevBlogs) => [...prevBlogs, ...fetchedBlogs]);

          setHasMore(
            blogsData.pagination.page * blogsData.pagination.limit <
              blogsData.pagination.total
          );
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load blogs section.';
        setError(message);
      } finally {
        hideLoading();
      }
    };

    fetchBlogsAndSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const loadMoreBlogs = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (isLoading && blogs.length === 0) {
    // Let your global loader handle the first load
    return null;
  }

  if (error) {
    return (
      <section className="py-20 relative flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  const titleParts = sectionContent?.title?.split(' ') || [];
  const firstWord = titleParts[0] || 'Latest';
  const restWords =
    titleParts.length > 1 ? titleParts.slice(1).join(' ') : 'Blogs';

  return (
    <section
      className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background"
      ref={ref}
    >
      {/* Subtle luxury background accents */}
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-4rem] left-6 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.35)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Writing & Insights
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            {firstWord}{' '}
            <span className="bg-gradient-to-r from-accent via-amber-400 to-accent bg-clip-text text-transparent">
              {restWords}
            </span>
          </h2>

          <div className="mx-auto h-[2px] w-24 rounded-full bg-gradient-to-r from-accent via-amber-400 to-transparent mb-4" />

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {sectionContent?.content ||
              'Insights, tutorials, and reflections on building, scaling, and shipping software that actually ships.'}
          </p>
        </motion.div>

        {/* Blog cards */}
        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {blogs.map((blog) => (
            <motion.div
              key={blog.id}
              variants={itemVariants}
              className="h-full"
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Link to={`/blog/${blog.slug}`}>
                <Card className="group h-full overflow-hidden rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.6)] hover:border-accent/70 transition-colors duration-300">
                  {/* Image */}
                  {blog.featured_image_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={blog.featured_image_url}
                        alt={blog.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <Badge
                          variant="secondary"
                          className="text-[0.7rem] bg-black/70 text-slate-100 border border-white/10"
                        >
                          {blog.read_time} min read
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="uppercase tracking-[0.16em] text-[0.68rem] text-accent">
                        Article
                      </span>
                      <span>
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg md:text-xl leading-snug group-hover:text-accent transition-colors">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-5">
                    <CardDescription className="mb-4 text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                      {blog.excerpt}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[0.7rem] border-border/70 text-muted-foreground group-hover:border-accent/60 group-hover:text-accent transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Load more */}
        {hasMore && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/70 text-accent hover:bg-accent hover:text-accent-foreground px-8 rounded-full"
                onClick={loadMoreBlogs}
                disabled={isLoading}
              >
                {isLoading ? 'Loading…' : 'Load More Blogs'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BlogsSection;
