"use client";

import { useState } from "react";
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

  const calculateProfitability = async () => {
    setIsLoading(true);
    setError(null);
    
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieoczekiwany błąd');
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
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Cena zakupu (zł)</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="np. 450000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Mies. przychód z najmu (zł)</Label>
              <Input
                id="monthlyRent"
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="np. 2500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transactionCosts">Koszty transakcyjne (zł)</Label>
              <Input
                id="transactionCosts"
                type="number"
                value={transactionCosts}
                onChange={(e) => setTransactionCosts(e.target.value)}
                placeholder="np. 15000"
              />
              <p className="text-xs text-gray-500">PCC, taksa notarialna, prowizja agencji</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="renovationCosts">Koszt remontu (zł)</Label>
              <Input
                id="renovationCosts"
                type="number"
                value={renovationCosts}
                onChange={(e) => setRenovationCosts(e.target.value)}
                placeholder="np. 25000"
              />
              <p className="text-xs text-gray-500">Remont i wyposażenie mieszkania</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminFees">Czynsz administracyjny (zł/mies.)</Label>
              <Input
                id="adminFees"
                type="number"
                value={adminFees}
                onChange={(e) => setAdminFees(e.target.value)}
                placeholder="np. 300"
              />
              <p className="text-xs text-gray-500">Do spółdzielni/wspólnoty</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="utilities">Opłaty za media (zł/mies.)</Label>
              <Input
                id="utilities"
                type="number"
                value={utilities}
                onChange={(e) => setUtilities(e.target.value)}
                placeholder="np. 200"
              />
              <p className="text-xs text-gray-500">Prąd, woda, gaz, internet</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Ubezpieczenie (zł/rok)</Label>
              <Input
                id="insurance"
                type="number"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                placeholder="np. 600"
              />
              <p className="text-xs text-gray-500">Roczna składka ubezpieczeniowa</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherCosts">Inne koszty (zł/mies.)</Label>
              <Input
                id="otherCosts"
                type="number"
                value={otherCosts}
                onChange={(e) => setOtherCosts(e.target.value)}
                placeholder="np. 100"
              />
              <p className="text-xs text-gray-500">Podatek od nieruchomości, itp.</p>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="vacancyPeriod">Okres pustostanów (mies./rok)</Label>
              <Input
                id="vacancyPeriod"
                type="number"
                min="0"
                max="12"
                value={vacancyPeriod}
                onChange={(e) => setVacancyPeriod(e.target.value)}
                placeholder="1"
              />
              <p className="text-xs text-gray-500">Średni czas w roku kiedy mieszkanie pozostaje puste (0-12 miesięcy)</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Finansowanie Kredytem</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="downPayment">Wkład własny</Label>
                <div className="flex gap-2">
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    placeholder="np. 150000"
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Oprocentowanie (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="np. 6.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanYears">Okres kredytowania (lata)</Label>
                <Input
                  id="loanYears"
                  type="number"
                  value={loanYears}
                  onChange={(e) => setLoanYears(e.target.value)}
                  placeholder="np. 25"
                />
              </div>
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
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Obliczanie...' : 'Oblicz opłacalność'}
            </Button>
          </div>
          
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
                     <div className="space-y-2">
                       <Label htmlFor="propertyAppreciation">Wzrost wartości nieruchomości (%/rok)</Label>
                       <Input
                         id="propertyAppreciation"
                         type="number"
                         step="0.1"
                         value={propertyAppreciation}
                         onChange={(e) => setPropertyAppreciation(e.target.value)}
                         placeholder="3"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="rentGrowth">Wzrost czynszu (%/rok)</Label>
                       <Input
                         id="rentGrowth"
                         type="number"
                         step="0.1"
                         value={rentGrowth}
                         onChange={(e) => setRentGrowth(e.target.value)}
                         placeholder="2"
                       />
                     </div>
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