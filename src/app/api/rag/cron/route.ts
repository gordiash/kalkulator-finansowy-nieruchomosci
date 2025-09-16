import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Vercel Cron sends x-vercel-cron header
    const isCron = request.headers.get('x-vercel-cron') === '1';
    if (!isCron && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base = new URL(request.url);
    base.search = '';
    const origin = `${base.protocol}//${base.host}`;
    const secret = process.env.RAG_INGEST_SECRET || '';

    const posts = await fetch(`${origin}/api/rag/ingest-posts?secret=${encodeURIComponent(secret)}`, { method: 'POST' });
    const postsJson = await posts.json().catch(() => ({}));
    if (!posts.ok) {
      return NextResponse.json({ error: postsJson.error || 'Ingest posts failed' }, { status: 500 });
    }

    const faq = await fetch(`${origin}/api/rag/ingest-faq?secret=${encodeURIComponent(secret)}`, { method: 'POST' });
    const faqJson = await faq.json().catch(() => ({}));
    if (!faq.ok) {
      return NextResponse.json({ error: faqJson.error || 'Ingest FAQ failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, posts: postsJson, faq: faqJson });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}


