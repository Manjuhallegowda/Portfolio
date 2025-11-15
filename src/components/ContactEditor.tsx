import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  reply_message: string;
  replied_at: string;
  created_at: string;
}

interface ContactEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSave: (contact: { reply_message: string }) => void;
}

const ContactEditor = ({
  open,
  onOpenChange,
  contact,
  onSave,
}: ContactEditorProps) => {
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [open]);

  useEffect(() => {
    if (contact) {
      setReplyMessage(contact.reply_message || '');
    } else {
      setReplyMessage('');
    }
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ reply_message: replyMessage });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to {contact?.name}</DialogTitle>
          <DialogDescription>
            <p>
              <strong>From:</strong> {contact?.email}
            </p>
            <p>
              <strong>Subject:</strong> {contact?.subject}
            </p>
            <p className="mt-4">{contact?.message}</p>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reply_message">Reply Message</Label>
            <Textarea
              id="reply_message"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={5}
              required
            />
          </div>
          <Button type="submit">Send Reply</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactEditor;
