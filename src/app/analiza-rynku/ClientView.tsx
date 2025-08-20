'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Filters, { type FiltersState } from './Filters';

// Dynamicznie importuj komponenty wykresu
const ChartComponents = dynamic(() => import('./ChartComponents'), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-slate-400 text-lg mb-2">Ładowanie wykresu...</div>
      </div>
    </div>
  ),
  ssr: false
});

interface SeriesPoint { date: string; value: number }

function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function fetchSingleSeries(seriesKey: string, from: string, to: string): Promise<SeriesPoint[]> {
  if (seriesKey.startsWith('city:')) {
    const city = seriesKey.split(':')[1];
    if (!city) return [];
    
    try {
      const params = new URLSearchParams({ city });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/market/city-prices?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const data = (json?.data ?? []) as SeriesPoint[];
        
        const processedData = data
          .map(p => ({ 
            date: p.date.length === 10 ? p.date : p.date.slice(0, 10), 
            value: Number(p.value) 
          }))
          .filter(p => Number.isFinite(p.value))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        if (processedData.length === 1) {
          const singlePoint = processedData[0];
          const endDate = to || formatDateLocal(new Date());
          if (singlePoint.date !== endDate) {
            processedData.push({
              date: endDate,
              value: singlePoint.value
            });
          }
        }
        
        return processedData;
      }
    } catch (error) {
      console.error(`Błąd pobierania danych dla miasta ${city}:`, error);
    }
    return [];
  }
  
  if (seriesKey === 'cpi_pl_ror') {
    try {
      const params = new URLSearchParams({ type: 'history' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      
      const res = await fetch(`/api/market/cpi?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const data = (json?.data ?? []) as SeriesPoint[];
        
        const processedData = data
          .map(p => ({ 
            date: p.date.length === 10 ? p.date : p.date.slice(0, 10), 
            value: Number(p.value) 
          }))
          .filter(p => Number.isFinite(p.value))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        if (processedData.length === 1) {
          const singlePoint = processedData[0];
          const endDate = to || formatDateLocal(new Date());
          if (singlePoint.date !== endDate) {
            processedData.push({
              date: endDate,
              value: singlePoint.value
            });
          }
        }
        
        return processedData;
      }
    } catch (error) {
      console.error('Błąd pobierania danych CPI:', error);
    }
    return [];
  }
  
  try {
    const params = new URLSearchParams({ key: seriesKey });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const res = await fetch(`/api/market/series?${params.toString()}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const points = (json?.data ?? []) as Array<{ date: string; value: number }>;
      if (points.length > 0) {
        const mapped = points
          .map((p) => ({ date: String(p.date).slice(0, 10), value: Number(p.value) }))
          .filter(p => Number.isFinite(p.value))
          .sort((a, b) => a.date.localeCompare(b.date));
        return mapped;
      }
    }
  } catch (error) {
    console.error(`Błąd pobierania serii ${seriesKey}:`, error);
  }
  
  try {
    const res = await fetch('/api/market/indicators', { cache: 'no-store' });
    if (res.ok) {
      const snap = await res.json();
      const item = (snap?.data ?? []).find((x: any) => x.key === seriesKey);
      if (item && Number.isFinite(Number(item.value))) {
        const baseValue = Number(item.value);
        const out: SeriesPoint[] = [];
        const end = to ? new Date(to) : new Date();
        const start = from ? new Date(from) : new Date(end.getFullYear() - 1, end.getMonth(), 1);
        
        const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cursor <= end) {
          out.push({ date: formatDateLocal(cursor), value: baseValue });
          cursor.setMonth(cursor.getMonth() + 1);
        }
        return out;
      }
    }
  } catch (error) {
    console.error(`Błąd pobierania wskaźników dla ${seriesKey}:`, error);
  }
  
  return [];
}

export default function ClientView() {
  // Ustaw początkowy zakres dat (ostatni rok do bieżącego miesiąca)
  const now = new Date();
  const initTo = new Date(now.getFullYear(), now.getMonth(), 1); // Pierwszy dzień bieżącego miesiąca
  const initFrom = new Date(initTo);
  initFrom.setFullYear(initTo.getFullYear() - 1);
  
  const [filters, setFilters] = useState<FiltersState>(() => ({
    seriesKey: 'nbp_reference_rate',
    from: formatDateLocal(initFrom),
    to: formatDateLocal(initTo),
    overlays: ['cpi_pl_ror']
  }));
  const [scale, setScale] = useState<'linear' | 'log'>('linear');
  const [dataMain, setDataMain] = useState<SeriesPoint[]>([]);
  const [dataOver, setDataOver] = useState<Record<string, SeriesPoint[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        // Usuń duplikaty z overlays
        const uniqueOverlays = Array.from(new Set(filters.overlays));
        
        const [mainData, ...overlayData] = await Promise.all([
          fetchSingleSeries(filters.seriesKey, filters.from, filters.to),
          ...uniqueOverlays.map(key => fetchSingleSeries(key, filters.from, filters.to))
        ]);
        
        if (!cancelled) {
          setDataMain(mainData);
          const map: Record<string, SeriesPoint[]> = {};
          uniqueOverlays.forEach((k, i) => { map[k] = overlayData[i] || []; });
          setDataOver(map);
        }
      } catch (error) {
        // Błędy są już logowane w fetchSingleSeries
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    fetchData();
    return () => { cancelled = true; };
  }, [filters]);

  const title = useMemo(() => {
    if (filters.seriesKey.startsWith('city:')) {
      return `Średnia cena m²: ${filters.seriesKey.split(':')[1]} (zł/m²)`;
    }
    
    switch (filters.seriesKey) {
      case 'nbp_reference_rate': return 'Stopa referencyjna NBP';
      case 'cpi_pl_ror': return 'Inflacja CPI r/r';
      case 'nbp_fx_eur': return 'Kurs EUR';
      case 'nbp_fx_usd': return 'Kurs USD';
      default: return filters.seriesKey;
    }
  }, [filters.seriesKey]);

  const merged = useMemo(() => {
    // Zbuduj indeks daty -> wartości dla każdej serii
    const dateSet = new Set<string>();
    dataMain.forEach(p => dateSet.add(p.date));
    for (const k of Object.keys(dataOver)) {
      (dataOver[k] || []).forEach(p => dateSet.add(p.date));
    }
    const dates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
    
    if (dates.length === 0) return [];
    
    const indexMain = new Map(dataMain.map(p => [p.date, p.value]));
    const indexOver: Record<string, Map<string, number>> = {};
    for (const k of Object.keys(dataOver)) {
      indexOver[k] = new Map((dataOver[k] || []).map(p => [p.date, p.value]));
    }
    
    // Filtruj daty, aby usunąć te bez żadnych danych
    const filteredDates = dates.filter(d => {
      const mainValue = indexMain.get(d);
      const hasOverlayData = filters.overlays.some(k => {
        const v = indexOver[k]?.get(d);
        return typeof v === 'number' && Number.isFinite(v);
      });
      return (typeof mainValue === 'number' && Number.isFinite(mainValue)) || hasOverlayData;
    });
    
    return filteredDates.map((d) => {
      const mainValue = indexMain.get(d);
      const row: any = { date: d, main: mainValue };
      
      for (const k of filters.overlays) {
        const v = indexOver[k]?.get(d);
        row[k] = typeof v === 'number' && Number.isFinite(v) ? v : undefined;
      }
      
      return row;
    });
  }, [dataMain, dataOver, filters.overlays]);

  const mainIsCity = filters.seriesKey.startsWith('city:');

  const leftKeys = useMemo(() => {
    const macros = ['cpi_pl_ror', 'nbp_fx_eur', 'nbp_fx_usd'];
    const keys: string[] = [];
    if (!mainIsCity) keys.push('main');
    for (const k of filters.overlays) if (macros.includes(k)) keys.push(k);
    return keys;
  }, [filters.overlays, mainIsCity]);

  const rightKeys = useMemo(() => {
    const keys: string[] = [];
    if (mainIsCity) keys.push('main');
    for (const k of filters.overlays) if (k.startsWith('city:')) keys.push(k);
    return keys;
  }, [filters.overlays, mainIsCity]);

  function computeDomain(keys: string[], scaleKind: 'linear' | 'log'): [number | 'auto', number | 'auto'] {
    if (!merged.length || keys.length === 0) return ['auto', 'auto'];
    
    const vals = merged.flatMap(row => 
      keys.map(k => row[k]).filter((v): v is number => 
        typeof v === 'number' && Number.isFinite(v)
      )
    );
    
    if (!vals.length) return ['auto', 'auto'];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    
    if (scaleKind === 'log') {
      const positiveVals = vals.filter(v => v > 0);
      if (positiveVals.length === 0) return ['auto', 'auto'];
      const minPos = Math.min(...positiveVals);
      const maxPos = Math.max(...positiveVals);
      return [Math.max(0.01, minPos / 1.1), maxPos * 1.1];
    }
    
    const span = Math.max(0, max - min);
    const pad = Math.max(span * 0.1, span === 0 ? Math.max(1, Math.abs(max) * 0.1 || 1) : 0);
    return [min - pad, max + pad];
  }

  const yDomainLeft = useMemo(() => computeDomain(leftKeys, scale), [leftKeys, merged, scale, computeDomain]);
  const yDomainRight = useMemo(() => computeDomain(rightKeys, 'linear'), [rightKeys, merged, computeDomain]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Filters onChange={(f) => {
          setFilters(f);
          if (f.seriesKey.startsWith('city:')) setScale('linear');
        }} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-slate-300 text-sm">Skala:</span>
        <button onClick={() => setScale('linear')} className={`px-3 py-1 rounded-lg text-sm ${scale==='linear'?'bg-blue-600 text-white':'bg-slate-800 text-slate-300 border border-slate-700'}`}>Linear</button>
        <button onClick={() => setScale('log')} disabled={filters.seriesKey.startsWith('city:')} className={`px-3 py-1 rounded-lg text-sm ${(scale==='log'&&!filters.seriesKey.startsWith('city:'))?'bg-blue-600 text-white':'bg-slate-800 text-slate-300 border border-slate-700'}`}>Log</button>
      </div>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {loading && <span className="text-slate-400 text-sm">Wczytywanie…</span>}
        </div>
        <div className="h-[420px] md:h-[520px] lg:h-[640px]">
          {merged.length > 0 ? (
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-slate-400 text-lg mb-2">Ładowanie wykresu...</div>
                </div>
              </div>
            }>
              <ChartComponents 
                data={merged}
                mainIsCity={mainIsCity}
                title={title}
                leftKeys={leftKeys}
                rightKeys={rightKeys}
                yDomainLeft={yDomainLeft}
                yDomainRight={yDomainRight}
                scale={scale}
                overlays={filters.overlays}
              />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-slate-400 text-lg mb-2">Brak danych do wyświetlenia</div>
                <div className="text-slate-500 text-sm">
                  {loading ? 'Wczytywanie danych...' : 'Spróbuj wybrać inny zakres dat lub serię danych'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}