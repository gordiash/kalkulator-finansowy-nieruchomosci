import { NextRequest, NextResponse } from 'next/server';
import { fetchMonthlyCpiData, fetchCpiYoYLatest } from '@/lib/market/gus';
import { fetchEurostatCpiLatest, fetchEurostatCpiHistory } from '@/lib/market/eurostat';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'latest';
    const from = searchParams.get('from') || '2024-08-17';
    const to = searchParams.get('to') || '2025-08-17';

    if (type === 'latest') {
      // Porównaj najnowsze dane z obu źródeł
      const [gusData, eurostatData] = await Promise.allSettled([
        fetchCpiYoYLatest(),
        fetchEurostatCpiLatest()
      ]);

      const comparison = {
        timestamp: new Date().toISOString(),
        sources: {
          gus: {
            status: gusData.status,
            data: gusData.status === 'fulfilled' ? gusData.value : null,
            error: gusData.status === 'rejected' ? gusData.reason?.message : null
          },
          eurostat: {
            status: eurostatData.status,
            data: eurostatData.status === 'fulfilled' ? eurostatData.value : null,
            error: eurostatData.status === 'rejected' ? eurostatData.reason?.message : null
          }
        },
        analysis: {
          bothAvailable: gusData.status === 'fulfilled' && eurostatData.status === 'fulfilled',
          difference: null as number | null,
          percentageDifference: null as number | null,
          recommendation: 'unknown'
        }
      };

      // Jeśli oba źródła mają dane, oblicz różnicę
      if (comparison.analysis.bothAvailable && 
          comparison.sources.gus.data && 
          comparison.sources.eurostat.data) {
        const gusValue = comparison.sources.gus.data.value;
        const eurostatValue = comparison.sources.eurostat.data.value;
        
        comparison.analysis.difference = Math.abs(gusValue - eurostatValue);
        comparison.analysis.percentageDifference = 
          Math.abs((gusValue - eurostatValue) / ((gusValue + eurostatValue) / 2)) * 100;
        
        // Rekomendacja na podstawie różnicy
        if (comparison.analysis.percentageDifference < 5) {
          comparison.analysis.recommendation = 'both_reliable';
        } else if (comparison.analysis.percentageDifference < 15) {
          comparison.analysis.recommendation = 'moderate_difference';
        } else {
          comparison.analysis.recommendation = 'significant_difference';
        }
      }

      return NextResponse.json(comparison);
    }

    if (type === 'history') {
      // Porównaj dane historyczne z obu źródeł
      const [gusData, eurostatData] = await Promise.allSettled([
        fetchMonthlyCpiData(from, to),
        fetchEurostatCpiHistory(from, to)
      ]);

      const comparison = {
        timestamp: new Date().toISOString(),
        dateRange: { from, to },
        sources: {
          gus: {
            status: gusData.status,
            dataCount: gusData.status === 'fulfilled' ? gusData.value.length : 0,
            data: gusData.status === 'fulfilled' ? gusData.value : [],
            error: gusData.status === 'rejected' ? gusData.reason?.message : null
          },
          eurostat: {
            status: eurostatData.status,
            dataCount: eurostatData.status === 'fulfilled' ? eurostatData.value.length : 0,
            data: eurostatData.status === 'fulfilled' ? eurostatData.value : [],
            error: eurostatData.status === 'rejected' ? eurostatData.reason?.message : null
          }
        },
        analysis: {
          bothAvailable: gusData.status === 'fulfilled' && eurostatData.status === 'fulfilled',
          commonPeriods: [] as any[],
          averageDifference: null as number | null,
          maxDifference: null as number | null,
          recommendation: 'unknown'
        }
      };

      // Jeśli oba źródła mają dane, znajdź wspólne okresy i oblicz różnice
      if (comparison.analysis.bothAvailable && 
          comparison.sources.gus.data.length > 0 && 
          comparison.sources.eurostat.data.length > 0) {
        
        const gusMap = new Map(comparison.sources.gus.data.map((item: any) => [item.date, item.value]));
        const eurostatMap = new Map(comparison.sources.eurostat.data.map((item: any) => [item.date, item.value]));
        
        const commonDates = [...gusMap.keys()].filter(date => eurostatMap.has(date));
        
        comparison.analysis.commonPeriods = commonDates.map(date => {
          const gusValue = gusMap.get(date)!;
          const eurostatValue = eurostatMap.get(date)!;
          const difference = Math.abs(gusValue - eurostatValue);
          const percentageDifference = Math.abs((gusValue - eurostatValue) / ((gusValue + eurostatValue) / 2)) * 100;
          
          return {
            date,
            gus: gusValue,
            eurostat: eurostatValue,
            difference,
            percentageDifference
          };
        });

        if (comparison.analysis.commonPeriods.length > 0) {
          const differences = comparison.analysis.commonPeriods.map(p => p.percentageDifference);
          comparison.analysis.averageDifference = differences.reduce((a, b) => a + b, 0) / differences.length;
          comparison.analysis.maxDifference = Math.max(...differences);
          
          // Rekomendacja na podstawie średniej różnicy
          if (comparison.analysis.averageDifference < 5) {
            comparison.analysis.recommendation = 'both_reliable';
          } else if (comparison.analysis.averageDifference < 15) {
            comparison.analysis.recommendation = 'moderate_difference';
          } else {
            comparison.analysis.recommendation = 'significant_difference';
          }
        }
      }

      return NextResponse.json(comparison);
    }

    return NextResponse.json({ error: 'Invalid type. Use "latest" or "history"' }, { status: 400 });

  } catch (error) {
    console.error('[CPI COMPARISON] Error:', error);
    return NextResponse.json(
      { error: 'Failed to compare CPI data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}