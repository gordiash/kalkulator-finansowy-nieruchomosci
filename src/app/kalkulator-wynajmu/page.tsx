"use client";

import { useState, useEffect } from "react";
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
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { validateField, sanitizeInput, FIELD_DEFINITIONS } from "@/lib/validation";

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
    <Label htmlFor={id} className={error ? "text-red-600" : ""}>{label}</Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={error ? "border-red-500 focus:border-red-500" : ""}
    />
    {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    {error && (
      <div className="flex items-center gap-1 text-sm text-red-600">
        <AlertTriangle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const RentalProfitabilityCalculatorPage = () => {
  // Kolory dla wykresów
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const [purchasePrice, setPurchasePrice] = useState("");
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
    const fieldDefinitions = FIELD_DEFINITIONS.RENTAL;

    const formData = {
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
      interestRate,
      loanYears,
      propertyAppreciation,
      rentGrowth
    };

    // Walidacja każdego pola
    Object.entries(formData).forEach(([fieldName, value]) => {
      const rules = fieldDefinitions[fieldName as keyof typeof fieldDefinitions];
      if (rules) {
        const result = validateField(value, fieldName, rules);
        if (!result.isValid) {
          errors[fieldName] = result.errors[0].message;
        }
      }
    });

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

  // Walidacja przy każdej zmianie
  useEffect(() => {
    validateAllFields();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasePrice, monthlyRent, transactionCosts, renovationCosts, 
      adminFees, utilities, insurance, otherCosts, vacancyPeriod, 
      downPayment, interestRate, loanYears, propertyAppreciation, rentGrowth]);

  // Funkcje pomocnicze do obsługi input-ów z sanityzacją
  const handleNumericInput = (setValue: (value: string) => void, allowDecimals = true) => {
    return (value: string) => {
      const sanitized = sanitizeInput(value, allowDecimals);
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
        purchasePrice: parseFloat(purchasePrice),
        monthlyRent: parseFloat(monthlyRent),
        transactionCosts: parseFloat(transactionCosts) || 0,
        renovationCosts: parseFloat(renovationCosts) || 0,
        adminFees: parseFloat(adminFees) || 0,
        utilities: parseFloat(utilities) || 0,
        insurance: parseFloat(insurance) || 0,
        otherCosts: parseFloat(otherCosts) || 0,
        vacancyPeriod: parseFloat(vacancyPeriod) || 1,
        downPayment: downPayment ? parseFloat(downPayment) : undefined,
        downPaymentType: downPaymentType as 'pln' | 'percent',
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        loanYears: loanYears ? parseFloat(loanYears) : undefined,
        taxationType: taxationType as 'ryczalt' | 'skala',
        taxScale: taxScale as '12' | '32',
        propertyAppreciation: parseFloat(propertyAppreciation) || 3,
        rentGrowth: parseFloat(rentGrowth) || 2,
      };

      const response = await fetch('/api/calculate.php', {
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
      
      // Śledzenie wyniku kalkulatora
      trackCalculatorResult('rental', data.roi, {
        purchase_price: parseFloat(purchasePrice),
        monthly_rent: parseFloat(monthlyRent),
        annual_income: data.annualIncome,
        net_cash_flow: data.netCashFlow
      });
      
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
    <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-5xl mx-auto">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Kalkulator Opłacalności Wynajmu
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Przeanalizuj zwrot z inwestycji w nieruchomość na wynajem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
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
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
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

          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Finansowanie Kredytem</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                onChange={handleNumericInput(setLoanYears, false)}
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
          
          <div className="flex justify-center mb-6">
            <Button 
              onClick={calculateProfitability} 
              size="lg" 
              className={`w-full sm:w-auto ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? 'Obliczanie...' : 'Oblicz opłacalność'}
            </Button>
          </div>

          {!isFormValid && Object.keys(validationErrors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}
          
          {results && (
            <div className="mt-8">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Wyniki analizy:</h3>
              
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
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">ROI (roczny zwrot)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700">{results.roi?.toFixed(2)}%</p>
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
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Cash Flow (roczny)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl sm:text-3xl font-bold ${results.cashFlow && results.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {results.cashFlow?.toFixed(2)} zł
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200 md:col-span-2">
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
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <Card className="bg-red-50 border-red-200">
                     <CardHeader>
                       <CardTitle className="text-base sm:text-lg">Podatek roczny</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <p className="text-xl sm:text-2xl font-semibold text-red-700">{results.taxAmount?.toFixed(2)} zł</p>
                     </CardContent>
                   </Card>
                   <Card className="bg-blue-50 border-blue-200">
                     <CardHeader>
                       <CardTitle className="text-base sm:text-lg">Cash Flow netto</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <p className={`text-xl sm:text-2xl font-semibold ${results.netCashFlow && results.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                         {results.netCashFlow?.toFixed(2)} zł
                       </p>
                     </CardContent>
                   </Card>
                   <Card className="bg-purple-50 border-purple-200 md:col-span-2">
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
                       <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                           <Pie
                             data={results.costBreakdown}
                             cx="50%"
                             cy="50%"
                             labelLine={false}
                             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                             outerRadius={80}
                             fill="#8884d8"
                             dataKey="value"
                           >
                             {results.costBreakdown.map((entry, index: number) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} zł`, 'Koszt']} />
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
                       <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={results.incomeVsCosts}>
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis 
                             dataKey="name" 
                             angle={-45}
                             textAnchor="end"
                             height={80}
                             fontSize={12}
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
                           {results.projection.map((row) => (
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
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalProfitabilityCalculatorPage; 