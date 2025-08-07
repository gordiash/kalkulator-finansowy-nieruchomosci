import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, excerpt, tags, status, image_display } = body;

    const supabase = await getSupabaseServerClient();
    
    const postData = {
      title: title || 'Test Wpis',
      slug: `test-${Date.now()}`,
      content: content || 'Treść testowa',
      short_content: excerpt || 'Krótki opis testowy',
      tags: tags || 'test',
      status: status || 'draft',
      image_display: image_display || '',
      published_at: new Date().toISOString(),
      seo_title: title || 'Test Wpis',
      seo_content: excerpt || 'Krótki opis testowy'
    };

    console.log('Próba zapisu wpisu:', postData);

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select();

    if (error) {
      console.error('Błąd zapisu:', error);
      return NextResponse.json({ 
        error: error.message,
        details: 'Błąd podczas zapisu do bazy danych'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Wpis został zapisany',
      data: data
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 