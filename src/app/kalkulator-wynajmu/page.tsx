"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trackCalculatorUse, trackCalculatorResult, trackError, trackPageView } from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { validateNumericInput, sanitizeInput } from "@/lib/validation";
import SaveCalculationButton from "@/components/SaveCalculationButton";

// Komponent pomocniczy dla inputs z walidacją
const InputWithValidation = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "number",
  error,
  helperText
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  helperText?: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className={`text-sm sm:text-base ${error ? "text-red-600" : ""}`}>{label}</Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`text-sm sm:text-base ${error ? "border-red-500 focus:border-red-500" : ""}`}
    />
    {helperText && <p className="text-xs sm:text-sm text-gray-500">{helperText}</p>}
    {error && (
      <div className="flex items-center gap-1 text-xs sm:text-sm text-red-600">
        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const RentalProfitabilityCalculatorPageContent = () => {
  const searchParams = useSearchParams();
  
  // Pre-wypełnianie ceny z parametru URL
  const initialPrice = searchParams.get('cena') || '';
  
  // Kolory dla wykresów
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const [purchasePrice, setPurchasePrice] = useState(initialPrice);
  const [monthlyRent, setMonthlyRent] = useState("");
  // Szczegółowe koszty początkowe
  const [transactionCosts, setTransactionCosts] = useState("");
  const [renovationCosts, setRenovationCosts] = useState("");
  // Szczegółowe koszty miesięczne
  const [adminFees, setAdminFees] = useState("");
  const [utilities, setUtilities] = useState("");
  const [insurance, setInsurance] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  // Okres pustostanów
  const [vacancyPeriod, setVacancyPeriod] = useState("1");
  // Finansowanie kredytem
  const [downPayment, setDownPayment] = useState("");
  const [downPaymentType, setDownPaymentType] = useState("pln"); // "pln" lub "percent"
  const [interestRate, setInterestRate] = useState("");
  const [loanYears, setLoanYears] = useState("");
  // Opcje podatkowe
  const [taxationType, setTaxationType] = useState("ryczalt"); // "ryczalt" lub "skala"
  const [taxScale, setTaxScale] = useState("12"); // "12" lub "32" dla skali podatkowej
  // Projekcja wieloletnia
  const [propertyAppreciation, setPropertyAppreciation] = useState("3"); // % rocznie
  const [rentGrowth, setRentGrowth] = useState("2"); // % rocznie

  // Wyniki z API
  const [results, setResults] = useState<{
    annualIncome: number;
    netAnnualIncome: number;
    roi: number;
    loanAmount?: number;
    monthlyLoanPayment?: number;
    cashFlow?: number;
    cocReturn?: number;
    taxAmount: number;
    netCashFlow: number;
    netCocReturn: number;
    costBreakdown: Array<{ name: string; value: number }>;
    incomeVsCosts: Array<{ name: string; Kwota: number; fill: string }>;
    projection: Array<{
      year: number;
      propertyValue: number;
      remainingLoan: number;
      equity: number;
      yearlyRent: number;
      cashFlow: number;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // System walidacji
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Śledzenie wejścia na stronę
  useEffect(() => {
    trackPageView('kalkulator_wynajmu');
  }, []);

  // Funkcja walidacji wszystkich pól
  const validateAllFields = () => {
    const errors: Record<string, string> = {};

    // Walidacja ceny zakupu
    if (!purchasePrice || parseFloat(purchasePrice) < 50000) {
      errors.purchasePrice = 'Cena zakupu musi być większa od 50 000 zł';
    } else if (parseFloat(purchasePrice) > 50000000) {
      errors.purchasePrice = 'Cena zakupu nie może przekraczać 50 000 000 zł';
    }

    // Walidacja czynszu miesięcznego
    if (!monthlyRent || parseFloat(monthlyRent) < 200) {
      errors.monthlyRent = 'Czynsz miesięczny musi być większy od 200 zł';
    } else if (parseFloat(monthlyRent) > 50000) {
      errors.monthlyRent = 'Czynsz miesięczny nie może przekraczać 50 000 zł';
    }

    // Walidacja kosztów transakcyjnych
    if (transactionCosts && parseFloat(transactionCosts) < 0) {
      errors.transactionCosts = 'Koszty transakcyjne nie mogą być ujemne';
    }

    // Walidacja kosztów remontu
    if (renovationCosts && parseFloat(renovationCosts) < 0) {
      errors.renovationCosts = 'Koszty remontu nie mogą być ujemne';
    }

    // Walidacja opłat administracyjnych
    if (adminFees && parseFloat(adminFees) < 0) {
      errors.adminFees = 'Opłaty administracyjne nie mogą być ujemne';
    }

    // Walidacja mediów
    if (utilities && parseFloat(utilities) < 0) {
      errors.utilities = 'Media nie mogą być ujemne';
    }

    // Walidacja ubezpieczenia
    if (insurance && parseFloat(insurance) < 0) {
      errors.insurance = 'Ubezpieczenie nie może być ujemne';
    }

    // Walidacja innych kosztów
    if (otherCosts && parseFloat(otherCosts) < 0) {
      errors.otherCosts = 'Inne koszty nie mogą być ujemne';
    }

    // Walidacja okresu pustostanów
    if (vacancyPeriod && parseFloat(vacancyPeriod) < 0) {
      errors.vacancyPeriod = 'Okres pustostanów nie może być ujemny';
    } else if (vacancyPeriod && parseFloat(vacancyPeriod) > 12) {
      errors.vacancyPeriod = 'Okres pustostanów nie może przekraczać 12 miesięcy';
    }

    // Walidacja wkładu własnego
    if (downPayment && parseFloat(downPayment) < 0) {
      errors.downPayment = 'Wkład własny nie może być ujemny';
    }

    // Walidacja oprocentowania
    if (interestRate && parseFloat(interestRate) < 0) {
      errors.interestRate = 'Oprocentowanie nie może być ujemne';
    } else if (interestRate && parseFloat(interestRate) > 20) {
      errors.interestRate = 'Oprocentowanie nie może przekraczać 20%';
    }

    // Walidacja okresu kredytowania
    if (loanYears && parseFloat(loanYears) < 1) {
      errors.loanYears = 'Okres kredytowania musi być większy od 0';
    } else if (loanYears && parseFloat(loanYears) > 30) {
      errors.loanYears = 'Okres kredytowania nie może przekraczać 30 lat';
    }

    // Walidacja wzrostu wartości nieruchomości
    if (propertyAppreciation && parseFloat(propertyAppreciation) < -10) {
      errors.propertyAppreciation = 'Wzrost wartości nieruchomości nie może być mniejszy od -10%';
    } else if (propertyAppreciation && parseFloat(propertyAppreciation) > 20) {
      errors.propertyAppreciation = 'Wzrost wartości nieruchomości nie może przekraczać 20%';
    }

    // Walidacja wzrostu czynszu
    if (rentGrowth && parseFloat(rentGrowth) < -10) {
      errors.rentGrowth = 'Wzrost czynszu nie może być mniejszy od -10%';
    } else if (rentGrowth && parseFloat(rentGrowth) > 20) {
      errors.rentGrowth = 'Wzrost czynszu nie może przekraczać 20%';
    }

    // Dodatkowa walidacja biznesowa dla kalkulatora wynajmu
    if (parseFloat(purchasePrice) && parseFloat(monthlyRent)) {
      const yearlyRent = parseFloat(monthlyRent) * 12;
      const rentToPrice = (yearlyRent / parseFloat(purchasePrice)) * 100;
      
      if (rentToPrice < 2) {
        errors.monthlyRent = 'Czynsz wydaje się zbyt niski w stosunku do ceny (poniżej 2% rocznie)';
      }
      if (rentToPrice > 15) {
        errors.monthlyRent = 'Czynsz wydaje się zbyt wysoki w stosunku do ceny (powyżej 15% rocznie)';
      }
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
  }, [purchasePrice, monthlyRent, transactionCosts, renovationCosts, 
      adminFees, utilities, insurance, otherCosts, vacancyPeriod, 
      downPayment, interestRate, loanYears, propertyAppreciation, rentGrowth]);

  // Funkcje pomocnicze do obsługi input-ów z sanityzacją
  const handleNumericInput = (setValue: (value: string) => void) => {
    return (value: string) => {
      const sanitized = sanitizeInput(value);
      setValue(sanitized);
    };
  };

  const calculateProfitability = async () => {
    // Sprawdź walidację przed rozpoczęciem obliczeń
    if (!validateAllFields()) {
      setError('Proszę poprawić błędy w formularzu przed obliczeniem');
      trackError('validation_error', 'Błędy walidacji w kalkulatorze wynajmu');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Śledzenie użycia kalkulatora
    trackCalculatorUse('rental');
    
    try {
      const requestData = {
        calculationType: 'rental',
        purchasePrice: parseFloat(purchasePrice),
        monthlyRent: parseFloat(monthlyRent),
        transactionCosts: parseFloat(transactionCosts) || 0,
        renovationCosts: parseFloat(renovationCosts) || 0,
        adminFees: parseFloat(adminFees) || 0,
        utilities: parseFloat(utilities) || 0,
        insurance: parseFloat(insurance) || 0,
        otherCosts: parseFloat(otherCosts) || 0,
        vacancyRate: parseFloat(vacancyPeriod) || 1,
        downPayment: downPayment ? (downPaymentType === 'percent' ? parseFloat(purchasePrice) * parseFloat(downPayment) / 100 : parseFloat(downPayment)) : 0,
        interestRate: interestRate ? parseFloat(interestRate) : 0,
        loanYears: loanYears ? parseFloat(loanYears) : 25,
        taxationType: taxationType as 'ryczalt' | 'skala',
        taxScale: taxScale as '12' | '32',
        propertyAppreciation: parseFloat(propertyAppreciation) || 3,
        rentGrowth: parseFloat(rentGrowth) || 2,
        otherInitialCosts: parseFloat(transactionCosts) || 0,
        managementFee: 0,
      };

      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas obliczeń');
      }

      const data = await response.json();
      setResults(data);
      
      // Zbierz wszystkie dane wejściowe do jednego obiektu
      const inputData = {
        purchasePrice,
        monthlyRent,
        transactionCosts,
        renovationCosts,
        adminFees,
        utilities,
        insurance,
        otherCosts,
        vacancyPeriod,
        downPayment,
        downPaymentType,
        interestRate,
        loanYears,
        taxationType,
        taxScale,
        propertyAppreciation,
        rentGrowth
      };

      // Śledzenie wyników
      trackCalculatorResult('rental', { input: inputData, output: data });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieoczekiwany błąd';
      
      // Śledzenie błędów
      trackError('rental_calculation_error', errorMessage);
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 sm:pt-24">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto shadow-2xl">
          <CardHeader className="text-center bg-gray-50 rounded-t-lg py-6 sm:py-8 px-4 sm:px-6">
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
              Kalkulator opłacalności wynajmu
            </CardTitle>
            <CardDescription className="mt-2 text-base sm:text-lg">
              Przeanalizuj potencjalny zwrot z inwestycji w nieruchomość na wynajem.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <SaveCalculationButton
              calculationData={{
                purchasePrice, monthlyRent, transactionCosts, renovationCosts, adminFees,
                utilities, insurance, otherCosts, vacancyPeriod, downPayment,
                downPaymentType, interestRate, loanYears, taxationType, taxScale,
                propertyAppreciation, rentGrowth
              }}
              resultData={results}
              calculationType="rentability"
              className="mb-6 sm:mb-8"
            />
            <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
              {/* Sekcja Danych Podstawowych */}
              <Card className="shadow-lg">
                <CardHeader className="text-center pb-3 sm:pb-4 lg:pb-6 px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">
                    Dane Podstawowe
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Wprowadź podstawowe dane dotyczące inwestycji.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <InputWithValidation
                      id="purchasePrice"
                      label="Cena zakupu (zł)"
                      value={purchasePrice}
                      onChange={handleNumericInput(setPurchasePrice)}
                      placeholder="np. 450000"
                      error={validationErrors.purchasePrice}
                    />
                    <InputWithValidation
                      id="monthlyRent"
                      label="Mies. przychód z najmu (zł)"
                      value={monthlyRent}
                      onChange={handleNumericInput(setMonthlyRent)}
                      placeholder="np. 2500"
                      error={validationErrors.monthlyRent}
                    />
                    <InputWithValidation
                      id="transactionCosts"
                      label="Koszty transakcyjne (zł)"
                      value={transactionCosts}
                      onChange={handleNumericInput(setTransactionCosts)}
                      placeholder="np. 15000"
                      error={validationErrors.transactionCosts}
                      helperText="PCC, taksa notarialna, prowizja agencji"
                    />
                    <InputWithValidation
                      id="renovationCosts"
                      label="Koszt remontu (zł)"
                      value={renovationCosts}
                      onChange={handleNumericInput(setRenovationCosts)}
                      placeholder="np. 25000"
                      error={validationErrors.renovationCosts}
                      helperText="Remont i wyposażenie mieszkania"
                    />
                    <InputWithValidation
                      id="adminFees"
                      label="Czynsz administracyjny (zł/mies.)"
                      value={adminFees}
                      onChange={handleNumericInput(setAdminFees)}
                      placeholder="np. 300"
                      error={validationErrors.adminFees}
                      helperText="Do spółdzielni/wspólnoty"
                    />
                    <InputWithValidation
                      id="utilities"
                      label="Opłaty za media (zł/mies.)"
                      value={utilities}
                      onChange={handleNumericInput(setUtilities)}
                      placeholder="np. 200"
                      error={validationErrors.utilities}
                      helperText="Prąd, woda, gaz, internet"
                    />
                    <InputWithValidation
                      id="insurance"
                      label="Ubezpieczenie (zł/rok)"
                      value={insurance}  
                      onChange={handleNumericInput(setInsurance)}
                      placeholder="np. 600"
                      error={validationErrors.insurance}
                      helperText="Roczna składka ubezpieczeniowa"
                    />
                    <InputWithValidation
                      id="otherCosts"
                      label="Inne koszty (zł/mies.)"
                      value={otherCosts}
                      onChange={handleNumericInput(setOtherCosts)}
                      placeholder="np. 100"
                      error={validationErrors.otherCosts}
                      helperText="Podatek od nieruchomości, itp."
                    />
                  </div>
                  
                  <div className="mb-6 p-3 sm:p-4 bg-blue-50 rounded-md">
                    <div className="max-w-full overflow-hidden">
                      <InputWithValidation
                        id="vacancyPeriod"
                        label="Okres pustostanów (mies./rok)"
                        value={vacancyPeriod}
                        onChange={handleNumericInput(setVacancyPeriod)}
                        placeholder="1"
                        error={validationErrors.vacancyPeriod}
                        helperText="Średni czas w roku kiedy mieszkanie pozostaje puste (0-12 miesięcy)"
                      />
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Finansowanie Kredytem</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="downPayment" className={validationErrors.downPayment ? "text-red-600" : ""}>Wkład własny</Label>
                        <div className="flex gap-2">
                          <Input
                            id="downPayment"
                            type="number"
                            value={downPayment}
                            onChange={(e) => handleNumericInput(setDownPayment)(e.target.value)}
                            placeholder="np. 150000"
                            className={validationErrors.downPayment ? "border-red-500 focus:border-red-500" : ""}
                          />
                          <Select value={downPaymentType} onValueChange={setDownPaymentType}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pln">zł</SelectItem>
                              <SelectItem value="percent">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {validationErrors.downPayment && (
                          <div className="flex items-center gap-1 text-sm text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{validationErrors.downPayment}</span>
                          </div>
                        )}
                      </div>
                      <InputWithValidation
                        id="interestRate"
                        label="Oprocentowanie (%)"
                        value={interestRate}
                        onChange={handleNumericInput(setInterestRate)}
                        placeholder="np. 6.5"
                        error={validationErrors.interestRate}
                      />
                      <InputWithValidation
                        id="loanYears"
                        label="Okres kredytowania (lata)"
                        value={loanYears}
                        onChange={handleNumericInput(setLoanYears)}
                        placeholder="np. 25"
                        error={validationErrors.loanYears}
                      />
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Podatki</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taxationType">Forma opodatkowania</Label>
                        <Select value={taxationType} onValueChange={setTaxationType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ryczalt">Ryczałt od przychodu</SelectItem>
                            <SelectItem value="skala">Skala podatkowa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {taxationType === "skala" && (
                        <div className="space-y-2">
                          <Label htmlFor="taxScale">Próg podatkowy</Label>
                          <Select value={taxScale} onValueChange={setTaxScale}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12">12% (do 120 000 zł)</SelectItem>
                              <SelectItem value="32">32% (powyżej 120 000 zł)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {taxationType === "ryczalt" && (
                        <div className="space-y-2">
                          <Label>Stawka ryczałtu</Label>
                          <p className="text-sm text-gray-600 p-2 bg-gray-100 rounded">
                            8,5% - do 100 000 zł przychodu rocznie<br/>
                            12,5% - powyżej 100 000 zł przychodu rocznie
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Przycisk Oblicz */}
                  <div className="mt-8 text-center">
                    <Button
                      onClick={calculateProfitability}
                      disabled={!isFormValid || isLoading}
                      className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors duration-200"
                    >
                      {isLoading ? 'Obliczanie...' : 'Oblicz opłacalność'}
                    </Button>
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-center">{error}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sekcja Wyników */}
              {results && (
                <Card className="shadow-lg">
                  <CardHeader className="text-center pb-4 sm:pb-6">
                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      Wyniki Analizy
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Przeanalizuj wyniki swojej inwestycji w nieruchomość.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Podstawowe wyniki */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base sm:text-lg">Roczny przychód</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xl sm:text-2xl font-semibold text-gray-800">{results.annualIncome?.toFixed(2)} zł</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base sm:text-lg">Roczny dochód netto</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xl sm:text-2xl font-semibold text-gray-800">{results.netAnnualIncome?.toFixed(2)} zł</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-50 border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-base sm:text-lg">ROI (roczny zwrot)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{results.roi?.toFixed(2)}%</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Wyniki kredytowe */}
                    {results.loanAmount && results.loanAmount > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Kwota kredytu</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xl sm:text-2xl font-semibold text-gray-800">{results.loanAmount?.toFixed(2)} zł</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Miesięczna rata</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xl sm:text-2xl font-semibold text-gray-800">{results.monthlyLoanPayment?.toFixed(2)} zł</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-50 border-gray-200">
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Cash Flow (roczny)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className={`text-2xl sm:text-3xl font-bold ${results.cashFlow && results.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {results.cashFlow?.toFixed(2)} zł
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-50 border-gray-200 md:col-span-2">
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Cash-on-Cash Return (brutto)</CardTitle>
                            <CardDescription>Zwrot z zaangażowanego kapitału przed opodatkowaniem</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className={`text-2xl sm:text-3xl font-bold ${results.cocReturn && results.cocReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {results.cocReturn?.toFixed(2)}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Wyniki podatkowe */}
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-4 text-center">Analiza podatkowa (netto):</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gray-50 border-gray-200">
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Podatek roczny</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xl sm:text-2xl font-semibold text-gray-800">{results.taxAmount?.toFixed(2)} zł</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-50 border-gray-200">
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Cash Flow netto</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className={`text-xl sm:text-2xl font-semibold ${results.netCashFlow && results.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {results.netCashFlow?.toFixed(2)} zł
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-50 border-gray-200 md:col-span-2">
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Cash-on-Cash Return netto</CardTitle>
                            <CardDescription>Zwrot z zaangażowanego kapitału po opodatkowaniu</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className={`text-2xl sm:text-3xl font-bold ${results.netCocReturn && results.netCocReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {results.netCocReturn?.toFixed(2)}%
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
                                  data={results.costBreakdown}
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
                                  {results.costBreakdown.map((entry, index: number) => (
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
                              <BarChart data={results.incomeVsCosts} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold mb-4 text-center">Projekcja wieloletnia:</h4>
                      
                      {/* Ustawienia projekcji */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputWithValidation
                            id="propertyAppreciation"
                            label="Wzrost wartości nieruchomości (%/rok)"
                            value={propertyAppreciation}
                            onChange={handleNumericInput(setPropertyAppreciation)}
                            placeholder="3"
                            error={validationErrors.propertyAppreciation}
                          />
                          <InputWithValidation
                            id="rentGrowth"
                            label="Wzrost czynszu (%/rok)"
                            value={rentGrowth}
                            onChange={handleNumericInput(setRentGrowth)}
                            placeholder="2"
                            error={validationErrors.rentGrowth}
                          />
                        </div>
                      </div>

                      {/* Tabela projekcji */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center text-base sm:text-lg">Projekcja na 10 lat</CardTitle>
                          <CardDescription className="text-center text-xs sm:text-sm">
                            Wartość nieruchomości, pozostały dług kredytowy i zbudowany kapitał
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="p-1 sm:p-2 text-left">Rok</th>
                                  <th className="p-1 sm:p-2 text-right">Wartość nieruchomości</th>
                                  <th className="p-1 sm:p-2 text-right">Pozostały kredyt</th>
                                  <th className="p-1 sm:p-2 text-right">Kapitał własny</th>
                                  <th className="p-1 sm:p-2 text-right">Roczny czynsz</th>
                                  <th className="p-1 sm:p-2 text-right">Cash Flow</th>
                                </tr>
                              </thead>
                              <tbody>
                                {results.projection.map((row) => (
                                  <tr key={row.year} className="border-b hover:bg-gray-50">
                                    <td className="p-1 sm:p-2 font-medium">{row.year}</td>
                                    <td className="p-1 sm:p-2 text-right">{row.propertyValue.toLocaleString()} zł</td>
                                    <td className="p-1 sm:p-2 text-right">{row.remainingLoan.toLocaleString()} zł</td>
                                    <td className="p-1 sm:p-2 text-right font-semibold text-green-700">
                                      {row.equity.toLocaleString()} zł
                                    </td>
                                    <td className="p-1 sm:p-2 text-right">{row.yearlyRent.toLocaleString()} zł</td>
                                    <td className={`p-1 sm:p-2 text-right font-medium ${row.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
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

                    <div className="mt-6 sm:mt-8">
                      <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center">Projekcja przepływów pieniężnych:</h4>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center text-base sm:text-lg">Przepływy pieniężne na 10 lat</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                            <BarChart data={results.projection}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k zł`} />
                              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} zł`, 'Kwota']} />
                              <Bar dataKey="yearlyRent" fill="#8884d8" name="Roczny czynsz" />
                              <Bar dataKey="cashFlow" fill="#82ca9d" name="Przepływy pieniężne" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const RentalProfitabilityCalculatorPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 sm:pt-24">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie kalkulatora...</p>
          </div>
        </div>
      </div>
    }>
      <RentalProfitabilityCalculatorPageContent />
    </Suspense>
  );
};

export default RentalProfitabilityCalculatorPage; 