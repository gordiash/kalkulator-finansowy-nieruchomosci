export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

  let content = `User-agent: *\nSitemap: ${baseUrl}/sitemap.xml\n`
  if (isProd) {
    content += 'Disallow: /admin\nDisallow: /api\n'
  } else {
    // W środowiskach innych niż produkcyjne blokujemy całą witrynę
    content += 'Disallow: /\n'
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
} 