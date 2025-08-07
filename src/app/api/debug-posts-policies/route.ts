import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź polityki RLS dla tabeli posts
    const { data: policies, error: policiesError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    // Sprawdź czy możemy wstawić dane
    const testData = {
      title: 'Test Policy',
      slug: `test-policy-${Date.now()}`,
      content: 'Test content',
      short_content: 'Test excerpt',
      tags: 'test',
      status: 'draft',
      published_at: new Date().toISOString(),
      seo_title: 'Test Policy',
      seo_content: 'Test excerpt'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('posts')
      .insert([testData])
      .select();

    return NextResponse.json({
      success: true,
      policies_test: policies,
      policies_error: policiesError?.message || null,
      insert_test: insertData,
      insert_error: insertError?.message || null,
      test_data: testData
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 