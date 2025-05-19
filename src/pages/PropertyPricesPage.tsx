import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { PropertyPrice } from '../types';
import { fetchPropertyPrices, fetchAvailableYears, fetchP3788Prices } from '../utils/bdlApi';
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

// Rejestracja komponentów Chart.js
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

// Typ wykresu
type ChartType = 'line' | 'bar';

const PropertyPricesPage: React.FC = () => {
  const [cityName, setCityName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prices, setPrices] = useState<PropertyPrice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [variableId, setVariableId] = useState<string>('P3788'); // domyślny wskaźnik
  const [marketType, setMarketType] = useState<'primary' | 'secondary'>('primary');

  // Usuwamy niepotrzebną referencję, gdyż powoduje problemy z typami
  // const chartRef = useRef<ChartJS>(null);

  // Pobranie dostępnych lat z API przy ładowaniu komponentu lub zmianie wskaźnika
  useEffect(() => {
    async function getAvailableYears() {
      try {
        setIsLoading(true);
        const years = await fetchAvailableYears(variableId);
        setAvailableYears(years);
      } catch (err: any) {
        setError('Błąd podczas pobierania dostępnych lat: ' + (err.message || 'Nieznany błąd'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    getAvailableYears();
  }, [variableId]);

  // Nowa funkcja do wyszukiwania unitId po nazwie miasta/powiatu
  async function findUnitIdByName(name: string): Promise<string | null> {
    // Najpierw szukaj na poziomie miasta (level 6)
    let res = await fetch('/.netlify/functions/bdlApi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'Units/search',
        params: { name, level: '6', format: 'json', lang: 'pl', pageSize: '10' },
      }),
    });
    let data = await res.json();
    if (data.results && data.results.length > 0) return data.results[0].id;
    // Jeśli nie znaleziono, szukaj na poziomie powiatu (level 5)
    res = await fetch('/.netlify/functions/bdlApi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'Units/search',
        params: { name, level: '5', format: 'json', lang: 'pl', pageSize: '10' },
      }),
    });
    data = await res.json();
    if (data.results && data.results.length > 0) return data.results[0].id;
    return null;
  }

  const handleFetchPrices = async () => {
    if (!cityName.trim()) {
      toast.error('Wprowadź nazwę powiatu');
      return;
    }
    if (!cityName.trim().toLowerCase().startsWith('powiat')) {
      toast.error('Wprowadź poprawną nazwę powiatu (np. "powiat warszawski")');
      return;
    }
    // Dodatkowa walidacja znaków
    const allowed = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ.\-\s]+$/;
    if (!allowed.test(cityName.trim())) {
      toast.error('Nazwa powiatu zawiera niedozwolone znaki');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      let propertyPrices: PropertyPrice[] = [];
      if (variableId === 'P3786') {
        // 633697 - pierwotny, 633702 - wtórny
        const varId = marketType === 'primary' ? '633697' : '633702';
        propertyPrices = await fetchPropertyPrices(cityName.trim(), availableYears, varId);
      } else if (variableId === 'P3788') {
        propertyPrices = await fetchP3788Prices(cityName.trim(), availableYears, marketType);
      } else {
        propertyPrices = await fetchPropertyPrices(cityName.trim(), availableYears, variableId);
      }
      setPrices(propertyPrices);
      if (propertyPrices.length > 0) {
        toast.success(`Pobrano dane dla wybranej jednostki`);
      } else {
        toast.info('Brak danych dla wybranej jednostki i lat');
      }
    } catch (err: any) {
      setError(err.message || 'Brak danych dla wybranej jednostki lub lat.');
      toast.error(err.message || 'Brak danych dla wybranej jednostki lub lat.');
    } finally {
      setIsLoading(false);
    }
  };

  // Przygotowanie danych do wykresu
  const prepareChartData = () => {
    if (prices.length === 0) return null;

    // Grupowanie cen według roku i kwartału
    const uniqueYears = Array.from(new Set(prices.map(price => price.year))).sort();
    
    // Dane dla wykresu liniowego (średnie roczne)
    const yearlyAverages = uniqueYears.map(year => {
      const yearPrices = prices.filter(price => price.year === year);
      const averagePrice = yearPrices.reduce((sum, price) => sum + price.price, 0) / yearPrices.length;
      return { year, price: averagePrice };
    });

    // Dane dla wykresu słupkowego (ceny kwartalne)
    const quarterlyData = prices.map(price => ({
      label: `${price.year} ${price.quarter || ''}`,
      price: price.price,
    }));

    return {
      line: {
        labels: yearlyAverages.map(data => data.year.toString()),
        datasets: [
          {
            label: `Średnia cena za m²`,
            data: yearlyAverages.map(data => data.price),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            tension: 0.3,
          },
        ],
      },
      bar: {
        labels: quarterlyData.map(data => data.label),
        datasets: [
          {
            label: `Cena za m²`,
            data: quarterlyData.map(data => data.price),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
          },
        ],
      },
    };
  };

  const chartData = prepareChartData();

  // Opcje wykresu
  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Ceny nieruchomości w powiecie ${cityName} (${availableYears[0]}-${availableYears[availableYears.length - 1]})`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString('pl-PL')} zł`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Cena za m² (PLN)',
        },
        ticks: {
          callback: function(value) {
            return `${value.toLocaleString('pl-PL')} zł`;
          },
        },
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-800">
        Ceny nieruchomości według powiatów
      </h1>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="text-gray-700 mb-6">
          Ten kalkulator pozwala sprawdzić średnie ceny nieruchomości za metr kwadratowy
          w wybranym powiecie w Polsce. Dane pochodzą z Banku Danych Lokalnych GUS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="cityName" className="block text-indigo-700 font-medium mb-1">
              Nazwa powiatu
            </label>
            <input
              id="cityName"
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="powiat m. Toruń, powiat olsztyński"
              aria-label="Nazwa miasta lub powiatu"
            />
          </div>

          <div>
            <label htmlFor="variableId" className="block text-indigo-700 font-medium mb-1">
              Rodzaj wskaźnika
            </label>
            <select
              id="variableId"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={variableId}
              onChange={(e) => setVariableId(e.target.value)}
              aria-label="Rodzaj wskaźnika"
            >
              <option value="P3786">Cena transakcyjna m²</option>
              <option value="P3788">Średnia cena lokali mieszkalnych sprzedanych w ramach transakcji rynkowych</option>
            </select>
          </div>

          {(variableId === 'P3788' || variableId === 'P3786') && (
            <div>
              <label className="block text-indigo-700 font-medium mb-1">Rynek</label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={marketType}
                onChange={e => setMarketType(e.target.value as 'primary' | 'secondary')}
                aria-label="Rynek nieruchomości"
              >
                <option value="primary">Pierwotny</option>
                <option value="secondary">Wtórny</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="chartType" className="block text-indigo-700 font-medium mb-1">
              Typ wykresu
            </label>
            <select
              id="chartType"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              aria-label="Typ wykresu"
            >
              <option value="line">Liniowy</option>
              <option value="bar">Słupkowy</option>
            </select>
          </div>
        </div>

        <button
          className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition duration-200 mb-6 disabled:bg-indigo-300"
          onClick={handleFetchPrices}
          disabled={isLoading || !cityName}
        >
          {isLoading ? 'Pobieranie danych...' : 'Sprawdź ceny'}
        </button>

        {error && (
          <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {!isLoading && prices.length === 0 && !error && (
          <div className="text-gray-600 mb-4 p-4 bg-gray-50 rounded-md text-center">
            Brak danych dla wybranej jednostki lub lat.
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-xl font-semibold text-indigo-700 animate-pulse">
              Pobieranie danych...
            </div>
          </div>
        )}

        {chartData && prices.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              Wykres cen nieruchomości w powiecie {cityName}
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6" style={{ height: '400px' }}>
              {chartType === 'line' && chartData.line && (
                <Line
                  data={chartData.line}
                  options={chartOptions}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
              
              {chartType === 'bar' && chartData.bar && (
                <Bar
                  data={chartData.bar}
                  options={chartOptions}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">
              Szczegółowe dane
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-center">Rok</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Cena za m²</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="border border-gray-300 px-4 py-2 text-center">{price.year}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {price.price.toLocaleString('pl-PL', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} zł
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
              <p>Dane pobrane z Banku Danych Lokalnych GUS. Ceny transakcyjne na 
                rynku pierwotnym.</p>
              <p>Uwaga: Rzeczywiste ceny mogą różnić się od średnich wartości i zależą od wielu czynników.</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">
          Jak korzystać z kalkulatora cen nieruchomości?
        </h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Wpisz nazwę powiatu, dla którego chcesz sprawdzić ceny nieruchomości (np. "powiat warszawski").</li>
          <li>Wybierz typ wykresu (liniowy lub słupkowy).</li>
          <li>Kliknij przycisk "Sprawdź ceny" i poczekaj na wyniki.</li>
        </ol>
        <p className="mt-4 text-gray-700">
          Dane pochodzą z Banku Danych Lokalnych Głównego Urzędu Statystycznego.
          Prezentowane ceny są średnimi cenami transakcyjnymi w danym powiecie.
        </p>
      </div>
    </div>
  );
};

export default PropertyPricesPage; 