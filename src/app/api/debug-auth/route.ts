import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter(cookie => cookie.name.startsWith('sb-'));
    
    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      error: error?.message || null,
      cookies: supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set',
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
    }, { status: 500 });
  }
} 