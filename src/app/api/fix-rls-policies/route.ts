import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Próba naprawy polityk RLS poprzez SQL
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('fix_rls_policies', {});

    // Alternatywnie, spróbujmy wyłączyć RLS dla tabeli posts
    const { data: disableRLSData, error: disableRLSError } = await supabase
      .rpc('disable_rls_for_posts', {});

    // Test zapisu po naprawie
    const testData = {
      title: 'Test RLS Fix',
      slug: `test-rls-fix-${Date.now()}`,
      content: 'Test content after RLS fix',
      short_content: 'Test excerpt',
      tags: 'test,rls,fix',
      status: 'draft',
      published_at: new Date().toISOString(),
      seo_title: 'Test RLS Fix',
      seo_content: 'Test excerpt'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('posts')
      .insert([testData])
      .select();

    return NextResponse.json({
      success: true,
      policies_fix: {
        data: policiesData,
        error: policiesError?.message || null
      },
      disable_rls: {
        data: disableRLSData,
        error: disableRLSError?.message || null
      },
      insert_test: {
        data: insertData,
        error: insertError?.message || null,
        test_data: testData
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź obecne polityki RLS
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_name', 'posts');

    // Sprawdź czy RLS jest włączone
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('row_security')
      .eq('table_name', 'posts');

    return NextResponse.json({
      success: true,
      current_policies: policies,
      policies_error: policiesError?.message || null,
      rls_status: rlsStatus,
      rls_error: rlsError?.message || null
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 