export interface CalculationInput {
  propertyValue: string;
  downPaymentAmount: string;
  loanTerm: string;
  bankMargin: string;
  referenceRate: string;
  bankCommissionPercentage: string;
  installmentType: 'equal' | 'decreasing';
  marketType: 'secondary' | 'primary';
  agencyCommissionPercentage: string;
  propertyValuationCost: string;
  bridgeInsuranceMonths: string;
  bridgeInsuranceMarginIncrease: string;
  overpaymentAmount: string;
  overpaymentFrequency: 'one-time' | 'monthly' | 'yearly';
  overpaymentStartMonth: string;
  overpaymentTarget: 'shorten-period' | 'lower-installment';
  referenceRateChange: string;
  loanAmount: number | null;
}

export interface CalculationResults {
  // Tutaj zdefiniujemy typy dla wyników, na razie może być 'any'
  [key: string]: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/calculate.php';

export const getCalculations = async (input: CalculationInput): Promise<CalculationResults> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Wystąpił nieoczekiwany błąd serwera.' }));
    throw new Error(errorData.message || 'Błąd serwera');
  }

  const data = await response.json();
  return data.calculationResults;
}; 