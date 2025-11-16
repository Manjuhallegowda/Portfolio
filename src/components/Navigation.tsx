import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import MobileMenu from './MobileMenu';
import { Menu, X } from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  isRoute?: boolean; // optional so TypeScript doesn't complain
};

interface NavigationProps {
  onHireMeClick: () => void;
  isAdminPage?: boolean;
}

const Navigation = ({
  onHireMeClick,
  isAdminPage = false,
}: NavigationProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ['expertise', 'projects', 'achievements'];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      setActiveSection(current || '');
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // run on mount so state is correct at top

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems: NavItem[] = [
    { id: 'projects', label: 'Projects' },
    { id: 'achievements', label: 'Tech Stack' },
    { id: '/blog', label: 'Blog', isRoute: true },
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <motion.nav
        className={`transition-all duration-300 rounded-full border border-border px-8 py-3 shadow-lg w-full max-w-screen-lg ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md'
            : 'bg-background/80 backdrop-blur-md'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="w-full">
          <div className="flex items-center justify-between h-auto">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              onClick={() => (window.location.href = '/')}
            >
              <motion.div
                className="w-8 h-8 bg-gradient-gold flex items-center justify-center rounded-full magnetic-hover"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={logo}
                  alt="CodeWithMJ Logo"
                  className="w-5 h-5 object-contain"
                />
              </motion.div>
              <div className="flex flex-col">
                <motion.span
                  className="text-xl font-bold"
                  whileHover={{ scale: 1.05 }}
                >
                  CodewithMJ
                </motion.span>
                <motion.a
                  href="https://www.ranstacksolutions.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-accent transition-colors"
                  whileHover={{ scale: 1.05 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {'@'} RanStack Solutions
                </motion.a>
              </div>
            </motion.div>

            {/* Right side: links / buttons */}
            {isAdminPage ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/"
                  className={`relative text-sm uppercase tracking-wide transition-colors ${
                    location.pathname === '/'
                      ? 'text-accent'
                      : 'hover:text-accent'
                  }`}
                >
                  Home
                  <AnimatePresence>
                    {location.pathname === '/' && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                        layoutId="activeSection"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                  {location.pathname.startsWith('/blog') ? (
                    <>
                      {/* On blog pages: show Home + Connect */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to="/"
                          className={`relative text-sm uppercase tracking-wide transition-colors ${
                            location.pathname === '/'
                              ? 'text-accent'
                              : 'hover:text-accent'
                          }`}
                        >
                          Home
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold glow-on-hover"
                          onClick={onHireMeClick}
                        >
                          Connect
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {navItems.map((item, index) =>
                        item.isRoute ? (
                          // Route item: /blog
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              to={item.id}
                              className={`relative text-sm uppercase tracking-wide transition-colors ${
                                location.pathname === item.id
                                  ? 'text-accent'
                                  : 'hover:text-accent'
                              }`}
                            >
                              {item.label}
                              <AnimatePresence>
                                {location.pathname === item.id && (
                                  <motion.div
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                                    layoutId="activeSection"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    exit={{ scaleX: 0 }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 380,
                                      damping: 30,
                                    }}
                                  />
                                )}
                              </AnimatePresence>
                            </Link>
                          </motion.div>
                        ) : location.pathname === '/' ? (
                          // On home route: smooth scroll to sections
                          <motion.a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`relative text-sm uppercase tracking-wide transition-colors ${
                              activeSection === item.id
                                ? 'text-accent'
                                : 'hover:text-accent'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToSection(item.id);
                            }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {item.label}
                            <AnimatePresence>
                              {activeSection === item.id && (
                                <motion.div
                                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                                  layoutId="activeSection"
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  exit={{ scaleX: 0 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 30,
                                  }}
                                />
                              )}
                            </AnimatePresence>
                          </motion.a>
                        ) : (
                          // On other routes: go home and then scroll to section
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              to="/"
                              state={{ scrollTo: item.id }}
                              className="relative text-sm uppercase tracking-wide transition-colors hover:text-accent"
                            >
                              {item.label}
                            </Link>
                          </motion.div>
                        )
                      )}

                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold glow-on-hover"
                          onClick={onHireMeClick}
                        >
                          Connect
                        </Button>
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Mobile nav toggle */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            onHireMeClick={onHireMeClick}
            scrollToSection={scrollToSection}
            location={location}
          />
        </div>
      </motion.nav>
    </div>
  );
};

export default Navigation;
