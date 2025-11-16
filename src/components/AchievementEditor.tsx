import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Achievement {
  _id?: string;
  title: string;
  description: string;
  items: string[];
  icon: string;
  category: string;
  order: number;
}

interface AchievementEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: Achievement | null;
  onSave: (achievement: Achievement) => void;
}

const AchievementEditor = ({ open, onOpenChange, achievement, onSave }: AchievementEditorProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [open]);

  useEffect(() => {
    if (achievement) {
      setTitle(achievement.title);
      setDescription(achievement.description);
      setItems(achievement.items.join(', '));
      setIcon(achievement.icon);
      setCategory(achievement.category);
      setOrder(achievement.order);
    } else {
      setTitle('');
      setDescription('');
      setItems('');
      setIcon('');
      setCategory('');
      setOrder(0);
    }
  }, [achievement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...achievement,
      title,
      description,
      items: items.split(',').map((item) => item.trim()),
      icon,
      category,
      order,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{achievement ? 'Edit Achievement' : 'Add New Achievement'}</DialogTitle>
          <DialogDescription>
            Fill out the form below to {achievement ? 'update' : 'create'} an achievement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="items">Items (comma-separated)</Label>
            <Input
              id="items"
              name="items"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon} name="icon" autoComplete="off">
              <SelectTrigger id="icon">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="award">Award</SelectItem>
                <SelectItem value="briefcase">Briefcase</SelectItem>
                <SelectItem value="globe">Globe</SelectItem>
                <SelectItem value="trending-up">Trending Up</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="star">Star</SelectItem>
                <SelectItem value="target">Target</SelectItem>
                <SelectItem value="cloud">Cloud</SelectItem>
                <SelectItem value="palette">Palette</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              required
              autoComplete="off"
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementEditor;
