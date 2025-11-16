import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, XCircle } from 'lucide-react';

interface Image {
  public_id?: string;
  url: string;
  alt?: string;
}

interface Video {
  url: string;
  alt?: string;
}

interface Link {
  text: string;
  url: string;
  target?: '_self' | '_blank';
}

interface Section {
  id?: string;
  name: string;
  page: string;
  title?: string;
  subtitle?: string;
  content?: string;
  images?: Image[];
  videos?: Video[];
  links?: Link[];
  order?: number;
  isPublished?: boolean;
  metadata?: Record<string, any>;
}

interface SectionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section | null;
  onSave: (section: Section) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  open,
  onOpenChange,
  section,
  onSave,
}) => {
  const [currentSection, setCurrentSection] = useState<Section>({
    name: '',
    page: '',
    title: '',
    subtitle: '',
    content: '',
    images: [],
    videos: [],
    links: [],
    order: 0,
    isPublished: true,
    metadata: {},
  });

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [open]);

  useEffect(() => {
    if (section) {
      setCurrentSection(section);
    } else {
      setCurrentSection({
        name: '',
        page: '',
        title: '',
        subtitle: '',
        content: '',
        images: [],
        videos: [],
        links: [],
        order: 0,
        isPublished: true,
        metadata: {},
      });
    }
  }, [section, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setCurrentSection((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentSection((prev) => ({ ...prev, isPublished: checked }));
  };

  const handleImageChange = (
    index: number,
    field: keyof Image,
    value: string
  ) => {
    const updatedImages = currentSection.images
      ? [...currentSection.images]
      : [];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setCurrentSection((prev) => ({ ...prev, images: updatedImages }));
  };

  const addImage = () => {
    setCurrentSection((prev) => ({
      ...prev,
      images: [...(prev.images || []), { url: '', alt: '' }],
    }));
  };

  const removeImage = (index: number) => {
    setCurrentSection((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleVideoChange = (
    index: number,
    field: keyof Video,
    value: string
  ) => {
    const updatedVideos = currentSection.videos
      ? [...currentSection.videos]
      : [];
    updatedVideos[index] = { ...updatedVideos[index], [field]: value };
    setCurrentSection((prev) => ({ ...prev, videos: updatedVideos }));
  };

  const addVideo = () => {
    setCurrentSection((prev) => ({
      ...prev,
      videos: [...(prev.videos || []), { url: '', alt: '' }],
    }));
  };

  const removeVideo = (index: number) => {
    setCurrentSection((prev) => ({
      ...prev,
      videos: (prev.videos || []).filter((_, i) => i !== index),
    }));
  };

  const handleLinkChange = (
    index: number,
    field: keyof Link,
    value: string
  ) => {
    const updatedLinks = currentSection.links ? [...currentSection.links] : [];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setCurrentSection((prev) => ({ ...prev, links: updatedLinks }));
  };

  const addLink = () => {
    setCurrentSection((prev) => ({
      ...prev,
      links: [...(prev.links || []), { text: '', url: '', target: '_self' }],
    }));
  };

  const removeLink = (index: number) => {
    setCurrentSection((prev) => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index),
    }));
  };

  const handleMetadataChange = (key: string, value: string) => {
    try {
      const parsedValue = JSON.parse(value);
      setCurrentSection((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, [key]: parsedValue },
      }));
    } catch (e) {
      // If not valid JSON, store as string
      setCurrentSection((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, [key]: value },
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentSection);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{section ? 'Edit Section' : 'Add New Section'}</DialogTitle>
          <DialogDescription>
            Fill out the form below to {section ? 'update' : 'create'} a section.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">General</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={currentSection.name}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  A unique identifier for the section (e.g., 'hero-section').
                </p>
              </div>
              <div>
                <Label htmlFor="page">Page</Label>
                <Input
                  id="page"
                  name="page"
                  value={currentSection.page}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  The page this section belongs to (e.g., 'home', 'about').
                </p>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={currentSection.title || ''}
                  onChange={handleChange}
                  autoComplete="off"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  The main heading for the section.
                </p>
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={currentSection.subtitle || ''}
                  onChange={handleChange}
                  autoComplete="off"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  A subheading or a short description.
                </p>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={currentSection.content || ''}
                  onChange={handleChange}
                  autoComplete="off"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  The main text content for the section.
                </p>
              </div>
              <div>
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={currentSection.order || 0}
                  onChange={handleChange}
                  autoComplete="off"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  The display order of the section on the page (lower numbers appear first).
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  name="isPublished"
                  checked={currentSection.isPublished}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isPublished">Published</Label>
                <p className="text-sm text-muted-foreground">
                  (Whether the section is visible to the public)
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Images</h3>
            <div className="space-y-4">
              {(currentSection.images || []).map((image, index) => (
                <div key={index} className="p-4 border rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Image {index + 1}</p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor={`image-url-${index}`}>URL</Label>
                    <Input
                      id={`image-url-${index}`}
                      name={`image-url-${index}`}
                      value={image.url}
                      onChange={(e) =>
                        handleImageChange(index, 'url', e.target.value)
                      }
                      autoComplete="off"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`image-alt-${index}`}>Alt Text</Label>
                    <Input
                      id={`image-alt-${index}`}
                      name={`image-alt-${index}`}
                      value={image.alt || ''}
                      onChange={(e) =>
                        handleImageChange(index, 'alt', e.target.value)
                      }
                      autoComplete="off"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addImage}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Image
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Videos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Videos</h3>
            <div className="space-y-4">
              {(currentSection.videos || []).map((video, index) => (
                <div key={index} className="p-4 border rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Video {index + 1}</p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeVideo(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor={`video-url-${index}`}>URL</Label>
                    <Input
                      id={`video-url-${index}`}
                      name={`video-url-${index}`}
                      value={video.url}
                      onChange={(e) =>
                        handleVideoChange(index, 'url', e.target.value)
                      }
                      autoComplete="off"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`video-alt-${index}`}>Alt Text</Label>
                    <Input
                      id={`video-alt-${index}`}
                      name={`video-alt-${index}`}
                      value={video.alt || ''}
                      onChange={(e) =>
                        handleVideoChange(index, 'alt', e.target.value)
                      }
                      autoComplete="off"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addVideo}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Video
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <div className="space-y-4">
              {(currentSection.links || []).map((link, index) => (
                <div key={index} className="p-4 border rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Link {index + 1}</p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeLink(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor={`link-text-${index}`}>Text</Label>
                    <Input
                      id={`link-text-${index}`}
                      name={`link-text-${index}`}
                      value={link.text}
                      onChange={(e) =>
                        handleLinkChange(index, 'text', e.target.value)
                      }
                      autoComplete="off"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`link-url-${index}`}>URL</Label>
                    <Input
                      id={`link-url-${index}`}
                      name={`link-url-${index}`}
                      value={link.url}
                      onChange={(e) =>
                        handleLinkChange(index, 'url', e.target.value)
                      }
                      autoComplete="off"
                      className="mt-1"
                    />
                  </div>
                  {/* Add target selection if needed */}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLink}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Link
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Metadata (JSON)</h3>
            <div className="space-y-4">
              {Object.entries(currentSection.metadata || {}).map(
                ([key, value], index) => (
                  <div key={key} className="p-4 border rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Metadata Entry {index + 1}</p>
                    </div>
                    <div>
                      <Label htmlFor={`metadata-key-${index}`}>Key</Label>
                      <Input
                        id={`metadata-key-${index}`}
                        name={`metadata-key-${index}`}
                        value={key}
                        onChange={(e) => {
                          const newMetadata = { ...currentSection.metadata };
                          const oldValue = newMetadata[key];
                          delete newMetadata[key];
                          newMetadata[e.target.value] = oldValue;
                          setCurrentSection((prev) => ({
                            ...prev,
                            metadata: newMetadata,
                          }));
                        }}
                        autoComplete="off"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`metadata-value-${index}`}>Value</Label>
                      <Textarea
                        id={`metadata-value-${index}`}
                        name={`metadata-value-${index}`}
                        value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        onChange={(e) =>
                          handleMetadataChange(key, e.target.value)
                        }
                        autoComplete="off"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )
              )}
              {/* Add button to add new metadata fields if needed */}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Save Section</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SectionEditor;
