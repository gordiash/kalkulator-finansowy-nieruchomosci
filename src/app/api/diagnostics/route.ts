import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface TestResult {
  success: boolean;
  error: string | null;
  posts_count?: unknown;
  sample_data?: unknown;
}

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabase: {
        url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        url_value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
        anon_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        anon_key_preview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'not set',
        service_role_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        connection_test: null as TestResult | null,
        posts_table_test: null as TestResult | null
      }
    };

    // Test połączenia z Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Test podstawowego połączenia
        const { data: connectionData, error: connectionError } = await supabase
          .from('posts')
          .select('count', { count: 'exact', head: true });

        diagnostics.supabase.connection_test = {
          success: !connectionError,
          error: connectionError?.message || null,
          posts_count: connectionData || null
        };

        // Test zapytania o posty
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id, title, status')
          .limit(1);

        diagnostics.supabase.posts_table_test = {
          success: !postsError,
          error: postsError?.message || null,
          sample_data: postsData || null
        };

      } catch (error) {
        diagnostics.supabase.connection_test = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          posts_count: null
        };
      }
    }

    return NextResponse.json(diagnostics);

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 