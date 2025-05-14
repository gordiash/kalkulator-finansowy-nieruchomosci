import { calculateResults, calculateMortgagePayment } from './calculations';
import { PropertyFormData, RentFormData, AnalysisOptions } from '../types';

// Mocking sample data
const mockPropertyData: PropertyFormData = {
  propertyPrice: 500000,
  downPaymentType: 'amount',
  downPaymentValue: 100000,
  baseRate: 5.6,
  bankMargin: 2.0,
  loanTerm: 25,
  propertyTax: 600,
  insurance: 800,
  maintenance: 2000,
  communityRent: 4800,
  appreciation: 3,
  transactionCosts: 10000,
  notaryFee: 5000, // 1% of property price
  pcc: 10000, // 2% of property price
  courtFee: 200,
  notarialActCopyCost: 100
};

const mockRentData: RentFormData = {
  monthlyRent: 2500,
  rentIncrease: 4,
  securityDeposit: 5000,
  renterInsurance: 200,
  rentMaintenance: 500,
  investmentReturn: 5
};

const mockAnalysisOptions: AnalysisOptions = {
  analysisPeriod: 30,
  inflation: 2.5
};

describe('calculateResults function', () => {
  test('should calculate correct results with valid input data', () => {
    const results = calculateResults(mockPropertyData, mockRentData, mockAnalysisOptions);
    
    // Check if results object has all expected properties
    expect(results).toHaveProperty('buyingSummary');
    expect(results).toHaveProperty('rentingSummary');
    expect(results).toHaveProperty('comparison');
    
    // Check buying summary calculations
    expect(results.buyingSummary.loanAmount).toBe(400000); // propertyPrice - downPayment
    expect(results.buyingSummary.downPayment).toBe(100000);
    
    // Check monthly mortgage payment calculation (approximate due to floating-point arithmetic)
    expect(results.buyingSummary.monthlyMortgagePayment).toBeCloseTo(2613.13, 0); // Approximate value
    
    // Check renting summary
    expect(results.rentingSummary.monthlyRent).toBe(2500);
    
    // Check comparison data
    expect(results.comparison.chartData.labels.length).toBe(30); // 30 years analysis
    expect(results.comparison.chartData.mortgageCostData.length).toBe(30);
    expect(results.comparison.chartData.rentCostData.length).toBe(30);
  });
  
  test('should throw error when property price is zero or negative', () => {
    const invalidPropertyData = { ...mockPropertyData, propertyPrice: 0 };
    
    expect(() => {
      calculateResults(invalidPropertyData, mockRentData, mockAnalysisOptions);
    }).toThrow("Cena nieruchomości musi być większa od zera");
  });
  
  test('should throw error when down payment is greater than property price', () => {
    const invalidPropertyData = { ...mockPropertyData, downPaymentValue: 600000 };
    
    expect(() => {
      calculateResults(invalidPropertyData, mockRentData, mockAnalysisOptions);
    }).toThrow("Wkład własny nie może być większy niż cena nieruchomości");
  });
  
  test('should throw error when down payment is zero or negative', () => {
    const invalidPropertyData = { ...mockPropertyData, downPaymentValue: 0 };
    
    expect(() => {
      calculateResults(invalidPropertyData, mockRentData, mockAnalysisOptions);
    }).toThrow("Wkład własny musi być większy od zera");
  });
  
  test('should throw error when loan term is zero or negative', () => {
    const invalidPropertyData = { ...mockPropertyData, loanTerm: 0 };
    
    expect(() => {
      calculateResults(invalidPropertyData, mockRentData, mockAnalysisOptions);
    }).toThrow("Okres kredytowania musi być większy od zera");
  });
  
  test('should throw error when monthly rent is zero or negative', () => {
    const invalidRentData = { ...mockRentData, monthlyRent: 0 };
    
    expect(() => {
      calculateResults(mockPropertyData, invalidRentData, mockAnalysisOptions);
    }).toThrow("Miesięczny czynsz musi być większy od zera");
  });
  
  test('should handle percentage down payment correctly', () => {
    const percentPropertyData: PropertyFormData = { 
      ...mockPropertyData, 
      downPaymentType: 'percent', 
      downPaymentValue: 20 // 20% of property price
    };
    
    const results = calculateResults(percentPropertyData, mockRentData, mockAnalysisOptions);
    
    // Down payment should be 20% of 500000 = 100000
    expect(results.buyingSummary.downPayment).toBe(100000);
    expect(results.buyingSummary.loanAmount).toBe(400000);
  });
  
  test('should calculate with zero interest rate', () => {
    const zeroRatePropertyData = {
      ...mockPropertyData,
      baseRate: 0,
      bankMargin: 0
    };
    
    const results = calculateResults(zeroRatePropertyData, mockRentData, mockAnalysisOptions);
    
    // With 0% interest, monthly payment for 400000 over 25 years should be 400000 / (25 * 12)
    expect(results.buyingSummary.monthlyMortgagePayment).toBeCloseTo(1333.33, 0);
  });
  
  test('should include all transaction costs in calculations', () => {
    const results = calculateResults(mockPropertyData, mockRentData, mockAnalysisOptions);
    
    // Total other costs should include transaction costs, notary fee, pcc, court fee, and notarial act copy cost
    const expectedTransactionCosts = mockPropertyData.transactionCosts + 
                                     mockPropertyData.notaryFee + 
                                     mockPropertyData.pcc + 
                                     mockPropertyData.courtFee + 
                                     mockPropertyData.notarialActCopyCost;
                                    
    // Note: Total other costs also includes yearly expenses over time, so will be higher
    expect(results.buyingSummary.totalOtherCosts).toBeGreaterThanOrEqual(expectedTransactionCosts);
  });
  
  test('should calculate ROE (Return on Equity) indicator', () => {
    const results = calculateResults(mockPropertyData, mockRentData, mockAnalysisOptions);
    
    // Sprawdzamy, czy ROE zostało obliczone i ma sensowną wartość
    expect(results.buyingSummary).toHaveProperty('roe');
    expect(typeof results.buyingSummary.roe).toBe('number');
    
    // Sprawdzamy, czy ROE jest obliczone według wzoru: ((propertyValue - buyingTotal) / downPayment) * 100
    const expectedRoe = ((results.buyingSummary.propertyValue - results.buyingSummary.buyingTotal) / results.buyingSummary.downPayment) * 100;
    expect(results.buyingSummary.roe).toBeCloseTo(expectedRoe, 2);
  });
  
  test('should calculate DTI (Debt-to-Income) indicator', () => {
    const results = calculateResults(mockPropertyData, mockRentData, mockAnalysisOptions);
    
    // Sprawdzamy, czy DTI zostało obliczone i ma sensowną wartość
    expect(results.buyingSummary).toHaveProperty('dti');
    expect(typeof results.buyingSummary.dti).toBe('number');
    
    // Sprawdzamy, czy DTI jest obliczone według wzoru w kodzie: (monthlyMortgagePayment / assumedMonthlyIncome) * 100
    // gdzie assumedMonthlyIncome = monthlyMortgagePayment * 3
    const assumedMonthlyIncome = results.buyingSummary.monthlyMortgagePayment * 3;
    const expectedDti = (results.buyingSummary.monthlyMortgagePayment / assumedMonthlyIncome) * 100;
    expect(results.buyingSummary.dti).toBeCloseTo(expectedDti, 2);
    
    // DTI powinno być około 33.33% przy założeniu dochodu 3x rata
    expect(results.buyingSummary.dti).toBeCloseTo(33.33, 0);
  });
});

// Test dla funkcji calculateMortgagePayment
describe('calculateMortgagePayment function', () => {
  test('should calculate correct monthly payment with standard inputs', () => {
    // Kredyt 400000 zł, oprocentowanie 7.6% (5.6% + 2%), okres 25 lat
    const principal = 400000;
    const annualRate = 7.6;
    const years = 25;
    
    const monthlyPayment = calculateMortgagePayment(principal, annualRate, years);
    
    // Przybliżona wartość miesięcznej raty
    expect(monthlyPayment).toBeCloseTo(2913.13, 0);
  });
  
  test('should handle zero interest rate', () => {
    const principal = 400000;
    const annualRate = 0;
    const years = 25;
    
    const monthlyPayment = calculateMortgagePayment(principal, annualRate, years);
    
    // Z zerowym oprocentowaniem, miesięczna rata powinna być równa kwocie kredytu podzielonej przez liczbę miesięcy
    expect(monthlyPayment).toBe(400000 / (25 * 12));
  });
  
  test('should handle very short loan term', () => {
    const principal = 400000;
    const annualRate = 7.6;
    const years = 1;
    
    const monthlyPayment = calculateMortgagePayment(principal, annualRate, years);
    
    // Dla krótkiego okresu, miesięczna rata powinna być wyższa
    expect(monthlyPayment).toBeGreaterThan(30000);
  });
  
  test('should handle very long loan term', () => {
    const principal = 400000;
    const annualRate = 7.6;
    const years = 50;
    
    const monthlyPayment = calculateMortgagePayment(principal, annualRate, years);
    
    // Dla długiego okresu, miesięczna rata powinna być niższa
    expect(monthlyPayment).toBeLessThan(3000);
  });
}); 