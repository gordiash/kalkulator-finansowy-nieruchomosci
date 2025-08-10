// Jest tests for Strapi blog utility functions
import axios from 'axios';
import { getBlogPosts, getBlogPost } from '../src/lib/strapi';

// Mock axios
jest.mock('axios', () => {
  // wspólna instancja klienta
  const instance = {
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  const create = jest.fn(() => instance);
  return {
    __esModule: true,
    default: { create },
    create, // pozwala na import nazwany
  };
});

describe('Strapi blog helpers', () => {
  const sampleRawPost = {
    id: 123,
    title: 'Post bez attributes',
    slug: 'raw-post',
    post_status: 'published',
  } as any;

  const samplePostWithAttributes = {
    id: 1,
    attributes: {
      slug: 'test-post',
      title: 'Test Post',
      seo_title: 'SEO Title',
      seo_description: 'SEO Desc',
      excerpt: 'Excerpt',
      post_status: 'published',
      featured_image: { data: null },
    },
  } as any;

  const axiosCreate = (axios as any).create as jest.Mock;
  const client = axiosCreate.mock.results[0].value;

  beforeEach(() => {
    client.get.mockReset();
  });

  it('getBlogPosts normalizes posts without attributes', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [sampleRawPost] } });
    const res = await getBlogPosts();
    expect(res.data[0].attributes).toBeDefined();
    expect(res.data[0].attributes.slug).toBe('raw-post');
  });

  it('getBlogPosts adds default featured_image when missing', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [samplePostWithAttributes] } });
    const res = await getBlogPosts();
    expect(res.data[0].attributes.featured_image).toBeDefined();
  });

  it('getBlogPosts builds query params correctly', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [] } });
    await getBlogPosts({ pageSize: 5 });
    const calledWith = client.get.mock.calls[0][0] as string;
    expect(calledWith).toContain('pagination%5BpageSize%5D=5');
  });

  it('getBlogPost returns first matched post', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [samplePostWithAttributes] } });
    const res = await getBlogPost('test-post');
    expect(res.attributes.slug).toBe('test-post');
  });

  it('getBlogPost normalizes non-attribute response', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [sampleRawPost] } });
    const res = await getBlogPost('raw-post');
    expect(res.attributes.title).toBe('Post bez attributes');
  });

  it('getBlogPost adds default featured_image when missing', async () => {
    const postMissingImage = {
      id: 10,
      attributes: { slug: 'imgless', title: 'No image', post_status: 'published' },
    } as any;
    client.get.mockResolvedValueOnce({ data: { data: [postMissingImage] } });
    const res = await getBlogPost('imgless');
    expect(res.attributes.featured_image).toBeDefined();
  });
}); 