// middleware.ts (zmieniono na .ts dla lepszego typowania)
import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Dodaj security headers dla wszystkich żądań
  const response = NextResponse.next();
  
  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // HSTS dla HTTPS z preload
  if (request.headers.get('x-forwarded-proto') === 'https') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // CSP Header
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseOrigin = (() => {
    try { return supabaseUrl ? new URL(supabaseUrl).origin : ''; } catch { return ''; }
  })();
  const connectSrc = [
    "'self'",
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://*.supabase.co',
    'https://*.supabase.in',
    supabaseOrigin,
  ].filter(Boolean).join(' ');

  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    `connect-src ${connectSrc}; ` +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests;"
  );

  // Obsługa sesji Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          response.cookies.set(name, '', options);
        },
      },
    }
  );

  // Zabezpiecz ścieżki admin
  if (pathname.startsWith('/admin')) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
      }
    } catch (error) {
      console.error('Błąd podczas sprawdzania autoryzacji w middleware:', error);
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
    }
  }

  // Zabezpiecz ścieżki panelu użytkownika
  if (pathname.startsWith('/panel')) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/logowanie', request.url));
      }
    } catch (error) {
      console.error('Błąd podczas sprawdzania autoryzacji w middleware:', error);
      return NextResponse.redirect(new URL('/logowanie', request.url));
    }
  }

  // Zabezpiecz API endpoints (oprócz publicznych)
  if (pathname.startsWith('/api/') && 
      !pathname.startsWith('/api/calculate') && 
      !pathname.startsWith('/api/valuation') &&
      !pathname.startsWith('/api/health') &&
      !pathname.startsWith('/api/locations') &&
      // Pozwól trasom /api/posts i /api/admin/upload-image samodzielnie weryfikować sesję (route-level auth)
      !pathname.startsWith('/api/posts') &&
      !pathname.startsWith('/api/admin/upload-image')) {
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (error) {
      console.error('Błąd podczas sprawdzania autoryzacji API:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health|api/calculate|api/valuation|api/locations).*)',
  ],
};