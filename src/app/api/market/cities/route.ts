import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimitMiddleware } from '@/lib/rateLimit';

export async function GET(request: Request) {
  const limited = rateLimitMiddleware(60, 60_000)(request as any);
  if (limited) return limited;

  try {
    const rows: Array<{ city: string | null }> = await (prisma as any).nieruchomosci.findMany({
      where: { city: { not: null } },
      select: { city: true },
      distinct: ['city'],
      take: 1000,
    });

    function stripDiacritics(input: string): string {
      return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
    }

    function titleCasePl(input: string): string {
      return input
        .toLowerCase()
        .split(/([ -])/)
        .map((token) => (token === ' ' || token === '-' ? token : token.charAt(0).toUpperCase() + token.slice(1)))
        .join('');
    }

    function isLikelyCountyAdjective(input: string): boolean {
      const n = stripDiacritics(input.trim());
      if (n.includes('powiat')) return true;
      // pojedynczy token zakończony na -ski/-cki/-dzki/-owski/-ewski/-eski/-ęski
      if (/^[a-z\-]+(ski|cki|dzki|owski|ewski|eski|enski|ęski)$/.test(n)) return true;
      return false;
    }

    const synonymMap: Record<string, string> = {
      'warszawa': 'Warszawa',
      'krakow': 'Kraków',
      'lodz': 'Łódź',
      'wroclaw': 'Wrocław',
      'poznan': 'Poznań',
      'gdansk': 'Gdańsk',
      'gdynia': 'Gdynia',
      'sopot': 'Sopot',
      'szczecin': 'Szczecin',
      'bydgoszcz': 'Bydgoszcz',
      'bialystok': 'Białystok',
      'zielona gora': 'Zielona Góra',
      'rzeszow': 'Rzeszów',
      'torun': 'Toruń',
    };

    const cleaned = rows
      .map(r => (r.city || '').trim())
      .filter(Boolean)
      .map((c) => {
        const n = stripDiacritics(c);
        const mapped = synonymMap[n];
        if (mapped) return mapped;
        return titleCasePl(c);
      })
      .filter((c) => !isLikelyCountyAdjective(c))
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort((a, b) => a.localeCompare(b, 'pl'));

    return NextResponse.json({ data: cleaned });
  } catch (e) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Cities fetch failed' } }, { status: 500 });
  }
}
