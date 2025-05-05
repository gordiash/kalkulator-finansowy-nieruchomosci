// src/types.ts
export interface PropertyFormData {
  propertyPrice: number;
  downPaymentType: 'amount' | 'percent';
  downPaymentValue: number;
  baseRate: number; // WIBOR etc.
  bankMargin: number;
  loanTerm: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  communityRent: number;
  appreciation: number;
  transactionCosts: number;
}

export interface RentFormData {
  monthlyRent: number;
  rentIncrease: number;
  securityDeposit: number;
  renterInsurance: number;
  rentMaintenance: number;
  investmentReturn: number;
}

export interface AnalysisOptions {
  analysisPeriod: 5 | 10 | 20 | 25 | 30;
  inflation: number;
}

export interface CalculationResults {
  buyingSummary: {
    monthlyMortgagePayment: number;
    downPayment: number;
    loanAmount: number;
    totalMortgagePayments: number;
    totalOtherCosts: number;
    buyingTotal: number;
    propertyValue: number;
  };
  rentingSummary: {
    monthlyRent: number;
    totalRent: number;
    totalRentInsurance: number;
    totalRentMaintenance: number;
    rentingTotal: number;
    investmentValue: number;
  };
  comparison: {
    difference: number;
    finalDifference: number;
    buyingIsBetter: boolean;
    chartData: {
      labels: string[];
      mortgageCostData: number[];
      rentCostData: number[];
    };
  };
} 