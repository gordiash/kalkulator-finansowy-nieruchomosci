import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Brak pliku' }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    
    // Test uploadu do bucketa posts-images
    const fileExt = file.name.split('.').pop();
    const fileName = `test-${Date.now()}.${fileExt}`;
    const filePath = `private/${fileName}`; // Upload do folderu 'private'
    
    const { data, error } = await supabase.storage
      .from('posts-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: 'Bucket posts-images nie istnieje lub brak uprawnień'
      }, { status: 500 });
    }

    // Pobierz publiczny URL
    const { data: urlData } = supabase.storage
      .from('posts-images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileName,
      publicUrl: urlData.publicUrl
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 