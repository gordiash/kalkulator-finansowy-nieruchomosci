/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Konfiguracja klienta Strapi
const strapiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dodanie interceptora dla dodawania tokenu autoryzacji
strapiClient.interceptors.request.use(
  (config) => {
    if (process.env.STRAPI_API_TOKEN) {
      config.headers.Authorization = `Bearer ${process.env.STRAPI_API_TOKEN}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor dla obsługi błędów
strapiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Strapi API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Funkcje pomocnicze do pobierania danych

/**
 * Pobiera listę postów bloga
 */
export async function getBlogPosts(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
  populate?: string[];
}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('pagination[page]', params.page.toString());
    if (params?.pageSize) queryParams.append('pagination[pageSize]', params.pageSize.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    // Dodanie filtrów
    if (params?.filters) {
      for (const [key, value] of Object.entries(params.filters)) {
        if (key === '$or' && Array.isArray(value)) {
          // Obsługa $or: każdy warunek jako where[$or][index][field][comparator]=value
          value.forEach((cond, idx) => {
            if (cond && typeof cond === 'object') {
              for (const [field, comparatorObj] of Object.entries(cond)) {
                if (comparatorObj && typeof comparatorObj === 'object') {
                  for (const [comparator, val] of Object.entries(comparatorObj)) {
                    const nestedPath = field.split('.').join('][');
                    queryParams.append(`filters[$or][${idx}][${nestedPath}][${comparator}]`, String(val));
                  }
                }
              }
            }
          });
        } else {
          // Prosty filtr lub z operatorem (np. $lt, $gt) dla pojedynczego pola
          const path = key.split('.').join('][');
          if (value && typeof value === 'object') {
            // Gdy przekazano obiekt z operatorami (np. { $lt: '2024-01-01' })
            for (const [comparator, val] of Object.entries(value)) {
              queryParams.append(`filters[${path}][${comparator}]`, String(val));
            }
          } else {
            // Domyślnie $eq
            queryParams.append(`filters[${path}][$eq]`, String(value));
          }
        }
      }
    }
    
    if (params?.populate && params.populate.length > 0) {
      params.populate.forEach((rel, idx) => {
        queryParams.append(`populate[${idx}]`, rel);
      });
    }
    
    const response = await strapiClient.get(`/api/blog-posts?${queryParams.toString()}`);
    // Normalizacja: upewnij się, że każde attributes ma featured_image
    const data = response.data;
    if (Array.isArray(data?.data)) {
      data.data = data.data.map((post: any) => {
        // Jeśli API zwróciło płaskie pola (brak attributes), przenosimy je do attributes
        if (!post.attributes) {
          const newAttrs: Record<string, any> = {};
          for (const [k, v] of Object.entries(post)) {
            if (k !== 'id' && k !== 'attributes') {
              newAttrs[k] = v;
              delete (post as any)[k];
            }
          }
          post.attributes = newAttrs;
        }
        // Zapewnienie istnienia featured_image
        if (!post.attributes.featured_image) {
          post.attributes.featured_image = { data: null };
        }
        return post;
      });
    }
    return data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
}

/**
 * Pobiera pojedynczy post bloga po slug
 */
export async function getBlogPost(slug: string, populate: string[] = ['categories', 'featured_image']) {
  try {
    const queryParams = new URLSearchParams();
    
    // Filtrowanie po slug – dekodujemy w razie gdy slug jest już zakodowany z URL
    const safeSlug = decodeURIComponent(slug);
    queryParams.append('filters[slug][$eq]', safeSlug);
    
    if (populate && populate.length > 0) {
      populate.forEach((rel, idx) => {
        queryParams.append(`populate[${idx}]`, rel);
      });
    }
    
    const response = await strapiClient.get(`/api/blog-posts?${queryParams.toString()}`);
    
    if (response.data.data.length === 0) {
      console.warn('Blog post not found for slug:', safeSlug);
      throw new Error('Blog post not found');
    }
    
    const single = response.data.data[0];
    // Normalizacja jak w liście
    if (single && !single.attributes) {
      const newAttrs: Record<string, any> = {};
      for (const [k, v] of Object.entries(single)) {
        if (k !== 'id' && k !== 'attributes') {
          newAttrs[k] = v;
          delete (single as any)[k];
        }
      }
      single.attributes = newAttrs;
    }

    if (single && !single.attributes.featured_image) {
      single.attributes.featured_image = { data: null };
    }
    return single;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
}

/**
 * Pobiera listę kategorii bloga
 */
export async function getBlogCategories(populate: string[] = []) {
  try {
    const queryParams = new URLSearchParams();
    if (populate.length > 0) {
      populate.forEach((rel, idx) => queryParams.append(`populate[${idx}]`, rel));
    }
    const response = await strapiClient.get(`/api/blog-categories?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    throw error;
  }
}

/**
 * Pobiera pojedynczą kategorię po slug
 */
export async function getBlogCategory(slug: string) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('filters[slug][$eq]', slug);

    const response = await strapiClient.get(`/api/blog-categories?${queryParams.toString()}`);

    if (response.data.data.length === 0) {
      throw new Error('Blog category not found');
    }

    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching blog category:', error);
    throw error;
  }
}

/**
 * Tworzy nowy post bloga (wymaga uprawnień)
 */
export async function createBlogPost(data: any) {
  try {
    const response = await strapiClient.post('/api/blog-posts', {
      data: data
    });
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
}

/**
 * Aktualizuje post bloga (wymaga uprawnień)
 */
export async function updateBlogPost(id: number, data: any) {
  try {
    const response = await strapiClient.put(`/api/blog-posts/${id}`, {
      data: data
    });
    return response.data;
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
}

/**
 * Pobiera URL dla mediów ze Strapi
 */
export function getStrapiMediaUrl(media: any): string {
  if (!media) return '';
  
  const url = media.url || media.data?.attributes?.url;
  if (!url) return '';
  
  // Jeśli URL jest relatywny, dodaj bazowy URL Strapi
  if (url.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_STRAPI_URL}${url}`;
  }
  
  return url;
}

export default strapiClient;