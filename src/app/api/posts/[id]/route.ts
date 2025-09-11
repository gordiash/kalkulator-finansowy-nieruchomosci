import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Ustandaryzowana sygnatura handlerów Next.js App Router
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { id } = await context.params;
    const json = await request.json().catch(() => ({}));

    const updateSchema = z.object({
      title: z.string().max(255).optional(),
      slug: z.string().max(255).optional(),
      content: z.string().optional(),
      short_content: z.string().optional(),
      tags: z.string().optional(),
      status: z.enum(['draft', 'published']).optional(),
      image_display: z.string().url().optional().or(z.literal('')),
      seo_title: z.string().optional(),
      seo_content: z.string().optional(),
      published_at: z.string().datetime().optional(),
    });

    const parsed = updateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Nieprawidłowe dane', details: parsed.error.flatten() }, { status: 400 });
    }

    const payload = { ...parsed.data } as Record<string, unknown>;

    // Jeśli publikujemy i nie podano published_at, ustaw teraz
    if (payload.status === 'published' && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    // Zawsze zaktualizuj znacznik czasu edycji, jeśli tabela go posiada
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Błąd aktualizacji posta:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Rewalidacja listy i strony posta (jeśli mamy slug)
    try {
      revalidatePath('/blog');
      if (data?.slug) {
        revalidatePath(`/blog/${data.slug}`);
      }
    } catch (_) {
      // no-op (środowisko dev bez cache)
    }

    return NextResponse.json({ success: true, data });
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

    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .select('slug')
      .maybeSingle();

    if (error) {
      console.error('Błąd usuwania posta:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath('/blog');
      if (data?.slug) {
        revalidatePath(`/blog/${data.slug}`);
      }
    } catch (_) {}

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