import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '@/hooks/useLoading';

import { Blog } from '@/interfaces/Blog';

interface SectionContent {
  title?: string;
  content?: string; // For the introductory paragraph
}

const BlogsSection = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // Number of blogs to load per request
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
        const sectionData = await sectionResponse.json();
        setSectionContent(sectionData);

        // Fetch blogs
        const blogsResponse = await fetch(
          `http://localhost:5000/api/blogs?page=${page}&limit=${limit}`
        );
        if (!blogsResponse.ok) {
          throw new Error(`HTTP error! status: ${blogsResponse.status}`);
        }
        const blogsData = await blogsResponse.json();
        if (blogsData.success) {
          console.log('Fetched blogs:', blogsData.data);
          const transformedBlogs = blogsData.data.map((blog: any) => ({
            ...blog,
            createdAt: blog.created_at,
            read_time: blog.read_time,
          }));
          setBlogs((prevBlogs) => [...prevBlogs, ...transformedBlogs]);
          setHasMore(blogsData.pagination.page * blogsData.pagination.limit < blogsData.pagination.total);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        hideLoading();
      }
    };

    fetchBlogsAndSection();
  }, [page, limit]);

  const loadMoreBlogs = () => {
    setPage((prevPage) => prevPage + 1);
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

  if (isLoading && blogs.length === 0) {
    return null; // The global spinner will be shown
  }

  if (error) {
    return (
      <section className="py-20 relative flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  return (
    <section className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-6">
            {sectionContent?.title?.split(' ')[0] || 'Latest'}{' '}
            <span className="text-accent">
              {sectionContent?.title?.split(' ').slice(1).join(' ') || 'Blogs'}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {sectionContent?.content ||
              'Insights, tutorials, and thoughts on web development, technology, and software engineering.'}
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Link to={`/blog/${blog.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border/50 hover:border-accent/30">
                  {blog.featured_image_url && (
                    <img
                      src={blog.featured_image_url}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {blog.read_time} min read
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl hover:text-accent transition-colors cursor-pointer">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {blog.excerpt}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
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

        {hasMore && (
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
                onClick={loadMoreBlogs}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Blogs'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BlogsSection;
