import { Doughnut, Bar } from 'react-chartjs-2';

interface RentalResultSectionProps {
  data: any;
}

export function RentalResultSection({ data }: RentalResultSectionProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Brak danych';
    }
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Podstawowe wyniki */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Podstawowe Wyniki</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Roczny przychód</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(data.annualIncome)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Roczny dochód netto</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(data.netAnnualIncome)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">ROI (roczny zwrot)</p>
            <p className="text-2xl font-bold text-gray-800">{formatPercentage(data.roi)}</p>
          </div>
        </div>
      </div>

      {/* Wyniki kredytowe */}
      {data.loanAmount && data.loanAmount > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wyniki Kredytowe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Kwota kredytu</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.loanAmount)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Miesięczna rata</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.monthlyLoanPayment)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Cash Flow (roczny)</p>
              <p className={`text-xl font-bold ${data.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(data.cashFlow)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center md:col-span-2 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Cash-on-Cash Return (brutto)</p>
              <p className={`text-2xl font-bold ${data.cocReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatPercentage(data.cocReturn)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analiza podatkowa */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Analiza Podatkowa (Netto)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Podatek roczny</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(data.taxAmount)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Cash Flow netto</p>
            <p className={`text-xl font-bold ${data.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(data.netCashFlow)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Cash-on-Cash Return netto</p>
            <p className={`text-2xl font-bold ${data.netCocReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatPercentage(data.netCocReturn)}
            </p>
          </div>
        </div>
      </div>

      {/* Wykresy */}
      {data.costBreakdown && data.costBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Struktura Kosztów Miesięcznych</h2>
          <div className="h-80">
            <Doughnut 
              data={{
                labels: data.costBreakdown.map((item: any) => item.name),
                datasets: [{
                  data: data.costBreakdown.map((item: any) => item.value),
                  backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'
                  ],
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Wykres przychody vs koszty */}
      {data.incomeVsCosts && data.incomeVsCosts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Przychody vs Koszty (Roczne)</h2>
          <div className="h-80">
            <Bar 
              data={{
                labels: data.incomeVsCosts.map((item: any) => item.name),
                datasets: [{
                  label: 'Kwota',
                  data: data.incomeVsCosts.map((item: any) => item.Kwota),
                  backgroundColor: data.incomeVsCosts.map((item: any) => item.fill),
                  borderColor: data.incomeVsCosts.map((item: any) => item.fill),
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${formatCurrency(context.parsed.y)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value as number);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Projekcja 10-letnia */}
      {data.projection && data.projection.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Projekcja 10-letnia</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Rok</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Wartość nieruchomości</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Pozostały kredyt</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Kapitał własny</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Roczny czynsz</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                {data.projection.map((year: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-800">{year.year || year.rok || index + 1}</td>
                    <td className="py-2 px-3 text-right text-gray-800">
                      {formatCurrency(year.propertyValue || year.wartoscNieruchomosci || 0)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-800">
                      {formatCurrency(year.remainingLoan || year.pozostalyKredyt || 0)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-800 font-semibold text-green-700">
                      {formatCurrency(year.equity || year.kapitalWlasny || 0)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-800">
                      {formatCurrency(year.yearlyRent || year.rocznyCzynsz || 0)}
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${
                      (year.cashFlow || year.przeplywPieniezny || 0) >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(year.cashFlow || year.przeplywPieniezny || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 