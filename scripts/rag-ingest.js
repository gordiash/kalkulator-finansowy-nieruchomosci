// Simple ingest runner for local/CI usage
// Usage: node scripts/rag-ingest.js posts|faq

const mode = process.argv[2] || 'posts';
const base = process.env.RAG_BASE_URL || 'http://localhost:3000';
const secret = process.env.RAG_INGEST_SECRET || '';

if (!secret) {
  console.error('Missing RAG_INGEST_SECRET env');
  process.exit(1);
}

const path = mode === 'faq' ? '/api/rag/ingest-faq' : '/api/rag/ingest-posts';

(async () => {
  try {
    const res = await fetch(base + path, { method: 'POST', headers: { 'x-rag-secret': secret } });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Ingest failed:', json.error || await res.text());
      process.exit(1);
    }
    console.log('Ingest OK:', json);
  } catch (e) {
    console.error('Ingest error:', e);
    process.exit(1);
  }
})();


