interface RentalInputSectionProps {
  data: any;
}

export function RentalInputSection({ data }: RentalInputSectionProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Brak danych';
    }
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Dane podstawowe */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Dane Podstawowe</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Cena zakupu</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.purchasePrice ? formatCurrency(parseFloat(data.purchasePrice)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Miesięczny czynsz</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.monthlyRent ? formatCurrency(parseFloat(data.monthlyRent)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Koszty transakcyjne</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.transactionCosts ? formatCurrency(parseFloat(data.transactionCosts)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Koszt remontu</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.renovationCosts ? formatCurrency(parseFloat(data.renovationCosts)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Czynsz administracyjny</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.adminFees ? formatCurrency(parseFloat(data.adminFees)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Opłaty za media</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.utilities ? formatCurrency(parseFloat(data.utilities)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Ubezpieczenie (rocznie)</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.insurance ? formatCurrency(parseFloat(data.insurance)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Inne koszty</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.otherCosts ? formatCurrency(parseFloat(data.otherCosts)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Okres pustostanów</p>
            <p className="text-lg font-bold text-gray-800">{data.vacancyPeriod ? `${data.vacancyPeriod} miesięcy/rok` : 'Brak danych'}</p>
          </div>
        </div>
      </div>

      {/* Finansowanie kredytem */}
      {data.downPayment && data.downPayment > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Finansowanie Kredytem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Wkład własny</p>
              <p className="text-lg font-bold text-gray-800 break-words">
                {formatCurrency(parseFloat(data.downPayment))}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Oprocentowanie</p>
              <p className="text-lg font-bold text-gray-800">
                {data.interestRate ? formatPercentage(parseFloat(data.interestRate)) : 'Brak danych'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Okres kredytowania</p>
              <p className="text-lg font-bold text-gray-800">{data.loanYears ? `${data.loanYears} lat` : 'Brak danych'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Podatki */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Podatki</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Forma opodatkowania</p>
            <p className="text-lg font-bold text-gray-800">{data.taxationType === 'ryczalt' ? 'Ryczałt od przychodu' : 'Skala podatkowa'}</p>
          </div>
          {data.taxationType === 'skala' && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Próg podatkowy</p>
              <p className="text-lg font-bold text-gray-800">{data.taxScale === '12' ? '12% (do 120 000 zł)' : '32% (powyżej 120 000 zł)'}</p>
            </div>
          )}
          {data.taxationType === 'ryczalt' && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Stawka ryczałtu</p>
              <p className="text-lg font-bold text-gray-800">8,5% - do 100 000 zł przychodu rocznie<br/>12,5% - powyżej 100 000 zł przychodu rocznie</p>
            </div>
          )}
        </div>
      </div>

      {/* Projekcja wieloletnia */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Projekcja Wieloletnia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wzrost wartości nieruchomości</p>
            <p className="text-lg font-bold text-gray-800">{data.propertyAppreciation ? formatPercentage(data.propertyAppreciation) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wzrost czynszu</p>
            <p className="text-lg font-bold text-gray-800">{data.rentGrowth ? formatPercentage(data.rentGrowth) : 'Brak danych'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 