'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

import { DataSection } from './DataSection';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import FlipperDetailsSection from './FlipperDetailsSection';
import GeneratePDFButton from '../GeneratePDFButton';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ReferenceLine } from 'recharts';
import { formatCurrency, formatCurrencyShort } from '@/lib/utils';

export default function CalculationDetailPage() {
  const [calculation, setCalculation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    
    const fetchCalculation = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error("Brak autoryzacji");

        const response = await fetch(`/api/user/calculations/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Nie udało się pobrać danych kalkulacji');
        }

        const data = await response.json();
        // Jeśli input/result to string (z bazy), zparseruj
        if (data && typeof data.input_json === 'string') {
          try { data.input_json = JSON.parse(data.input_json); } catch {}
        }
        if (data && typeof data.result_json === 'string') {
          try { data.result_json = JSON.parse(data.result_json); } catch {}
        }
        console.log('Pobrane dane kalkulacji:', data);
        
        // Sprawdź czy dane są poprawne
        if (!data.input_json || Object.keys(data.input_json).length === 0) {
          console.warn('Brak danych wejściowych w kalkulacji');
        }
        
        if (!data.result_json || Object.keys(data.result_json).length === 0) {
          console.warn('Brak danych wynikowych w kalkulacji');
        }
        
        setCalculation(data);

      } catch (err) {
        console.error('Błąd podczas pobierania kalkulacji:', err);
        setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalculation();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Ładowanie szczegółów kalkulacji..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} backLink="/panel/kalkulacje" />;
  }
  
  if (!calculation) {
    return <div>Nie znaleziono kalkulacji.</div>;
  }

  // Sprawdź czy dane są dostępne
  const hasInputData = calculation.input_json && Object.keys(calculation.input_json).length > 0;
  const hasResultData = calculation.result_json && Object.keys(calculation.result_json).length > 0;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <Link href="/panel/kalkulacje" className="text-blue-600 hover:underline">
            &larr; Wróć do listy
          </Link>
          <GeneratePDFButton 
            calculationId={calculation.id}
            calculationTitle={calculation.title || 'Kalkulacja'}
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">{calculation.title || (calculation.calculation_type === 'flipper' ? 'Kalkulacja flip' : 'Kalkulacja')}</h1>
        <p className="text-gray-500 mt-2">
          Szczegóły zapisanej kalkulacji z dnia {new Date(calculation.created_at).toLocaleDateString('pl-PL')}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Typ kalkulacji: {calculation.calculation_type}
        </p>
      </div>

      <div className="space-y-8">
        {/* Usunięto kartę "Dane wejściowe" */}
        
        {hasResultData && (
          <div className="w-full">
            <DataSection
              title={
                calculation.calculation_type === 'purchase' ? 'Wynik kalkulacji' :
                calculation.calculation_type === 'rentability' ? 'Wynik kalkulacji' :
                calculation.calculation_type === 'credit-score' ? 'Wynik kalkulacji' :
                calculation.calculation_type === 'flipper' ? 'Wynik kalkulacji' :
                'Wynik wyceny'
              }
              data={{
                ...calculation.result_json,
                inputData: calculation.input_json // Przekaż dane wejściowe do wyników
              }}
              calculationType={calculation.calculation_type}
            />
            {/* Szczegółowe dane wejściowe dla flipera */}
            {calculation.calculation_type === 'flipper' && (
              <div className="mt-8">
                <FlipperDetailsSection data={calculation.input_json} result={calculation.result_json} />
              </div>
            )}
            {/* Wykresy dla flipera */}
            {calculation.calculation_type === 'flipper' && (
              <div className="mt-8 grid grid-cols-1 gap-8">
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 font-semibold">Struktura kosztów</div>
                  <div className="p-4">
                    {(() => {
                      const pieData = [
                        { name: 'Zakup', value: calculation.result_json.koszt_zakupu_brutto || 0 },
                        { name: 'Remont', value: calculation.result_json.koszt_remontu_calkowity || 0 },
                        { name: 'Utrzymanie', value: calculation.result_json.koszty_utrzymania || 0 },
                        { name: 'Finansowanie', value: calculation.result_json.koszty_finansowania || 0 },
                        { name: 'Sprzedaż', value: calculation.result_json.koszty_sprzedazy || 0 },
                      ]
                      const total = pieData.reduce((s, x) => s + (x.value || 0), 0)
                      const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                      return (
                        <>
                          <div className="h-[340px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={120} dataKey="value">
                                  {COLORS.map((c, i) => (
                                    <Cell key={`cell-${i}`} fill={c} />
                                  ))}
                                </Pie>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#0f172a">
                                  <tspan x="50%" dy="-0.6em" className="text-[12px]">Suma kosztów</tspan>
                                  <tspan x="50%" dy="1.4em" className="font-semibold">{formatCurrency(total)}</tspan>
                                </text>
                                <RechartsTooltip formatter={(v: number) => [`${formatCurrency(v as number)}`, 'Kwota']} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                            {pieData.map((item, i) => {
                              const percent = total > 0 ? (item.value / total) * 100 : 0
                              return (
                                <div key={item.name} className="flex items-center gap-2">
                                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                                  <span className="text-slate-700">{item.name}: <span className="font-medium">{formatCurrencyShort(item.value)}</span> ({percent.toFixed(0)}%)</span>
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 font-semibold">Koszty vs przychód i zysk</div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={360}>
                      <BarChart data={(() => {
                        const zakup = calculation.result_json.koszt_zakupu_brutto || 0
                        const remont = calculation.result_json.koszt_remontu_calkowity || 0
                        const utrzymanie = calculation.result_json.koszty_utrzymania || 0
                        const finansowanie = calculation.result_json.koszty_finansowania || 0
                        const sprzedaz = calculation.result_json.koszty_sprzedazy || 0
                        const totalCosts = zakup + remont + utrzymanie + finansowanie + sprzedaz
                        const przychod = totalCosts + (calculation.result_json.zysk_brutto || 0)
                        return [
                          { name: 'Koszty', zakup, remont, utrzymanie, finansowanie, sprzedaz, przychod: 0, zysk: 0 },
                          { name: 'Przychód (sprzedaż)', zakup: 0, remont: 0, utrzymanie: 0, finansowanie: 0, sprzedaz: 0, przychod, zysk: 0 },
                          { name: 'Zysk netto', zakup: 0, remont: 0, utrzymanie: 0, finansowanie: 0, sprzedaz: 0, przychod: 0, zysk: calculation.result_json.zysk_netto || 0 },
                        ]
                      })()} margin={{ top: 10, right: 20, left: 8, bottom: 28 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={{ stroke: '#94A3B8' }} tickLine={{ stroke: '#94A3B8' }} />
                        <YAxis domain={[(dataMin: number) => (dataMin < 0 ? dataMin * 1.25 : 0), (dataMax: number) => (dataMax > 0 ? dataMax * 1.1 : 0)]} tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={{ stroke: '#94A3B8' }} tickLine={{ stroke: '#94A3B8' }} tickFormatter={(v) => formatCurrencyShort(v)} width={90} />
                        <ReferenceLine y={0} stroke="#94A3B8" />
                        <RechartsTooltip formatter={(v: number) => [`${formatCurrency(v as number)}`, 'Kwota']} />
                        {/* Stacked koszty + etykieta sumy */}
                        <Bar dataKey="zakup" stackId="koszty" fill="#2563EB" />
                        <Bar dataKey="remont" stackId="koszty" fill="#10B981" />
                        <Bar dataKey="utrzymanie" stackId="koszty" fill="#F59E0B" />
                        <Bar dataKey="finansowanie" stackId="koszty" fill="#EF4444" />
                        <Bar dataKey="sprzedaz" stackId="koszty" fill="#8B5CF6">
                          <LabelList content={(props) => {
                            const { x = 0, y = 0, width = 0, payload } = props as unknown as { x: number; y: number; width: number; payload: Record<string, number | string> }
                            if (typeof payload?.name !== 'string' || payload.name !== 'Koszty') return null
                            const sum = (payload.zakup as number) + (payload.remont as number) + (payload.utrzymanie as number) + (payload.finansowanie as number) + (payload.sprzedaz as number)
                            const cx = x + width / 2
                            return (
                              <text x={cx} y={y - 8} textAnchor="middle" fill="#0f172a" fontSize={12}>
                                {formatCurrencyShort(sum)}
                              </text>
                            )
                          }} />
                        </Bar>
                        {/* Przychód */}
                        <Bar dataKey="przychod" fill="#0EA5E9" radius={[6, 6, 0, 0]}>
                          <LabelList position="top" offset={8} formatter={(v: unknown) => formatCurrencyShort(v as number)} fill="#0f172a" />
                        </Bar>
                        {/* Zysk netto */}
                        <Bar dataKey="zysk" fill={(calculation.result_json.zysk_netto || 0) >= 0 ? '#22C55E' : '#EF4444'} radius={[6, 6, 0, 0]}>
                          <LabelList content={(props) => {
                            const { x = 0, y = 0, width = 0, height = 0, value } = props as unknown as { x: number; y: number; width: number; height: number; value: number }
                            const val = typeof value === 'number' ? value : parseFloat(String(value))
                            const cx = x + width / 2
                            const cy = val >= 0 ? y - 8 : y + height + 14
                            return (
                              <text x={cx} y={cy} textAnchor="middle" fill="#0f172a" fontSize={12}>
                                {formatCurrencyShort(val)}
                              </text>
                            )
                          }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {/* Legenda wartości kosztów */}
                    {(() => {
                      const rows = [
                        { key: 'zakup', label: 'Zakup', color: '#2563EB', value: calculation.result_json.koszt_zakupu_brutto || 0 },
                        { key: 'remont', label: 'Remont', color: '#10B981', value: calculation.result_json.koszt_remontu_calkowity || 0 },
                        { key: 'utrzymanie', label: 'Utrzymanie', color: '#F59E0B', value: calculation.result_json.koszty_utrzymania || 0 },
                        { key: 'finansowanie', label: 'Finansowanie', color: '#EF4444', value: calculation.result_json.koszty_finansowania || 0 },
                        { key: 'sprzedaz', label: 'Sprzedaż', color: '#8B5CF6', value: calculation.result_json.koszty_sprzedazy || 0 },
                      ]
                      const total = rows.reduce((s, r) => s + r.value, 0)
                      return (
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                          {rows.map((r) => {
                            const percent = total > 0 ? (r.value / total) * 100 : 0
                            return (
                              <div key={r.key} className="flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: r.color }} />
                                <span className="text-slate-700">{r.label}: <span className="font-medium">{formatCurrencyShort(r.value)}</span> ({percent.toFixed(0)}%)</span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gdy brak danych wejściowych – nic nie pokazuj */}

        {!hasResultData && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {calculation.calculation_type === 'purchase' ? 'Wynik kalkulacji' : 
               calculation.calculation_type === 'credit-score' ? 'Wynik kalkulacji' :
               'Wynik wyceny'}
            </h2>
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Brak zapisanych wyników</p>
              <p className="text-sm mt-1">Wyniki mogły zostać uszkodzone lub nie zostały zapisane</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 