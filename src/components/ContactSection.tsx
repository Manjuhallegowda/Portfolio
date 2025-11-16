import { useForm, ValidationError } from '@formspree/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '@/hooks/useLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  type LucideIcon,
} from 'lucide-react';

// Map string icon names to LucideIcon components
const iconMap: { [key: string]: LucideIcon } = {
  Mail,
  Linkedin,
  Twitter,
  Instagram,
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
    setIsSubmitting(state.submitting);
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
        const data = (await response.json()) as SectionContent;
        setSectionData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        hideLoading();
      }
    };

    fetchContactSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <section className="py-20 relative overflow-hidden flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  if (!sectionData) {
    return null;
  }

  if (state.succeeded) {
    return (
      <motion.section
        className="py-32 relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-3"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Thanks for your message!
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            I&apos;ll get back to you as soon as possible.
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

  const fallbackContent = (
    <>
      Have a project in mind…? <br />
      Need a technical co-founder or full-stack developer…? <br />
      Let&apos;s discuss how we can bring your vision to life — from first
      sketch to production launch.
    </>
  );

  return (
    <section
      className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-background to-background/95"
      ref={ref}
    >
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
      >
        {/* soft gold / accent glows */}
        <div className="absolute -top-24 -left-10 w-80 h-80 bg-accent/12 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-[-4rem] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        {/* subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.4)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>
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
                className="text-4xl md:text-5xl font-bold leading-tight"
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {sectionData?.title || 'Let&apos;s build something remarkable.'}
              </motion.h2>

              <motion.p
                className="text-lg text-muted-foreground leading-relaxed max-w-xl whitespace-pre-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                {sectionData?.content ? sectionData.content : fallbackContent}
              </motion.p>
            </motion.div>

            {/* Social Links */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <motion.h3
                className="text-xs uppercase tracking-[0.2em] text-accent font-semibold"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                Connect with me
              </motion.h3>
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                {socialLinks.map((social, index) => {
                  const IconComponent = iconMap[social.iconName];
                  return (
                    <motion.a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-full border border-border/80 bg-background/80 hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all duration-300 group"
                      whileHover={{
                        y: -3,
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        duration: 0.25,
                        delay: 0.55 + index * 0.08,
                      }}
                    >
                      {IconComponent && (
                        <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                      )}
                    </motion.a>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="w-20 h-[2px] bg-gradient-to-r from-accent via-amber-400 to-transparent"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            />

            {/* Additional Info */}
            <motion.div
              className="space-y-3 text-muted-foreground text-sm"
              variants={itemVariants}
            >
              <motion.p
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -15 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Mail className="w-5 h-5 text-accent" />
                <span>
                  {sectionData?.metadata?.email || 'manjuhallegowda@gmail.com'}
                </span>
              </motion.p>
              <motion.p
                className="text-xs leading-relaxed max-w-md whitespace-pre-wrap"
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {sectionData?.metadata?.additionalInfo ||
                  'Open to remote/global collaborations, product partnerships, and selective consulting engagements.'}
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            className="bg-card/95 border border-border/80 rounded-3xl p-8 md:p-9 shadow-[0_18px_60px_rgba(15,23,42,0.7)] backdrop-blur-xl"
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
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
                  placeholder: 'you@example.com',
                  type: 'email',
                },
              ].map((field, index) => (
                <motion.div
                  key={field.id}
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.1 }}
                >
                  <label
                    htmlFor={field.id}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {field.label}
                  </label>
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="bg-background/80 border-border focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm transition-all duration-300"
                  />
                  {field.id === 'email' && (
                    <ValidationError
                      prefix="Email"
                      field="email"
                      errors={state.errors}
                      className="text-red-500 text-xs"
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
                <label
                  htmlFor="message"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell me about your project or inquiry..."
                  rows={6}
                  className="bg-background/80 border-border focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm resize-none transition-all duration-300"
                />
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                  className="text-red-500 text-xs"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.55 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="submit"
                    disabled={state.submitting || isSubmitting}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold tracking-wide py-3"
                    size="lg"
                  >
                    {isSubmitting ? 'Sending…' : 'Send Message'}
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
