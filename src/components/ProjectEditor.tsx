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
import { Switch } from './ui/switch';
import type { Project } from '@/interfaces/Project';

interface ProjectEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSave: (project: FormData) => void;
}

const ProjectEditor = ({
  open,
  onOpenChange,
  project,
  onSave,
}: ProjectEditorProps) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [existingFeaturedImage, setExistingFeaturedImage] = useState<
    string | undefined
  >(undefined);
  const [demoUrl, setDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [status, setStatus] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [open]);

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setSlug(project.slug || '');
      setDescription(project.description || '');
      setLongDescription(project.longDescription || '');
      setTechnologies((project.technologies || []).join(', '));
      setCategory(project.category || '');
      setDemoUrl(project.demoUrl || '');
      setGithubUrl(project.githubUrl || '');
      setStatus(project.status || '');
      setIsFeatured(project.isFeatured || false);
      setOrder(project.order || 0);
      setExistingFeaturedImage(project.featuredImageUrl);
      setExistingImages(project.images || []);
    } else {
      setTitle('');
      setSlug('');
      setDescription('');
      setLongDescription('');
      setTechnologies('');
      setCategory('');
      setDemoUrl('');
      setGithubUrl('');
      setStatus('');
      setIsFeatured(false);
      setOrder(0);
      setExistingFeaturedImage(undefined);
      setExistingImages([]);
      setImages([]);
      setFeaturedImage(null);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    // These keys match what your backend destructures:
    // title, description, longDescription, technologies, category,
    // demoUrl, githubUrl, status, isFeatured, order, isPublished (if you add it later).
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('longDescription', longDescription);
    formData.append('technologies', technologies);
    formData.append('category', category);
    formData.append('demoUrl', demoUrl);
    formData.append('githubUrl', githubUrl);
    formData.append('status', status);
    formData.append('isFeatured', String(isFeatured));
    formData.append('order', String(order));

    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    images.forEach((image) => {
      formData.append('images', image);
    });

    if (project?.id) {
      formData.append('id', project.id);
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to {project ? 'update' : 'create'} a
            project.
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
            <Label htmlFor="long_description">Long Description</Label>
            <Textarea
              id="long_description"
              name="long_description"
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              rows={5}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies (comma-separated)</Label>
            <Input
              id="technologies"
              name="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              autoComplete="off"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a category</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="api">API</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo_url">Demo URL</Label>
            <Input
              id="demo_url"
              name="demo_url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              name="github_url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              name="is_featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
            <Label htmlFor="is_featured">Is Featured?</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image</Label>
            {existingFeaturedImage && (
              <div className="mb-2">
                <img
                  src={existingFeaturedImage}
                  alt="Featured"
                  className="w-20 h-20 object-cover rounded-md"
                />
              </div>
            )}
            <Input
              id="featuredImage"
              name="featuredImage"
              type="file"
              onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images">Additional Images</Label>
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {existingImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Existing ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
            <Input
              id="images"
              name="images"
              type="file"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectEditor;
