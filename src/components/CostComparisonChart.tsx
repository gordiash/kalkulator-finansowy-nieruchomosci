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
};

const CostComparisonChart: React.FC<CostComparisonChartProps> = ({
  results,
  showCumulative = true,
  showBreakEvenPoint = true,
  title = 'Porównanie kosztów: Zakup vs Wynajem'
}) => {
  const { labels, mortgageCostData, rentCostData } = results.comparison.chartData;
  
  // Obliczenie punktu break-even (moment, w którym linia zakupu przecina linię wynajmu)
  const breakEvenIndex = mortgageCostData.findIndex((value, index) => 
    value <= rentCostData[index] && (index === 0 || mortgageCostData[index - 1] > rentCostData[index - 1])
  );
  
  const breakEvenYear = breakEvenIndex !== -1 ? labels[breakEvenIndex] : "Nie znaleziono";
  
  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Koszt zakupu (kredyt + utrzymanie)',
        data: mortgageCostData,
        borderColor: '#3b82f6', // niebieski
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Koszt wynajmu',
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
  const yearlyMortgageCosts = mortgageCostData.map((value, index) => 
    index === 0 ? value : value - mortgageCostData[index - 1]
  );
  
  const yearlyRentCosts = rentCostData.map((value, index) => 
    index === 0 ? value : value - rentCostData[index - 1]
  );
  
  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Roczny koszt zakupu',
        data: yearlyMortgageCosts,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
      {
        label: 'Roczny koszt wynajmu',
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
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">{title}</div>
        
        {showBreakEvenPoint && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gray-100 py-2 px-4 rounded-lg text-sm">
              <span className="font-medium">Punkt rentowności:</span>
              <span className="ml-2 text-blue-600 font-semibold">{breakEvenIndex !== -1 ? breakEvenYear : "Nie osiągnięto"}</span>
            </div>
            
            <div className="bg-gray-100 py-2 px-4 rounded-lg text-sm">
              <span className="font-medium">Różnica po {labels.length} latach:</span>
              <span className={`ml-2 font-semibold ${results.comparison.buyingIsBetter ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Math.abs(results.comparison.finalDifference))}
                {results.comparison.buyingIsBetter ? ' na korzyść zakupu' : ' na korzyść wynajmu'}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="h-80 mb-6">
        {showCumulative ? (
          <Line data={lineChartData} options={options} />
        ) : (
          <Bar data={barChartData} options={options} />
        )}
      </div>
      
      <div className="flex justify-center gap-8 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 mr-2 rounded"></div>
          <span>Zakup nieruchomości</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-amber-500 mr-2 rounded"></div>
          <span>Wynajem</span>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>* Wykres uwzględnia wszystkie koszty związane z zakupem (rata kredytu, ubezpieczenie, podatki, utrzymanie) oraz wynajmem (czynsz, kaucja, ubezpieczenie).</p>
        <p>* Wartości obliczone z uwzględnieniem inflacji na poziomie {results.comparison.chartData.labels.length > 0 ? results.comparison.chartData.labels[0] : 0}.</p>
      </div>
    </div>
  );
};

export default CostComparisonChart;