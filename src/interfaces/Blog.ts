export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  tags: string[];
  read_time: number;
  is_published: boolean;
  published_at: string;
  views: number;
  likes: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
}
