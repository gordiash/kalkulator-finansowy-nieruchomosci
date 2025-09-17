import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createPostSchema } from '@/lib/validation/post';

// używamy wspólnego schematu z lib/validation/post

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Debug: loguj informacje o autoryzacji
    console.log('POST /api/posts - Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    });
    
    if (authError) {
      console.error('Błąd autoryzacji:', authError);
      return NextResponse.json({ error: 'Błąd autoryzacji: ' + authError.message }, { status: 401 });
    }
    
    if (!user) {
      console.log('Brak użytkownika - przekierowanie do logowania');
      return NextResponse.json({ error: 'Nieautoryzowany - zaloguj się ponownie' }, { status: 401 });
    }

    const json = await request.json().catch(() => ({}));
    const parsed = createPostSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Nieprawidłowe dane', details: parsed.error.flatten() }, { status: 400 });
    }

    const payload = { ...parsed.data } as Record<string, unknown>;
    if (payload.status === 'published') {
      (payload as any).published_at = new Date().toISOString();
    }
    // Ustaw autora zgodnie z RLS (polityka zwykle wymaga author_id = auth.uid())
    (payload as any).author_id = user.id;

    // Unikalność slug – opcjonalna szybka walidacja
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', payload.slug as string)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'Slug już istnieje' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Błąd tworzenia posta:', error);
      // Konflikt unikalności (np. slug)
      if ((error as any).code === '23505') {
        return NextResponse.json({ error: 'Slug już istnieje' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath('/blog');
      if (data?.slug) revalidatePath(`/blog/${data.slug}`);
    } catch (_) {}

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const status = (searchParams.get('status') || '').trim();
    const tag = (searchParams.get('tag') || '').trim();
    const slug = (searchParams.get('slug') || '').trim();
    const uniqueSlugCheck = searchParams.get('unique') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get('pageSize') || '20', 10)));

    const supabase = await getSupabaseServerClient();

    if (uniqueSlugCheck && slug) {
      const { data } = await supabase.from('posts').select('id').eq('slug', slug).maybeSingle();
      return NextResponse.json({ unique: !data });
    }

    let query = supabase.from('posts').select('*', { count: 'exact' }).order('published_at', { ascending: false });
    if (q) query = query.ilike('title', `%${q}%`);
    if (status) query = query.eq('status', status);
    if (tag) query = query.ilike('tags', `%${tag}%`);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, count, page, pageSize });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


