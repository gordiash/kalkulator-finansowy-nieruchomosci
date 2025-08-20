'use client';

import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface ChartComponentsProps {
  data: any[];
  mainIsCity: boolean;
  title: string;
  leftKeys: string[];
  rightKeys: string[];
  yDomainLeft: [number | 'auto', number | 'auto'];
  yDomainRight: [number | 'auto', number | 'auto'];
  scale: 'linear' | 'log';
  overlays: string[];
}

// Memoizowane komponenty pomocnicze dla lepszej wydajności
const MacroLines = memo(function MacroLines({ overlays, data }: { overlays: string[], data: any[] }) {
  // Upewnij się, że każdy klucz jest unikalny
  const uniqueOverlays = Array.from(new Set(overlays.filter(k => !k.startsWith('city:'))));
  
  return (
    <>
      {uniqueOverlays.map((k) => (
          <Line 
            key={`macro-${k}`} 
            yAxisId="left" 
            type="linear" 
            dataKey={k} 
            name={k === 'cpi_pl_ror' ? 'CPI r/r' : 
                 k === 'nbp_fx_eur' ? 'EUR' :
                 k === 'nbp_fx_usd' ? 'USD' : k} 
            stroke={k === 'cpi_pl_ror' ? "#f59e0b" :
                   k === 'nbp_fx_eur' ? "#22c55e" :
                   k === 'nbp_fx_usd' ? "#ef4444" : "#a855f7"} 
            strokeWidth={2} 
            dot={false} 
            connectNulls={true}
          />
        ))}
    </>
  );
});

const CityLines = memo(function CityLines({ overlays, data }: { overlays: string[], data: any[] }) {
  const cityColors = useMemo(() => ['#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'], []);
  
  // Upewnij się, że każdy klucz jest unikalny
  const uniqueCityOverlays = Array.from(new Set(overlays.filter(k => k.startsWith('city:'))));

  return (
    <>
      {uniqueCityOverlays.map((k, idx) => {
          const stroke = cityColors[idx % cityColors.length];
          const cityName = k.split(':')[1];
          return (
            <Line 
              key={`city-${k}`} 
              yAxisId="right" 
              type="linear" 
              dataKey={k} 
              name={`${cityName} (zł/m²)`} 
              stroke={stroke} 
              strokeWidth={3} 
              dot={false} 
              connectNulls={true}
            />
          );
        })}
    </>
  );
});

// Główny komponent wykresu
const ChartComponents = memo(function ChartComponents({
  data,
  mainIsCity,
  title,
  leftKeys,
  rightKeys,
  yDomainLeft,
  yDomainRight,
  scale,
  overlays
}: ChartComponentsProps) {
  // Memoizowane funkcje formatujące
  const formatXAxisTick = useMemo(() => (value: string) => {
    const date = new Date(value);
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }, []);

  const formatYAxisLeftTick = useMemo(() => (v: number) => {
    if (!Number.isFinite(v)) return '';
    const hasFx = leftKeys.some(k => k === 'nbp_fx_eur' || k === 'nbp_fx_usd');
    return (hasFx ? Number(v).toFixed(2) : Number(v).toFixed(1));
  }, [leftKeys]);

  const formatYAxisRightTick = useMemo(() => (v: number) => {
    if (!Number.isFinite(v)) return '';
    return `${Number(v).toFixed(0)} zł/m²`;
  }, []);

  const formatTooltipValue = useMemo(() => (value: any, _name: any, props: any) => {
    const key = String(props?.dataKey ?? '');
    const decimals = (key === 'nbp_fx_eur' || key === 'nbp_fx_usd') ? 2 : 
                   (key.startsWith('city:') ? 0 : 1);
    const num = typeof value === 'number' ? value : Number(value);
    
    if (!Number.isFinite(num) || value === undefined) {
      return ['Brak danych', props?.name ?? _name];
    }
    
    const formattedValue = num.toFixed(decimals);
    
    if (key.startsWith('city:') || (key === 'main' && mainIsCity)) {
      return [`${formattedValue} zł/m²`, props?.name ?? _name];
    }
    
    return [formattedValue, props?.name ?? _name];
  }, [mainIsCity]);

  const formatTooltipLabel = useMemo(() => (label: string) => {
    const date = new Date(label);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="date" 
          stroke="#cbd5e1" 
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickFormatter={formatXAxisTick}
        />
        {leftKeys.length > 0 && (
          <YAxis
            yAxisId="left"
            stroke="#cbd5e1"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            scale={scale}
            domain={yDomainLeft}
            allowDataOverflow
            label={{ 
              value: 'Wartość (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: '12px' }
            }}
            tickFormatter={formatYAxisLeftTick}
          />
        )}
        {rightKeys.length > 0 && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#cbd5e1"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            scale="linear"
            domain={yDomainRight}
            allowDataOverflow
            label={{ 
              value: 'Cena (zł/m²)', 
              angle: 90, 
              position: 'insideRight',
              style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: '12px' }
            }}
            tickFormatter={formatYAxisRightTick}
          />
        )}
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0' }}
          formatter={formatTooltipValue}
          labelFormatter={formatTooltipLabel}
        />
        <Legend 
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '12px'
          }}
        />
        <Line 
          yAxisId={mainIsCity ? 'right' : 'left'} 
          type="linear" 
          dataKey="main" 
          name={title} 
          stroke={mainIsCity ? "#dc2626" : "#60a5fa"} 
          strokeWidth={mainIsCity ? 3 : 2} 
          dot={false} 
          connectNulls={true}
        />
        <MacroLines overlays={overlays} data={data} />
        <CityLines overlays={overlays} data={data} />
      </LineChart>
    </ResponsiveContainer>
  );
});

// Eksportuj jako dynamiczny komponent z wyłączonym SSR
export default ChartComponents;