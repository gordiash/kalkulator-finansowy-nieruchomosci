// middleware.ts (zmieniono na .ts dla lepszego typowania)
import { NextResponse, NextRequest } from 'next/server';
//import { createServerClient } from '@supabase/ssr';

export function middleware(request: NextRequest) {
  // PODSTAWOWE logowanie - powinno być widoczne dla KAŻDEGO żądania
  console.log('🚨🚨🚨 MIDDLEWARE DZIAŁA 🚨🚨🚨');
  console.log('Path:', request.nextUrl.pathname);
  console.log('Headers Host:', request.headers.get('host'));
  console.log('Full URL:', request.url);
  
  // Jeśli to nie admin, po prostu kontynuuj
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Not admin path, continuing...');
    return NextResponse.next();
  }
  
  console.log('🛡️ ADMIN PATH DETECTED - REDIRECTING TO LOGIN');
  
  // Dla /admin zawsze przekieruj do /login (na razie)
  return NextResponse.redirect(new URL('/login', request.url));
}

// Bez matcher - middleware uruchomi się dla wszystkich ścieżek
export const config = {
  // Uruchamiaj middleware dla wszystkich ścieżek z wyjątkiem assetów Nexta i statycznych plików
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};