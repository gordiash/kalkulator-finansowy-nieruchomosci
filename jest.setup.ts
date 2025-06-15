// Ustawienia globalne dla testów
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

// Mock next-mdx-remote for tests (ESM not handled by jest)
jest.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: () => null,
}));

jest.mock('remark-gfm', () => ({}), { virtual: true });
jest.mock('rehype-raw', () => ({}), { virtual: true });

jest.mock('@/lib/supabase/blog', () => ({
  fetchPublishedPosts: jest.fn(() => Promise.resolve([])),
  fetchPostBySlug: jest.fn(() => Promise.resolve(null)),
})); 