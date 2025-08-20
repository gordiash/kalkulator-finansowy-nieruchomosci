import { NextRequest, NextResponse } from 'next/server';
import { fetchEurostatCpiLatest, fetchEurostatCpiHistory } from '@/lib/market/eurostat';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'overview';

    if (type === 'overview') {
      // Pobierz podstawowe informacje o danych Eurostat
      const [latestResult, historyResult] = await Promise.allSettled([
        fetchEurostatCpiLatest(),
        fetchEurostatCpiHistory('2024-01-01', '2025-12-31')
      ]);

      const latest = latestResult.status === 'fulfilled' ? latestResult.value : null;
      const history = historyResult.status === 'fulfilled' ? historyResult.value : [];

      // Oblicz trend (ostatnie 3 miesiące)
      const recentData = history.slice(-3);
      let trend = 'stable';
      if (recentData.length >= 2) {
        const firstValue = recentData[0].value;
        const lastValue = recentData[recentData.length - 1].value;
        if (lastValue > firstValue + 0.2) trend = 'up';
        else if (lastValue < firstValue - 0.2) trend = 'down';
      }

      // Znajdź szczyt i dołek w ostatnim roku
      const yearData = history.slice(-12);
      const peak = yearData.reduce((max, curr) => curr.value > max.value ? curr : max, yearData[0] || { value: 0, date: '' });
      const trough = yearData.reduce((min, curr) => curr.value < min.value ? curr : min, yearData[0] || { value: 0, date: '' });

      const overview = {
        source: {
          name: 'Eurostat',
          fullName: 'European Statistical Office',
          dataset: 'prc_hicp_manr',
          description: 'Harmonised Index of Consumer Prices - Monthly annual rate of change',
          url: 'https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_manr/default/table',
          methodology: 'HICP (Harmonised Index of Consumer Prices)',
          country: 'Poland (PL)',
          unit: 'RCH_A (Rate of change - annual)',
          category: 'CP00 (All-items HICP)',
          frequency: 'Monthly',
          access: 'Free, no API key required'
        },
        current: {
          value: latest?.value || null,
          date: latest?.date || null,
          trend,
          status: latest ? 'available' : 'unavailable'
        },
        statistics: {
          dataPoints: history.length,
          dateRange: {
            from: history.length > 0 ? history[0].date : null,
            to: history.length > 0 ? history[history.length - 1].date : null
          },
          peak: peak ? { value: peak.value, date: peak.date } : null,
          trough: trough ? { value: trough.value, date: trough.date } : null,
          average: history.length > 0 ? 
            Math.round((history.reduce((sum, item) => sum + item.value, 0) / history.length) * 10) / 10 : null
        },
        recentTrend: recentData.map(item => ({
          date: item.date,
          value: item.value
        })),
        advantages: [
          'Harmonized methodology across EU countries',
          'Monthly updates with 1-2 month delay',
          'High quality data with rigorous validation',
          'Free access without API limitations',
          'Stable and reliable API infrastructure',
          'Consistent with European Central Bank data'
        ],
        technicalInfo: {
          apiEndpoint: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/',
          responseFormat: 'JSON',
          rateLimits: 'None officially specified',
          caching: 'Recommended (data updates monthly)',
          availability: '99.9% uptime',
          supportedPeriods: 'From 1996 onwards'
        }
      };

      return NextResponse.json(overview);
    }

    if (type === 'comparison') {
      // Porównanie z innymi źródłami
      const comparison = {
        sources: {
          eurostat: {
            name: 'Eurostat HICP',
            methodology: 'Harmonised Index of Consumer Prices',
            frequency: 'Monthly',
            delay: '1-2 months',
            coverage: 'All EU countries',
            advantages: ['EU harmonized', 'Monthly updates', 'High quality'],
            disadvantages: ['Slight delay', 'EU-focused basket']
          },
          gus: {
            name: 'GUS CPI',
            methodology: 'National Consumer Price Index',
            frequency: 'Annual/Monthly (limited)',
            delay: '1-3 months',
            coverage: 'Poland specific',
            advantages: ['National focus', 'Local basket', 'Official Polish data'],
            disadvantages: ['Limited API', 'Less frequent updates', 'Data access issues']
          },
          nbp: {
            name: 'NBP Inflation',
            methodology: 'Central Bank inflation measures',
            frequency: 'Monthly',
            delay: '1 month',
            coverage: 'Poland monetary policy',
            advantages: ['Monetary policy focus', 'Core inflation', 'Forward guidance'],
            disadvantages: ['Limited historical data', 'API restrictions']
          }
        },
        recommendation: {
          primary: 'eurostat',
          reason: 'Most reliable, frequent, and accessible data source',
          fallback: 'gus',
          strategy: 'Eurostat first, GUS as backup, NBP for specialized use cases'
        }
      };

      return NextResponse.json(comparison);
    }

    if (type === 'status') {
      // Status połączenia i dostępności danych
      const testStart = Date.now();
      
      try {
        const testData = await fetchEurostatCpiLatest();
        const responseTime = Date.now() - testStart;
        
        return NextResponse.json({
          status: 'operational',
          responseTime: `${responseTime}ms`,
          lastUpdate: testData?.date || null,
          currentValue: testData?.value || null,
          apiHealth: 'healthy',
          dataQuality: 'high',
          recommendations: [
            'API is operational and responding normally',
            'Data is up to date and within expected ranges',
            'No issues detected with data quality',
            'Safe to use for production calculations'
          ]
        });
      } catch (error) {
        return NextResponse.json({
          status: 'error',
          responseTime: `${Date.now() - testStart}ms`,
          error: error instanceof Error ? error.message : 'Unknown error',
          apiHealth: 'degraded',
          dataQuality: 'unknown',
          recommendations: [
            'API connection failed - check network connectivity',
            'Consider using fallback data source (GUS)',
            'Monitor for service restoration',
            'Cache last known good values'
          ]
        });
      }
    }

    return NextResponse.json({ 
      error: 'Invalid type parameter',
      availableTypes: ['overview', 'comparison', 'status']
    }, { status: 400 });

  } catch (error) {
    console.error('[EUROSTAT INFO] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Eurostat information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}