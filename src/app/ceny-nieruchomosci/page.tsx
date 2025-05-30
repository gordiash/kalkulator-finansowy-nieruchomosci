'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { PropertyPrice } from '@/types';
import { fetchUnitIdByName, fetchPropertyPrices, fetchAvailableYears, fetchPricesByMarketType } from '@/utils/bdlApi';
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
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type ChartType = 'line' | 'bar';

const PropertyPricesPage: React.FC = () => {
  const [cityName, setCityName] = useState<string>('');
  const [unitId, setUnitId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prices, setPrices] = useState<PropertyPrice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [variableId, setVariableId] = useState<string>('P3788');
  const [marketType, setMarketType] = useState<'primary' | 'secondary'>('primary');

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function getAvailableYearsForVariable() {
      if (!variableId) return;
      try {
        setIsLoading(true);
        const years = await fetchAvailableYears(variableId);
        setAvailableYears(years);
        if (years.length > 0) {
          const defaultEndYear = years[0];
          const defaultStartYear = years[Math.min(years.length - 1, 4)];
          setStartYear(defaultStartYear);
          setEndYear(defaultEndYear);
        }
      } catch (err: any) {
        setError('Błąd podczas pobierania dostępnych lat: ' + (err.message || 'Nieznany błąd'));
        console.error(err);
        setAvailableYears([]);
        setStartYear(null);
        setEndYear(null);
      } finally {
        setIsLoading(false);
      }
    }
    getAvailableYearsForVariable();
  }, [variableId]);

  const performFetchPrices = async () => {
    if (!cityName.trim()) {
      toast.error('Wprowadź nazwę powiatu');
      setIsLoading(false);
      return;
    }
    const allowed = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ.\-\s]+$/;
    if (!allowed.test(cityName.trim())) {
      toast.error('Nazwa powiatu zawiera niedozwolone znaki');
      setIsLoading(false);
      return;
    }
    if (!startYear || !endYear || startYear > endYear) {
      toast.error('Wybierz poprawny zakres lat.');
      setIsLoading(false);
      return;
    }
    const currentSelectedYears = availableYears.filter(year => year >= startYear && year <= endYear).sort((a, b) => b - a);
    if (currentSelectedYears.length === 0) {
      toast.error('W wybranym zakresie nie ma dostępnych lat z danymi.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrices([]);

    try {
      const fetchedUnitId = await fetchUnitIdByName(cityName.trim());
      if (!fetchedUnitId) {
        throw new Error('Nie znaleziono jednostki terytorialnej dla podanej nazwy.');
      }
      setUnitId(fetchedUnitId);

      let propertyPrices: PropertyPrice[] = [];
      
      if (variableId === 'P3788' || variableId === 'P3786' || variableId === 'P3787') {
        propertyPrices = await fetchPricesByMarketType(fetchedUnitId, currentSelectedYears, variableId as 'P3788' | 'P3786' | 'P3787', marketType);
      } else {
        throw new Error(`Obsługa dla wskaźnika ${variableId} nie została jeszcze w pełni zaimplementowana lub wymaga innej logiki pobierania.`);
      }
      
      setPrices(propertyPrices);
      if (propertyPrices.length > 0) {
        toast.success(`Pobrano dane dla: ${cityName.trim()}`);
      } else {
        toast.info('Brak danych dla wybranej jednostki, lat i kryteriów.');
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas pobierania danych.');
      toast.error(err.message || 'Wystąpił błąd podczas pobierania danych.');
      setPrices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchPrices = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      performFetchPrices();
    }, 500);
  };
  
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const prepareChartData = () => {
    if (prices.length === 0) return null;

    const unitMeasureName = prices[0]?.unitMeasureName || 'zł/m2';

    const indicatorLabels: Record<string, string> = {
      P3788: `Ceny lokali mieszkalnych (transakcje rynkowe) (${unitMeasureName})`,
      P3786: `Średnie ceny 1 m2 pow. użytkowej lokali mieszkalnych (${unitMeasureName})`,
      P3787: `Mediana cen 1 m2 pow. użytkowej lokali mieszkalnych (${unitMeasureName})`,
    };
    const currentIndicatorLabel = indicatorLabels[variableId] || `Nieznany wskaźnik (${unitMeasureName})`;

    const sortedPrices = [...prices].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.quarter && b.quarter) return parseInt(a.quarter.substring(1)) - parseInt(b.quarter.substring(1));
        return 0;
    });

    const uniqueYears = Array.from(new Set(sortedPrices.map((price: PropertyPrice) => price.year))).sort((a,b) => a - b);
    
    const yearlyAverages = uniqueYears.map(year => {
      const yearPrices = sortedPrices.filter((price: PropertyPrice) => price.year === year);
      const averagePrice = yearPrices.reduce((sum: number, price: PropertyPrice) => sum + price.price, 0) / yearPrices.length;
      return { year, price: averagePrice };
    });

    const quarterlyData = sortedPrices.map((price: PropertyPrice) => ({
      label: `${price.year} ${price.quarter || ''}`.trim(), 
      price: price.price,
    }));

    return {
      lineChartConfig: {
        labels: yearlyAverages.map(data => data.year.toString()),
        datasets: [
          {
            label: `Śr. roczna: ${currentIndicatorLabel} (${cityName || '-'})`,
            data: yearlyAverages.map(data => data.price),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            tension: 0.3,
          },
        ],
      },
      barChartConfig: {
        labels: quarterlyData.map(data => data.label),
        datasets: [
          {
            label: `Kwartalnie: ${currentIndicatorLabel} (${cityName || '-'})`,
            data: quarterlyData.map(data => data.price),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
          },
        ],
      },
      yearlyAverages,
      quarterlyData,
    };
  };

  const allChartData = prepareChartData();
  const chartData = allChartData ? { line: allChartData.lineChartConfig, bar: allChartData.barChartConfig } : null;

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: cityName && startYear && endYear ? 
              `Ceny nieruchomości w ${cityName} (${startYear}-${endYear})` 
              : 'Wykres cen nieruchomości',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: prices[0]?.unitMeasureName || 'Cena (PLN)',
        },
        ticks: {
          callback: function(value: string | number) {
            if (typeof value === 'number') { 
              return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
            }
            return value;
          },
        },
      },
      x: {
        title: {
            display: true,
            text: chartType === 'line' ? 'Rok' : 'Rok i kwartał',
        }
      }
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-800">
        Ceny nieruchomości według powiatów
      </h1>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="text-gray-700 mb-6">
          Ten kalkulator pozwala sprawdzić średnie ceny nieruchomości 
          (w zależności od wybranego wskaźnika: za metr kwadratowy lub całkowite ceny transakcyjne)
          w wybranym powiecie w Polsce. Dane pochodzą z Banku Danych Lokalnych GUS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
          <div className="md:col-span-2">
            <label htmlFor="cityNameInput" className="block text-indigo-700 font-medium mb-1">
              Nazwa powiatu
            </label>
            <input
              id="cityNameInput"
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="np. powiat warszawski, m. Kraków"
              aria-label="Nazwa powiatu"
            />
          </div>

          <div>
            <button 
              onClick={handleFetchPrices}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading || !startYear || !endYear}
              aria-label="Pokaż ceny dla wybranego powiatu i lat"
            >
              {isLoading ? 'Ładowanie...' : 'Pokaż ceny'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-start">
            <div>
                <label htmlFor="variableIdSelect" className="block text-indigo-700 font-medium mb-1">
                Rodzaj wskaźnika
                </label>
                <select 
                    id="variableIdSelect"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={variableId}
                    onChange={(e) => setVariableId(e.target.value)}
                    aria-label="Wybierz rodzaj wskaźnika cen nieruchomości"
                >
                    <option value="P3788">Ceny lokali mieszkalnych (transakcje, zł/m2)</option>
                    <option value="P3786">Średnia cena transakcyjna (zł)</option>
                    <option value="P3787">Mediana ceny transakcyjnej (zł)</option>
                </select>
            </div>
            {(variableId === 'P3786' || variableId === 'P3787') && (
                <div>
                    <label htmlFor="marketTypeSelect" className="block text-indigo-700 font-medium mb-1">Rynek</label>
                    <select 
                        id="marketTypeSelect" 
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={marketType}
                        onChange={(e) => setMarketType(e.target.value as 'primary' | 'secondary')}
                        aria-label="Wybierz typ rynku (pierwotny lub wtórny)"
                    >
                        <option value="primary">Pierwotny</option>
                        <option value="secondary">Wtórny</option>
                    </select>
                </div>
            )}
            <div>
              <label htmlFor="startYearSelect" className="block text-indigo-700 font-medium mb-1">
                Rok od
              </label>
              <select 
                id="startYearSelect"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={startYear || ''}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                disabled={availableYears.length === 0 || isLoading}
                aria-label="Wybierz rok początkowy do analizy cen nieruchomości"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="endYearSelect" className="block text-indigo-700 font-medium mb-1">
                Rok do
              </label>
              <select 
                id="endYearSelect"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={endYear || ''}
                onChange={(e) => {
                  const selectedEnd = parseInt(e.target.value);
                  if (startYear && selectedEnd < startYear) {
                    toast.error('Rok "do" nie może być wcześniejszy niż rok "od".');
                    setEndYear(startYear);
                  } else {
                    setEndYear(selectedEnd);
                  }
                }}
                disabled={availableYears.length === 0 || isLoading}
                aria-label="Wybierz rok końcowy do analizy cen nieruchomości"
              >
                {availableYears.filter(year => !startYear || year >= startYear).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Błąd: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isLoading && prices.length === 0 && (
            <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
                <p className="mt-2 text-indigo-700">Ładowanie danych...</p>
            </div>
        )}

        {!isLoading && prices.length > 0 && chartData && (
          <div className="mt-8">
            <div className="mb-4 flex justify-center md:justify-end">
              <button 
                onClick={() => setChartType('line')} 
                className={`px-3 py-2 mr-2 rounded text-sm md:px-4 md:py-2 ${chartType === 'line' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-indigo-500 hover:text-white transition-colors`}
                aria-pressed={chartType === 'line'}
              >
                Wykres Liniowy (Śr. Roczna)
              </button>
              <button 
                onClick={() => setChartType('bar')} 
                className={`px-3 py-2 rounded text-sm md:px-4 md:py-2 ${chartType === 'bar' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-indigo-500 hover:text-white transition-colors`}
                aria-pressed={chartType === 'bar'}
              >
                Wykres Słupkowy (Kwartalny)
              </button>
            </div>
            <div className="h-96 md:h-[500px]"> 
              {chartType === 'line' && chartData.line && <Line options={chartOptions as ChartOptions<'line'>} data={chartData.line} />}
              {chartType === 'bar' && chartData.bar && <Bar options={chartOptions as ChartOptions<'bar'>} data={chartData.bar} />}
            </div>
          </div>
        )}
        {!isLoading && prices.length === 0 && cityName && unitId && !error && (
          <p className="text-center text-gray-600 mt-8">Brak danych dla powiatu "{cityName}" i wybranych kryteriów.</p>
        )}

        {!isLoading && !error && allChartData && (
          <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">
              Dane tabelaryczne ({chartType === 'line' ? 'Średnie roczne' : 'Dane kwartalne'})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {chartType === 'line' ? 'Rok' : 'Okres'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena ({prices[0]?.unitMeasureName || 'PLN'})
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(chartType === 'line' ? allChartData.yearlyAverages : allChartData.quarterlyData).map((item: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {chartType === 'line' ? item.year : item.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {prices.length === 0 && <p className="text-center py-4 text-gray-500">Brak danych do wyświetlenia w tabeli.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPricesPage; 