import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź dostępne buckety
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    // Sprawdź zawartość bucketa posts-images
    const { data: files, error: filesError } = await supabase.storage
      .from('posts-images')
      .list('', {
        limit: 10,
        offset: 0
      });

    return NextResponse.json({
      success: true,
      buckets: buckets || [],
      posts_images_files: files || [],
      buckets_error: bucketsError?.message || null,
      files_error: filesError?.message || null
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 