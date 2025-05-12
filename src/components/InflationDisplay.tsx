import React, { useEffect, useState } from 'react';
import { inflationFetcher } from '../utils/inflationFetcher';
import { type InflationData } from '../utils/gusInflationFetcher';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type InflationDisplayProps = {
  years?: number;
  showChart?: boolean;
  onInflationChange?: (inflationValue: number) => void;
  className?: string;
};

const InflationDisplay: React.FC<InflationDisplayProps> = ({
  years = 5,
  showChart = true,
  onInflationChange,
  className = ''
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentInflation, setCurrentInflation] = useState<number | null>(null);
  const [historicalData, setHistoricalData] = useState<InflationData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Pobierz aktualną wartość inflacji
        const current = await inflationFetcher.getCurrentInflation();
        setCurrentInflation(current);
        
        // Powiadom rodzica o zmianie, jeśli taka funkcja została przekazana
        if (onInflationChange) {
          onInflationChange(current);
        }
        
        // Pobierz dane historyczne, jeśli wykres ma być wyświetlany
        if (showChart) {
          const historical = await inflationFetcher.getHistoricalInflationData(years);
          setHistoricalData(historical);
        }
        
        setError(null);
      } catch (err) {
        console.error('Błąd podczas pobierania danych o inflacji:', err);
        setError('Nie udało się pobrać danych o inflacji. Używam wartości domyślnych.');
        
        // Ustaw wartość domyślną
        setCurrentInflation(2.5);
        if (onInflationChange) {
          onInflationChange(2.5);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [years, showChart, onInflationChange]);

  // Przygotuj dane do wykresu
  const chartData = {
    labels: historicalData.map(item => {
      const date = new Date(item.date);
      return date.getFullYear();
    }).reverse(),
    datasets: [
      {
        label: 'Inflacja (%)',
        data: historicalData.map(item => item.value).reverse(),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11,
          }
        }
      },
      title: {
        display: true,
        text: 'Historyczne dane inflacji w Polsce',
        font: {
          size: 13,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y.toFixed(2)}%`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}%`,
          font: {
            size: 10,
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      }
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Aktualna inflacja</h3>
        
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <span className="text-gray-600">Pobieranie aktualnych danych...</span>
          </div>
        ) : error ? (
          <div className="text-amber-600 text-sm flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentInflation !== null ? `${currentInflation.toFixed(2)}%` : 'N/A'}
            </div>
            <div className="ml-3 text-sm text-gray-500">
              <p>Wartość roczna</p>
              <p className="text-xs">Źródło: GUS (Główny Urząd Statystyczny)</p>
            </div>
          </div>
        )}
      </div>
      
      {showChart && historicalData.length > 0 && (
        <div className="mt-6">
          <div className="h-48 md:h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Dane historyczne za ostatnich {years} lat
          </div>
        </div>
      )}
    </div>
  );
};

export default InflationDisplay; 