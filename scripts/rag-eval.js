// Prosty skrypt ewaluacji trafności: mierzy hit-rate (czy odpowiedź zawiera oczekiwany string)
// Usage: node scripts/rag-eval.js

const BASE = process.env.RAG_BASE_URL || 'http://localhost:3000';

const CASES = [
  { q: 'Koszty zakupu mieszkania za 500000 na rynku wtórnym', expect: ['PCC', 'Suma'] },
  { q: 'Średni czynsz najmu 2-pokojowego w Łodzi', expect: ['Łódź'] },
];

(async () => {
  let ok = 0;
  for (const c of CASES) {
    const res = await fetch(`${BASE}/api/assistant/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: c.q }) });
    const json = await res.json().catch(() => ({}));
    const ans = String(json.answer || '');
    const pass = c.expect.every((s) => ans.includes(s));
    if (pass) ok++;
    console.log(`Q: ${c.q}\nPASS: ${pass}\n`);
  }
  const hr = (ok / CASES.length) * 100;
  console.log(`Hit-rate: ${hr.toFixed(1)}% (${ok}/${CASES.length})`);
})();


