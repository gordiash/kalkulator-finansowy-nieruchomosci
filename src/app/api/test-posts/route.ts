import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Użyj dokładnie tego samego kodu co w stronie admina
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    const stats = {
      total: posts?.length || 0,
      published: posts?.filter(p => p.status === 'published').length || 0,
      drafts: posts?.filter(p => p.status === 'draft').length || 0,
    };

    return NextResponse.json({
      success: true,
      posts_count: posts?.length || 0,
      stats: stats,
      posts: posts?.slice(0, 3) || [], // Pierwsze 3 posty
      error: error?.message || null
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 