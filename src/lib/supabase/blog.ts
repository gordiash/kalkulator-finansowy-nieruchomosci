import { supabase } from './client';
import { createClient } from '@supabase/supabase-js';

export interface BlogPostListing {
  id: string;
  slug: string;
  title: string;
  short_content: string | null;
  image_display: string | null;
  tags: string | null;
  seo_title: string | null;
  seo_content: string | null;
  status: string;
  published_at: string;
}

export interface BlogPostDetail extends BlogPostListing {
  content: string | null;
}

// Zwraca tylko opublikowane posty – używane w widoku bloga publicznego
export async function fetchPublishedPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching published posts:', error);
    return [];
  }
  return data;
}

// Zwraca najnowsze opublikowane posty z limitem
export async function fetchLatestPosts(limit: number = 6) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, short_content, image_display, tags, seo_title, seo_content, status, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }
  return data;
}

// Zwraca wszystkie posty – wykorzystywane w panelu admina
export async function fetchAllPostsForAdmin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts for admin:', error);
    return [];
  }
  return data;
}

export async function fetchPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const sb = typeof window === 'undefined'
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    : supabase;

  const { data, error } = await sb
    .from('posts')
    .select('id, slug, title, published_at, content, short_content, image_display, tags, seo_title, seo_content, status')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }

  return data as BlogPostDetail | null;
}

export async function fetchPostById(id: string): Promise<BlogPostDetail | null> {
  const sb = typeof window === 'undefined'
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    : supabase;

  const { data, error } = await sb
    .from('posts')
    .select('id, slug, title, content, published_at, short_content, image_display, tags, seo_title, seo_content, status')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as BlogPostDetail | null;
}

export async function upsertPost(values: { id?: string; title: string; slug: string; content: string }) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await sb.from('posts').upsert(values).select('id').single();
  if (error) throw new Error(error.message);
  return data?.id as string;
} 