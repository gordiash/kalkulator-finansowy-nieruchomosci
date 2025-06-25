import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase: {
      url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      url_preview: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'NOT_SET',
      key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      key_preview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NOT_SET',
      is_build_dummy: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('build-dummy') || false,
    },
    mysql: {
      host_exists: !!process.env.MYSQL_HOST,
      host_preview: process.env.MYSQL_HOST ? 
        process.env.MYSQL_HOST.substring(0, 20) + '...' : 'NOT_SET',
      user_exists: !!process.env.MYSQL_USER,
      password_exists: !!process.env.MYSQL_PASSWORD,
      database_exists: !!process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT || 'default (3306)',
      config_complete: !!(process.env.MYSQL_HOST && process.env.MYSQL_USER && 
                          process.env.MYSQL_PASSWORD && process.env.MYSQL_DATABASE)
    },
    all_env_vars: Object.keys(process.env).filter(key => 
      key.startsWith('NEXT_PUBLIC_SUPABASE') || 
      key.startsWith('SUPABASE') || 
      key.startsWith('MYSQL')
    )
  });
} 