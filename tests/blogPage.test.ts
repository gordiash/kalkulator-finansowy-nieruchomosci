// Tests for Next.js blog page helpers

import { Metadata } from 'next';

// Mock modułu Strapi
jest.mock('@/lib/strapi', () => {
  return {
    getBlogPosts: jest.fn(),
    getBlogPost: jest.fn(),
  };
});

import { getBlogPosts, getBlogPost } from '@/lib/strapi';
import { generateStaticParams, generateMetadata } from '../src/app/blog/[slug]/page';

describe('Blog page helper functions', () => {
  const mockPost = {
    id: 1,
    attributes: {
      slug: 'test-post',
      title: 'Test Post',
      seo_title: 'SEO Title',
      seo_description: 'SEO Desc',
      excerpt: 'Excerpt',
      post_status: 'published',
    },
  } as any;

  beforeEach(() => {
    (getBlogPosts as jest.Mock).mockReset();
    (getBlogPost as jest.Mock).mockReset();
  });

  it('generateStaticParams maps slugs correctly', async () => {
    (getBlogPosts as jest.Mock).mockResolvedValueOnce({ data: [mockPost] });
    const params = await generateStaticParams();
    expect(params).toEqual([{ slug: 'test-post' }]);
  });

  it('generateStaticParams returns empty array on error', async () => {
    (getBlogPosts as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const params = await generateStaticParams();
    expect(params).toEqual([]);
  });

  it('generateMetadata builds correct title and description', async () => {
    (getBlogPost as jest.Mock).mockResolvedValueOnce(mockPost);
    const parentMeta = Promise.resolve({ title: { absolute: 'Blog' } } as Metadata);

    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'test-post' }) } as any, parentMeta as any);
    expect(meta.title).toBe('SEO Title | Blog');
    expect(meta.description).toBe('SEO Desc');
  });

  it('generateMetadata falls back on error', async () => {
    (getBlogPost as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'bad' }) } as any, Promise.resolve({}) as any);
    expect(meta.title).toBe('Błąd ładowania posta');
  });
}); 