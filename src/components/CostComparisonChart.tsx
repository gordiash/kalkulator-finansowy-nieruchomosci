import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { CalculationResults } from '../types';

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

type CostComparisonChartProps = {
  results: CalculationResults;
  showCumulative?: boolean;
  showBreakEvenPoint?: boolean;
  title?: string;
  calculatorType?: 'roi' | 'investment' | 'rental-value';
};

const CostComparisonChart: React.FC<CostComparisonChartProps> = ({
  results,
  showCumulative = true,
  showBreakEvenPoint = true,
  title = 'Porównanie kosztów: Zakup vs Wynajem',
  calculatorType = 'roi'
}) => {
  // Określenie etykiet na podstawie typu kalkulatora
  const getDatasetLabels = () => {
    switch (calculatorType) {
      case 'investment':
        return {
          first: 'Inwestycja początkowa',
          second: 'Przepływy pieniężne'
        };
      case 'rental-value':
        return {
          first: 'Wartość nieruchomości',
          second: 'Przychód z najmu'
        };
      default: // roi
        return {
          first: 'Koszt zakupu (kredyt + utrzymanie)',
          second: 'Koszt wynajmu'
        };
    }
  };

  const datasetLabels = getDatasetLabels();

  // Jeśli brak chartData, generujemy podstawowe dane
  if (!results.comparison.chartData) {
    // Tworzymy dane zastępcze z istniejących informacji
    const years = results.yearlyCosts?.buying?.length || 30;
    const labels = Array.from({ length: years }, (_, i) => `Rok ${i+1}`);
    
    const mortgageCostData = results.cumulativeCosts?.buying || Array(years).fill(0);
    const rentCostData = results.cumulativeCosts?.renting || Array(years).fill(0);
    
    // Uproszczone dane wykresu
    const lineChartData = {
      labels,
      datasets: [
        {
          label: datasetLabels.first,
          data: mortgageCostData,
          borderColor: '#3b82f6', // niebieski
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
        {
          label: datasetLabels.second,
          data: rentCostData,
          borderColor: '#f59e0b', // pomarańczowy
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 5,
        }
      ]
    };
    
    // Opcje wykresów
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
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
                label += new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(context.parsed.y);
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
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumSignificantDigits: 3 }).format(value);
            }
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.2)',
          }
        }
      }
    };
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">{title}</div>
          
          {showBreakEvenPoint && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-gray-100 py-2 px-4 rounded-lg text-sm">
                <span className="font-medium">
                  {calculatorType === 'investment' ? 'Okres zwrotu inwestycji:' : 'Punkt rentowności:'}
                </span>
                <span className="ml-2 text-blue-600 font-semibold">
                  {results.comparison.breakEvenYear || "Nie osiągnięto"}
                </span>
              </div>
              
              <div className="bg-gray-100 py-2 px-4 rounded-lg text-sm">
                <span className="font-medium">
                  {calculatorType === 'investment'
                    ? 'NPV inwestycji:'
                    : calculatorType === 'rental-value'
                      ? 'Różnica po okresie:'
                      : `Różnica po ${years} latach:`}
                </span>
                <span className={`ml-2 font-semibold ${results.comparison.buyingIsBetter ? 'text-green-600' : 'text-red-600'}`}>
                  {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Math.abs(results.comparison.finalDifference))}
                  {calculatorType === 'roi' && (results.comparison.buyingIsBetter 
                    ? ' na korzyść zakupu' 
                    : ' na korzyść wynajmu')}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-80 mb-6">
          <Line data={lineChartData} options={options} />
        </div>
        
        <div className="flex justify-center gap-8 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 mr-2 rounded"></div>
            <span>
              {calculatorType === 'investment'
                ? 'Inwestycja'
                : calculatorType === 'rental-value'
                  ? 'Wartość nieruchomości'
                  : 'Zakup nieruchomości'}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-500 mr-2 rounded"></div>
            <span>
              {calculatorType === 'investment'
                ? 'Przepływy pieniężne'
                : calculatorType === 'rental-value'
                  ? 'Przychód z najmu'
                  : 'Wynajem'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>
            {calculatorType === 'investment'
              ? '* Wykres uwzględnia początkową inwestycję oraz prognozowane przepływy pieniężne w kolejnych latach.'
              : calculatorType === 'rental-value'
                ? '* Wykres porównuje wartość nieruchomości z przychodami z najmu w kolejnych latach.'
                : '* Wykres uwzględnia wszystkie koszty związane z zakupem (rata kredytu, ubezpieczenie, podatki, utrzymanie) oraz wynajmem (czynsz, kaucja, ubezpieczenie).'}
          </p>
        </div>
      </div>
    );
  }

  const { labels, mortgageCostData, rentCostData } = results.comparison.chartData;
  
  // Obliczenie punktu break-even (moment, w którym linia zakupu przecina linię wynajmu)
  const breakEvenIndex = mortgageCostData.findIndex((value: number, index: number) => 
    value <= rentCostData[index] && (index === 0 || mortgageCostData[index - 1] > rentCostData[index - 1])
  );
  
  const breakEvenYear = breakEvenIndex !== -1 ? labels[breakEvenIndex] : "Nie znaleziono";
  
  const lineChartData = {
    labels,
    datasets: [
      {
        label: datasetLabels.first,
        data: mortgageCostData,
        borderColor: '#3b82f6', // niebieski
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: datasetLabels.second,
        data: rentCostData,
        borderColor: '#f59e0b', // pomarańczowy
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5,
      }
    ]
  };
  
  // Dane dla wykresu słupkowego - roczne koszty zamiast kumulacyjnych
  const yearlyMortgageCosts = mortgageCostData.map((value: number, index: number) => 
    index === 0 ? value : value - mortgageCostData[index - 1]
  );
  
  const yearlyRentCosts = rentCostData.map((value: number, index: number) => 
    index === 0 ? value : value - rentCostData[index - 1]
  );
  
  const barChartData = {
    labels,
    datasets: [
      {
        label: calculatorType === 'investment' ? 'Roczne wydatki' : 'Roczny koszt zakupu',
        data: yearlyMortgageCosts,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
      {
        label: calculatorType === 'investment' ? 'Roczne przychody' : 'Roczny koszt wynajmu',
        data: yearlyRentCosts,
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderColor: '#f59e0b',
        borderWidth: 1,
      }
    ]
  };
  
  // Opcje wykresów
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
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
              label += new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(context.parsed.y);
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
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumSignificantDigits: 3 }).format(value);
          }
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        }
      }
    }
  };
  
  // Dodajemy adnotacje do wykresu jeśli znaleziono punkt break-even i jeśli wykres jest kumulacyjny
  const optionsWithAnnotations = {
    ...options,
    plugins: {
      ...options.plugins,
      annotation: breakEvenIndex !== -1 && showBreakEvenPoint && showCumulative && calculatorType === 'roi' ? {
        annotations: {
          breakEvenLine: {
            type: 'line' as const,
            xMin: breakEvenIndex,
            xMax: breakEvenIndex,
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              content: `Punkt rentowności: ${labels[breakEvenIndex]}`,
              position: 'start' as const
            }
          }
        }
      } : {}
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">{title}</div>
        
        {showBreakEvenPoint && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gray-100 py-2 px-4 rounded-lg text-sm">
              <span className="font-medium">
                {calculatorType === 'investment' ? 'Okres zwrotu inwestycji:' : 'Punkt rentowności:'}
              </span>
              <span className="ml-2 text-blue-600 font-semibold">
                {breakEvenIndex !== -1 ? breakEvenYear : "Nie osiągnięto"}
              </span>
            </div>
            
            <div className="bg-gray-100 py-2 px-4 rounded-lg text-sm">
              <span className="font-medium">
                {calculatorType === 'investment'
                  ? 'NPV inwestycji:'
                  : `Różnica po ${labels.length} latach:`}
              </span>
              <span className={`ml-2 font-semibold ${results.comparison.buyingIsBetter ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Math.abs(results.comparison.finalDifference))}
                {calculatorType === 'roi' && (results.comparison.buyingIsBetter 
                  ? ' na korzyść zakupu' 
                  : ' na korzyść wynajmu')}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="h-80 mb-6">
        {showCumulative ? (
          <Line data={lineChartData} options={optionsWithAnnotations} />
        ) : (
          <Bar data={barChartData} options={options} />
        )}
      </div>
      
      <div className="flex justify-center gap-8 text-sm">
        <div className="flex items-center">
          <div className={`w-4 h-4 ${showCumulative ? 'bg-blue-500' : 'bg-blue-700'} mr-2 rounded`}></div>
          <span>
            {calculatorType === 'investment'
              ? 'Inwestycja'
              : calculatorType === 'rental-value'
                ? 'Wartość nieruchomości'
                : 'Zakup nieruchomości'}
          </span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 ${showCumulative ? 'bg-amber-500' : 'bg-amber-700'} mr-2 rounded`}></div>
          <span>
            {calculatorType === 'investment'
              ? 'Przepływy pieniężne'
              : calculatorType === 'rental-value'
                ? 'Przychód z najmu'
                : 'Wynajem'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          {calculatorType === 'investment'
            ? '* Wykres uwzględnia początkową inwestycję oraz prognozowane przepływy pieniężne w kolejnych latach.'
            : calculatorType === 'rental-value'
              ? '* Wykres porównuje wartość nieruchomości z przychodami z najmu w kolejnych latach.'
              : '* Wykres uwzględnia wszystkie koszty związane z zakupem (rata kredytu, ubezpieczenie, podatki, utrzymanie) oraz wynajmem (czynsz, kaucja, ubezpieczenie).'}
        </p>
      </div>
    </div>
  );
};

export default CostComparisonChart;