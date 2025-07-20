'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, FileText, Calculator } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend as ChartLegend, ArcElement, BarElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, ChartLegend, ArcElement, BarElement);

interface Calculation {
  id: string;
  title: string;
  calculation_type: string;
  input_json: any;
  result_json: any;
  created_at: string;
  updated_at: string;
}

// Komponenty wykresów z kalkulatora zakupu
const OverpaymentComparisonChart: React.FC<{
  scheduleWithoutOverpayment: any[];
  scheduleWithOverpayment: any[];
}> = ({ scheduleWithoutOverpayment, scheduleWithOverpayment }) => {
  if (!scheduleWithoutOverpayment || !scheduleWithOverpayment) return null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={scheduleWithoutOverpayment}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="principalPart" fill="#8884d8" name="Kapitał" />
          <Bar dataKey="interestPart" fill="#82ca9d" name="Odsetki" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const OverpaymentTimelineChart: React.FC<{
  schedule: any[];
}> = ({ schedule }) => {
  if (!schedule) return null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={schedule}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="remainingPrincipal" fill="#8884d8" name="Pozostały kapitał" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CalculationDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!params.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setError('Brak tokenu autoryzacji');
          return;
        }

        const response = await fetch(`/api/user/calculations/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Kalkulacja nie została znaleziona');
          } else if (response.status === 401) {
            setError('Brak uprawnień do wyświetlenia tej kalkulacji');
          } else {
            setError('Błąd podczas pobierania kalkulacji');
          }
          return;
        }
        
        const data = await response.json();
        setCalculation(data);
      } catch (err) {
        console.error('Error fetching calculation:', err);
        setError('Błąd podczas pobierania kalkulacji');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [params.id]);

  const getCalculationTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return 'Kalkulator zakupu nieruchomości';
      case 'rental': return 'Kalkulator opłacalności wynajmu';
      case 'creditScore': return 'Kalkulator zdolności kredytowej';
      case 'valuation': return 'Kalkulator wyceny nieruchomości';
      default: return 'Kalkulacja';
    }
  };

  const getCalculationTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rental': return 'bg-green-100 text-green-800 border-green-200';
      case 'creditScore': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'valuation': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const isValidNumber = (value: any): boolean => {
    if (!value) return false;
    if (value === '' || value === '0' || value === 0) return false;
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  };

  const renderValuationResults = (inputData: any, resultData: any) => {
    if (!resultData) return null;

    const mainPrice = resultData.price || resultData.estimated_value;
    const hasRange = resultData.minPrice && resultData.maxPrice;
    const area = inputData?.area ? parseFloat(inputData.area) : null;

    const translateValuationMethod = (method: string) => {
      switch (method) {
        case 'EstymatorAI v2.7': return 'EstymatorAI v2.7';
        case 'heuristic_fallback': return 'Analiza heurystyczna';
        case 'comparative': return 'Metoda porównawcza';
        case 'income': return 'Metoda dochodowa';
        case 'cost': return 'Metoda kosztowa';
        case 'market': return 'Analiza rynkowa';
        default: return method;
      }
    };

    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">Wynik wyceny</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div>
                <p className="text-4xl font-bold text-blue-900 mb-2">
                  {formatCurrency(mainPrice)}
                </p>
                <p className="text-sm text-blue-700">Szacowana wartość nieruchomości</p>
              </div>
              
              {hasRange && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/70 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Minimum</p>
                    <p className="text-xl font-semibold text-gray-800">{formatCurrency(resultData.minPrice)}</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Maksimum</p>
                    <p className="text-xl font-semibold text-gray-800">{formatCurrency(resultData.maxPrice)}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resultData.confidence && (
                  <div className="bg-white/70 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Pewność wyceny</p>
                    <p className="text-lg font-semibold text-green-700">
                      {typeof resultData.confidence === 'number' 
                        ? `${Math.round(resultData.confidence * 100)}%` 
                        : resultData.confidence}
                    </p>
                  </div>
                )}
                
                {resultData.method && (
                  <div className="bg-white/70 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Metoda wyceny</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {translateValuationMethod(resultData.method)}
                    </p>
                  </div>
                )}
              </div>

              {resultData.note && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-800 mb-2">Uwagi</p>
                  <p className="text-sm text-amber-700">{resultData.note}</p>
                </div>
              )}

              {resultData.timestamp && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Wycena wykonana: {formatDate(resultData.timestamp)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {mainPrice && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {area ? formatCurrency(mainPrice / area) : 'N/A'}
                </div>
                <div className="text-sm text-green-600">Cena za m²</div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {hasRange ? formatCurrency((resultData.maxPrice - resultData.minPrice)) : 'N/A'}
                </div>
                <div className="text-sm text-blue-600">Dokładność szacowania</div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {hasRange ? `±${formatPercent(((resultData.maxPrice - resultData.minPrice) / mainPrice) * 50)}` : 'N/A'}
                </div>
                <div className="text-sm text-purple-600">Przedział ufności</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

    const renderRentalResults = (inputData: any, resultData: any) => {
    if (!resultData) return null;

    // Kolory dla wykresów (identyczne z oryginalnym kalkulatorem)
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
      <div className="mt-8">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Wyniki analizy:</h3>
        
        {/* Podstawowe wyniki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Roczny przychód</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-semibold text-gray-800">{resultData.annualIncome?.toFixed(2)} zł</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Roczny dochód netto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-semibold text-gray-800">{resultData.netAnnualIncome?.toFixed(2)} zł</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">ROI (roczny zwrot)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-green-700">{resultData.roi?.toFixed(2)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Wyniki kredytowe */}
        {resultData.loanAmount && resultData.loanAmount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Kwota kredytu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl font-semibold text-gray-800">{resultData.loanAmount?.toFixed(2)} zł</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Miesięczna rata</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl font-semibold text-gray-800">{resultData.monthlyLoanPayment?.toFixed(2)} zł</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Cash Flow (roczny)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl sm:text-3xl font-bold ${resultData.cashFlow && resultData.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {resultData.cashFlow?.toFixed(2)} zł
                </p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Cash-on-Cash Return (brutto)</CardTitle>
                <CardDescription>Zwrot z zaangażowanego kapitału przed opodatkowaniem</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl sm:text-3xl font-bold ${resultData.cocReturn && resultData.cocReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {resultData.cocReturn?.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wyniki podatkowe */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4 text-center">Analiza podatkowa (netto):</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Podatek roczny</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl font-semibold text-red-700">{resultData.taxAmount?.toFixed(2)} zł</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Cash Flow netto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-xl sm:text-2xl font-semibold ${resultData.netCashFlow && resultData.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {resultData.netCashFlow?.toFixed(2)} zł
                </p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Cash-on-Cash Return netto</CardTitle>
                <CardDescription>Zwrot z zaangażowanego kapitału po opodatkowaniu</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl sm:text-3xl font-bold ${resultData.netCocReturn && resultData.netCocReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {resultData.netCocReturn?.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Wykresy */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-6 text-center">Analiza wizualna:</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wykres kołowy kosztów miesięcznych */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Struktura kosztów miesięcznych</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={resultData.costBreakdown}
                      cx="50%"
                      cy="45%"
                      labelLine={true}
                      label={({ name, percent }) => {
                        if (percent > 0.15) return `${name}\n${(percent * 100).toFixed(0)}%`;
                        if (percent > 0.01) return `${(percent * 100).toFixed(0)}%`;
                        return '';
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {resultData.costBreakdown && resultData.costBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} zł`, 'Koszt']} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={80}
                      wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Wykres słupkowy przychody vs koszty */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Przychody vs Koszty (roczne)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={resultData.incomeVsCosts} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                      interval={0}
                      tick={{ dy: 10 }}
                    />
                    <YAxis tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k zł`} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} zł`, 'Kwota']} />
                    <Bar dataKey="Kwota" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Projekcja wieloletnia */}
        {resultData.projection && resultData.projection.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-4 text-center">Projekcja wieloletnia:</h4>
            
            {/* Tabela projekcji */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Projekcja na 10 lat</CardTitle>
                <CardDescription className="text-center">
                  Wartość nieruchomości, pozostały dług kredytowy i zbudowany kapitał
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Rok</th>
                        <th className="p-2 text-right">Wartość nieruchomości</th>
                        <th className="p-2 text-right">Pozostały kredyt</th>
                        <th className="p-2 text-right">Kapitał własny</th>
                        <th className="p-2 text-right">Roczny czynsz</th>
                        <th className="p-2 text-right">Cash Flow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultData.projection.map((row: any) => (
                        <tr key={row.year} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{row.year}</td>
                          <td className="p-2 text-right">{row.propertyValue.toLocaleString()} zł</td>
                          <td className="p-2 text-right">{row.remainingLoan.toLocaleString()} zł</td>
                          <td className="p-2 text-right font-semibold text-green-700">
                            {row.equity.toLocaleString()} zł
                          </td>
                          <td className="p-2 text-right">{row.yearlyRent.toLocaleString()} zł</td>
                          <td className={`p-2 text-right font-medium ${row.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {row.cashFlow.toLocaleString()} zł
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderCreditScoreResults = (inputData: any, resultData: any) => {
    if (!resultData) return null;

    // Przygotuj dane wykresu z oryginalnych danych lub konstruuj
    const chartData = resultData.chartData || [
      { 
        name: 'Dostępne na spłatę', 
        value: resultData.creditCapacity || 0, 
        fill: '#22c55e' 
      },
      { 
        name: 'Koszty utrzymania', 
        value: resultData.costOfLiving || 0, 
        fill: '#f97316' 
      },
      { 
        name: 'Zobowiązania', 
        value: resultData.totalCommitments || 0, 
        fill: '#ef4444' 
      }
    ].filter(item => item.value > 0);

    return (
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-6 text-center">Twoja szacunkowa zdolność kredytowa:</h3>
        
        {(!resultData.creditCapacity && !resultData.maxLoanAmount) && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-800">
              <span className="text-lg mr-2">⚠️</span>
              <span>Niektóre dane wyników mogą być niepełne lub niedostępne.</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Wyniki liczbowe */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-2">Maksymalna miesięczna rata:</h4>
                <p className="text-2xl font-bold text-green-700">
                  {resultData.creditCapacity ? formatCurrency(resultData.creditCapacity) : 'Brak danych'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-2">Maksymalna kwota kredytu:</h4>
                <p className="text-2xl font-bold text-green-700">
                  {resultData.maxLoanAmount ? formatCurrency(resultData.maxLoanAmount) : 'Brak danych'}
                </p>
                
                {inputData?.loanAmount && parseFloat(inputData.loanAmount) > 0 && (
                  <div className="mt-3 p-3 rounded-lg border">
                    <p className="text-sm font-medium mb-1">
                      Porównanie z pożądaną kwotą ({parseInt(inputData.loanAmount).toLocaleString('pl-PL')} zł):
                    </p>
                    {parseFloat(inputData.loanAmount) <= (resultData.maxLoanAmount || 0) ? (
                      <div className="flex items-center text-green-600">
                        <span className="text-lg mr-2">✅</span>
                        <span className="font-medium">Kredyt możliwy do uzyskania!</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <span className="text-lg mr-2">❌</span>
                        <span className="font-medium">
                          Przekracza zdolność o {(parseFloat(inputData.loanAmount) - (resultData.maxLoanAmount || 0)).toFixed(0)} zł
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Wykres kołowy */}
          {chartData.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg">Struktura miesięcznych dochodów i wydatków</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(0)} zł`, 'Kwota']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Szczegóły obliczeń */}
        {resultData.calculationDetails && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">📊 Szczegóły obliczeń</CardTitle>
                <CardDescription>
                  Transparentne wyjaśnienie jak kalkulator doszedł do Twojego wyniku
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">💰 Całkowity dochód netto</h4>
                    <p className="text-2xl font-bold text-blue-700">
                      {resultData.calculationDetails.totalIncome?.toFixed(0)} zł
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Po uwzględnieniu wag dla typu umowy
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">🏠 Koszty utrzymania</h4>
                    <p className="text-2xl font-bold text-orange-700">
                      {resultData.calculationDetails.costOfLiving?.toFixed(0)} zł
                    </p>
                    <p className="text-sm text-orange-600 mt-1">
                      Dynamiczny model: baza + 10% dochodu
                    </p>
                  </div>

                  <div className="bg-red-100 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">📋 Suma zobowiązań</h4>
                    <p className="text-2xl font-bold text-red-700">
                      {resultData.calculationDetails.totalCommitments?.toFixed(0)} zł
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      Opłaty + kredyty + 3% limitów kart/debetu
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">📈 Oprocentowanie (stress test)</h4>
                    <p className="text-2xl font-bold text-purple-700">
                      {resultData.calculationDetails.stressedInterestRate?.toFixed(1)}%
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      Twoje {inputData?.interestRate}% + bufor 2.5 p.p.
                    </p>
                  </div>

                  <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Zastosowany limit DSTI</h4>
                    <p className="text-2xl font-bold text-green-700">
                      {resultData.calculationDetails.effectiveDstiLimit?.toFixed(0)}%
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {resultData.calculationDetails.effectiveDstiLimit !== parseFloat(inputData?.dstiRatio) ? 
                        'Automatycznie ograniczony' : 'Zgodnie z Twoim wyborem'}
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-2">⚖️ Wykorzystane DSTI</h4>
                    <p className="text-2xl font-bold text-indigo-700">
                      {resultData.calculationDetails.dstiUsed?.toFixed(1)}%
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderPurchaseResults = (resultData: any) => {
    if (!resultData) return null;

    return (
      <div className="space-y-6">
        {/* Główne wskaźniki */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Pierwsza rata</h4>
              <p className="text-xl font-bold text-blue-800">
                {formatCurrency(resultData.firstInstallment || 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6 text-center">
              <h4 className="text-lg font-semibold text-green-900 mb-2">Ostatnia rata</h4>
              <p className="text-xl font-bold text-green-800">
                {formatCurrency(resultData.lastInstallment || 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <h4 className="text-lg font-semibold text-purple-900 mb-2">Łączne odsetki</h4>
              <p className="text-xl font-bold text-purple-800">
                {formatCurrency(resultData.totalInterest || 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <h4 className="text-lg font-semibold text-orange-900 mb-2">Całkowita spłata</h4>
              <p className="text-xl font-bold text-orange-800">
                {formatCurrency(resultData.totalRepayment || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Koszty dodatkowe */}
        <Card>
          <CardHeader>
            <CardTitle>Koszty dodatkowe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {resultData.pccTax && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Podatek PCC</p>
                  <p className="text-lg font-semibold text-gray-800">{formatCurrency(resultData.pccTax)}</p>
                </div>
              )}
              {resultData.notaryFee && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Opłata notarialna</p>
                  <p className="text-lg font-semibold text-gray-800">{formatCurrency(resultData.notaryFee)}</p>
                </div>
              )}
              {resultData.bankCommissionAmount && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Prowizja banku</p>
                  <p className="text-lg font-semibold text-gray-800">{formatCurrency(resultData.bankCommissionAmount)}</p>
                </div>
              )}
              {resultData.agencyCommissionAmount && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Prowizja agencji</p>
                  <p className="text-lg font-semibold text-gray-800">{formatCurrency(resultData.agencyCommissionAmount)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wykresy harmonogramu spłat */}
        {resultData.schedule && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Struktura rat (kapitał vs odsetki)</CardTitle>
              </CardHeader>
              <CardContent>
                <OverpaymentComparisonChart
                  scheduleWithoutOverpayment={resultData.schedule}
                  scheduleWithOverpayment={resultData.schedule}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Spadek zadłużenia w czasie</CardTitle>
              </CardHeader>
              <CardContent>
                <OverpaymentTimelineChart schedule={resultData.schedule} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderInputData = (inputData: any, type: string) => {
    if (!inputData) return null;

    switch (type) {
      case 'valuation':
        // Funkcje do tłumaczenia wartości
        const translateCondition = (condition: string) => {
          switch (condition) {
            case 'new': return 'Nowy (po remoncie)';
            case 'good': return 'Dobry (mieszkalny)';
            case 'renovation': return 'Do remontu';
            default: return condition;
          }
        };

        const translateLocationTier = (tier: string) => {
          switch (tier) {
            case 'premium': return 'Premium (centrum, prestiżowe dzielnice)';
            case 'standard': return 'Standard (typowe osiedla)';
            default: return tier;
          }
        };

        const translateBuildingType = (type: string) => {
          switch (type) {
            case 'blok': return 'Blok mieszkalny';
            case 'kamienica': return 'Kamienica';
            case 'dom': return 'Dom jednorodzinny';
            case 'apartamentowiec': return 'Apartamentowiec';
            default: return type;
          }
        };

        const translateParking = (parking: string) => {
          switch (parking) {
            case 'garage': return 'Garaż';
            case 'parking': return 'Miejsce parkingowe';
            case 'street': return 'Parking uliczny';
            case 'none': return 'Brak';
            default: return parking;
          }
        };

        const translateFinishing = (finishing: string) => {
          switch (finishing) {
            case 'developer': return 'Deweloperski';
            case 'full': return 'Pod klucz';
            case 'renovation': return 'Do remontu';
            case 'standard': return 'Standard';
            default: return finishing;
          }
        };

        const translateYesNo = (value: string) => {
          switch (value) {
            case 'yes': return 'Tak';
            case 'no': return 'Nie';
            default: return value;
          }
        };

        const translateOrientation = (orientation: string) => {
          switch (orientation) {
            case 'north': return 'Północ';
            case 'south': return 'Południe';
            case 'east': return 'Wschód';
            case 'west': return 'Zachód';
            case 'north-east': return 'Północny wschód';
            case 'south-east': return 'Południowy wschód';
            case 'north-west': return 'Północny zachód';
            case 'south-west': return 'Południowy zachód';
            default: return orientation;
          }
        };

        const translateTransport = (transport: string) => {
          switch (transport) {
            case 'excellent': return 'Doskonały';
            case 'good': return 'Dobry';
            case 'medium': return 'Średni';
            case 'poor': return 'Słaby';
            default: return transport;
          }
        };

        const translateHeating = (heating: string) => {
          switch (heating) {
            case 'central': return 'Centralne';
            case 'gas': return 'Gazowe';
            case 'electric': return 'Elektryczne';
            case 'coal': return 'Węglowe';
            case 'oil': return 'Olejowe';
            default: return heating;
          }
        };

        const translateKitchenType = (kitchen: string) => {
          switch (kitchen) {
            case 'separate': return 'Osobna';
            case 'annex': return 'Aneks';
            case 'open': return 'Otwarta';
            case 'kitchenette': return 'Aneks kuchenny';
            case 'closed': return 'Zamknięta';
            default: return kitchen;
          }
        };

        const translateBasement = (basement: string) => {
          switch (basement) {
            case 'basement': return 'Piwnica';
            case 'storage': return 'Komórka';
            case 'none': return 'Brak';
            default: return basement;
          }
        };

        const translateBuildingMaterial = (material: string) => {
          switch (material) {
            case 'brick': return 'Cegła';
            case 'concrete': return 'Beton';
            case 'brick_concrete': return 'Cegła i beton';
            case 'reinforced_concrete': return 'Żelbet';
            case 'wood': return 'Drewno';
            case 'steel': return 'Stal';
            case 'stone': return 'Kamień';
            case 'other': return 'Inne';
            default: return material;
          }
        };

        const translateOwnership = (ownership: string) => {
          switch (ownership) {
            case 'full': return 'Pełna własność';
            case 'cooperative': return 'Prawo spółdzielcze';
            default: return ownership;
          }
        };

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lokalizacja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inputData.city && inputData.city.trim() && <div><span className="font-medium">Miasto:</span> {inputData.city}</div>}
                  {inputData.district && inputData.district.trim() && <div><span className="font-medium">Dzielnica:</span> {inputData.district}</div>}
                  {inputData.street && inputData.street.trim() && <div><span className="font-medium">Ulica:</span> {inputData.street}</div>}
                  {inputData.locationTier && <div><span className="font-medium">Klasa lokalizacji:</span> {translateLocationTier(inputData.locationTier)}</div>}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Podstawowe parametry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inputData.area && <div><span className="font-medium">Powierzchnia:</span> {inputData.area} m²</div>}
                  {inputData.rooms && <div><span className="font-medium">Pokoje:</span> {inputData.rooms}</div>}
                  {inputData.floor && <div><span className="font-medium">Piętro:</span> {inputData.floor}</div>}
                  {inputData.totalFloors && <div><span className="font-medium">Pięter w budynku:</span> {inputData.totalFloors}</div>}
                  {inputData.year && <div><span className="font-medium">Rok budowy:</span> {inputData.year}</div>}
                  {inputData.condition && <div><span className="font-medium">Stan:</span> {translateCondition(inputData.condition)}</div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Typ i wykończenie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inputData.buildingType && <div><span className="font-medium">Typ budynku:</span> {translateBuildingType(inputData.buildingType)}</div>}
                  {inputData.finishing && <div><span className="font-medium">Wykończenie:</span> {translateFinishing(inputData.finishing)}</div>}
                  {inputData.buildingMaterial && <div><span className="font-medium">Materiał budynku:</span> {translateBuildingMaterial(inputData.buildingMaterial)}</div>}
                  {inputData.ownership && <div><span className="font-medium">Forma własności:</span> {translateOwnership(inputData.ownership)}</div>}
                  {inputData.lastRenovation && <div><span className="font-medium">Ostatni remont:</span> {inputData.lastRenovation}</div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Udogodnienia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inputData.parking && <div><span className="font-medium">Parking:</span> {translateParking(inputData.parking)}</div>}
                  {inputData.elevator && <div><span className="font-medium">Winda:</span> {translateYesNo(inputData.elevator)}</div>}
                  {inputData.balcony && <div><span className="font-medium">Balkon:</span> {translateYesNo(inputData.balcony)}</div>}
                  {inputData.balconyArea && <div><span className="font-medium">Powierzchnia balkonu:</span> {inputData.balconyArea} m²</div>}
                  {inputData.basement && <div><span className="font-medium">Piwnica/komórka:</span> {translateBasement(inputData.basement)}</div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instalacje i media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inputData.heating && <div><span className="font-medium">Ogrzewanie:</span> {translateHeating(inputData.heating)}</div>}
                  {inputData.bathrooms && <div><span className="font-medium">Łazienki:</span> {inputData.bathrooms}</div>}
                  {inputData.kitchenType && <div><span className="font-medium">Typ kuchni:</span> {translateKitchenType(inputData.kitchenType)}</div>}
                  {inputData.orientation && <div><span className="font-medium">Orientacja:</span> {translateOrientation(inputData.orientation)}</div>}
                  {inputData.transport && <div><span className="font-medium">Transport:</span> {translateTransport(inputData.transport)}</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'rental':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Podstawowe dane</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isValidNumber(inputData.purchasePrice) && <div><span className="font-medium">Cena zakupu:</span> {formatCurrency(parseFloat(inputData.purchasePrice))}</div>}
                  {isValidNumber(inputData.monthlyRent) && <div><span className="font-medium">Czynsz miesięczny:</span> {formatCurrency(parseFloat(inputData.monthlyRent))}</div>}
                  {isValidNumber(inputData.transactionCosts) && <div><span className="font-medium">Koszty transakcji:</span> {formatCurrency(parseFloat(inputData.transactionCosts))}</div>}
                  {isValidNumber(inputData.renovationCosts) && <div><span className="font-medium">Koszty remontu:</span> {formatCurrency(parseFloat(inputData.renovationCosts))}</div>}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Koszty miesięczne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isValidNumber(inputData.adminFees) && <div><span className="font-medium">Opłaty administracyjne:</span> {formatCurrency(parseFloat(inputData.adminFees))}</div>}
                  {isValidNumber(inputData.utilities) && <div><span className="font-medium">Media:</span> {formatCurrency(parseFloat(inputData.utilities))}</div>}
                  {isValidNumber(inputData.insurance) && <div><span className="font-medium">Ubezpieczenie:</span> {formatCurrency(parseFloat(inputData.insurance))}</div>}
                  {isValidNumber(inputData.maintenance) && <div><span className="font-medium">Konserwacja:</span> {formatCurrency(parseFloat(inputData.maintenance))}</div>}
                  {isValidNumber(inputData.propertyTax) && <div><span className="font-medium">Podatek:</span> {formatCurrency(parseFloat(inputData.propertyTax))}</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'creditScore':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dochody</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isValidNumber(inputData.monthlyIncome) && <div><span className="font-medium">Miesięczny dochód:</span> {formatCurrency(parseFloat(inputData.monthlyIncome))}</div>}
                  {isValidNumber(inputData.secondBorrowerIncome) && <div><span className="font-medium">Dochód współkredytobiorcy:</span> {formatCurrency(parseFloat(inputData.secondBorrowerIncome))}</div>}
                  {inputData.employmentType && inputData.employmentType !== '' && <div><span className="font-medium">Typ zatrudnienia:</span> {
                    inputData.employmentType === 'employment' ? 'Umowa o pracę' :
                    inputData.employmentType === 'b2b' ? 'B2B / Działalność gospodarcza' :
                    inputData.employmentType === 'contract' ? 'Umowa zlecenie/o dzieło' :
                    inputData.employmentType
                  }</div>}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Wydatki</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isValidNumber(inputData.monthlyExpenses) && <div><span className="font-medium">Miesięczne wydatki:</span> {formatCurrency(parseFloat(inputData.monthlyExpenses))}</div>}
                  {isValidNumber(inputData.otherLoans) && <div><span className="font-medium">Inne kredyty:</span> {formatCurrency(parseFloat(inputData.otherLoans))}</div>}
                  {isValidNumber(inputData.creditCardLimits) && <div><span className="font-medium">Limity kart kredytowych:</span> {formatCurrency(parseFloat(inputData.creditCardLimits))}</div>}
                  {isValidNumber(inputData.accountOverdrafts) && <div><span className="font-medium">Debety w koncie:</span> {formatCurrency(parseFloat(inputData.accountOverdrafts))}</div>}
                  {isValidNumber(inputData.householdSize) && <div><span className="font-medium">Liczba osób w gospodarstwie:</span> {inputData.householdSize}</div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parametry kredytu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isValidNumber(inputData.loanAmount) && <div><span className="font-medium">Kwota kredytu:</span> {formatCurrency(parseFloat(inputData.loanAmount))}</div>}
                  {isValidNumber(inputData.loanTerm) && <div><span className="font-medium">Okres kredytowania:</span> {inputData.loanTerm} lat</div>}
                  {isValidNumber(inputData.interestRate) && <div><span className="font-medium">Oprocentowanie:</span> {inputData.interestRate}%</div>}
                  {inputData.installmentType && inputData.installmentType !== '' && <div><span className="font-medium">Typ rat:</span> {inputData.installmentType === 'equal' ? 'Równe (annuitetowe)' : 'Malejące'}</div>}
                  {isValidNumber(inputData.dstiRatio) && <div><span className="font-medium">Wskaźnik DSTI:</span> {inputData.dstiRatio}%</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'purchase':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Parametry kredytu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isValidNumber(inputData.propertyValue) && <div><span className="font-medium">Wartość nieruchomości:</span> {formatCurrency(parseFloat(inputData.propertyValue))}</div>}
                  {isValidNumber(inputData.loanAmount) && <div><span className="font-medium">Kwota kredytu:</span> {formatCurrency(parseFloat(inputData.loanAmount))}</div>}
                  {isValidNumber(inputData.loanTerm) && <div><span className="font-medium">Okres kredytowania:</span> {inputData.loanTerm} lat</div>}
                  {isValidNumber(inputData.bankMargin) && <div><span className="font-medium">Marża banku:</span> {inputData.bankMargin}%</div>}
                  {isValidNumber(inputData.referenceRate) && <div><span className="font-medium">Stopa referencyjna:</span> {inputData.referenceRate}%</div>}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Koszty dodatkowe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isValidNumber(inputData.bankCommission) && <div><span className="font-medium">Prowizja banku:</span> {inputData.bankCommission}%</div>}
                  {isValidNumber(inputData.agencyCommission) && <div><span className="font-medium">Prowizja agencji:</span> {inputData.agencyCommission}%</div>}
                  {isValidNumber(inputData.pccTaxRate) && <div><span className="font-medium">Podatek PCC:</span> {inputData.pccTaxRate}%</div>}
                  {inputData.installmentType && inputData.installmentType !== '' && <div><span className="font-medium">Typ rat:</span> {inputData.installmentType === 'equal' ? 'Równe' : 'Malejące'}</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie kalkulacji...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Błąd</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/panel/kalkulacje')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Powrót do listy
          </Button>
        </div>
      </div>
    );
  }

  if (!calculation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/panel/kalkulacje')}
            variant="outline"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Powrót do listy
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{calculation.title}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCalculationTypeColor(calculation.calculation_type)}`}>
                    {getCalculationTypeLabel(calculation.calculation_type)}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(calculation.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Calculator className="w-5 h-5" />
                <span className="text-sm">ID: {calculation.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dane wejściowe */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dane wejściowe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderInputData(calculation.input_json, calculation.calculation_type)}
            </CardContent>
          </Card>
        </div>

        {/* Wyniki */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Wyniki kalkulacji
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculation.calculation_type === 'valuation' && renderValuationResults(calculation.input_json, calculation.result_json)}
              {calculation.calculation_type === 'rental' && renderRentalResults(calculation.input_json, calculation.result_json)}
              {calculation.calculation_type === 'creditScore' && renderCreditScoreResults(calculation.input_json, calculation.result_json)}
              {calculation.calculation_type === 'purchase' && renderPurchaseResults(calculation.result_json)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculationDetailPage; 