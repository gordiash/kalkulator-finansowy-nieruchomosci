// middleware.ts (zmieniono na .ts dla lepszego typowania)
import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Dodaj security headers dla wszystkich żądań
  const response = NextResponse.next();
  
  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS dla HTTPS
  if (request.headers.get('x-forwarded-proto') === 'https') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // CSP Header
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://www.google-analytics.com; " +
    "frame-ancestors 'none';"
  );

  // Zabezpiecz ścieżki admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.redirect(new URL('/logowanie', request.url));
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL('/logowanie', request.url));
    }
    
    // Sprawdź czy użytkownik ma uprawnienia admin (można dodać role)
    return response;
  }

  // Zabezpiecz ścieżki panelu użytkownika
  if (pathname.startsWith('/panel')) {
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.redirect(new URL('/logowanie', request.url));
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL('/logowanie', request.url));
    }
    
    return response;
  }

  // Zabezpiecz API endpoints (oprócz publicznych)
  if (pathname.startsWith('/api/') && 
      !pathname.startsWith('/api/calculate') && 
      !pathname.startsWith('/api/valuation') &&
      !pathname.startsWith('/api/health') &&
      !pathname.startsWith('/api/locations')) {
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health|api/calculate|api/valuation|api/locations).*)',
  ],
};