import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Ustandaryzowana sygnatura handlerów Next.js App Router
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { status } = body as { status?: string };

    if (!status || !['draft', 'published'].includes(status)) {
      return NextResponse.json({ error: 'Nieprawidłowy status' }, { status: 400 });
    }

    const { error } = await supabase.from('posts').update({ status }).eq('id', id);

    if (error) {
      console.error('Błąd aktualizacji statusu:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { id } = await context.params;

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      console.error('Błąd usuwania wpisu:', error);
      return NextResponse.json(
        { error: error.message, details: 'Błąd podczas usuwania wpisu z bazy danych' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Wpis został usunięty' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}