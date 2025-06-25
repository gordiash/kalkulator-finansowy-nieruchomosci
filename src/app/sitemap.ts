import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

interface BlogPost {
  slug: string
  updated_at: string
  published: boolean
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  // Podstawowe strony statyczne
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kalkulator-wyceny`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kalkulator-wynajmu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kalkulator-zakupu-nieruchomosci`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kalkulator-zdolnosci-kredytowej`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/o-nas`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/polityka-prywatnosci`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/regulamin`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    // Użyj publicznego klienta Supabase (bez cookies) dla statycznego generowania
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Brak konfiguracji Supabase dla sitemap, zwracam tylko statyczne strony')
      return staticRoutes
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at, published')
      .eq('published', true)
    
    const blogRoutes: MetadataRoute.Sitemap = (posts as BlogPost[])?.map((post: BlogPost) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || []

    return [...staticRoutes, ...blogRoutes]
  } catch (error) {
    console.error('Błąd podczas generowania mapy witryny:', error)
    // Zwróć tylko statyczne strony w przypadku błędu
    return staticRoutes
  }
} 