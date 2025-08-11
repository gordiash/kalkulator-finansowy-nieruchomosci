import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface CreditScoreResultSectionProps {
  data: any;
}

export function CreditScoreResultSection({ data }: CreditScoreResultSectionProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Brak danych';
    }
    return `${value.toFixed(2)}%`;
  };

  const hasNoStress = data && data.maxLoanAmountNoStress !== undefined && data.maxLoanAmountNoStress !== null;
  const columnsClass = hasNoStress ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <div className="space-y-8">
      {/* Główne wyniki */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Twoja szacunkowa zdolność kredytowa</h2>
        <div className={`grid grid-cols-1 ${columnsClass} gap-6`}>
          <div className="p-6 bg-green-50 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Maksymalna miesięczna rata</h3>
            <p className="text-3xl font-bold text-green-700">
              {data.creditCapacity ? formatCurrency(data.creditCapacity) : 'Brak danych'}
            </p>
          </div>
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Maksymalna kwota kredytu</h3>
            <p className="text-3xl font-bold text-blue-700">
              {data.maxLoanAmount ? formatCurrency(data.maxLoanAmount) : 'Brak danych'}
            </p>
          </div>

          {hasNoStress && (
            <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Maksymalna kwota bez stress testu</h3>
              <p className="text-3xl font-bold text-indigo-700">
                {formatCurrency(Number(data.maxLoanAmountNoStress))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Wykres struktury */}
      {data.chartData && data.chartData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Struktura miesięcznych dochodów i wydatków</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`${value.toFixed(0)} zł`, 'Kwota']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Szczegóły obliczeń */}
      {data.calculationDetails && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Szczegóły obliczeń</h2>
          <p className="text-gray-600 mb-6">Transparentne wyjaśnienie jak kalkulator doszedł do Twojego wyniku</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💰 Całkowity dochód netto</h4>
              <p className="text-2xl font-bold text-blue-700">
                {data.calculationDetails.totalIncome ? formatCurrency(data.calculationDetails.totalIncome) : 'Brak danych'}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Po uwzględnieniu wag dla typu umowy
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">🏠 Koszty utrzymania</h4>
              <p className="text-2xl font-bold text-orange-700">
                {data.calculationDetails.costOfLiving ? formatCurrency(data.calculationDetails.costOfLiving) : 'Brak danych'}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Dynamiczny model: baza + 10% dochodu
              </p>
            </div>

            <div className="bg-red-100 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">📋 Suma zobowiązań</h4>
              <p className="text-2xl font-bold text-red-700">
                {data.calculationDetails.totalCommitments ? formatCurrency(data.calculationDetails.totalCommitments) : 'Brak danych'}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Opłaty + kredyty + 3% limitów kart/debetu
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">📈 Oprocentowanie (stress test)</h4>
              <p className="text-2xl font-bold text-purple-700">
                {data.calculationDetails.stressedInterestRate ? formatPercentage(data.calculationDetails.stressedInterestRate) : 'Brak danych'}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                Twoje oprocentowanie + bufor 2.5 p.p.
              </p>
            </div>

            <div className="bg-green-100 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">🎯 Zastosowany limit DSTI</h4>
              <p className="text-2xl font-bold text-green-700">
                {data.calculationDetails.effectiveDstiLimit ? formatPercentage(data.calculationDetails.effectiveDstiLimit) : 'Brak danych'}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Automatycznie ograniczony lub zgodnie z wyborem
              </p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">⚖️ Wykorzystane DSTI</h4>
              <p className="text-2xl font-bold text-indigo-700">
                {data.calculationDetails.dstiUsed ? formatPercentage(data.calculationDetails.dstiUsed) : 'Brak danych'}
              </p>
              <p className="text-sm text-indigo-600 mt-1">
                Rzeczywiste obciążenie dochodów
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">🔍 Jak działają ograniczenia?</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Limity DSTI:</strong> Dochód &lt;7500zł → max 40%, 7500-12000zł → max 50%, &gt;12000zł → do 60%</p>
              <p><strong>Stress test:</strong> Automatyczny bufor +2.5 p.p. do oprocentowania (wymóg KNF)</p>
              <p><strong>Okresy:</strong> Maksymalnie 30 lat niezależnie od wprowadzonej wartości</p>
              <p><strong>Koszty życia:</strong> Realistyczny model uwzględniający poziom Twoich dochodów</p>
            </div>
          </div>
        </div>
      )}

      {/* Informacje o algorytmie */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="text-2xl">🚀</div>
          <div>
            <h4 className="font-semibold text-green-900 mb-2">Zaawansowany algorytm bankowy</h4>
            <p className="text-sm text-green-800 mb-2">
              Ten kalkulator wykorzystuje rzeczywiste mechanizmy stosowane przez banki:
            </p>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• <strong>Stress test</strong> - automatyczny bufor stóp procentowych (+2.5 p.p.)</li>
              <li>• <strong>Dynamiczne DSTI</strong> - ograniczenia w zależności od wysokości dochodu</li>
              <li>• <strong>Realistyczne koszty życia</strong> - model uwzględniający poziom zarobków</li>
              <li>• <strong>Pełna transparentność</strong> - widzisz każdy krok obliczeń</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Informacja prawna */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p>
          Powyższe obliczenia są jedynie symulacją i nie stanowią oferty w rozumieniu przepisów prawa. 
          Rzeczywista zdolność kredytowa zależy od wielu czynników i jest oceniana indywidualnie przez bank.
        </p>
      </div>
    </div>
  );
} 