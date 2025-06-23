import { fetchPublishedPosts } from '@/lib/supabase/blog'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  let posts: any[] = []
  try {
    // Sprawdź czy Supabase jest skonfigurowany
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://dummy.supabase.co') {
      posts = await fetchPublishedPosts()
    }
  } catch (error) {
    console.warn('RSS: Nie można pobrać postów z Supabase:', error)
    posts = []
  }

  const items = posts
    .slice(0, 10)
    .map((post) => {
      return `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${baseUrl}/blog/${post.slug}</link>
        <guid>${baseUrl}/blog/${post.slug}</guid>
        <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
        <description><![CDATA[${post.short_content ?? ''}]]></description>
      </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>Analityka Nieruchomości – Blog</title>
        <link>${baseUrl}/blog</link>
        <description>Najnowsze artykuły o nieruchomościach, kredytach i inwestycjach.</description>
        ${items}
      </channel>
    </rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate',
    },
  })
} 