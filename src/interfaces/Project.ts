// src/interfaces/Project.ts

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  technologies: string[];
  category: string;
  images: string[]; // URLs from backend
  featuredImageUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  status: string;
  isFeatured: boolean;
  order: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
