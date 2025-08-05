interface CreditScoreInputSectionProps {
  data: any;
}

export function CreditScoreInputSection({ data }: CreditScoreInputSectionProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Brak danych';
    }
    return `${value.toFixed(2)}%`;
  };

  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case 'employment': return 'Umowa o pracę';
      case 'b2b': return 'B2B / Działalność gospodarcza';
      case 'contract': return 'Umowa zlecenie/o dzieło';
      default: return type;
    }
  };

  const getInstallmentTypeLabel = (type: string) => {
    switch (type) {
      case 'equal': return 'Raty równe (annuitetowe)';
      case 'decreasing': return 'Raty malejące';
      default: return type;
    }
  };

  const getDstiRatioLabel = (ratio: string) => {
    switch (ratio) {
      case '40': return '40% - konserwatywnie';
      case '50': return '50% - standardowo';
      case '60': return '60% - agresywnie';
      default: return `${ratio}%`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dochody */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">💰 Dochody</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Miesięczny dochód netto - główny kredytobiorca</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.monthlyIncome ? formatCurrency(parseFloat(data.monthlyIncome)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Miesięczny dochód netto - drugi kredytobiorca</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.secondBorrowerIncome ? formatCurrency(parseFloat(data.secondBorrowerIncome)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Typ umowy głównego kredytobiorcy</p>
            <p className="text-lg font-bold text-gray-800">
              {data.employmentType ? getEmploymentTypeLabel(data.employmentType) : 'Brak danych'}
            </p>
          </div>
        </div>
      </div>

      {/* Wydatki i zobowiązania */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">📋 Wydatki i zobowiązania</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Miesięczne stałe opłaty</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.monthlyExpenses ? formatCurrency(parseFloat(data.monthlyExpenses)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Raty innych kredytów</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.otherLoans ? formatCurrency(parseFloat(data.otherLoans)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Suma limitów na kartach kredytowych</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.creditCardLimits ? formatCurrency(parseFloat(data.creditCardLimits)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Suma limitów w koncie - debet</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.accountOverdrafts ? formatCurrency(parseFloat(data.accountOverdrafts)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Liczba osób w gospodarstwie domowym</p>
            <p className="text-lg font-bold text-gray-800">{data.householdSize || 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wskaźnik DSTI</p>
            <p className="text-lg font-bold text-gray-800">
              {data.dstiRatio ? getDstiRatioLabel(data.dstiRatio) : 'Brak danych'}
            </p>
          </div>
        </div>
      </div>

      {/* Parametry kredytu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">🏦 Parametry kredytu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.loanAmount && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Kwota kredytu</p>
              <p className="text-lg font-bold text-gray-800 break-words">
                {formatCurrency(parseFloat(data.loanAmount))}
              </p>
            </div>
          )}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Okres kredytowania</p>
            <p className="text-lg font-bold text-gray-800">{data.loanTerm ? `${data.loanTerm} lat` : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Oprocentowanie kredytu</p>
            <p className="text-lg font-bold text-gray-800">
              {data.interestRate ? formatPercentage(parseFloat(data.interestRate)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Rodzaj rat</p>
            <p className="text-lg font-bold text-gray-800">
              {data.installmentType ? getInstallmentTypeLabel(data.installmentType) : 'Brak danych'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 