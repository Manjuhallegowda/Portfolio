import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onHireMeClick: () => void;
  scrollToSection: (sectionId: string) => void;
  location: ReturnType<typeof useLocation>;
}

const MobileMenu = ({
  isOpen,
  onClose,
  onHireMeClick,
  scrollToSection,
  location,
}: MobileMenuProps) => {
  const navigate = useNavigate();
  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleScroll = (sectionId: string) => {
    if (location.pathname === '/') {
      scrollToSection(sectionId);
      onClose();
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-background/95 backdrop-blur-md border border-border md:hidden"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={menuVariants}
        >
          <div className="px-2 py-2">
            {location.pathname.startsWith('/blog') ? (
              <>
                <motion.div variants={itemVariants}>
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent/20 rounded-md"
                    onClick={onClose}
                  >
                    Home
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants} className="mt-2">
                  <button
                    className="w-full text-left px-4 py-2 text-sm bg-accent text-accent-foreground hover:bg-accent/90 rounded-md"
                    onClick={() => {
                      onHireMeClick();
                      onClose();
                    }}
                  >
                    Connect
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.button
                  className="w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-accent/20 rounded-md"
                  onClick={() => handleScroll('projects')}
                  variants={itemVariants}
                >
                  Projects
                </motion.button>
                <motion.button
                  className="w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-accent/20 rounded-md"
                  onClick={() => handleScroll('achievements')}
                  variants={itemVariants}
                >
                  Tech Stack
                </motion.button>
                <motion.div variants={itemVariants}>
                  <Link
                    to="/blog"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent/20 rounded-md"
                    onClick={onClose}
                  >
                    Blog
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants} className="mt-2">
                  <button
                    className="w-full text-left px-4 py-2 text-sm bg-accent text-accent-foreground hover:bg-accent/90 rounded-md"
                    onClick={() => {
                      onHireMeClick();
                      onClose();
                    }}
                  >
                    Connect
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
