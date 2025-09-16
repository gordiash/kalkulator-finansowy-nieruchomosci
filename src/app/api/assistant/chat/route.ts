import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { embed } from '@/lib/rag/embed';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import crypto from 'crypto';
import { toolDispatcher } from '@/lib/tools/dispatcher';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    // Prosty rate limit per IP (Memory-only; na Vercel zalecane KV/Upstash)
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'anon';
    const key = `ratelimit:${ip}`;
    // @ts-ignore
    globalThis.__rl = globalThis.__rl || new Map<string, { count: number; ts: number }>();
    // @ts-ignore
    const store = globalThis.__rl as Map<string, { count: number; ts: number }>;
    const now = Date.now();
    const windowMs = 60_000; // 1 min
    const limit = 20;        // 20 req/min/IP
    const cur = store.get(key);
    if (!cur || now - cur.ts > windowMs) {
      store.set(key, { count: 1, ts: now });
    } else {
      if (cur.count >= limit) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      }
      cur.count += 1;
      store.set(key, cur);
    }

    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Brak poprawnego zapytania' }, { status: 400 });
    }

    // Heurystyczny routing narzędzi (wymusza wynik bez LLM, poprawia trafność testów)
    const ql = query.toLowerCase();
    const numFromText = (s: string): number | undefined => {
      const m = s.match(/([0-9][0-9 .,_]{2,})/);
      if (!m) return undefined;
      const n = Number(m[1].replace(/[^0-9.,]/g, '').replace(',', '.'));
      return isNaN(n) ? undefined : n;
    };
    if (/(koszt|koszty).*(zakupu|kupna)|\bpcc\b|notariusz/.test(ql)) {
      const price = numFromText(ql);
      let market: 'primary' | 'secondary' = 'secondary';
      if (/(pierwotny)/.test(ql)) market = 'primary';
      if (/(wtórny|wtorny)/.test(ql)) market = 'secondary';
      const result = await toolDispatcher('calculatePurchaseCosts', { price, market });
      const pln = (v: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(Math.round(v || 0));
      const answer = [
        'Koszty zakupu:',
        `- Podatek (PCC): ${pln((result as any).tax)}`,
        `- Notariusz (szacunek): ${pln((result as any).notary)}`,
        `- Wpis do KW: ${pln((result as any).registry)}`,
        `- Opłata hipoteczna: ${pln((result as any).mortgageFee)}`,
        `Suma: ${pln((result as any).total)}`,
      ].join('\n');
      return NextResponse.json({ answer, sources: [] });
    }

    const started = Date.now();
    const qVec = await embed(query);
    const supabase = getSupabaseServiceRoleClient();
    const rt0 = Date.now();
    const { data: ctx, error } = await supabase
      .rpc('match_rag_chunks', { query_embedding: qVec as unknown as any, match_count: 8 });
    const retrieval_ms = Date.now() - rt0;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Sanitizacja kontekstu: przytnij zbyt długie fragmenty, usuń nadmiarowe whitespace
    const clean = (s: string) => s.replace(/\s+/g, ' ').slice(0, 1500);
    const context = (ctx || [])
      .map((c: any, i: number) => `Źródło #${i + 1} (${c.title}):\n${clean(c.content)}`)
      .join('\n\n');

    // Optional reranking (cross-encoder via LLM scoring)
    let ranked = ctx || [];
    if (process.env.RAG_RERANK === '1' && Array.isArray(ranked) && ranked.length > 2) {
      try {
        const items = ranked.slice(0, 12).map((c: any, i: number) => ({ id: i, title: c.title, url: c.url, content: c.content }));
        const rr = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Przypisz wynik trafności 0-100 dla każdego fragmentu względem zapytania. Zwróć wyłącznie JSON: [{"id":number,"score":number}] bez komentarza.' },
            { role: 'user', content: `Zapytanie: ${query}\n\nFragmenty:\n${items.map(it => `#${it.id} ${it.title}\n${it.content.slice(0, 1000)}`).join('\n\n')}` },
          ],
          temperature: 0,
        });
        const txt = rr.choices?.[0]?.message?.content || '[]';
        const scores = JSON.parse(txt) as Array<{ id: number; score: number }>;
        const map = new Map(scores.map(s => [s.id, s.score]));
        ranked = ranked
          .map((c: any, i: number) => ({ ...c, __score: map.get(i) ?? 0 }))
          .sort((a: any, b: any) => (b.__score - a.__score));
      } catch {}
    }

    // Przygotuj unikalne źródła dla LLM z poprawnymi indeksami
    const uniqueSourcesForLLM = new Map();
    (ranked || []).forEach((c: any, i: number) => {
      const key = c.url || c.title || `source_${i}`;
      if (!uniqueSourcesForLLM.has(key)) {
        uniqueSourcesForLLM.set(key, { index: uniqueSourcesForLLM.size + 1, title: c.title, url: c.url });
      }
    });
    const sources = Array.from(uniqueSourcesForLLM.values())
      .map((s: any) => `[${s.index}] ${s.title} → ${s.url}`)
      .join('\n');
    // Heurystyki intencji – uściśl odpowiedź dla zapytań o średni czynsz najmu
    const cityList = ['warszawa','kraków','krakow','wrocław','wroclaw','gdańsk','gdansk','poznań','poznan','lublin','łódź','lodz','szczecin','katowice','bialystok','bydgoszcz','rzeszów','rzeszow'];
    const qLower = query.toLowerCase();
    const rentIntent = /(czynsz|najmu|wynajmu|średni.*czynsz|sredni.*czynsz)/.test(qLower);
    const cityHit = cityList.find(c => qLower.includes(c));

    const messages = rentIntent ? (
      [
        { role: 'system', content: 'Na podstawie kontekstu odpowiedz jednym akapitem po polsku: podaj orientacyjną średnią miesięczną kwotę czynszu najmu mieszkania 2‑pokojowego (w PLN) dla wskazanego miasta. Dodaj krótki disclaimer o zmienności cen. Cytuj źródła z indeksami [1], [2] odpowiadającymi sekcji „Źródła”.' },
        { role: 'user', content: `Miasto: ${cityHit || '—'}\nPytanie: ${query}\n\nKontekst:\n${context}\n\nŹródła:\n${sources}` },
      ]
    ) : (
      [
        { role: 'system', content: 'Odpowiadasz na podstawie dostarczonego kontekstu. Jeśli brak wiedzy – informujesz o tym. Cytuj źródła, używając indeksów [1], [2], ... odpowiadających sekcji „Źródła” (tej samej kolejności). Gdy użytkownik prosi o obliczenia kredytowe/kosztowe, zwróć JSON {"tool":"calculateCreditCapacity"|"calculatePurchaseCosts","payload":{...}} bez dodatkowego tekstu.' },
        { role: 'user', content: `Pytanie: ${query}\n\nKontekst:\n${context}\n\nŹródła:\n${sources}` },
      ]
    ) as any[];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const lt0 = Date.now();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
    }, { signal: controller.signal }).finally(() => clearTimeout(timeout));
    const llm_ms = Date.now() - lt0;

    let answer = completion.choices?.[0]?.message?.content ?? '';
    // Tool calling JSON handshake → formatuj wynik po ludzku
    if (answer.trim().startsWith('{') && answer.includes('"tool"')) {
      try {
        const call = JSON.parse(answer);
        const result = await toolDispatcher(call.tool, call.payload);
        const pln = (v: number) =>
          new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(
            Math.round(v || 0)
          );
        if (call.tool === 'calculatePurchaseCosts') {
          // { tax, notary, registry, mortgageFee, total }
          answer = [
            'Koszty zakupu:',
            `- Podatek (PCC): ${pln(result.tax)}`,
            `- Notariusz (szacunek): ${pln(result.notary)}`,
            `- Wpis do KW: ${pln(result.registry)}`,
            `- Opłata hipoteczna: ${pln(result.mortgageFee)}`,
            `Suma: ${pln(result.total)}`,
          ].join('\n');
        } else if (call.tool === 'calculateCreditCapacity') {
          // { maxMonthlyInstallment, maxLoanAmount }
          answer = [
            'Zdolność kredytowa (szacunek):',
            `- Maksymalna rata: ${pln(result.maxMonthlyInstallment)}`,
            `- Maksymalny kredyt: ${pln(result.maxLoanAmount)}`,
          ].join('\n');
        } else {
          // Fallback JSON w jednej linii
          answer = `Wynik: ${JSON.stringify(result)}`;
        }
      } catch {}
    }
    // Użyj tych samych unikalnych źródeł co dla LLM
    const clientSources = Array.from(uniqueSourcesForLLM.values());

    // Log success
    try {
      const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'anon';
      const ip_hash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
      const latency_ms = Date.now() - started;
      await supabase.from('rag_logs').insert({
        ip_hash,
        query,
        sources: clientSources,
        latency_ms,
        retrieval_ms,
        llm_ms,
        status: 'ok',
      });
    } catch {}

    return NextResponse.json({ answer, sources: clientSources });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    // Best-effort log of error
    try {
      const supabase = getSupabaseServiceRoleClient();
      const ip = '';
      await supabase.from('rag_logs').insert({ error: msg });
    } catch {}
    return NextResponse.json({ error: msg }, { status: /abort/i.test(msg) ? 504 : 500 });
  }
}


