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
  notaryFee: number; // Stawka taksy notarialnej
  pcc: number; // Podatek PCC
  courtFee: number; // Opłata sądowa
  notarialActCopyCost: number; // Koszty odpisów aktu notarialnego
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
  analysisPeriod: number;
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
    roe: number; // Return on Equity (zwrot z kapitału własnego)
    dti: number; // Debt-to-Income (wskaźnik obciążenia dochodów kredytem)
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
    breakEvenYear?: number; // Rok, w którym inwestycja się zwraca
    chartData?: {
      labels: string[];
      mortgageCostData: number[];
      rentCostData: number[];
    };
  };
  yearlyCosts?: {
    buying: number[];
    renting: number[];
  };
  cumulativeCosts?: {
    buying: number[];
    renting: number[];
  };
}