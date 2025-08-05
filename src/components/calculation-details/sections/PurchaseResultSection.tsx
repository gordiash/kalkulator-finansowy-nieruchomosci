import { Doughnut, Bar, Line } from 'react-chartjs-2';

interface PurchaseResultSectionProps {
  data: any;
}

export function PurchaseResultSection({ data }: PurchaseResultSectionProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatLoanTerm = (months: number | null) => {
    if (!months) return '0';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} miesięcy`;
    if (remainingMonths === 0) return `${years} lat`;
    return `${years} lat ${remainingMonths} miesięcy`;
  };
  
  // Oblicz koszty jak w normalnej kalkulacji
  const ancillaryCosts = (data.notaryFee || 0) + (data.pcctax || 0) + (data.bankCommissionAmount || 0) + (data.courtFees || 0) + (data.agencyCommissionAmount || 0);
  const totalCreditCost = (data.totalInterest || 0) + (data.bankCommissionAmount || 0);
  
  // Pobierz dane wejściowe z kalkulacji (jeśli dostępne)
  const inputData = data.inputData || {};
  const propertyValue = parseFloat(inputData.propertyValue) || 0;
  const loanAmount = parseFloat(inputData.loanAmount) || 0;
  const downPayment = propertyValue - loanAmount;
  const totalInitialOutlay = downPayment + ancillaryCosts;

  // Dane dla wykresu struktury kosztów
  const costStructureData = {
    labels: ['Wkład własny', 'Podatek PCC', 'Taksa notarialna', 'Prowizja bankowa', 'Opłaty sądowe', 'Prowizja agencji'],
    datasets: [
      {
        data: [
          downPayment,
          data.pcctax || 0,
          data.notaryFee || 0,
          data.bankCommissionAmount || 0,
          data.courtFees || 0,
          data.agencyCommissionAmount || 0
        ],
        backgroundColor: [
          '#3B82F6', // blue
          '#EF4444', // red
          '#F59E0B', // amber
          '#10B981', // emerald
          '#8B5CF6', // violet
          '#F97316'  // orange
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Dane dla wykresu harmonogramu spłat (cały okres)
  const scheduleData = data.schedule && data.schedule.length > 0 ? {
    labels: data.schedule.map((payment: any) => `Miesiąc ${payment.month}`),
    datasets: [
      {
        label: 'Kapitał',
        data: data.schedule.map((payment: any) => payment.principalPart),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Odsetki',
        data: data.schedule.map((payment: any) => payment.interestPart),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }
    ]
  } : null;

  // Dane dla wykresu porównania rat
  const installmentComparisonData = {
    labels: ['Pierwsza rata', 'Ostatnia rata'],
    datasets: [
      {
        label: 'Wysokość raty',
        data: [data.firstInstallment || 0, data.lastInstallment || 0],
        backgroundColor: ['#3B82F6', '#EF4444'],
        borderColor: ['#2563EB', '#DC2626'],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Koszty Początkowe */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Koszty Początkowe</h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 md:p-6 bg-gray-100 rounded-lg">
            <p className="text-sm md:text-base text-gray-600 mb-2 sm:mb-0">Wkład własny</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{formatCurrency(downPayment)}</p>
          </div>
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg">
            <p className="text-sm md:text-base text-gray-600 mb-4 font-semibold">Koszty okołozakupowe</p>
            <div className="space-y-3 text-sm md:text-base">
              {(data.pcctax || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Podatek PCC:</span> 
                  <span className="font-semibold">{formatCurrency(data.pcctax)}</span>
                </div>
              )}
              {(data.notaryFee || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Taksa notarialna:</span> 
                  <span className="font-semibold">{formatCurrency(data.notaryFee)}</span>
                </div>
              )}
              {(data.bankCommissionAmount || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Prowizja bankowa:</span> 
                  <span className="font-semibold">{formatCurrency(data.bankCommissionAmount)}</span>
                </div>
              )}
              {(data.courtFees || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Opłaty sądowe:</span> 
                  <span className="font-semibold">{formatCurrency(data.courtFees)}</span>
                </div>
              )}
              {(data.agencyCommissionAmount || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Prowizja agencji:</span> 
                  <span className="font-semibold">{formatCurrency(data.agencyCommissionAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold border-t pt-3 mt-3 text-base md:text-lg">
                <span>Suma kosztów okołozakupowych:</span> 
                <span>{formatCurrency(ancillaryCosts)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 md:p-6 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm md:text-base font-semibold text-gray-700 mb-2 sm:mb-0">RAZEM (gotówka na start)</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{formatCurrency(totalInitialOutlay)}</p>
          </div>
        </div>
      </div>

      {/* Wykres struktury kosztów */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Struktura Kosztów Początkowych</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <Doughnut 
              data={costStructureData}
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
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Wkład własny</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(downPayment)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Podatek PCC</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.pcctax || 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Taksa notarialna</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.notaryFee || 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Prowizja bankowa</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.bankCommissionAmount || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Podsumowanie Płatności Kredytu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Podsumowanie Płatności Kredytu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
            <p className="text-sm md:text-base text-gray-600 mb-2">Pierwsza Rata</p>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 break-words">{formatCurrency(data.firstInstallment)}</p>
          </div>
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
            <p className="text-sm md:text-base text-gray-600 mb-2">Ostatnia Rata</p>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 break-words">{formatCurrency(data.lastInstallment)}</p>
          </div>
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
            <p className="text-sm md:text-base text-gray-600 mb-2">Suma Odsetek</p>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 break-words">{formatCurrency(data.totalInterest)}</p>
          </div>
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
            <p className="text-sm md:text-base text-gray-600 mb-2">Całkowity Koszt Kredytu</p>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 break-words">{formatCurrency(totalCreditCost)}</p>
          </div>
        </div>
      </div>

      {/* Wykres porównania rat */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Porównanie Rat</h2>
        <div className="h-80">
          <Bar 
            data={installmentComparisonData}
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

      {/* Wykres harmonogramu spłat */}
      {scheduleData && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Harmonogram Spłat (Cały okres)</h2>
          <div className="h-80">
            <Line 
              data={scheduleData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
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

      {/* Wyniki Nadpłaty */}
      {data.overpaymentResults && data.overpaymentResults.savedInterest > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wyniki Nadpłaty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
              <p className="text-sm md:text-base text-gray-700 mb-2">Zaoszczędzone odsetki</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{formatCurrency(data.overpaymentResults.savedInterest)}</p>
            </div>
            <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
              <p className="text-sm md:text-base text-gray-700 mb-2">Kredyt spłacisz szybciej o</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                {data.overpaymentResults.monthsShortened > 0 ? formatLoanTerm(data.overpaymentResults.monthsShortened) : '0'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Harmonogram spłat */}
      {data.schedule && data.schedule.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Harmonogram Spłat</h2>
           <div className="space-y-2 max-h-96 overflow-y-auto">
             {data.schedule.map((payment: any, index: number) => (
               <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                 <div>
                   <p className="text-md font-semibold text-gray-800">Miesiąc {payment.month}: {formatCurrency(payment.totalPayment)}</p>
                   <div className="text-sm text-gray-600 mt-1">
                     <span>Kapitał: {formatCurrency(payment.principalPart)}</span>
                     <span className="mx-2">•</span>
                     <span>Odsetki: {formatCurrency(payment.interestPart)}</span>
                     {payment.overpayment > 0 && (
                       <>
                         <span className="mx-2">•</span>
                         <span>Nadpłata: {formatCurrency(payment.overpayment)}</span>
                       </>
                     )}
                   </div>
                 </div>
                 <div className="text-right text-sm text-gray-500">
                   Pozostałe saldo: {formatCurrency(payment.remainingPrincipal)}
                 </div>
               </div>
             ))}
           </div>
           
           {/* Break-even point */}
           {(() => {
             // Znajdź rzeczywisty punkt break-even uwzględniając nadpłaty
             // ale nie w miesiącu w którym wystąpiła nadpłata
             const breakEvenMonth = data.schedule.findIndex((payment: any) => {
               // Sprawdź czy część kapitałowa jest większa od części odsetkowej
               // Uwzględnij nadpłatę w części kapitałowej
               const effectivePrincipalPart = payment.principalPart + (payment.overpayment || 0);
               const isBreakEven = effectivePrincipalPart > payment.interestPart;
               
               // Nie pokazuj break-even w miesiącu z nadpłatą
               const hasOverpayment = (payment.overpayment || 0) > 0;
               
               return isBreakEven && !hasOverpayment;
             });
             
             if (breakEvenMonth !== -1) {
               const payment = data.schedule[breakEvenMonth];
               const effectivePrincipalPart = payment.principalPart + (payment.overpayment || 0);
               
               return (
                 <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                   <p className="text-lg font-semibold text-gray-800 mb-2">Punkt Break-even</p>
                   <p className="text-gray-600">
                     W miesiącu {breakEvenMonth + 1} część kapitałowa raty ({formatCurrency(effectivePrincipalPart)}) 
                     będzie większa od części odsetkowej ({formatCurrency(payment.interestPart)}).
                     <span className="block mt-1 text-sm text-blue-600">
                       Uwzględniając wpływ nadpłat na harmonogram kredytu
                     </span>
                   </p>
                 </div>
               );
             }
             return null;
           })()}
        </div>
      )}

      {/* Wynik Symulacji Zmiany Stóp Procentowych */}
      {data.referenceRateChange && data.referenceRateChange !== 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wynik Symulacji Zmiany Stóp Procentowych</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
              <p className="text-sm md:text-base text-gray-600 mb-2">Nowa pierwsza rata</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{formatCurrency(data.newFirstInstallment)}</p>
            </div>
            <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
              <p className="text-sm md:text-base text-gray-600 mb-2">Różnica w racie</p>
              <p className={`text-lg md:text-xl lg:text-2xl font-bold ${data.installmentDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {data.installmentDifference >= 0 ? '+' : ''}{formatCurrency(data.installmentDifference)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 