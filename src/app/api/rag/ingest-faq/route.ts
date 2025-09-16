import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { chunkText } from '@/lib/rag/chunk';
import { embed } from '@/lib/rag/embed';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const qsSecret = url.searchParams.get('secret');
    const headerSecret = request.headers.get('x-rag-secret');
    const ok = (qsSecret && qsSecret === process.env.RAG_INGEST_SECRET) || (headerSecret && headerSecret === process.env.RAG_INGEST_SECRET);
    if (!ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prosty ingest: zbuduj statyczny zestaw FAQ z kilku znanych ścieżek stron kalkulatorów (SSR tekstowo)
    const roots = [
      path.join(process.cwd(), 'src', 'app', 'kalkulator-wyceny', 'page.tsx'),
      path.join(process.cwd(), 'src', 'app', 'kalkulator-wynajmu', 'page.tsx'),
      path.join(process.cwd(), 'src', 'app', 'kalkulator-zakupu-nieruchomosci', 'page.tsx'),
      path.join(process.cwd(), 'src', 'app', 'kalkulator-zdolnosci-kredytowej', 'page.tsx'),
    ];

    const sbAdmin = getSupabaseServiceRoleClient();
    let total = 0;

    for (const file of roots) {
      try {
        const content = await readFile(file, 'utf8');
        const chunks = chunkText(content, { maxChars: 2000, overlapChars: 200 });
        const urlGuess = '/';
        for (const text of chunks) {
          const vector = await embed(text);
          const { error } = await sbAdmin.from('rag_chunks').upsert({
            source_type: 'faq',
            source_id: path.basename(file),
            title: 'FAQ/Docs',
            url: urlGuess,
            content: text,
            embedding: vector as unknown as any,
          });
          if (error) return NextResponse.json({ error: error.message }, { status: 500 });
          total += 1;
        }
      } catch {}
    }

    return NextResponse.json({ success: true, chunks: total });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}


