"use client";

import { useState } from "react";

const CreditScoreCalculatorPage = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [otherLoans, setOtherLoans] = useState("");
  const [householdSize, setHouseholdSize] = useState("1");

  const [creditCapacity, setCreditCapacity] = useState<number | null>(null);
  const [maxLoanAmount, setMaxLoanAmount] = useState<number | null>(null);

  const calculateCreditScore = () => {
    const income = parseFloat(monthlyIncome);
    const expenses = parseFloat(monthlyExpenses);
    const loans = parseFloat(otherLoans) || 0;
    const people = parseInt(householdSize);

    // Simplified cost of living per person - in a real scenario, this would be more complex
    const costOfLiving = people * 1000; 
    
    // Disposable income
    const disposableIncome = income - expenses - loans - costOfLiving;

    if (disposableIncome > 0) {
      // Banks often use a DSTI (Debt Service to Income) ratio, typically around 50-60%.
      // We'll use a conservative 50% of the *disposable* income for the max payment.
      const maxMonthlyPayment = disposableIncome * 0.5;
      setCreditCapacity(maxMonthlyPayment);

      // Estimate max loan amount based on the calculated payment
      // This is a reverse mortgage calculation, assuming a 30-year term and 7.5% interest rate for estimation
      const r = 0.075 / 12;
      const n = 30 * 12;
      const maxLoan = maxMonthlyPayment * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
      setMaxLoanAmount(maxLoan);

    } else {
        setCreditCapacity(0);
        setMaxLoanAmount(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Kalkulator Zdolności Kredytowej
      </h1>
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="monthlyIncome">
              Mies. dochód netto (zł)
            </label>
            <input
              id="monthlyIncome" type="number" value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="np. 6000"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="householdSize">
              Liczba osób w gosp. domowym
            </label>
            <input
              id="householdSize" type="number" value={householdSize}
              onChange={(e) => setHouseholdSize(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="np. 2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="monthlyExpenses">
              Mies. stałe opłaty (zł)
            </label>
            <input
              id="monthlyExpenses" type="number" value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="np. 1500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otherLoans">
              Raty innych kredytów (zł)
            </label>
            <input
              id="otherLoans" type="number" value={otherLoans}
              onChange={(e) => setOtherLoans(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="np. 500"
            />
          </div>
        </div>
        <div className="flex items-center justify-center mt-4">
          <button onClick={calculateCreditScore} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Oblicz zdolność
          </button>
        </div>
        {creditCapacity !== null && (
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Twoja szacunkowa zdolność kredytowa:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-semibold">Maks. miesięczna rata:</h4>
                <p className="text-2xl font-bold text-green-700">{creditCapacity.toFixed(2)} zł</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-semibold">Maks. kwota kredytu:</h4>
                <p className="text-2xl font-bold text-green-700">{maxLoanAmount?.toFixed(0)} zł</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Powyższe obliczenia są jedynie symulacją i nie stanowią oferty w rozumieniu przepisów prawa. Rzeczywista zdolność kredytowa zależy od wielu czynników i jest oceniana indywidualnie przez bank.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditScoreCalculatorPage; 