import React, { useState } from 'react';

interface MortgageCalculatorProps {
  propertyPrice: number;
  downPayment: number;
  annualRate: number;
  loanTerm: number;
  onMonthlyPaymentCalculate: (payment: number) => void;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  propertyPrice,
  downPayment,
  annualRate,
  loanTerm,
  onMonthlyPaymentCalculate
}) => {
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);

  const calculateMonthlyPayment = () => {
    const loanAmount = propertyPrice - downPayment;
    const monthlyRate = annualRate / 12 / 100;
    const numberOfPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      const payment = loanAmount / numberOfPayments;
      setMonthlyPayment(payment);
      onMonthlyPaymentCalculate(payment);
      return;
    }

    const payment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    setMonthlyPayment(payment);
    onMonthlyPaymentCalculate(payment);
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">Kalkulator Raty Kredytu</h2>
      <button
        onClick={calculateMonthlyPayment}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Oblicz ratę miesięczną
      </button>
      {monthlyPayment !== null && (
        <p className="mt-4">Miesięczna rata: {monthlyPayment.toFixed(2)} PLN</p>
      )}
    </div>
  );
};

export default MortgageCalculator;