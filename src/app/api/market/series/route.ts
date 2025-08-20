import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getReferenceRateSeries, fetchNBPFxHistory } from '@/lib/market/nbp';
import { fetchCpiYoYHistory, fetchMonthlyCpiData } from '@/lib/market/gus';
import { fetchEurostatCpiHistory } from '@/lib/market/eurostat';
import { rateLimitMiddleware } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const limited = rateLimitMiddleware(120, 60_000)(req);
    if (limited) return limited;
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (!key) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Missing key' } }, { status: 400 });

    // Jeśli prosimy o zakres dla kluczy, które potrafimy pobrać z zewnętrznych API,
    // korzystamy bezpośrednio ze źródła (świeższe i pełniejsze niż snapshot w DB)
    if (from && to) {
      if (key === 'nbp_reference_rate') {
        const data = await getReferenceRateSeries(from, to);
        return NextResponse.json({ data: data.map(p => ({ date: p.date, value: p.value })) });
      }
      if (key === 'nbp_fx_eur') {
        const data = await fetchNBPFxHistory('EUR', from, to);
        return NextResponse.json({ data: data.map(p => ({ date: p.date, value: p.value })) });
      }
      if (key === 'nbp_fx_usd') {
        const data = await fetchNBPFxHistory('USD', from, to);
        return NextResponse.json({ data: data.map(p => ({ date: p.date, value: p.value })) });
      }
      if (key === 'cpi_pl_ror') {
        // NOWA STRATEGIA: Eurostat jako główne źródło, GUS jako backup
        console.log('[SERIES API] Fetching CPI data - trying Eurostat first...');
        
        let data: any[] = [];
        let source = 'unknown';
        
        try {
          // Próba 1: Eurostat (miesięczne, aktualne)
          const eurostatData = await fetchEurostatCpiHistory(from, to);
          if (eurostatData.length > 0) {
            data = eurostatData.map(point => ({ date: point.date, value: point.value }));
            source = 'eurostat';
            console.log(`[SERIES API] SUCCESS: Eurostat returned ${data.length} data points`);
          }
        } catch (error) {
          console.log('[SERIES API] Eurostat failed:', error);
        }
        
        // Próba 2: GUS jako backup (roczne, opóźnione)
        if (data.length === 0) {
          console.log('[SERIES API] Eurostat failed, trying GUS...');
          try {
            const gusData = await fetchMonthlyCpiData(from, to);
            if (gusData.length > 0) {
              data = gusData.map(point => ({ date: point.date, value: point.value }));
              source = 'gus';
              console.log(`[SERIES API] SUCCESS: GUS returned ${data.length} data points`);
            }
          } catch (error) {
            console.log('[SERIES API] GUS also failed:', error);
          }
        }
        
        console.log(`[SERIES API] Final result: ${data.length} points from ${source}`);
        return NextResponse.json({ 
          data: data.map(p => ({ date: p.date, value: p.value })),
          source,
          count: data.length
        });
      }
    }

    // 1) Próba z bazy, jeśli mamy zsynchronizowaną serię (i brak specjalnego źródła)
    const client: any = prisma as any;
    const series = await client.marketSeries.findUnique({ where: { key } });
    if (series) {
      const where: any = { seriesId: series.id };
      if (from) where.date = { ...(where.date || {}), gte: new Date(from) };
      if (to) where.date = { ...(where.date || {}), lte: new Date(to) };
      const points = await client.observation.findMany({ where, orderBy: { date: 'asc' } });
      if (points.length > 0) return NextResponse.json({ data: points });
    }

    return NextResponse.json({ data: [] });
  } catch (e) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Series fetch failed' } }, { status: 500 });
  }
}
