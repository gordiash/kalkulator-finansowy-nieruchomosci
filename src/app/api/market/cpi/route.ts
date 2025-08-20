import { NextRequest, NextResponse } from 'next/server';
import { fetchMonthlyCpiData, fetchCpiYoYLatest } from '@/lib/market/gus';
import { fetchEurostatCpiHistory, fetchEurostatCpiLatest } from '@/lib/market/eurostat';
import { rateLimitMiddleware } from '@/lib/rateLimit';

export const revalidate = 3600; // 1 hour

export async function GET(req: NextRequest) {
  try {
    const limited = rateLimitMiddleware(60, 60_000)(req);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'history';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const months = searchParams.get('months');

    switch (type) {
      case 'latest':
        // Pobierz najnowsze dane CPI - najpierw GUS, potem Eurostat
        let latest = await fetchCpiYoYLatest();
        
        if (!latest) {
          console.log('[CPI API] GUS failed, trying Eurostat...');
          const eurostatLatest = await fetchEurostatCpiLatest();
          if (eurostatLatest) {
            // Konwertuj format Eurostat do standardowego
            latest = {
              key: 'cpi_pl_ror',
              name: eurostatLatest.name,
              unit: eurostatLatest.unit,
              value: eurostatLatest.value,
              date: eurostatLatest.date,
              source: 'eurostat' as any
            };
          }
        }
        
        if (!latest) {
          return NextResponse.json(
            { error: { code: 'NO_DATA', message: 'Brak najnowszych danych CPI z GUS i Eurostat' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ data: latest });

      case 'history':
        // Pobierz historię CPI
        let fromDate = from;
        let toDate = to;

        // Jeśli nie podano zakresu lub podane daty są w przyszłości, użyj ostatnich N miesięcy
        const now = new Date();
        const monthsCount = months ? parseInt(months) : 24;
        
        // Jeśli nie podano dat lub podane daty są w przyszłości, ustaw zakres na ostatnie N miesięcy
        if (!fromDate || !toDate || new Date(fromDate) > now || new Date(toDate) > now) {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setMonth(endDate.getMonth() - monthsCount);

          fromDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`;
          toDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-01`;
        }
        
        // Upewnij się, że data końcowa nie jest w przyszłości
        const toDateObj = new Date(toDate);
        if (toDateObj > now) {
          toDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        }

        console.log(`CPI API: fetching history from ${fromDate} to ${toDate}`);

        let historyData = await fetchMonthlyCpiData(fromDate, toDate);
        let dataSource = 'GUS BDL';
        
        // Jeśli GUS nie zwrócił danych, spróbuj Eurostat
        if (!historyData || historyData.length === 0) {
          console.log('[CPI API] GUS failed, trying Eurostat...');
          const eurostatData = await fetchEurostatCpiHistory(fromDate, toDate);
          if (eurostatData.length > 0) {
            historyData = eurostatData.map(point => ({ date: point.date, value: point.value }));
            dataSource = 'Eurostat';
          }
        }
        
        if (!historyData || historyData.length === 0) {
          return NextResponse.json(
            { error: { code: 'NO_DATA', message: 'Brak danych historycznych CPI z GUS i Eurostat' } },
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          data: historyData,
          meta: {
            count: historyData.length,
            from: fromDate,
            to: toDate,
            source: dataSource
          }
        });

      default:
        return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'Nieprawidłowy typ żądania' } },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('CPI API error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Błąd podczas pobierania danych CPI' } },
      { status: 500 }
    );
  }
}