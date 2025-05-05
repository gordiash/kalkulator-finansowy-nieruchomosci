import { PropertyFormData, RentFormData, AnalysisOptions, CalculationResults } from '../types';

// Funkcja do obliczania miesięcznej raty kredytu
const calculateMortgagePayment = (principal: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  
  // Zabezpieczenie przed dzieleniem przez zero
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  return monthlyPayment;
};

// Główna funkcja obliczeniowa
export const calculateResults = (
  propertyData: PropertyFormData,
  rentData: RentFormData,
  analysisOptions: AnalysisOptions
): CalculationResults => {
  // Walidacja danych wejściowych
  if (propertyData.propertyPrice <= 0) throw new Error("Cena nieruchomości musi być większa od zera");
  
  // Obliczenie rzeczywistej kwoty wkładu własnego
  let downPayment = 0;
  if (propertyData.downPaymentType === 'percent') {
    downPayment = propertyData.propertyPrice * (propertyData.downPaymentValue / 100);
  } else {
    downPayment = propertyData.downPaymentValue;
  }
  
  if (downPayment <= 0) throw new Error("Wkład własny musi być większy od zera");
  if (downPayment >= propertyData.propertyPrice) throw new Error("Wkład własny nie może być większy niż cena nieruchomości");
  if (propertyData.loanTerm <= 0) throw new Error("Okres kredytowania musi być większy od zera");
  if (rentData.monthlyRent <= 0) throw new Error("Miesięczny czynsz musi być większy od zera");
  if (analysisOptions.analysisPeriod <= 0) throw new Error("Okres analizy musi być większy od zera");

  // Przygotowanie danych dla wykresu
  const labels: string[] = [];
  const mortgageCostData: number[] = [];
  const rentCostData: number[] = [];
  let cumulativeMortgageCost = 0;
  let cumulativeRentCost = 0;

  // Obliczenia dla zakupu
  const loanAmount = propertyData.propertyPrice - downPayment;
  const totalAnnualRate = propertyData.baseRate + propertyData.bankMargin;
  const monthlyMortgagePayment = calculateMortgagePayment(loanAmount, totalAnnualRate, propertyData.loanTerm);
  let buyingTotal = propertyData.transactionCosts + downPayment;
  let propertyValue = propertyData.propertyPrice;
  let totalMortgagePayments = 0;
  let totalOtherCosts = 0;

  // Obliczenia dla wynajmu
  let rentingTotal = rentData.securityDeposit;
  let currentMonthlyRent = rentData.monthlyRent;
  let investmentValue = downPayment;
  let totalRent = 0;
  let totalRentInsurance = 0;
  let totalRentMaintenance = 0;

  // Współczynniki uwzględniające inflację
  const realAppreciation = propertyData.appreciation - analysisOptions.inflation; // Realna aprecjacja po uwzględnieniu inflacji
  const realInvestmentReturn = rentData.investmentReturn - analysisOptions.inflation; // Realna stopa zwrotu po uwzględnieniu inflacji

  for (let year = 1; year <= analysisOptions.analysisPeriod; year++) {
    labels.push(`Rok ${year}`);
    
    // Obliczenia dla zakupu w danym roku
    const yearlyMortgagePayments = (year <= propertyData.loanTerm) ? monthlyMortgagePayment * 12 : 0;
    
    // Aktualizacja kosztów rocznych z uwzględnieniem inflacji
    const inflationFactor = Math.pow(1 + analysisOptions.inflation / 100, year - 1);
    const adjustedPropertyTax = propertyData.propertyTax * inflationFactor;
    const adjustedInsurance = propertyData.insurance * inflationFactor;
    const adjustedMaintenance = propertyData.maintenance * inflationFactor;
    const adjustedCommunityRent = propertyData.communityRent * inflationFactor;
    
    const yearlyCosts = adjustedPropertyTax + adjustedInsurance + adjustedMaintenance + adjustedCommunityRent;
    
    buyingTotal += yearlyMortgagePayments + yearlyCosts;
    totalMortgagePayments += yearlyMortgagePayments;
    totalOtherCosts += yearlyCosts;
    
    // Aktualizacja wartości nieruchomości (uwzględniając realną aprecjację)
    propertyValue *= (1 + realAppreciation / 100);
    
    // Obliczenia dla wynajmu w danym roku
    const yearlyRent = currentMonthlyRent * 12;
    const adjustedRenterInsurance = rentData.renterInsurance * inflationFactor;
    const adjustedRentMaintenance = rentData.rentMaintenance * inflationFactor;
    
    rentingTotal += yearlyRent + adjustedRenterInsurance + adjustedRentMaintenance;
    totalRent += yearlyRent;
    totalRentInsurance += adjustedRenterInsurance;
    totalRentMaintenance += adjustedRentMaintenance;
    
    // Aktualizacja czynszu na następny rok (uwzględniając inflację)
    currentMonthlyRent *= (1 + rentData.rentIncrease / 100);
    
    // Aktualizacja wartości inwestycji (uwzględniając realną stopę zwrotu)
    investmentValue *= (1 + realInvestmentReturn / 100);
    
    // Aktualizacja danych do wykresu
    if (year <= propertyData.loanTerm) {
      cumulativeMortgageCost += yearlyMortgagePayments;
    }
    cumulativeRentCost += yearlyRent;
    
    mortgageCostData.push(cumulativeMortgageCost);
    rentCostData.push(cumulativeRentCost);
  }

  // Porównanie opcji
  const difference = buyingTotal - rentingTotal;
  const finalDifference = (propertyValue - buyingTotal) - (investmentValue - rentingTotal);
  const buyingIsBetter = finalDifference > 0;

  return {
    buyingSummary: {
      monthlyMortgagePayment,
      downPayment,
      loanAmount,
      totalMortgagePayments,
      totalOtherCosts,
      buyingTotal,
      propertyValue
    },
    rentingSummary: {
      monthlyRent: rentData.monthlyRent,
      totalRent,
      totalRentInsurance,
      totalRentMaintenance,
      rentingTotal,
      investmentValue
    },
    comparison: {
      difference,
      finalDifference,
      buyingIsBetter,
      chartData: {
        labels,
        mortgageCostData,
        rentCostData
      }
    }
  };
}; 