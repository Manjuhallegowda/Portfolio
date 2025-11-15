import { motion } from 'framer-motion';
import { useLoading } from '../hooks/useLoading';
import logo from '../assets/logo.png';

const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        className="w-16 h-16 bg-gradient-gold flex items-center justify-center rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <img
          src={logo}
          alt="Loading..."
          className="w-10 h-10 object-contain"
        />
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
