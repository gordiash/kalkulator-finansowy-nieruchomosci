export interface ChunkOptions {
  maxChars?: number;
  overlapChars?: number;
}

export function chunkText(text: string, opts: ChunkOptions = {}): string[] {
  const max = opts.maxChars ?? 2000;
  const overlap = opts.overlapChars ?? 200;
  const clean = text.replace(/\s+$/g, '');
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + max, clean.length);
    out.push(clean.slice(i, end));
    if (end >= clean.length) break;
    i = Math.max(0, end - overlap);
  }
  return out;
}


