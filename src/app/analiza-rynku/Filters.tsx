'use client';

import { useEffect, useMemo, useState } from 'react';
import { MultiSelect } from '@/components/ui/multi-select';

export type FiltersState = {
  seriesKey: string;
  from: string;
  to: string;
  overlays: string[];
};

function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const STATIC_SERIES = [
  { key: 'nbp_reference_rate', label: 'Stopa referencyjna NBP' },
  { key: 'cpi_pl_ror', label: 'Inflacja CPI r/r' },
  { key: 'nbp_fx_eur', label: 'Kurs EUR' },
  { key: 'nbp_fx_usd', label: 'Kurs USD' },
];

export default function Filters({ onChange }: { onChange: (f: FiltersState) => void }) {
  const [seriesKey, setSeriesKey] = useState<string>('nbp_reference_rate');
  const initTo = new Date();
  const initFrom = new Date();
  initFrom.setFullYear(initTo.getFullYear() - 1);
  const [from, setFrom] = useState<string>(formatDateLocal(initFrom));
  const [to, setTo] = useState<string>(formatDateLocal(initTo));
  const [overlays, setOverlays] = useState<string[]>(['cpi_pl_ror']);
  const [pendingFrom, setPendingFrom] = useState<string>(formatDateLocal(initFrom));
  const [pendingTo, setPendingTo] = useState<string>(formatDateLocal(initTo));
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/market/cities').then(r => r.json()).then(json => {
      if (!cancelled) setCities(Array.isArray(json?.data) ? json.data : []);
    }).catch(() => { if (!cancelled) setCities([]); });
    return () => { cancelled = true; };
  }, []);

  // Emituj zmiany do rodzica po commitcie stanu (unikanie setState podczas renderu innego komponentu)
  useEffect(() => {
    onChange({ seriesKey, from, to, overlays });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesKey, overlays, from, to]);

  const toggleOverlay = (key: string) => {
    setOverlays(prev => {
      // Usuń duplikaty i zachowaj kolejność
      const uniquePrev = Array.from(new Set(prev));
      const next = uniquePrev.includes(key) ? uniquePrev.filter(k => k !== key) : [...uniquePrev, key];
      return next;
    });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="series-select" className="text-sm text-slate-300">Seria danych</label>
          <select 
            id="series-select"
            value={seriesKey} 
            onChange={(e) => { const v = e.target.value; setSeriesKey(v); }} 
            className="bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700"
          >
            {STATIC_SERIES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
            {cities.map(city => (
              <option key={`city:${city}`} value={`city:${city}`}>Cena m²: {city}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="date-from" className="text-sm text-slate-300">Data od</label>
          <input 
            id="date-from"
            type="date" 
            value={pendingFrom} 
            onChange={(e) => { const v = e.target.value; setPendingFrom(v); }} 
            className="bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700" 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="date-to" className="text-sm text-slate-300">Data do</label>
          <input 
            id="date-to"
            type="date" 
            value={pendingTo} 
            onChange={(e) => { const v = e.target.value; setPendingTo(v); }} 
            className="bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700" 
          />
        </div>
        <button type="button" onClick={() => {
          // walidacja i porządkowanie zakresu
          let f = pendingFrom; let t = pendingTo;
          if (f && t && f > t) { const tmp = f; f = t; t = tmp; }
          setFrom(f);
          setTo(t);
        }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Zastosuj</button>
      </div>
      <div className="flex flex-col gap-2 text-slate-300">
        <span className="text-sm">Dodatkowe serie:</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1">Makro</label>
            <MultiSelect
              options={['Brak', ...STATIC_SERIES.map(s => s.label)]}
              value={(() => {
                // Użyj Map do zachowania unikalności kluczy i mapowania
                const keyToLabel = new Map(STATIC_SERIES.map(s => [s.key, s.label]));
                const macroOverlays = Array.from(new Set(
                  overlays
                    .filter(k => STATIC_SERIES.some(s => s.key === k))
                    .map(k => keyToLabel.get(k))
                    .filter((label): label is string => label !== undefined)
                ));
                return macroOverlays.length > 0 ? macroOverlays : ['Brak'];
              })()}
              onChange={(selected) => {
                setOverlays(prev => {
                  // Zachowaj elementy, które nie są makro wskaźnikami
                  const nonMacro = prev.filter(k => !STATIC_SERIES.some(s => s.key === k));
                  
                  if (selected.includes('Brak') || selected.length === 0) {
                    return nonMacro;
                  }
                  
                  // Użyj Map do odwrotnego mapowania label -> key
                  const labelToKey = new Map(STATIC_SERIES.map(s => [s.label, s.key]));
                  const uniqueMacroKeys = Array.from(new Set(
                    selected
                      .map(label => labelToKey.get(label))
                      .filter((key): key is string => key !== undefined)
                  ));
                  
                  return [...nonMacro, ...uniqueMacroKeys];
                });
              }}
              aria-label="Dodatkowe serie makro"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Miasta</label>
            <MultiSelect
              options={['Brak', ...cities]}
              value={(() => {
                // Wyodrębnij unikalne nazwy miast z overlays
                const cityOverlays = Array.from(new Set(
                  overlays
                    .filter(k => k.startsWith('city:'))
                    .map(k => k.split(':')[1])
                ));
                return cityOverlays.length > 0 ? cityOverlays : ['Brak'];
              })()}
              onChange={(selected) => {
                setOverlays(prev => {
                  // Zachowaj elementy, które nie są miastami
                  const nonCity = prev.filter(k => !k.startsWith('city:'));
                  
                  if (selected.includes('Brak') || selected.length === 0) {
                    return nonCity;
                  }
                  
                  // Dodaj unikalne miasta
                  const uniqueCityKeys = Array.from(new Set(
                    selected
                      .filter(city => city !== 'Brak')
                      .map(city => `city:${city}`)
                  ));
                  
                  return [...nonCity, ...uniqueCityKeys];
                });
              }}
              aria-label="Dodatkowe serie miast"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
