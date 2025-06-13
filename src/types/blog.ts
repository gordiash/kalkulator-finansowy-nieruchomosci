// Typy dla Strapi Blog API

export interface StrapiMedia {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: {
      thumbnail?: StrapiMediaFormat;
      small?: StrapiMediaFormat;
      medium?: StrapiMediaFormat;
      large?: StrapiMediaFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    provider_metadata?: any;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path?: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

export interface BlogCategory {
  id: number;
  attributes: {
    name: string;
    slug: string;
    description?: string;
    color: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface BlogPost {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    author?: string;
    tags?: string;
    seo_title?: string;
    seo_description?: string;
    ai_generated: boolean;
    published_at?: string;
    status: 'draft' | 'published' | 'archived';
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    featured_image?: {
      data: StrapiMedia | null;
    };
    categories?: {
      data: BlogCategory[];
    };
  };
}

export interface StrapiResponse<T> {
  data: T;
  meta: PaginationMeta;
}

export interface PaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: {};
}

// Typy dla formularzy i tworzenia postów
export interface CreateBlogPostData {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  tags?: string;
  seo_title?: string;
  seo_description?: string;
  ai_generated?: boolean;
  published_at?: string;
  status?: 'draft' | 'published' | 'archived';
  featured_image?: number; // ID pliku
  categories?: number[]; // Array ID kategorii
}

export interface CreateBlogCategoryData {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}

// Typ dla parametrów wyszukiwania
export interface BlogPostFilters {
  status?: 'draft' | 'published' | 'archived';
  ai_generated?: boolean;
  categories?: string; // slug kategorii
  author?: string;
  search?: string; // wyszukiwanie w tytule lub treści
}

// Helper typy dla łatwiejszego użycia
export type BlogPostAttributes = BlogPost['attributes'];
export type BlogCategoryAttributes = BlogCategory['attributes'];

// Typ dla processed blog post (po przetworzeniu przez getStrapiMediaUrl)
export interface ProcessedBlogPost extends Omit<BlogPost, 'attributes'> {
  attributes: Omit<BlogPostAttributes, 'featured_image'> & {
    featured_image_url?: string;
    categories_list?: BlogCategoryAttributes[];
  };
} 