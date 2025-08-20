// Usage:
// 1) Dry-run (default): node scripts/normalize-cities.js
// 2) Apply changes: APPLY=1 node scripts/normalize-cities.js

/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function stripDiacritics(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function rootToken(str) {
  if (!str) return str;
  let s = String(str).trim();
  // remove parentheses content
  s = s.replace(/\(.*?\)/g, '').trim();
  const seps = [',', '/', '–', '-', '—'];
  let cut = s.length;
  for (const sep of seps) {
    const i = s.indexOf(sep);
    if (i >= 0 && i < cut) cut = i;
  }
  return s.slice(0, cut).trim();
}

// Dominujące miasta + synonimy/wariacje (po normalizacji)
const CANONICAL = [
  { name: 'Warszawa', match: ['warszawa', 'warsaw', 'warszaw', 'legionowski', 'minski', 'piaseczynski', 'pruszkowski', 'wolominski', 'wołominski'] },
  { name: 'Kraków', match: ['krakow', 'kraków', 'wielicki'] },
  { name: 'Wrocław', match: ['wroclaw', 'wrocław', 'trzebnicki', 'sredzki', 'średzki'] },
  { name: 'Gdańsk', match: ['gdansk', 'gdańsk', 'kartuski'] },
  { name: 'Poznań', match: ['poznan', 'poznań'] },
  { name: 'Łódź', match: ['lodz', 'łodz', 'łódz', 'łódź'] },
  { name: 'Szczecin', match: ['szczecin'] },
  { name: 'Lublin', match: ['lublin'] },
  { name: 'Katowice', match: ['katowice'] },
  { name: 'Gdynia', match: ['gdynia'] },
  { name: 'Sopot', match: ['sopot'] },
  { name: 'Bydgoszcz', match: ['bydgoszcz', 'bydgoski'] },
  { name: 'Białystok', match: ['bialystok', 'białystok'] },
  { name: 'Rzeszów', match: ['rzeszow', 'rzeszów'] },
  { name: 'Olsztyn', match: ['olsztyn'] },
  { name: 'Toruń', match: ['torun', 'toruń'] },
  { name: 'Opole', match: ['opole'] },
  { name: 'Zielona Góra', match: ['zielona gora', 'zielonagora', 'zielona góra'] },
  { name: 'Gorzów Wielkopolski', match: ['gorzow wielkopolski', 'gorzow wlkp', 'gorzów wielkopolski'] },
  { name: 'Kielce', match: ['kielce'] },
  { name: 'Radom', match: ['radom'] },
  { name: 'Częstochowa', match: ['czestochowa', 'częstochowa'] },
  { name: 'Gliwice', match: ['gliwice'] },
  { name: 'Zabrze', match: ['zabrze'] },
  { name: 'Sosnowiec', match: ['sosnowiec'] },
  { name: 'Bielsko-Biała', match: ['bielskobiala', 'bielsko biala', 'bielsko-biala', 'bielsko-biała'] },
  { name: 'Tychy', match: ['tychy'] },
  { name: 'Płock', match: ['plock', 'płock'] },
  { name: 'Rybnik', match: ['rybnik'] },
  // Dodatkowe dopasowania z form przymiotnikowych powiatów
  { name: 'Goleniów', match: ['goleniow', 'goleniowski'] },
  { name: 'Gryfino', match: ['gryfino', 'gryfinski', 'gryfiński'] },
  { name: 'Police', match: ['police', 'policki'] },
  { name: 'Lublin', match: ['lubelski'] },
];

function guessCanonicalCity(raw) {
  if (!raw) return null;
  const root = rootToken(raw);
  const norm = stripDiacritics(root);
  for (const c of CANONICAL) {
    if (c.match.includes(norm)) return c.name;
  }
  // spróbuj dopasować przez zawieranie (np. warszawa-bemowo)
  for (const c of CANONICAL) {
    for (const m of c.match) {
      if (norm.includes(m)) return c.name;
    }
  }
  return null;
}

async function main() {
  const apply = process.env.APPLY === '1';
  console.log(`City normalization ${apply ? '(APPLY)' : '(dry-run)'}...`);

  // Pobierz unikalne miasta
  const rows = await prisma.nieruchomosci.findMany({
    where: { city: { not: null } },
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' },
  });

  const unique = rows.map(r => (r.city || '').trim()).filter(Boolean);
  const plan = [];
  const unknown = new Map();
  for (const val of unique) {
    const canonical = guessCanonicalCity(val);
    if (canonical && canonical !== val) {
      plan.push({ from: val, to: canonical });
    } else if (!canonical) {
      const token = stripDiacritics(rootToken(val));
      unknown.set(token, (unknown.get(token) || 0) + 1);
    }
  }

  if (plan.length > 0) console.table(plan);
  if (unknown.size > 0) {
    console.log('\nUnmatched city tokens (top 50):');
    console.table(
      Array.from(unknown.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(([token, cnt]) => ({ token, cnt }))
    );
  }

  if (!apply) {
    console.log(`Planned updates: ${plan.length}. Run with APPLY=1 (npm run cities:apply) to apply.`);
    return;
  }

  let total = 0;
  for (const { from, to } of plan) {
    const res = await prisma.nieruchomosci.updateMany({ where: { city: from }, data: { city: to } });
    total += res.count || 0;
    console.log(`Updated ${res.count} rows: "${from}" -> "${to}"`);
  }
  console.log(`Done. Total updated rows: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
