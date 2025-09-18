import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

interface BlogPost {
  slug: string
  published_at: string
  status: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kalkulatorynieruchomosci.pl'

  const now = new Date()

  // Strony statyczne (posortowane i ze spójnymi priorytetami)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Kalkulatory - główne narzędzia
    {
      url: `${baseUrl}/kalkulator-wyceny`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kalkulator-flipera`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kalkulator-wynajmu`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kalkulator-zakupu-nieruchomosci`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kalkulator-zdolnosci-kredytowej`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Strony informacyjne
    {
      url: `${baseUrl}/o-nas`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Strony prawne
    {
      url: `${baseUrl}/polityka-prywatnosci`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/regulamin`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    let blogRoutes: MetadataRoute.Sitemap = []

    // Pobierz posty z Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const { data: posts } = await supabase
        .from('posts')
        .select('slug, published_at, status')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      
      blogRoutes = (posts as BlogPost[])?.map((post: BlogPost) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.published_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })) || []
      
      console.log(`Sitemap: Załadowano ${blogRoutes.length} postów z Supabase`)
    }

    // Zachowaj kolejność: najpierw statyczne, potem blog
    return [...staticRoutes, ...blogRoutes]
  } catch (error) {
    console.error('Błąd podczas generowania mapy witryny:', error)
    // Zwróć tylko statyczne strony w przypadku błędu
    return staticRoutes
  }
} 