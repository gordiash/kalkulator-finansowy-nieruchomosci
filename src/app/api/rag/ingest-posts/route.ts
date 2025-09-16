import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { chunkText } from '@/lib/rag/chunk';
import { embed } from '@/lib/rag/embed';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const qsSecret = url.searchParams.get('secret');
    const headerSecret = request.headers.get('x-rag-secret');
    const ok = (qsSecret && qsSecret === process.env.RAG_INGEST_SECRET) || (headerSecret && headerSecret === process.env.RAG_INGEST_SECRET);
    if (!ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sbAdmin = getSupabaseServiceRoleClient();
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data: posts, error } = await anon
      .from('posts')
      .select('id, slug, title, content')
      .eq('status', 'published');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let count = 0;
    for (const p of posts || []) {
      const chunks = chunkText(p.content || '');
      for (const text of chunks) {
        const vector = await embed(text);
        const { error: upErr } = await sbAdmin
          .from('rag_chunks')
          .upsert({
            source_type: 'post',
            source_id: p.id,
            title: p.title,
            url: `/blog/${p.slug}`,
            content: text,
            embedding: vector as unknown as any,
          });
        if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
        count += 1;
      }
    }

    return NextResponse.json({ success: true, chunks: count });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}


