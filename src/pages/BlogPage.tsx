import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import HireMePopup from '@/components/HireMePopup';

import { Blog } from '@/interfaces/Blog';

const BlogPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHireMePopupOpen, setIsHireMePopupOpen] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/blogs/${slug}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setBlog(data.data);
        } else {
          setError(data.message || 'Blog not found');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-white">Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Blog post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onHireMeClick={() => setIsHireMePopupOpen(true)} />

      <motion.div
        className="pt-32 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/blog">
              {' '}
              {/* Link back to the blogs list */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blogs
              </Button>
            </Link>

            {blog.featured_image_url && (
              <motion.img
                src={blog.featured_image_url}
                alt={blog.title}
                className="w-full h-96 object-cover mb-8 rounded-lg shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              {blog.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {blog.excerpt}
            </p>

            <div className="flex items-center justify-between text-sm text-muted-foreground mb-8 border-b border-border pb-4">
              <div className="flex gap-2">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <span>
                {blog.read_time} min read &bull;{' '}
                {new Date(blog.published_at).toLocaleDateString()} &bull;{' '}
                {blog.views} views
              </span>
            </div>
          </motion.div>

          <motion.div
            className="prose prose-invert max-w-none whitespace-pre-wrap" // Using prose for better markdown rendering
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {blog.content}
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RanStack Solutions. All Rights Reserved.</p>
          <p className="mt-2">
            Proudly built by{' '}
            <a
              href="http://www.ranstacksolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              RanStack Solutions
            </a>
          </p>
        </div>
      </footer>

      <HireMePopup
        open={isHireMePopupOpen}
        onOpenChange={setIsHireMePopupOpen}
      />
    </div>
  );
};

export default BlogPage;
