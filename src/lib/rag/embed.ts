// Server-only wrapper for embeddings
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const useFake = !apiKey || process.env.RAG_EMBED_FAKE === '1';
const client = apiKey ? new OpenAI({ apiKey }) : null;

function fakeEmbedding(text: string, dim = 1536): number[] {
  // Deterministyczny embedding oparty o sumy kodów znaków
  const v = new Array(dim).fill(0);
  const s = Array.from(text).map((c) => c.charCodeAt(0));
  for (let i = 0; i < dim; i++) {
    let acc = 0;
    for (let j = i; j < s.length; j += 97) acc += s[j] * (i % 13 + 1);
    // Skala do [-1, 1]
    v[i] = Math.sin(acc % 360) * 0.5 + Math.cos((acc % 180)) * 0.5;
  }
  return v;
}

export async function embed(text: string): Promise<number[]> {
  const input = text.length > 5000 ? text.slice(0, 5000) : text;
  if (useFake || !client) {
    return fakeEmbedding(input);
  }
  // Timeout 20s na żądanie do OpenAI
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input,
      // @ts-expect-error - openai v4 akceptuje signal przez fetch impl
      signal: controller.signal,
    } as any);
    return res.data[0].embedding as unknown as number[];
  } catch (e) {
    // Fallback na fake gdy timeout/błąd
    return fakeEmbedding(input);
  } finally {
    clearTimeout(timeout);
  }
}


