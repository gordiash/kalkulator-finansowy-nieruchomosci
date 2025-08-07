import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź czy bucket posts-images istnieje
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    const postsImagesBucket = buckets?.find(bucket => bucket.name === 'posts-images');
    
    if (!postsImagesBucket) {
      // Utwórz bucket posts-images
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('posts-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        return NextResponse.json({ 
          error: `Nie można utworzyć bucketa: ${createError.message}` 
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Bucket posts-images został utworzony',
        bucket: newBucket
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bucket posts-images już istnieje',
      bucket: postsImagesBucket
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 