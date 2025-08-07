import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, excerpt, tags, status, image_display } = body;

    const supabase = await getSupabaseServerClient();
    
    const postData = {
      title: title || 'Test Wpis z Obrazkiem',
      slug: `test-image-${Date.now()}`,
      content: content || 'Treść testowa z obrazkiem',
      short_content: excerpt || 'Krótki opis testowy z obrazkiem',
      tags: tags || 'test, obrazek',
      status: status || 'draft',
      image_display: image_display || 'https://lhihjbltatugcnbcpzzt.supabase.co/storage/v1/object/sign/posts-images/stos-monet-i-domow-papieru.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mZmVlYmRlNS1hMjJhLTQyYzEtOTViNy1lMDNjNGY4YjI0MzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0cy1pbWFnZXMvc3Rvcy1tb25ldC1pLWRvbW93LXBhcGllcnUud2VicCIsImlhdCI6MTc0OTk5NTkxNSwiZXhwIjoxNzgxNTMxOTE1fQ.qzC6jOl64Yikt8ryvYXY8Lq0ncqxmKf-M4bii_9uXRY',
      published_at: new Date().toISOString(),
      seo_title: title || 'Test Wpis z Obrazkiem',
      seo_content: excerpt || 'Krótki opis testowy z obrazkiem'
    };

    console.log('Próba zapisu wpisu z obrazkiem:', postData);

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select();

    if (error) {
      console.error('Błąd zapisu:', error);
      return NextResponse.json({ 
        error: error.message,
        details: 'Błąd podczas zapisu do bazy danych',
        test_data: postData
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Wpis z obrazkiem został zapisany',
      data: data,
      image_url: postData.image_display
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 