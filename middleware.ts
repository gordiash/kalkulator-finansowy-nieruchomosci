import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Tylko dla ścieżki /admin i pod-ścieżek
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            request.cookies.set({ name, value: '', ...options });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Logowanie dla debugowania na Vercel
    console.log('Middleware - User:', user ? 'authenticated' : 'not authenticated');
    console.log('Middleware - Error:', error);
    console.log('Middleware - Path:', request.nextUrl.pathname);

    // Jeśli brak użytkownika lub błąd – przekieruj do /login
    if (!user || error) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      
      console.log('Middleware - Redirecting to:', redirectUrl.toString());
      
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // W przypadku błędu, przekieruj do logowania
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    '/admin/:path*'
  ],
}; 