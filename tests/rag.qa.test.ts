import { createServer } from 'http';

// Prosty test integracyjny Q/A – przykładowe zapytania
const CASES: Array<{ q: string; expectIncludes: string[] }> = [
  // Koszty zakupu (heurystyka + tool calling)
  { q: 'Jakie są koszty zakupu mieszkania za 500000 na rynku wtórnym?', expectIncludes: ['PCC', 'Notariusz', 'Suma'] },
  { q: 'Policz koszt kupna mieszkania (wartość 650 000 zł) na rynku wtórnym', expectIncludes: ['PCC', 'Suma'] },
  { q: 'Koszt zakupu lokalu 420000 zł na rynku pierwotnym', expectIncludes: ['Suma'] },

  // Średni czynsz najmu (RAG)
  { q: 'Jaka jest średnia cena najmu 2-pokojowego w Łodzi?', expectIncludes: ['Łódź'] },
  { q: 'Średni czynsz najmu w Krakowie?', expectIncludes: ['Krak'] },
  { q: 'Ile kosztuje najem mieszkania w Gdańsku (2 pokoje)?', expectIncludes: ['Gdań'] },

  // Zdolność kredytowa (tool calling)
  { q: 'Oblicz zdolność kredytową: dochód 9000 zł, zobowiązania 500 zł, 7.2%, okres 30 lat', expectIncludes: ['Zdolność', 'Maksymalna rata'] },
];

const enabled = process.env.RAG_E2E === '1';
const d = enabled ? describe : describe.skip;

d('RAG Q/A basic', () => {
  it('answers and provides sources', async () => {
    for (const c of CASES) {
      const res = await fetch('http://localhost:3000/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: c.q }),
      });
      expect(res.ok).toBe(true);
      const json = await res.json();
      expect(typeof json.answer).toBe('string');
      for (const e of c.expectIncludes) {
        expect(json.answer).toEqual(expect.stringContaining(e));
      }
      expect(Array.isArray(json.sources)).toBe(true);
    }
  }, 30000);
});


