import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { updatePostSchema } from '@/lib/validation/post';

// Ustandaryzowana sygnatura handlerów Next.js App Router
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }
    const { id } = await context.params;
    const json = await request.json().catch(() => ({}));

    const parsed = updatePostSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Nieprawidłowe dane', details: parsed.error.flatten() }, { status: 400 });
    }

    const payload = { ...parsed.data } as Record<string, unknown>;

    // Jeśli publikujemy i nie podano published_at, ustaw teraz
    if (payload.status === 'published' && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    // Nie ustawiamy updated_at jeśli kolumna nie istnieje w tabeli (błąd schema cache)

    // Jeśli zmieniamy slug, sprawdź unikalność
    if (payload.slug) {
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', payload.slug as string)
        .neq('id', id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ error: 'Slug już istnieje' }, { status: 409 });
      }
    }

    // Pobierz poprzednią wersję do ewentualnego zapisu historii
    let previous: any = null;
    try {
      const { data: prev } = await supabase
        .from('posts')
        .select('id, title, slug, content, short_content, tags, status, image_display, seo_title, seo_content')
        .eq('id', id)
        .maybeSingle();
      previous = prev || null;
    } catch (_) {}

    const { error } = await supabase
      .from('posts')
      .update({ ...payload, author_id: user.id })
      .eq('id', id);

    if (error) {
      console.error('Błąd aktualizacji posta:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Uwaga: przy włączonym RLS SELECT może być zablokowany – nie próbujemy odczytu zaktualizowanego rekordu

    // Rewalidacja listy i strony posta (jeśli mamy slug)
    try {
      revalidatePath('/blog');
      // Brak bezpośredniego data po UPDATE – rewalidujemy stronę edycji i listę
      revalidatePath('/admin/posts');
    } catch (_) {
      // no-op (środowisko dev bez cache)
    }

    // Spróbuj zapisać wersję (opcjonalnie, jeśli istnieje tabela post_versions)
    try {
      if (previous) {
        await supabase.from('post_versions').insert({
          post_id: id,
          title: previous.title,
          slug: previous.slug,
          content: previous.content,
          short_content: previous.short_content,
          tags: previous.tags,
          status: previous.status,
          image_display: previous.image_display,
          seo_title: previous.seo_title,
          seo_content: previous.seo_content,
          author_id: user.id,
          created_at: new Date().toISOString(),
        });
      }
    } catch (_) {
      // brak tabeli lub RLS – ignoruj
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
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUser = await getSupabaseServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }
    const { id } = await context.params;

    // Sprawdź tryb usuwania
    const url = new URL(request.url);
    const hard = url.searchParams.get('hard') === 'true';

    const sbAdmin = getSupabaseServiceRoleClient();

    // Pobierz status wpisu (service role, aby ominąć RLS)
    const { data: existing, error: fetchErr } = await sbAdmin
      .from('posts')
      .select('id, status, slug')
      .eq('id', id)
      .maybeSingle();
    if (fetchErr) {
      console.error('Błąd pobierania wpisu przed usunięciem:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Nie znaleziono wpisu' }, { status: 404 });
    }

    let error: any = null;
    if (hard && existing.status !== 'published') {
      // Twarde usunięcie dozwolone tylko dla nieopublikowanych
      const del = await sbAdmin.from('posts').delete().eq('id', id);
      error = del.error;
      if (!error) {
        try {
          revalidatePath('/admin/posts');
          if (existing.slug) revalidatePath(`/blog/${existing.slug}`);
        } catch {}
        return NextResponse.json({ success: true, deleted: true });
      }
    } else {
      // Archiwizacja (soft delete)
      const upd = await sbAdmin
        .from('posts')
        .update({ status: 'archived' })
        .eq('id', id);
      error = upd.error;
      if (!error) {
        try {
          revalidatePath('/blog');
          revalidatePath('/admin/posts');
        } catch {}
        return NextResponse.json({ success: true, archived: true });
      }
    }

    if (error) {
      console.error('Błąd usuwania posta:', error);
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