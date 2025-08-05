interface PurchaseInputSectionProps {
  data: any;
}

export function PurchaseInputSection({ data }: PurchaseInputSectionProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Brak danych';
    }
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Główne parametry kredytu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Parametry Kredytu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wartość nieruchomości</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.propertyValue ? formatCurrency(parseFloat(data.propertyValue)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Kwota kredytu</p>
            <p className="text-lg font-bold text-gray-800 break-words">
              {data.loanAmount ? formatCurrency(parseFloat(data.loanAmount)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Okres kredytowania</p>
            <p className="text-lg font-bold text-gray-800">{data.loanTerm ? `${data.loanTerm} lat` : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Typ rat</p>
            <p className="text-lg font-bold text-gray-800">{data.installmentType ? (data.installmentType === 'equal' ? 'Równe' : 'Malejące') : 'Brak danych'}</p>
          </div>
        </div>
      </div>

      {/* Stopy procentowe */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Stopy Procentowe</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Marża banku</p>
            <p className="text-lg font-bold text-gray-800">
              {data.bankMargin ? formatPercentage(parseFloat(data.bankMargin)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Stopa referencyjna</p>
            <p className="text-lg font-bold text-gray-800">
              {data.referenceRate ? formatPercentage(parseFloat(data.referenceRate)) : 'Brak danych'}
            </p>
          </div>
        </div>
      </div>

      {/* Koszty i prowizje */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Koszty i Prowizje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Prowizja banku</p>
            <p className="text-lg font-bold text-gray-800">
              {data.bankCommission ? formatPercentage(parseFloat(data.bankCommission)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Prowizja agencji</p>
            <p className="text-lg font-bold text-gray-800">
              {data.agencyCommission ? formatPercentage(parseFloat(data.agencyCommission)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Stawka PCC</p>
            <p className="text-lg font-bold text-gray-800">
              {data.pccTaxRate ? formatPercentage(parseFloat(data.pccTaxRate)) : 'Brak danych'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Typ taksy notarialnej</p>
            <p className="text-lg font-bold text-gray-800">{data.notaryFeeType ? (data.notaryFeeType === 'max' ? 'Maksymalna' : 'Własna') : 'Brak danych'}</p>
          </div>
          {data.customNotaryFee && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Własna taksa notarialna</p>
              <p className="text-lg font-bold text-gray-800 break-words">
                {formatCurrency(parseFloat(data.customNotaryFee))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ubezpieczenie pomostowe */}
      {data.bridgeInsuranceMonths && parseFloat(data.bridgeInsuranceMonths) > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Ubezpieczenie Pomostowe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Okres ubezpieczenia</p>
              <p className="text-lg font-bold text-gray-800">{data.bridgeInsuranceMonths} miesięcy</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Zwiększenie marży</p>
              <p className="text-lg font-bold text-gray-800">
                {formatPercentage(parseFloat(data.bridgeInsuranceMarginIncrease))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nadpłaty */}
      {data.overpaymentAmount && parseFloat(data.overpaymentAmount) > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Parametry Nadpłat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Kwota nadpłaty</p>
              <p className="text-lg font-bold text-gray-800 break-words">
                {formatCurrency(parseFloat(data.overpaymentAmount))}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Częstotliwość</p>
              <p className="text-lg font-bold text-gray-800">{
                data.overpaymentFrequency === 'one-time' ? 'Jednorazowa' :
                data.overpaymentFrequency === 'monthly' ? 'Miesięczna' : 'Roczna'
              }</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Miesiąc rozpoczęcia</p>
              <p className="text-lg font-bold text-gray-800">{data.overpaymentStartMonth}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Cel nadpłat</p>
              <p className="text-lg font-bold text-gray-800">{
                data.overpaymentTarget === 'shorten-period' ? 'Skrócenie okresu' : 'Obniżenie rat'
              }</p>
            </div>
            {data.overpaymentFrequency !== 'one-time' && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Interwał nadpłat</p>
                <p className="text-lg font-bold text-gray-800">Co {data.overpaymentInterval} {data.overpaymentFrequency === 'monthly' ? 'miesiąc' : 'rok'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zmiana stopy referencyjnej */}
      {data.referenceRateChange && parseFloat(data.referenceRateChange) !== 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Symulacja Zmiany Stóp</h2>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Zmiana stopy referencyjnej</p>
            <p className="text-lg font-bold text-gray-800">
              {parseFloat(data.referenceRateChange) > 0 ? '+' : ''}{formatPercentage(parseFloat(data.referenceRateChange))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 