import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { PropertyPrice } from '../types';
import { fetchPropertyPrices, fetchAvailableYears } from '../utils/bdlApi';
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

// Typ rynku nieruchomości
type MarketType = 'primary' | 'secondary';

// Typ wykresu
type ChartType = 'line' | 'bar';

const PropertyPricesPage: React.FC = () => {
  const [cityName, setCityName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prices, setPrices] = useState<PropertyPrice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [marketType, setMarketType] = useState<MarketType>('primary');
  const [chartType, setChartType] = useState<ChartType>('line');
  
  // Usuwamy niepotrzebną referencję, gdyż powoduje problemy z typami
  // const chartRef = useRef<ChartJS>(null);

  // Pobranie dostępnych lat z API przy ładowaniu komponentu
  useEffect(() => {
    async function getAvailableYears() {
      try {
        setIsLoading(true);
        const years = await fetchAvailableYears();
        setAvailableYears(years);
        setStartYear(years[years.length - 1]); // Najstarszy rok
        setEndYear(years[0]); // Najnowszy rok
      } catch (err: any) {
        setError('Błąd podczas pobierania dostępnych lat: ' + (err.message || 'Nieznany błąd'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    getAvailableYears();
  }, []);

  // ID wskaźnika GUS BDL zależne od wybranego typu rynku
  const getMarketIndicatorId = (type: MarketType): string => {
    // P2425 - rynek pierwotny, P2426 - rynek wtórny
    return type === 'primary' ? 'P2425' : 'P2426';
  };

  const handleFetchPrices = async () => {
    if (!cityName.trim()) {
      toast.error('Wprowadź nazwę miasta');
      return;
    }
    if (!startYear || !endYear) {
      toast.error('Wybierz zakres lat');
      return;
    }
    if (startYear > endYear) {
      toast.error('Rok początkowy nie może być późniejszy niż rok końcowy');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const years = Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => startYear + i
      );
      // Produkcyjnie: pobieramy dane z API GUS BDL dla każdego roku
      const allPrices = await Promise.all(
        years.map(year => fetchPropertyPrices(cityName, year, getMarketIndicatorId(marketType)))
      );
      const propertyPrices = allPrices.flat();
      setPrices(propertyPrices);
      if (propertyPrices.length > 0) {
        toast.success(`Pobrano dane dla miasta ${propertyPrices[0].city}`);
      } else {
        toast.info('Brak danych dla wybranego miasta i lat');
      }
    } catch (err: any) {
      console.error('Błąd podczas pobierania danych:', err);
      setError(err.message || 'Wystąpił błąd podczas pobierania danych. Spróbuj ponownie.');
      toast.error('Nie udało się pobrać danych');
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
            label: `Średnia cena za m² (${marketType === 'primary' ? 'rynek pierwotny' : 'rynek wtórny'})`,
            data: yearlyAverages.map(data => data.price),
            borderColor: marketType === 'primary' ? 'rgb(99, 102, 241)' : 'rgb(14, 165, 233)',
            backgroundColor: marketType === 'primary' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(14, 165, 233, 0.5)',
            tension: 0.3,
          },
        ],
      },
      bar: {
        labels: quarterlyData.map(data => data.label),
        datasets: [
          {
            label: `Cena za m² (${marketType === 'primary' ? 'rynek pierwotny' : 'rynek wtórny'})`,
            data: quarterlyData.map(data => data.price),
            backgroundColor: marketType === 'primary' ? 'rgba(99, 102, 241, 0.8)' : 'rgba(14, 165, 233, 0.8)',
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
        text: `Ceny nieruchomości w mieście ${cityName} (${startYear}-${endYear})`,
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
        Ceny nieruchomości za m² według miast
      </h1>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="text-gray-700 mb-6">
          Ten kalkulator pozwala sprawdzić średnie ceny nieruchomości za metr kwadratowy
          w wybranym mieście w Polsce. Dane pochodzą z Banku Danych Lokalnych GUS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="cityName" className="block text-indigo-700 font-medium mb-1">
              Nazwa miasta
            </label>
            <input
              id="cityName"
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="np. Warszawa, Kraków"
              aria-label="Nazwa miasta"
            />
          </div>

          <div>
            <label htmlFor="marketType" className="block text-indigo-700 font-medium mb-1">
              Rodzaj rynku
            </label>
            <select
              id="marketType"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={marketType}
              onChange={(e) => setMarketType(e.target.value as MarketType)}
              aria-label="Rodzaj rynku"
            >
              <option value="primary">Rynek pierwotny</option>
              <option value="secondary">Rynek wtórny</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="startYear" className="block text-indigo-700 font-medium mb-1">
              Rok początkowy
            </label>
            <select
              id="startYear"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={startYear || ''}
              onChange={(e) => setStartYear(parseInt(e.target.value))}
              aria-label="Rok początkowy"
            >
              {availableYears.map(year => (
                <option key={`start-${year}`} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="endYear" className="block text-indigo-700 font-medium mb-1">
              Rok końcowy
            </label>
            <select
              id="endYear"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={endYear || ''}
              onChange={(e) => setEndYear(parseInt(e.target.value))}
              aria-label="Rok końcowy"
            >
              {availableYears.map(year => (
                <option key={`end-${year}`} value={year}>{year}</option>
              ))}
            </select>
          </div>

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
          disabled={isLoading || !cityName.trim() || !startYear || !endYear}
        >
          {isLoading ? 'Pobieranie danych...' : 'Sprawdź ceny'}
        </button>

        {error && (
          <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {chartData && prices.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              Wykres cen nieruchomości w mieście {prices[0].city}
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
                    <th className="border border-gray-300 px-4 py-2 text-left">Rok</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Kwartał</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Cena za m²</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="border border-gray-300 px-4 py-2">{price.year}</td>
                      <td className="border border-gray-300 px-4 py-2">{price.quarter || '-'}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
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
                {marketType === 'primary' ? ' rynku pierwotnym' : ' rynku wtórnym'}.</p>
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
          <li>Wpisz nazwę miasta, dla którego chcesz sprawdzić ceny nieruchomości.</li>
          <li>Wybierz rodzaj rynku (pierwotny lub wtórny).</li>
          <li>Ustaw przedział lat, dla których chcesz zobaczyć dane.</li>
          <li>Wybierz typ wykresu (liniowy lub słupkowy).</li>
          <li>Kliknij przycisk "Sprawdź ceny" i poczekaj na wyniki.</li>
        </ol>
        <p className="mt-4 text-gray-700">
          Dane pochodzą z Banku Danych Lokalnych Głównego Urzędu Statystycznego.
          Prezentowane ceny są średnimi cenami transakcyjnymi w danym mieście.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-md text-blue-800">
          <h3 className="font-medium mb-2">Rodzaje rynków:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Rynek pierwotny</strong> - dotyczy nowych nieruchomości, sprzedawanych przez deweloperów.</li>
            <li><strong>Rynek wtórny</strong> - dotyczy nieruchomości, które były już wcześniej użytkowane i są odsprzedawane.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PropertyPricesPage; 