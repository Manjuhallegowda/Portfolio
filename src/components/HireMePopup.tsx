import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface HireMePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HireMePopup = ({ open, onOpenChange }: HireMePopupProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setError('');
    setSubmitting(false);
  };

  const handleDialogChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSuccess(false);
        resetForm();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (response.ok) {
        setSuccess(true);
        resetForm();
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.message || 'Failed to send message.');
      }
    } catch {
      setError('Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-md border border-accent/40 bg-card/95 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.7)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Thanks for your message!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              I&apos;ll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button
              onClick={() => handleDialogChange(false)}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md border border-accent/40 bg-card/95 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.7)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Let&apos;s Connect
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Have a project in mind? Share a few details and I&apos;ll follow up
            with next steps.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <p className="text-red-500 text-sm border border-red-500/40 bg-red-500/5 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="hire-name" className="text-sm font-semibold">
              Your Name
            </label>
            <Input
              id="hire-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="First Name & Last Name"
              className="bg-secondary border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="hire-email" className="text-sm font-semibold">
              Email Address
            </label>
            <Input
              id="hire-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="bg-secondary border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="hire-subject" className="text-sm font-semibold">
              Subject
            </label>
            <Input
              id="hire-subject"
              name="subject"
              type="text"
              autoComplete="off"
              placeholder="What is this about?"
              className="bg-secondary border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="hire-message" className="text-sm font-semibold">
              Message
            </label>
            <Textarea
              id="hire-message"
              name="message"
              autoComplete="off"
              placeholder="Tell me about your project or inquiry..."
              rows={4}
              className="bg-secondary border-border focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HireMePopup;
