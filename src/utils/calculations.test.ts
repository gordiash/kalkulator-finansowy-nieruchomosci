import { calculateResults, calculateMortgagePayment, generateMortgageSchedule } from './calculations';
import { PropertyFormData, RentFormData, AnalysisOptions } from '../types';

// Dane przykładowe do testów
const mockPropertyData: PropertyFormData = {
  propertyPrice: 500000,
  downPaymentType: 'amount',
  downPaymentValue: 100000,
  baseRate: 5.6,
  bankMargin: 2.0,
  loanTerm: 25,
  propertyTax: 0.5,
  insurance: 0.08,
  maintenance: 0.5,
  communityRent: 500,
  appreciation: 3,
  transactionCosts: 5000,
  notaryFee: 3000,
  pcc: 2,
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
    if (results.comparison.chartData) {
      expect(results.comparison.chartData.labels.length).toBe(30); // 30 years analysis
      expect(results.comparison.chartData.mortgageCostData.length).toBe(30);
      expect(results.comparison.chartData.rentCostData.length).toBe(30);
    } else {
      // Jeśli chartData nie istnieje, upewnij się, że inne kluczowe dane są obecne
      expect(results.comparison.finalDifference).toBeDefined();
      expect(results.comparison.buyingIsBetter).toBeDefined();
    }
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

// Test dla funkcji generateMortgageSchedule
describe('generateMortgageSchedule function', () => {
  test('should generate correct mortgage schedule', () => {
    const principal = 400000;
    const annualRate = 7.6;
    const years = 5; // używamy krótszego okresu dla uproszczenia testów
    
    const schedule = generateMortgageSchedule(principal, annualRate, years);
    
    // Liczba rat powinna być równa liczbie miesięcy
    expect(schedule.length).toBe(years * 12);
    
    // Pierwsza rata
    const firstPayment = schedule[0];
    expect(firstPayment.paymentNumber).toBe(1);
    expect(firstPayment.totalPayment).toBeCloseTo(calculateMortgagePayment(principal, annualRate, years), 2);
    expect(firstPayment.interestPayment).toBeCloseTo(principal * (annualRate / 12 / 100), 2);
    expect(firstPayment.principalPayment).toBeCloseTo(
      firstPayment.totalPayment - firstPayment.interestPayment, 2
    );
    
    // Ostatnia rata
    const lastPayment = schedule[schedule.length - 1];
    expect(lastPayment.paymentNumber).toBe(years * 12);
    expect(lastPayment.remainingPrincipal).toBe(0); // Saldo powinno być równe zero po ostatniej racie
    
    // Suma wszystkich płatności kapitału powinna być równa kwocie kredytu
    const totalPrincipal = schedule.reduce((sum, payment) => sum + payment.principalPayment, 0);
    expect(totalPrincipal).toBeCloseTo(principal, 0); // Sprawdzamy z dokładnością do pełnych złotych
    
    // Suma wszystkich odsetek + kapitał powinny być równe sumie wszystkich płatności
    const totalInterest = schedule.reduce((sum, payment) => sum + payment.interestPayment, 0);
    const totalPayments = schedule.reduce((sum, payment) => sum + payment.totalPayment, 0);
    expect(totalPrincipal + totalInterest).toBeCloseTo(totalPayments, 0);
  });
  
  test('should handle zero interest rate correctly', () => {
    const principal = 400000;
    const annualRate = 0;
    const years = 5;
    
    const schedule = generateMortgageSchedule(principal, annualRate, years);
    
    // Sprawdzenie poprawności harmonogramu dla zerowego oprocentowania
    expect(schedule.length).toBe(years * 12);
    
    // Dla zerowego oprocentowania, każda rata powinna być taka sama i równa kwocie kredytu podzielonej przez liczbę rat
    const expectedPayment = principal / (years * 12);
    
    for (const payment of schedule) {
      expect(payment.totalPayment).toBeCloseTo(expectedPayment, 2);
      expect(payment.interestPayment).toBeCloseTo(0, 2);
      expect(payment.principalPayment).toBeCloseTo(expectedPayment, 2);
    }
    
    // Suma wszystkich płatności powinna być równa kwocie kredytu
    const totalPaid = schedule.reduce((sum, payment) => sum + payment.totalPayment, 0);
    expect(totalPaid).toBeCloseTo(principal, 0);
  });
  
  test('should handle very short loan term (1 year)', () => {
    const principal = 400000;
    const annualRate = 7.6;
    const years = 1;
    
    const schedule = generateMortgageSchedule(principal, annualRate, years);
    
    // Sprawdzenie poprawności harmonogramu dla krótkiego okresu
    expect(schedule.length).toBe(12); // 1 rok = 12 miesięcy
    
    // Ostatnia rata
    const lastPayment = schedule[schedule.length - 1];
    expect(lastPayment.remainingPrincipal).toBe(0);
    
    // Suma wszystkich płatności kapitału powinna być równa kwocie kredytu
    const totalPrincipal = schedule.reduce((sum, payment) => sum + payment.principalPayment, 0);
    expect(totalPrincipal).toBeCloseTo(principal, 0);
  });
  
  test('should handle very long loan term (50 years)', () => {
    const principal = 400000;
    const annualRate = 7.6;
    const years = 50;
    
    const schedule = generateMortgageSchedule(principal, annualRate, years);
    
    // Sprawdzenie poprawności harmonogramu dla długiego okresu
    expect(schedule.length).toBe(50 * 12); // 50 lat = 600 miesięcy
    
    // Ostatnia rata
    const lastPayment = schedule[schedule.length - 1];
    expect(lastPayment.remainingPrincipal).toBe(0);
    
    // Suma wszystkich płatności kapitału powinna być równa kwocie kredytu
    const totalPrincipal = schedule.reduce((sum, payment) => sum + payment.principalPayment, 0);
    expect(totalPrincipal).toBeCloseTo(principal, 0);
    
    // W przypadku długiego kredytu, suma odsetek powinna być znacznie większa niż kwota kredytu
    const totalInterest = schedule.reduce((sum, payment) => sum + payment.interestPayment, 0);
    expect(totalInterest).toBeGreaterThan(principal * 3); // Przy 50 latach i 7.6% odsetki będą kilkukrotnie większe od kwoty kredytu
  });
  
  test('should correctly set date for each payment', () => {
    const principal = 400000;
    const annualRate = 7.6;
    const years = 2;
    const startDate = new Date(2023, 0, 15); // 15 stycznia 2023
    
    const schedule = generateMortgageSchedule(principal, annualRate, years, startDate);
    
    // Sprawdzenie poprawności dat płatności
    expect(schedule[0].date).toBe('2023-01-15'); // Pierwsza rata (format YYYY-MM-DD)
    expect(schedule[1].date).toBe('2023-02-15'); // Druga rata
    expect(schedule[11].date).toBe('2023-12-15'); // 12-ta rata
    expect(schedule[12].date).toBe('2024-01-15'); // 13-ta rata (drugi rok)
    expect(schedule[schedule.length - 1].date).toBe('2024-12-15'); // Ostatnia rata (po 2 latach)
  });
  
  test('should correctly update running totals in each payment', () => {
    const principal = 400000;
    const annualRate = 7.6;
    const years = 3;
    
    const schedule = generateMortgageSchedule(principal, annualRate, years);
    
    // Sprawdzenie poprawności narastających sum
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    let totalPaid = 0;
    
    for (let i = 0; i < schedule.length; i++) {
      const payment = schedule[i];
      
      totalPrincipalPaid += payment.principalPayment;
      totalInterestPaid += payment.interestPayment;
      totalPaid += payment.totalPayment;
      
      // Narastające sumy w każdej racie powinny być zgodne z obliczeniami
      expect(payment.totalPrincipalPaid).toBeCloseTo(totalPrincipalPaid, 2);
      expect(payment.totalInterestPaid).toBeCloseTo(totalInterestPaid, 2);
      expect(payment.totalPaid).toBeCloseTo(totalPaid, 2);
    }
  });
}); 