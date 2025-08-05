"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trackCalculatorUse, trackCalculatorResult, trackError, trackPageView } from "@/lib/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { HelpCircle, AlertTriangle } from "lucide-react";
import { validateNumericInput, sanitizeInput } from "@/lib/validation";

// Komponent pomocniczy dla pól z tooltipami - POZA głównym komponentem
const InputWithTooltip = ({ 
  id, 
  label, 
  tooltip, 
  value, 
  onChange, 
  type = "number", 
  placeholder, 
  step,
  error
}: {
  id: string;
  label: string;
  tooltip: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  error?: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className={error ? "text-red-600" : ""}>{label}</Label>
      <Tooltip content={tooltip}>
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
      </Tooltip>
    </div>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      step={step}
      className={error ? "border-red-500 focus:border-red-500" : ""}
    />
    {error && (
      <div className="flex items-center gap-1 text-sm text-red-600">
        <AlertTriangle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )}
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
  children,
  error
}: {
  id: string;
  label: string;
  tooltip: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className={error ? "text-red-600" : ""}>{label}</Label>
      <Tooltip content={tooltip}>
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
      </Tooltip>
    </div>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={error ? "border-red-500" : ""}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
    {error && (
      <div className="flex items-center gap-1 text-sm text-red-600">
        <AlertTriangle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const CreditScoreCalculatorPageContent = () => {
  const searchParams = useSearchParams();
  
  // Pre-wypełnianie kwoty z parametru URL
  const initialLoanAmount = searchParams.get('kwota') || '';
  
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [otherLoans, setOtherLoans] = useState("");
  const [householdSize, setHouseholdSize] = useState("1");
  
  // Parametry kredytu
  const [loanAmount, setLoanAmount] = useState(initialLoanAmount);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Rozszerzone dane z zaawansowanego algorytmu
  const [calculationDetails, setCalculationDetails] = useState<{
    totalIncome?: number;
    costOfLiving?: number;
    totalCommitments?: number;
    stressedInterestRate?: number;
    effectiveDstiLimit?: number;
    dstiUsed?: number;
  } | null>(null);

  // System walidacji
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Śledzenie wejścia na stronę
  useEffect(() => {
    trackPageView('kalkulator_zdolnosci_kredytowej');
  }, []);

  // Funkcja walidacji wszystkich pól
  const validateAllFields = () => {
    const errors: Record<string, string> = {};

    // Walidacja miesięcznego dochodu
    if (!monthlyIncome || parseFloat(monthlyIncome) < 1000) {
      errors.monthlyIncome = 'Dochód miesięczny musi być większy od 1000 zł';
    } else if (parseFloat(monthlyIncome) > 500000) {
      errors.monthlyIncome = 'Dochód miesięczny nie może przekraczać 500 000 zł';
    }

    // Walidacja drugiego kredytobiorcy (opcjonalne)
    if (secondBorrowerIncome && parseFloat(secondBorrowerIncome) < 0) {
      errors.secondBorrowerIncome = 'Dochód drugiego kredytobiorcy nie może być ujemny';
    }

    // Walidacja wydatków miesięcznych
    if (monthlyExpenses && parseFloat(monthlyExpenses) < 0) {
      errors.monthlyExpenses = 'Wydatki miesięczne nie mogą być ujemne';
    }

    // Walidacja innych kredytów
    if (otherLoans && parseFloat(otherLoans) < 0) {
      errors.otherLoans = 'Raty innych kredytów nie mogą być ujemne';
    }

    // Walidacja limitów kart kredytowych
    if (creditCardLimits && parseFloat(creditCardLimits) < 0) {
      errors.creditCardLimits = 'Limity kart kredytowych nie mogą być ujemne';
    }

    // Walidacja debetów
    if (accountOverdrafts && parseFloat(accountOverdrafts) < 0) {
      errors.accountOverdrafts = 'Limity debetowe nie mogą być ujemne';
    }

    // Walidacja liczby osób w gospodarstwie
    if (!householdSize || parseInt(householdSize) < 1) {
      errors.householdSize = 'Liczba osób w gospodarstwie musi być większa od 0';
    } else if (parseInt(householdSize) > 20) {
      errors.householdSize = 'Liczba osób w gospodarstwie nie może przekraczać 20';
    }

    // Walidacja okresu kredytowania
    if (!loanTerm || parseInt(loanTerm) < 1) {
      errors.loanTerm = 'Okres kredytowania musi być większy od 0';
    } else if (parseInt(loanTerm) > 30) {
      errors.loanTerm = 'Okres kredytowania nie może przekraczać 30 lat';
    }

    // Walidacja oprocentowania
    if (!interestRate || parseFloat(interestRate) < 0) {
      errors.interestRate = 'Oprocentowanie nie może być ujemne';
    } else if (parseFloat(interestRate) > 20) {
      errors.interestRate = 'Oprocentowanie nie może przekraczać 20%';
    }

    // Walidacja DSTI
    if (!dstiRatio || parseFloat(dstiRatio) < 10) {
      errors.dstiRatio = 'Wskaźnik DSTI musi być większy od 10%';
    } else if (parseFloat(dstiRatio) > 60) {
      errors.dstiRatio = 'Wskaźnik DSTI nie może przekraczać 60%';
    }

    // Dodatkowa walidacja biznesowa
    if (parseFloat(monthlyIncome) < 3000 && parseFloat(dstiRatio) > 40) {
      errors.dstiRatio = 'Dla niskich dochodów zaleca się DSTI maksymalnie 40%';
    }

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  // Walidacja z debouncing dla lepszej wydajności
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateAllFields();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyIncome, secondBorrowerIncome, monthlyExpenses, otherLoans, 
      creditCardLimits, accountOverdrafts, householdSize, loanTerm, 
      interestRate, dstiRatio]);

  // Funkcje pomocnicze do obsługi input-ów z sanityzacją
  const handleNumericInput = (setValue: (value: string) => void, allowDecimals = false) => {
    return (value: string) => {
      const sanitized = sanitizeInput(value);
      setValue(sanitized);
    };
  };

  const calculateCreditScore = async () => {
    // Sprawdź walidację przed rozpoczęciem obliczeń
    if (!validateAllFields()) {
      setError('Proszę poprawić błędy w formularzu przed obliczeniem');
      trackError('validation_error', 'Błędy walidacji w kalkulatorze zdolności kredytowej');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Śledzenie użycia kalkulatora
    trackCalculatorUse('credit-score');
    
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

      const response = await fetch('/api/calculate', {
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
      
      // Zapisz szczegółowe dane z zaawansowanego algorytmu
      setCalculationDetails({
        totalIncome: result.details?.totalIncome,
        costOfLiving: result.details?.costOfLiving,
        totalCommitments: result.details?.totalCommitments,
        stressedInterestRate: result.details?.stressedInterestRate,
        effectiveDstiLimit: result.details?.effectiveDstiLimit,
        dstiUsed: result.details?.dstiUsed
      });

      // Śledzenie wyniku kalkulatora
      trackCalculatorResult('credit-score', {
        max_loan_amount: result.maxLoanAmount,
        credit_capacity: result.creditCapacity,
        total_income: result.details?.totalIncome,
        dsti_limit: result.details?.effectiveDstiLimit,
        stressed_rate: result.details?.stressedInterestRate
      });

    } catch (err) {
      console.error('Błąd podczas obliczeń:', err);
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      
      // Śledzenie błędów
      trackError('calculation_error', errorMessage);
      
      setError(errorMessage);
      setCreditCapacity(null);
      setMaxLoanAmount(null);
      setChartData([]);
      setCalculationDetails(null);
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
                    onChange={handleNumericInput(setMonthlyIncome)}
                    placeholder="np. 6000"
                    error={validationErrors.monthlyIncome}
                  />
                  
                  <InputWithTooltip
                    id="secondBorrowerIncome"
                    label="Miesięczny dochód netto - drugi kredytobiorca (zł)"
                    tooltip="Miesięczny dochód netto drugiego kredytobiorcy (np. współmałżonka). Pole opcjonalne - pozostaw puste jeśli kreduyt będzie zaciągany samodzielnie."
                    value={secondBorrowerIncome}
                    onChange={handleNumericInput(setSecondBorrowerIncome)}
                    placeholder="np. 4000"
                    error={validationErrors.secondBorrowerIncome}
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
                    onChange={handleNumericInput(setMonthlyExpenses)}
                    placeholder="np. 1500"
                    error={validationErrors.monthlyExpenses}
                  />
                  
                  <InputWithTooltip
                    id="otherLoans"
                    label="Raty innych kredytów (zł)"
                    tooltip="Suma wszystkich miesięcznych rat kredytów, które już spłacasz (kredyt samochodowy, konsumpcyjny, inne kredyty hipoteczne, karty kredytowe w ratach)."
                    value={otherLoans}
                    onChange={handleNumericInput(setOtherLoans)}
                    placeholder="np. 500"
                    error={validationErrors.otherLoans}
                  />
                  
                  <InputWithTooltip
                    id="creditCardLimits"
                    label="Suma limitów na kartach kredytowych (zł)"
                    tooltip="Łączna suma wszystkich przyznanych limitów na kartach kredytowych. Bank zakłada, że możesz wykorzystać 3% tych limitów miesięcznie, co obciąża Twoją zdolność kredytową."
                    value={creditCardLimits}
                    onChange={handleNumericInput(setCreditCardLimits)}
                    placeholder="np. 10000"
                    error={validationErrors.creditCardLimits}
                  />
                  
                  <InputWithTooltip
                    id="accountOverdrafts"
                    label="Suma limitów w koncie - debet (zł)"
                    tooltip="Łączna suma przyznanych debetów w koncie (możliwość przejścia na minus). Podobnie jak karty kredytowe, bank zakłada 3% miesięczne wykorzystanie."
                    value={accountOverdrafts}
                    onChange={handleNumericInput(setAccountOverdrafts)}
                    placeholder="np. 5000"
                    error={validationErrors.accountOverdrafts}
                  />
                  
                  <InputWithTooltip
                    id="householdSize"
                    label="Liczba osób w gospodarstwie domowym"
                    tooltip="Liczba osób w gospodarstwie domowym. Kalkulator używa dynamicznego modelu kosztów życia: bazowa kwota dla liczby osób + 10% całkowitego dochodu netto (osoby z wyższymi dochodami mają wyższe koszty życia)."
                    value={householdSize}
                    onChange={handleNumericInput(setHouseholdSize, false)}
                    placeholder="np. 2"
                    error={validationErrors.householdSize}
                  />

                  <SelectWithTooltip
                    id="dstiRatio"
                    label="Wskaźnik DSTI (%)"
                    tooltip="Debt Service to Income - preferowany procent dochodu na zobowiązania. UWAGA: Kalkulator automatycznie ogranicza DSTI w zależności od wysokości dochodu: <7500zł→max40%, 7500-12000zł→max50%, >12000zł→zgodnie z wyborem."
                    value={dstiRatio}
                    onValueChange={setDstiRatio}
                    placeholder="Wybierz poziom DSTI"
                    error={validationErrors.dstiRatio}
                  >
                    <SelectItem value="40">40% - konserwatywnie</SelectItem>
                    <SelectItem value="50">50% - standardowo</SelectItem>
                    <SelectItem value="60">60% - agresywnie</SelectItem>
                  </SelectWithTooltip>
                </div>
              </div>

              {/* Sekcja parametrów kredytu */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Parametry kredytu
                  {initialLoanAmount && (
                    <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                      💰 Kwota z kalkulatora wyceny: {parseInt(initialLoanAmount).toLocaleString('pl-PL')} zł
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loanAmount && (
                    <InputWithTooltip
                      id="loanAmount"
                      label="Kwota kredytu (zł)"
                      tooltip="Kwota kredytu którą chcesz uzyskać. Zostanie porównana z Twoją maksymalną zdolnością kredytową."
                      value={loanAmount}
                      onChange={handleNumericInput(setLoanAmount, false)}
                      placeholder="np. 500000"
                    />
                  )}
                  
                  <InputWithTooltip
                    id="loanTerm"
                    label="Okres kredytowania (lata)"
                    tooltip="Okres na jaki chcesz zaciągnąć kredyt. UWAGA: Do obliczeń jest używany maksymalnie 30-letni okres niezależnie od wprowadzonej wartości, zgodnie z praktyką banków ograniczających ryzyko."
                    value={loanTerm}
                    onChange={handleNumericInput(setLoanTerm, false)}
                    placeholder="30"
                    error={validationErrors.loanTerm}
                  />
                  
                  <InputWithTooltip
                    id="interestRate"
                    label="Oprocentowanie kredytu (%)"
                    tooltip="Szacowane roczne oprocentowanie kredytu. UWAGA: Kalkulator automatycznie dodaje bufor +2.5 p.p. (stress test) do wprowadzonej wartości, zgodnie z wymogami KNF dotyczącymi scenariusza wzrostu stóp procentowych."
                    value={interestRate}
                    onChange={handleNumericInput(setInterestRate)}
                    placeholder="7.5"
                    step="0.1"
                    error={validationErrors.interestRate}
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
              <Button 
                onClick={calculateCreditScore} 
                size="lg" 
                disabled={isLoading || !isFormValid}
                className={!isFormValid ? "opacity-50 cursor-not-allowed" : ""}
              >
                {isLoading ? 'Obliczanie...' : 'Oblicz zdolność kredytową'}
              </Button>
            </div>
            
            {!isFormValid && Object.keys(validationErrors).length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Formularz zawiera błędy:</span>
                </div>
                <ul className="text-red-700 text-sm space-y-1">
                  {Object.entries(validationErrors).map(([field, message]) => (
                    <li key={field}>• {message}</li>
                  ))}
                </ul>
              </div>
            )}

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
                        
                        {loanAmount && parseFloat(loanAmount) > 0 && (
                          <div className="mt-3 p-3 rounded-lg border">
                            <p className="text-sm font-medium mb-1">
                              Porównanie z pożądaną kwotą ({parseInt(loanAmount).toLocaleString('pl-PL')} zł):
                            </p>
                            {parseFloat(loanAmount) <= (maxLoanAmount || 0) ? (
                              <div className="flex items-center text-green-600">
                                <span className="text-lg mr-2">✅</span>
                                <span className="font-medium">Kredyt możliwy do uzyskania!</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600">
                                <span className="text-lg mr-2">❌</span>
                                <span className="font-medium">
                                  Przekracza zdolność o {(parseFloat(loanAmount) - (maxLoanAmount || 0)).toFixed(0)} zł
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

                {/* Szczegóły obliczeń */}
                {calculationDetails && (
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
                              {calculationDetails.totalIncome?.toFixed(0)} zł
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                              Po uwzględnieniu wag dla typu umowy
                            </p>
                          </div>

                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-semibold text-orange-900 mb-2">🏠 Koszty utrzymania</h4>
                            <p className="text-2xl font-bold text-orange-700">
                              {calculationDetails.costOfLiving?.toFixed(0)} zł
                            </p>
                            <p className="text-sm text-orange-600 mt-1">
                              Dynamiczny model: baza + 10% dochodu
                            </p>
                          </div>

                          <div className="bg-red-100 p-4 rounded-lg border border-red-200">
                            <h4 className="font-semibold text-red-900 mb-2">📋 Suma zobowiązań</h4>
                            <p className="text-2xl font-bold text-red-700">
                              {calculationDetails.totalCommitments?.toFixed(0)} zł
                            </p>
                            <p className="text-sm text-red-600 mt-1">
                              Opłaty + kredyty + 3% limitów kart/debetu
                            </p>
                          </div>

                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-900 mb-2">📈 Oprocentowanie (stress test)</h4>
                            <p className="text-2xl font-bold text-purple-700">
                              {calculationDetails.stressedInterestRate?.toFixed(1)}%
                            </p>
                            <p className="text-sm text-purple-600 mt-1">
                              Twoje {interestRate}% + bufor 2.5 p.p.
                            </p>
                          </div>

                          <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-900 mb-2">🎯 Zastosowany limit DSTI</h4>
                            <p className="text-2xl font-bold text-green-700">
                              {calculationDetails.effectiveDstiLimit?.toFixed(0)}%
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                              {calculationDetails.effectiveDstiLimit !== parseFloat(dstiRatio) ? 
                                'Automatycznie ograniczony' : 'Zgodnie z Twoim wyborem'}
                            </p>
                          </div>

                          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <h4 className="font-semibold text-indigo-900 mb-2">⚖️ Wykorzystane DSTI</h4>
                            <p className="text-2xl font-bold text-indigo-700">
                              {calculationDetails.dstiUsed?.toFixed(1)}%
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
                
                {/* Dodatkowe informacje o zaawansowanym algorytmie */}
                {calculationDetails && (
                  <div className="mt-6">
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                      <CardContent className="p-6">
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
                      </CardContent>
                    </Card>
                  </div>
                )}

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

const CreditScoreCalculatorPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie kalkulatora...</p>
        </div>
      </div>
    }>
      <CreditScoreCalculatorPageContent />
    </Suspense>
  );
};

export default CreditScoreCalculatorPage; 