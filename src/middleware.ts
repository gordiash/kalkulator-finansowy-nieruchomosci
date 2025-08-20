import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Optymalizacja cache dla API
  if (request.nextUrl.pathname.startsWith('/api/market/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300'
    )
  }

  // Optymalizacja cache dla statycznych zasobów
  if (
    request.nextUrl.pathname.match(/\.(js|css|woff2|png|ico|webmanifest)$/) ||
    request.nextUrl.pathname.startsWith('/_next/static/')
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  // Optymalizacja bfcache
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate')
    response.headers.delete('x-powered-by')
  }

  return response
}
