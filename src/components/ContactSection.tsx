import { useForm, ValidationError } from '@formspree/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '@/hooks/useLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Linkedin, Twitter, Instagram, LucideIcon } from 'lucide-react';

// Map string icon names to LucideIcon components
const iconMap: { [key: string]: LucideIcon } = {
  Mail: Mail,
  Linkedin: Linkedin,
  Twitter: Twitter,
  Instagram: Instagram,
  // Add other icons as needed
};

interface SectionContent {
  title?: string;
  content?: string;
  links?: { text: string; url: string; target?: '_self' | '_blank' }[];
  metadata?: {
    email?: string;
    additionalInfo?: string;
    socialLinks?: {
      platform: string;
      url: string;
      iconName: string;
    }[];
  };
}

const ContactSection = () => {
  const [state, handleSubmit] = useForm('mvgvendz'); // Formspree form ID
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionData, setSectionData] = useState<SectionContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (state.submitting) {
      setIsSubmitting(true);
    } else {
      setIsSubmitting(false);
    }
  }, [state.submitting]);

  useEffect(() => {
    const fetchContactSection = async () => {
      showLoading();
      try {
        const response = await fetch(
          'http://localhost:5000/api/sections/contact-section'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSectionData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        hideLoading();
      }
    };

    fetchContactSection();
  }, []);

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
      <section className="py-20 relative overflow-hidden flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  if (!sectionData) {
    return null; // Or a placeholder
  }

  if (state.succeeded) {
    return (
      <motion.section
        className="py-32 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h2
            className="text-4xl font-bold mb-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Thanks for your message!
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            I'll get back to you as soon as possible.
          </motion.p>
        </div>
      </motion.section>
    );
  }

  const socialLinks = sectionData?.metadata?.socialLinks || [
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/in/manjuhallegowda/',
      iconName: 'Linkedin',
    },
    {
      platform: 'Twitter',
      url: 'https://www.twitter.com/in/manjuhallegowda/',
      iconName: 'Twitter',
    },
    {
      platform: 'Instagram',
      url: 'https://www.instagram.com/manju_halleygowda/',
      iconName: 'Instagram',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="grid lg:grid-cols-2 gap-16 items-start"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* Left: Contact Info */}
          <motion.div className="space-y-12" variants={itemVariants}>
            <motion.div className="space-y-6" variants={itemVariants}>
              <motion.h2
                className="text-5xl font-bold"
                initial={{ opacity: 0, x: -50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {sectionData?.title || "Let's Build Together"}
              </motion.h2>
              <motion.p
                className="text-xl text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {sectionData?.content ||
                  `Have a project in mind...? <br/>
                Need a technical co-founder or full-stack developer...?
                <br/> Let's discuss how we can bring your vision to life from
                initial concept to live deployment.`}
              </motion.p>
            </motion.div>

            {/* Social Links */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <motion.h3
                className="text-sm uppercase tracking-wider text-accent font-semibold"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                Connect With Me
              </motion.h3>
              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {socialLinks.map((social, index) => {
                  const IconComponent = iconMap[social.iconName];
                  return (
                    <motion.a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 border border-accent bg-secondary hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300 group"
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        duration: 0.3,
                        delay: 1 + index * 0.1,
                        type: 'spring',
                        stiffness: 300,
                      }}
                    >
                      {IconComponent && (
                        <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      )}
                    </motion.a>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="w-24 h-1 bg-gradient-gold"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
            />

            {/* Additional Info */}
            <motion.div
              className="space-y-4 text-muted-foreground"
              variants={itemVariants}
            >
              <motion.p
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <Mail className="w-5 h-5 text-accent" />
                <span>
                  {sectionData?.metadata?.email || 'manjuhallegowda@gmail.com'}
                </span>
              </motion.p>
              <motion.p
                className="text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                {sectionData?.metadata?.additionalInfo ||
                  `On-Site/Remote, global availability
                Open for freelance & equity partnerships`}
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            className="bg-card border border-border p-8"
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                {
                  id: 'name',
                  label: 'Your Name',
                  placeholder: 'First Name & Last Name',
                  type: 'text',
                },
                {
                  id: 'email',
                  label: 'Email Address',
                  placeholder: 'Email-ID',
                  type: 'email',
                },
              ].map((field, index) => (
                <motion.div
                  key={field.id}
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  <motion.label
                    htmlFor={field.id}
                    className="text-sm font-semibold uppercase tracking-wide text-accent"
                    whileHover={{ scale: 1.02 }}
                  >
                    {field.label}
                  </motion.label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      className="bg-secondary border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                    />
                  </motion.div>
                  {field.id === 'email' && (
                    <ValidationError
                      prefix="Email"
                      field="email"
                      errors={state.errors}
                      className="text-red-500 text-sm"
                    />
                  )}
                </motion.div>
              ))}

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <motion.label
                  htmlFor="message"
                  className="text-sm font-semibold uppercase tracking-wide text-accent"
                  whileHover={{ scale: 1.02 }}
                >
                  Message
                </motion.label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell me about your project or inquiry..."
                    rows={6}
                    className="bg-secondary border-border focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none transition-all duration-300"
                  />
                </motion.div>
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                  className="text-red-500 text-sm"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={state.submitting || isSubmitting}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-gold glow-on-hover"
                    size="lg"
                  >
                    <motion.span
                      key={isSubmitting ? 'submitting' : 'send'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </motion.span>
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
