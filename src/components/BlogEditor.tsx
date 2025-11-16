import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { Blog } from '@/interfaces/Blog';

interface BlogEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: Blog | null;
  onSave: (blog: FormData) => void;
}

const BlogEditor = ({ open, onOpenChange, blog, onSave }: BlogEditorProps) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [readTime, setReadTime] = useState(0);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [open]);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setSlug(blog.slug);
      setExcerpt(blog.excerpt);
      setContent(blog.content);
      setTags(blog.tags.join(', '));
      setReadTime(blog.read_time);
    } else {
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setTags('');
      setReadTime(0);
    }
  }, [blog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('tags', tags);
    formData.append('read_time', String(readTime));
    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }
    if (blog?._id) {
      formData.append('_id', blog._id);
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{blog ? 'Edit Blog' : 'Add New Blog'}</DialogTitle>
          <DialogDescription>
            Fill out the form below to {blog ? 'update' : 'create'} a blog post.
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
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="read_time">Read Time (minutes)</Label>
            <Input
              id="read_time"
              name="read_time"
              type="number"
              value={readTime}
              onChange={(e) => setReadTime(Number(e.target.value))}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image</Label>
            <Input
              id="featuredImage"
              name="featuredImage"
              type="file"
              onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogEditor;
