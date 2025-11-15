import { useState } from 'react';
import Navigation from '@/components/Navigation';
import BlogsSection from '@/components/BlogsSection';
import HireMePopup from '@/components/HireMePopup';
import { motion } from 'framer-motion';

const BlogsIndexPage = () => {
  const [isHireMePopupOpen, setIsHireMePopupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation onHireMeClick={() => setIsHireMePopupOpen(true)} />

      <motion.div
        className="pt-10 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6">
          <BlogsSection />
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} RanStack Solutions. All Rights
            Reserved.
          </p>
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

export default BlogsIndexPage;
