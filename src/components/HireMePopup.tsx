import { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send message.');
      }
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thanks for your message!</DialogTitle>
            <DialogDescription>
              I'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button
              onClick={() => {
                setSuccess(false);
                onOpenChange(false);
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Let's Connect</DialogTitle>
          <DialogDescription>
            Have a project in mind? Let's build something amazing together.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold">
              Your Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="First Name & Last Name"
              className="bg-secondary border-border focus:border-accent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="bg-secondary border-border focus:border-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-semibold">
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder="What is this about?"
              className="bg-secondary border-border focus:border-accent"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-semibold">
              Message
            </label>
            <Textarea
              id="message"
              name="message"
              placeholder="Tell me about your project or inquiry..."
              rows={4}
              className="bg-secondary border-border focus:border-accent"
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
