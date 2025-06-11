"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { HelpCircle } from "lucide-react";

// Komponent pomocniczy dla pól z tooltipami - POZA głównym komponentem
const InputWithTooltip = ({ 
  id, 
  label, 
  tooltip, 
  value, 
  onChange, 
  type = "number", 
  placeholder, 
  step 
}: {
  id: string;
  label: string;
  tooltip: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-80">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      step={step}
    />
  </div>
);

// Komponent pomocniczy dla selectów z tooltipami - POZA głównym komponentem
const SelectWithTooltip = ({ 
  id, 
  label, 
  tooltip, 
  value, 
  onValueChange, 
  placeholder,
  children 
}: {
  id: string;
  label: string;
  tooltip: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-80">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  </div>
);

const CreditScoreCalculatorPage = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [otherLoans, setOtherLoans] = useState("");
  const [householdSize, setHouseholdSize] = useState("1");
  
  // Parametry kredytu
  const [loanTerm, setLoanTerm] = useState("30");
  const [interestRate, setInterestRate] = useState("7.5");
  const [installmentType, setInstallmentType] = useState("equal");

  // Pola z Etapu 2
  const [secondBorrowerIncome, setSecondBorrowerIncome] = useState("");
  const [employmentType, setEmploymentType] = useState("employment");
  const [creditCardLimits, setCreditCardLimits] = useState("");
  const [accountOverdrafts, setAccountOverdrafts] = useState("");

  // Pole z Etapu 3
  const [dstiRatio, setDstiRatio] = useState("50");

  // Stany dla backendu
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditCapacity, setCreditCapacity] = useState<number | null>(null);
  const [maxLoanAmount, setMaxLoanAmount] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const calculateCreditScore = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const requestData = {
        calculationType: 'credit-score',
        monthlyIncome: parseFloat(monthlyIncome),
        monthlyExpenses: parseFloat(monthlyExpenses) || 0,
        otherLoans: parseFloat(otherLoans) || 0,
        householdSize: parseInt(householdSize),
        loanTerm: parseInt(loanTerm),
        interestRate: parseFloat(interestRate),
        installmentType,
        secondBorrowerIncome: parseFloat(secondBorrowerIncome) || 0,
        employmentType,
        creditCardLimits: parseFloat(creditCardLimits) || 0,
        accountOverdrafts: parseFloat(accountOverdrafts) || 0,
        dstiRatio: parseFloat(dstiRatio)
      };

      const response = await fetch('/api/calculate.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas komunikacji z serwerem');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setCreditCapacity(result.creditCapacity);
      setMaxLoanAmount(result.maxLoanAmount);
      setChartData(result.chartData || []);

    } catch (err) {
      console.error('Błąd podczas obliczeń:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd');
      setCreditCapacity(null);
      setMaxLoanAmount(null);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Kalkulator Zdolności Kredytowej
        </h1>
        
        <Card className="max-w-8xl mx-auto">
          <CardHeader>
            <CardTitle>Oblicz swoją zdolność kredytową</CardTitle>
            <CardDescription>
              Wprowadź swoje dane finansowe, aby poznać orientacyjną zdolność kredytową
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-8">
              {/* Sekcja dochodów */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Dochody</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputWithTooltip
                    id="monthlyIncome"
                    label="Miesięczny dochód netto - główny kredytobiorca (zł)"
                    tooltip="Wprowadź miesięczny dochód netto głównego kredytobiorcy po odliczeniu podatków i składek ZUS. To kwota, którą faktycznie otrzymujesz na konto."
                    value={monthlyIncome}
                    onChange={setMonthlyIncome}
                    placeholder="np. 6000"
                  />
                  
                  <InputWithTooltip
                    id="secondBorrowerIncome"
                    label="Miesięczny dochód netto - drugi kredytobiorca (zł)"
                    tooltip="Miesięczny dochód netto drugiego kredytobiorcy (np. współmałżonka). Pole opcjonalne - pozostaw puste jeśli kreduyt będzie zaciągany samodzielnie."
                    value={secondBorrowerIncome}
                    onChange={setSecondBorrowerIncome}
                    placeholder="np. 4000"
                  />
                  
                  <SelectWithTooltip
                    id="employmentType"
                    label="Typ umowy głównego kredytobiorcy"
                    tooltip="Banki różnie oceniają stabilność dochodów w zależności od typu umowy. Umowa o pracę ma najwyższą wagę, B2B i umowy zlecenia są traktowane jako mniej stabilne."
                    value={employmentType}
                    onValueChange={setEmploymentType}
                    placeholder="Wybierz typ umowy"
                  >
                    <SelectItem value="employment">Umowa o pracę</SelectItem>
                    <SelectItem value="b2b">B2B / Działalność gospodarcza</SelectItem>
                    <SelectItem value="contract">Umowa zlecenie/o dzieło</SelectItem>
                  </SelectWithTooltip>
                </div>
              </div>

              {/* Sekcja wydatków i zobowiązań */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Wydatki i zobowiązania</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputWithTooltip
                    id="monthlyExpenses"
                    label="Miesięczne stałe opłaty (zł)"
                    tooltip="Suma stałych miesięcznych wydatków takich jak: czynsz, media, telefon, internet, ubezpieczenia. Nie wliczaj kosztów żywności i rozrywki - są one uwzględnione w kosztach utrzymania."
                    value={monthlyExpenses}
                    onChange={setMonthlyExpenses}
                    placeholder="np. 1500"
                  />
                  
                  <InputWithTooltip
                    id="otherLoans"
                    label="Raty innych kredytów (zł)"
                    tooltip="Suma wszystkich miesięcznych rat kredytów, które już spłacasz (kredyt samochodowy, konsumpcyjny, inne kredyty hipoteczne, karty kredytowe w ratach)."
                    value={otherLoans}
                    onChange={setOtherLoans}
                    placeholder="np. 500"
                  />
                  
                  <InputWithTooltip
                    id="creditCardLimits"
                    label="Suma limitów na kartach kredytowych (zł)"
                    tooltip="Łączna suma wszystkich przyznanych limitów na kartach kredytowych. Bank zakłada, że możesz wykorzystać 3% tych limitów miesięcznie, co obciąża Twoją zdolność kredytową."
                    value={creditCardLimits}
                    onChange={setCreditCardLimits}
                    placeholder="np. 10000"
                  />
                  
                  <InputWithTooltip
                    id="accountOverdrafts"
                    label="Suma limitów w koncie - debet (zł)"
                    tooltip="Łączna suma przyznanych debetów w koncie (możliwość przejścia na minus). Podobnie jak karty kredytowe, bank zakłada 3% miesięczne wykorzystanie."
                    value={accountOverdrafts}
                    onChange={setAccountOverdrafts}
                    placeholder="np. 5000"
                  />
                  
                  <InputWithTooltip
                    id="householdSize"
                    label="Liczba osób w gospodarstwie domowym"
                    tooltip="Liczba osób w gospodarstwie domowym. Kalkulator używa dynamicznego modelu kosztów życia: bazowa kwota dla liczby osób + 10% całkowitego dochodu netto (osoby z wyższymi dochodami mają wyższe koszty życia)."
                    value={householdSize}
                    onChange={setHouseholdSize}
                    placeholder="np. 2"
                  />

                  <SelectWithTooltip
                    id="dstiRatio"
                    label="Wskaźnik DSTI (%)"
                    tooltip="Debt Service to Income - preferowany procent dochodu na zobowiązania. UWAGA: Kalkulator automatycznie ogranicza DSTI w zależności od wysokości dochodu: <7500zł→max40%, 7500-12000zł→max50%, >12000zł→zgodnie z wyborem."
                    value={dstiRatio}
                    onValueChange={setDstiRatio}
                    placeholder="Wybierz poziom DSTI"
                  >
                    <SelectItem value="40">40% - konserwatywnie</SelectItem>
                    <SelectItem value="50">50% - standardowo</SelectItem>
                    <SelectItem value="60">60% - agresywnie</SelectItem>
                  </SelectWithTooltip>
                </div>
              </div>

              {/* Sekcja parametrów kredytu */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Parametry kredytu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputWithTooltip
                    id="loanTerm"
                    label="Okres kredytowania (lata)"
                    tooltip="Okres na jaki chcesz zaciągnąć kredyt. UWAGA: Do obliczeń jest używany maksymalnie 30-letni okres niezależnie od wprowadzonej wartości, zgodnie z praktyką banków ograniczających ryzyko."
                    value={loanTerm}
                    onChange={setLoanTerm}
                    placeholder="30"
                  />
                  
                  <InputWithTooltip
                    id="interestRate"
                    label="Oprocentowanie kredytu (%)"
                    tooltip="Szacowane roczne oprocentowanie kredytu. UWAGA: Kalkulator automatycznie dodaje bufor +2.5 p.p. (stress test) do wprowadzonej wartości, zgodnie z wymogami KNF dotyczącymi scenariusza wzrostu stóp procentowych."
                    value={interestRate}
                    onChange={setInterestRate}
                    placeholder="7.5"
                    step="0.1"
                  />
                  
                  <SelectWithTooltip
                    id="installmentType"
                    label="Rodzaj rat"
                    tooltip="Raty równe (annuitetowe) - stała kwota przez cały okres. Raty malejące - wysoka rata na początku, która się zmniejsza. Raty równe są popularniejsze ze względu na przewidywalność."
                    value={installmentType}
                    onValueChange={setInstallmentType}
                    placeholder="Wybierz rodzaj rat"
                  >
                    <SelectItem value="equal">Raty równe (annuitetowe)</SelectItem>
                    <SelectItem value="decreasing">Raty malejące</SelectItem>
                  </SelectWithTooltip>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button onClick={calculateCreditScore} size="lg" disabled={isLoading}>
                {isLoading ? 'Obliczanie...' : 'Oblicz zdolność kredytową'}
              </Button>
            </div>

            {error && (
              <div className="mt-6">
                <Card className="border-red-500">
                  <CardContent className="p-6">
                    <p className="text-red-600 text-center">{error}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {creditCapacity !== null && !error && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Twoja szacunkowa zdolność kredytowa:</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Wyniki liczbowe */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-2">Maksymalna miesięczna rata:</h4>
                        <p className="text-2xl font-bold text-green-700">{creditCapacity.toFixed(2)} zł</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-2">Maksymalna kwota kredytu:</h4>
                        <p className="text-2xl font-bold text-green-700">{maxLoanAmount?.toFixed(0)} zł</p>
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
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value: number) => [`${value.toFixed(0)} zł`, 'Kwota']}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-6 text-center">
                  Powyższe obliczenia są jedynie symulacją i nie stanowią oferty w rozumieniu przepisów prawa. 
                  Rzeczywista zdolność kredytowa zależy od wielu czynników i jest oceniana indywidualnie przez bank.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default CreditScoreCalculatorPage; 