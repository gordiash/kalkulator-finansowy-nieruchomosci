import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient();
    
    console.log('Próba usunięcia wpisu:', params.id);

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Błąd usuwania wpisu:', error);
      return NextResponse.json({ 
        error: error.message,
        details: 'Błąd podczas usuwania wpisu z bazy danych'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Wpis został usunięty'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 