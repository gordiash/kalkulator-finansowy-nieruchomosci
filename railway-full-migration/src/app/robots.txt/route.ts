export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

  let content = `User-agent: *\nSitemap: ${baseUrl}/sitemap.xml\n`
  if (isProd) {
    content += 'Disallow: /admin\nDisallow: /api\n'
    // Blokujemy stare URL-e które są przekierowywane
    content += 'Disallow: /kalkulator-wartosci-najmu\n'
    content += 'Disallow: /kalkulator-roi\n'
    content += 'Disallow: /kalkulator-inwestycji\n'
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