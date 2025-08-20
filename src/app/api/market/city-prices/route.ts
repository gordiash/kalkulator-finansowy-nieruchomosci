import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimitMiddleware } from '@/lib/rateLimit';

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function tokenize(input: string): string[] {
  return normalize(input).split(/[^a-z0-9]+/g).filter(Boolean);
}

function stem(pl: string): string {
  // usuwanie typowych końcówek przymiotnikowych (-ski, -cki, -dzki, -owski itd.) oraz końcówki liczby
  return pl
    .replace(/(ski|cki|dzki|owski|ewski|eski|enski|ęski)$/,'')
    .replace(/(i|y)$/,'');
}

export async function GET(req: NextRequest) {
  try {
    const limited = rateLimitMiddleware(60, 60_000)(req);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (!city) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Missing city' } }, { status: 400 });

    // Pobierz rekordy z zadanego zakresu dat dla wszystkich miast, a właściwe dopasowanie zrobimy lokalnie (bezproblemowe dla diakrytyków)
    // Wyznacz skuteczny zakres dat – jeśli zakres jest bardzo wąski (np. 1 dzień), rozszerz do całych miesięcy
    const whereBase: any = { city: { not: null } };
    const ld: any = {};
    const sa: any = {};
    let fromEff: Date | undefined = from ? new Date(from) : undefined;
    let toEff: Date | undefined = to ? new Date(to) : undefined;
    if (fromEff && toEff) {
      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.floor((toEff.getTime() - fromEff.getTime()) / oneDay) + 1;
      if (diffDays < 28) {
        fromEff = new Date(fromEff.getFullYear(), fromEff.getMonth(), 1);
        toEff = new Date(toEff.getFullYear(), toEff.getMonth() + 1, 0);
      }
    }
    if (fromEff) { ld.gte = fromEff; sa.gte = fromEff; }
    if (toEff) { ld.lte = toEff; sa.lte = toEff; }
    if (Object.keys(ld).length > 0 || Object.keys(sa).length > 0) {
      whereBase.AND = [ { OR: [ { listing_date: ld }, { scraped_at: sa } ] } ];
    }

    const rows: Array<{ listing_date: Date | null; scraped_at: Date; price: any; area: any; city: string | null }> = await (prisma as any).nieruchomosci.findMany({
      where: whereBase,
      select: { listing_date: true, scraped_at: true, price: true, area: true, city: true },
      take: 200000,
    });

    // Zbieraj obserwacje per miesiąc jako tablicę wartości (cena/m²), a potem policz medianę po odfiltrowaniu outlierów (IQR)
    const buckets = new Map<string, number[]>();
    const nCity = normalize(city);
    const targetTokens = tokenize(city);
    for (const r of rows) {
      // filtr lokalny po znormalizowanej nazwie miasta: akceptuj dopasowania tokenowe (np. "Warszawa Bemowo")
      if (!r.city) continue;
      const rc = normalize(r.city);
      const rcTokens = tokenize(r.city);
      const tokenHit =
        targetTokens.every((t) => rcTokens.includes(t)) ||
        rc.includes(nCity) ||
        targetTokens.every((t) => rcTokens.some((rt) => stem(rt) === stem(t)));
      if (!tokenHit) continue;
      if (!r.price || !r.area) continue;
      const d = r.listing_date ?? r.scraped_at; // fallback do scraped_at gdy listing_date brak
      if (!d) continue;
      // filtry zakresu dat na podstawie efektywnej daty
      if (from && d < new Date(from)) continue;
      if (to && d > new Date(to)) continue;
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const key = ym;
      // surowe wartości -> liczby
      const price = Number(r.price);
      const area = Number(r.area);
      if (!Number.isFinite(price) || !Number.isFinite(area) || area <= 0) continue;
      // Odfiltruj jedynie skrajne outliery (luźniejsze progi): area 10–500 m², cena/m² 500–60000 PLN
      const pricePerM2 = price / area;
      if (area < 10 || area > 500) continue;
      if (pricePerM2 < 500 || pricePerM2 > 60000) continue;
      const arr = buckets.get(key) || [];
      arr.push(pricePerM2);
      buckets.set(key, arr);
    }

    function median(nums: number[]): number {
      const n = nums.length;
      if (n === 0) return NaN;
      const mid = Math.floor(n / 2);
      return n % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
    }

    function iqrFilter(values: number[]): number[] {
      if (values.length < 6) return values; // zbyt mało aby liczyć IQR
      const arr = [...values].sort((a, b) => a - b);
      const q1 = arr[Math.floor(arr.length * 0.25)];
      const q3 = arr[Math.floor(arr.length * 0.75)];
      const iqr = q3 - q1;
      const min = q1 - 1.5 * iqr;
      const max = q3 + 1.5 * iqr;
      return arr.filter(v => v >= min && v <= max);
    }

    // Oblicz środkową po IQR; jeżeli po filtrze nie ma wartości, użyj mediany bez filtra
    let data = Array.from(buckets.entries())
      .map(([date, arr]) => {
        const filtered = iqrFilter(arr);
        const base = filtered.length > 0 ? filtered : arr;
        const med = median(base.sort((a, b) => a - b));
        return { date, value: Number.isFinite(med) ? Math.round(med) : null };
      })
      .filter(p => p.value != null)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Fallback: jeśli w żądanym zakresie nie ma danych, weź ostatnią dostępną medianę z ostatnich 12 mies. i zwróć stałą wartość
    if (data.length === 0 && toEff) {
      const fallbackFrom = new Date(toEff.getFullYear(), toEff.getMonth() - 12, 1);
      const rows2: Array<{ listing_date: Date | null; scraped_at: Date; price: any; area: any; city: string | null }> = await (prisma as any).nieruchomosci.findMany({
        where: { city: { not: null }, AND: [ { OR: [ { listing_date: { gte: fallbackFrom, lte: toEff } }, { scraped_at: { gte: fallbackFrom, lte: toEff } } ] } ] },
        select: { listing_date: true, scraped_at: true, price: true, area: true, city: true },
        take: 200000,
      });
      const buckets2 = new Map<string, number[]>();
      for (const r of rows2) {
        if (!r.city) continue;
        const rcTokens = tokenize(r.city);
        const tokenHit = targetTokens.every((t) => rcTokens.includes(t)) || normalize(r.city).includes(nCity) || targetTokens.every((t) => rcTokens.some((rt) => stem(rt) === stem(t)));
        if (!tokenHit) continue;
        if (!r.price || !r.area) continue;
        const d = r.listing_date ?? r.scraped_at;
        if (!d) continue;
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
        const price = Number(r.price); const area = Number(r.area);
        if (!Number.isFinite(price) || !Number.isFinite(area) || area <= 0) continue;
        const ppm2 = price / area;
        if (area < 10 || area > 500) continue;
        if (ppm2 < 500 || ppm2 > 60000) continue;
        const arr = buckets2.get(ym) || []; arr.push(ppm2); buckets2.set(ym, arr);
      }
      const hist = Array.from(buckets2.entries())
        .map(([date, arr]) => {
          const filtered = iqrFilter(arr); const base = filtered.length > 0 ? filtered : arr;
          const med = median(base.sort((a, b) => a - b));
          return { date, value: Number.isFinite(med) ? Math.round(med) : null };
        })
        .filter(p => p.value != null)
        .sort((a, b) => a.date.localeCompare(b.date));
      const last = hist[hist.length - 1];
      if (last && fromEff && toEff) {
        const out: { date: string; value: number }[] = [];
        const cursor = new Date(fromEff.getFullYear(), fromEff.getMonth(), 1);
        while (cursor <= toEff) {
          out.push({ date: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-01`, value: last.value as number });
          cursor.setMonth(cursor.getMonth() + 1);
        }
        data = out;
      }
    }

    // Ostateczny fallback: jeśli nadal brak danych, policz medianę dla całej historii miasta i zwróć stałą wartość w żądanym zakresie
    if (data.length === 0 && fromEff && toEff) {
      const allRows: Array<{ listing_date: Date | null; scraped_at: Date; price: any; area: any; city: string | null }> = await (prisma as any).nieruchomosci.findMany({
        where: { city: { not: null } },
        select: { listing_date: true, scraped_at: true, price: true, area: true, city: true },
        take: 300000,
      });
      const arr: number[] = [];
      for (const r of allRows) {
        if (!r.city) continue;
        const rcTokens = tokenize(r.city);
        const tokenHit = targetTokens.every((t) => rcTokens.includes(t)) || normalize(r.city).includes(nCity) || targetTokens.every((t) => rcTokens.some((rt) => stem(rt) === stem(t)));
        if (!tokenHit) continue;
        const price = Number(r.price); const area = Number(r.area);
        if (!Number.isFinite(price) || !Number.isFinite(area) || area <= 0) continue;
        const ppm2 = price / area;
        if (area < 10 || area > 500) continue;
        if (ppm2 < 500 || ppm2 > 60000) continue;
        arr.push(ppm2);
      }
      if (arr.length > 0) {
        const medAll = median(iqrFilter(arr).sort((a, b) => a - b));
        if (Number.isFinite(medAll)) {
          const out: { date: string; value: number }[] = [];
          const cursor = new Date(fromEff.getFullYear(), fromEff.getMonth(), 1);
          while (cursor <= toEff) {
            out.push({ date: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-01`, value: Math.round(medAll as number) });
            cursor.setMonth(cursor.getMonth() + 1);
          }
          data = out;
        }
      }
    }

    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'City prices fetch failed' } }, { status: 500 });
  }
}
