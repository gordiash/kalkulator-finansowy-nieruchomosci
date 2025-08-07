import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Pobierz wszystkie posty bez sortowania
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Pobierz informacje o strukturze tabeli
    const tableStructure = posts?.[0] ? Object.keys(posts[0]) : [];

    return NextResponse.json({
      success: true,
      posts_count: posts?.length || 0,
      posts: posts?.slice(0, 3) || [], // Pierwsze 3 posty
      table_structure: tableStructure,
      sample_post: posts?.[0] || null
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 