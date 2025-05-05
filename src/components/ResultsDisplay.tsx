import React from 'react';
import { CalculationResults } from '../types';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Rejestracja komponentów Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ResultsDisplayProps {
  results: CalculationResults;
  inflation: number;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, inflation }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const { buyingSummary, rentingSummary, comparison } = results;
  
  // Konfiguracja wykresu
  const chartData = {
    labels: comparison.chartData.labels,
    datasets: [
      {
        label: 'Skumulowane koszty kredytu',
        data: comparison.chartData.mortgageCostData,
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: 'Skumulowane koszty najmu',
        data: comparison.chartData.rentCostData,
        borderColor: '#ef4444', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
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
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Porównanie skumulowanych kosztów kredytu i najmu w czasie',
        color: '#1e293b',
        font: {
          size: 14,
          weight: 'bold' as const
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        },
        padding: 10,
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(value),
          font: {
            size: 10
          },
          maxTicksLimit: 8
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-10 animate-fadeIn">
      <h2 className="text-2xl font-bold text-center text-indigo-900 mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-amber-500 after:rounded-md">
        <svg className="w-6 h-6 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
        </svg>
        Wyniki analizy
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Podsumowanie zakupu */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-300">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 text-center relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-amber-500 after:rounded-md">
            Podsumowanie zakupu
          </h3>
          <ul className="space-y-2">
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Miesięczna rata kredytu:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.monthlyMortgagePayment)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Wkład własny:</span>
              <span className="font-semibold text-indigo-900">
                {formatCurrency(buyingSummary.downPayment)} ({((buyingSummary.downPayment / (buyingSummary.downPayment + buyingSummary.loanAmount)) * 100).toFixed(2)}%)
              </span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Kwota kredytu:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.loanAmount)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma rat kredytu:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.totalMortgagePayments)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma innych kosztów:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.totalOtherCosts)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Całkowite koszty:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.buyingTotal)}</span>
            </li>
            <li className="flex justify-between p-3 bg-amber-50 rounded-md shadow-sm font-semibold">
              <span>Wartość nieruchomości na koniec okresu:</span>
              <span className="text-amber-700">{formatCurrency(buyingSummary.propertyValue)}</span>
            </li>
          </ul>
        </div>

        {/* Podsumowanie wynajmu */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-300">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 text-center relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-amber-500 after:rounded-md">
            Podsumowanie wynajmu
          </h3>
          <ul className="space-y-2">
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Miesięczny czynsz:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.monthlyRent)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma czynszu:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.totalRent)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma ubezpieczenia:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.totalRentInsurance)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma kosztów bieżących:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.totalRentMaintenance)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Całkowite koszty:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.rentingTotal)}</span>
            </li>
            <li className="flex justify-between p-3 bg-amber-50 rounded-md shadow-sm font-semibold">
              <span>Wartość inwestycji na koniec okresu:</span>
              <span className="text-amber-700">{formatCurrency(rentingSummary.investmentValue)}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Porównanie opcji */}
      <div className="bg-white p-6 border-2 border-gray-100 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-indigo-900 mb-4 text-center inline-block relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-500 after:rounded-md">
          Porównanie opcji
        </h3>
        
        <p className="mb-2 text-center">Uwzględniona inflacja: {inflation}% rocznie</p>
        <p className="mb-2 text-center">
          Różnica w kosztach całkowitych: {formatCurrency(Math.abs(comparison.difference))}
        </p>
        <p className="mb-2 text-center">
          {comparison.difference > 0 
            ? 'Wynajem jest tańszy o ' 
            : 'Zakup jest tańszy o '} 
          {formatCurrency(Math.abs(comparison.difference))}
        </p>
        <p className="mb-2 text-center">Uwzględniając wartość końcową nieruchomości i inwestycji:</p>
        <p className="mt-4 p-4 bg-amber-50 rounded-lg text-center font-bold text-lg text-amber-700 relative overflow-hidden shadow-sm before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-amber-500">
          {comparison.buyingIsBetter 
            ? 'Zakup jest korzystniejszy o ' 
            : 'Wynajem jest korzystniejszy o '} 
          {formatCurrency(Math.abs(comparison.finalDifference))}
        </p>
      </div>

      {/* Wykres porównawczy */}
      <div className="h-64 sm:h-96 md:h-128 lg:h-192 p-4 bg-white rounded-lg shadow-sm overflow-x-auto">
        <div className="min-w-[600px] h-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay; 