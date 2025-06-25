import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_url_preview: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
      process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'NOT_SET',
    supabase_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_key_preview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NOT_SET',
    is_build_dummy: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('build-dummy') || false,
    all_env_vars: Object.keys(process.env).filter(key => 
      key.startsWith('NEXT_PUBLIC_SUPABASE') || key.startsWith('SUPABASE')
    )
  });
} 