"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Miesięczny dochód netto - główny kredytobiorca (zł)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="np. 6000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondBorrowerIncome">Miesięczny dochód netto - drugi kredytobiorca (zł)</Label>
                  <Input
                    id="secondBorrowerIncome"
                    type="number"
                    value={secondBorrowerIncome}
                    onChange={(e) => setSecondBorrowerIncome(e.target.value)}
                    placeholder="np. 4000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Typ umowy głównego kredytobiorcy</Label>
                  <Select value={employmentType} onValueChange={setEmploymentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz typ umowy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employment">Umowa o pracę</SelectItem>
                      <SelectItem value="b2b">B2B / Działalność gospodarcza</SelectItem>
                      <SelectItem value="contract">Umowa zlecenie/o dzieło</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sekcja wydatków i zobowiązań */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Wydatki i zobowiązania</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Miesięczne stałe opłaty (zł)</Label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="np. 1500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="otherLoans">Raty innych kredytów (zł)</Label>
                  <Input
                    id="otherLoans"
                    type="number"
                    value={otherLoans}
                    onChange={(e) => setOtherLoans(e.target.value)}
                    placeholder="np. 500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="creditCardLimits">Suma limitów na kartach kredytowych (zł)</Label>
                  <Input
                    id="creditCardLimits"
                    type="number"
                    value={creditCardLimits}
                    onChange={(e) => setCreditCardLimits(e.target.value)}
                    placeholder="np. 10000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountOverdrafts">Suma limitów w koncie - debet (zł)</Label>
                  <Input
                    id="accountOverdrafts"
                    type="number"
                    value={accountOverdrafts}
                    onChange={(e) => setAccountOverdrafts(e.target.value)}
                    placeholder="np. 5000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="householdSize">Liczba osób w gospodarstwie domowym</Label>
                  <Input
                    id="householdSize"
                    type="number"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(e.target.value)}
                    placeholder="np. 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dstiRatio">Wskaźnik DSTI (%)</Label>
                  <Select value={dstiRatio} onValueChange={setDstiRatio}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz poziom DSTI" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="40">40% - konserwatywnie</SelectItem>
                      <SelectItem value="50">50% - standardowo</SelectItem>
                      <SelectItem value="60">60% - agresywnie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sekcja parametrów kredytu */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Parametry kredytu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="loanTerm">Okres kredytowania (lata)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    placeholder="30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Oprocentowanie kredytu (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="7.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="installmentType">Rodzaj rat</Label>
                  <Select value={installmentType} onValueChange={setInstallmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz rodzaj rat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal">Raty równe (annuitetowe)</SelectItem>
                      <SelectItem value="decreasing">Raty malejące</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              
              <p className="text-sm text-gray-500 mt-6 text-center">
                Powyższe obliczenia są jedynie symulacją i nie stanowią oferty w rozumieniu przepisów prawa. 
                Rzeczywista zdolność kredytowa zależy od wielu czynników i jest oceniana indywidualnie przez bank.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditScoreCalculatorPage; 