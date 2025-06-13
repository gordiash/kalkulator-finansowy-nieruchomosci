import { NextRequest, NextResponse } from 'next/server';

// ===== WSPÓLNE STAŁE I KONFIGURACJA =====
const INTEREST_RATE_STRESS_BUFFER = 2.5; // Bufor 2.5 p.p. do stress testu stóp procentowych
const MAX_LOAN_TERM_YEARS = 35; // Maksymalny okres kredytowania
const LIVING_COST_INCOME_FACTOR = 0.10; // 10% dochodu dodawane do bazowych kosztów życia


// ===== FUNKCJE POMOCNICZE =====

/**
 * Oblicza szacunkową wysokość taksy notarialnej na podstawie wartości nieruchomości.
 */
function calculateNotaryFee(value: number): number {
    let fee = 0.0;
    if (value <= 3000) {
        fee = 100;
    } else if (value <= 10000) {
        fee = 100 + (value - 3000) * 0.03;
    } else if (value <= 30000) {
        fee = 310 + (value - 10000) * 0.02;
    } else if (value <= 60000) {
        fee = 710 + (value - 30000) * 0.01;
    } else if (value <= 1000000) {
        fee = 1010 + (value - 60000) * 0.004;
    } else if (value <= 2000000) {
        fee = 4770 + (value - 1000000) * 0.002;
    } else {
        fee = 6770 + (value - 2000000) * 0.0025;
        if (fee > 10000) {
            fee = 10000;
        }
    }
    return fee * 1.23;
}

/**
 * Oblicza ratę annuitetową dla kalkulatora wynajmu
 */
function calculateLoanPaymentRental(loanAmount: number, annualRate: number, years: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) {
        return loanAmount / numberOfPayments;
    }
    
    const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return payment;
}

/**
 * Oblicza podatek na podstawie typu opodatkowania
 */
function calculateTaxRental(income: number, costs: number, interestAmount: number, taxationType: string, taxScale: string = '12'): number {
    if (taxationType === 'ryczalt') {
        // Ryczałt od przychodu
        if (income <= 100000) {
            return income * 0.085; // 8.5%
        } else {
            return income * 0.125; // 12.5%
        }
    } else {
        // Skala podatkowa od dochodu
        const taxableIncome = income - costs - interestAmount;
        if (taxableIncome <= 0) return 0;
        
        const rate = parseFloat(taxScale) / 100;
        return taxableIncome * rate;
    }
}

/**
 * Przygotowuje dane dla wykresu kosztów miesięcznych
 */
function prepareCostBreakdownData(adminFees: number, utilities: number, insurance: number, otherCosts: number, monthlyLoanPayment: number) {
    const data = [];
    
    // Zawsze dodaj koszty, nawet jeśli są 0 (dla jasności)
    data.push({ name: 'Czynsz administracyjny', value: Math.max(0, adminFees) });
    data.push({ name: 'Media', value: Math.max(0, utilities) });
    data.push({ name: 'Ubezpieczenie', value: Math.max(0, insurance / 12) });
    data.push({ name: 'Inne koszty', value: Math.max(0, otherCosts) });
    
    if (monthlyLoanPayment > 0) {
        data.push({ name: 'Rata kredytu', value: monthlyLoanPayment });
    }
    
    return data;
}

/**
 * Przygotowuje dane dla wykresu przychody vs koszty
 */
function prepareIncomeVsCostsData(annualIncome: number, adminFees: number, utilities: number, insurance: number, otherCosts: number, monthlyLoanPayment: number, taxAmount: number) {
    const annualCosts = adminFees * 12 + utilities * 12 + insurance + otherCosts * 12;
    const loanPayments = monthlyLoanPayment * 12;
    const netIncome = annualIncome - annualCosts - loanPayments - taxAmount;

    return [
        { name: 'Przychód roczny', Kwota: annualIncome, fill: '#00C49F' },
        { name: 'Koszty operacyjne', Kwota: annualCosts, fill: '#FF8042' },
        { name: 'Raty kredytu', Kwota: loanPayments, fill: '#FFBB28' },
        { name: 'Podatki', Kwota: taxAmount, fill: '#FF4444' },
        { name: 'Dochód netto', Kwota: netIncome, fill: netIncome >= 0 ? '#0088FE' : '#FF0000' }
    ];
}

/**
 * Generuje projekcję wieloletnią
 */
function generateProjectionRental(purchasePrice: number, monthlyRent: number, loanAmount: number, loanYears: number, netCashFlow: number, propertyAppreciation: number, rentGrowth: number) {
    const appreciationRate = propertyAppreciation / 100;
    const rentGrowthRate = rentGrowth / 100;
    
    const projection = [];
    let remainingLoan = loanAmount;
    
    for (let year = 1; year <= 10; year++) {
        const propertyValue = purchasePrice * Math.pow(1 + appreciationRate, year);
        const yearlyRent = monthlyRent * Math.pow(1 + rentGrowthRate, year);
        
        // Spłata kapitału kredytu w danym roku (uproszczone)
        const yearlyPrincipalPayment = loanAmount > 0 ? loanAmount / loanYears : 0;
        remainingLoan = Math.max(0, remainingLoan - yearlyPrincipalPayment);
        
        const equity = propertyValue - remainingLoan;
        const yearlyNetCashFlow = netCashFlow * Math.pow(1 + rentGrowthRate, year - 1);
        
        projection.push({
            year: year,
            propertyValue: Math.round(propertyValue),
            remainingLoan: Math.round(remainingLoan),
            equity: Math.round(equity),
            yearlyRent: Math.round(yearlyRent * 12),
            cashFlow: Math.round(yearlyNetCashFlow)
        });
    }
    
    return projection;
}

/**
 * Oblicza dynamiczne koszty utrzymania na podstawie liczby osób i dochodu
 */
function calculateLivingCosts(people: number, totalNetIncome: number): number {
    // Bazowe koszty życia w zależności od liczby osób
    let baseCost = 0;
    if (people === 1) baseCost = 1200;
    else if (people === 2) baseCost = 2000;
    else if (people === 3) baseCost = 2800;
    else if (people === 4) baseCost = 3500;
    else baseCost = 3500 + (people - 4) * 600; // każda kolejna osoba +600 zł

    // Dodanie 10% dochodu jako dodatkowe koszty utrzymania dla wyższych dochodów
    const additionalCosts = totalNetIncome * LIVING_COST_INCOME_FACTOR;
    
    return baseCost + additionalCosts;
}

/**
 * Zwraca wagę zatrudnienia wpływającą na zdolność kredytową
 */
function getEmploymentWeight(employmentType: string): number {
    const weights: { [key: string]: number } = {
        // Polskie nazwy (stare)
        'umowa_o_prace': 1.0,
        'umowa_zlecenie': 0.8,
        'dzialalnosc_gospodarcza': 0.7,
        'umowa_o_dzielo': 0.6,
        'emeryt_rencista': 0.9,
        // Angielskie nazwy (nowe z frontendu)
        'employment': 1.0,        // Umowa o pracę - najlepsza stabilność
        'b2b': 0.8,             // B2B / Działalność gospodarcza - średnia stabilność
        'contract': 0.7         // Umowa zlecenie/o dzieło - niższa stabilność
    };
    
    return weights[employmentType] || 0.7; // Domyślna waga dla nieznanych typów
}

/**
 * Oblicza maksymalną kwotę kredytu
 */
function calculateMaxLoanAmount(maxMonthlyPayment: number, interestRate: number, termYears: number, installmentType: string): number {
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = termYears * 12;
    
    if (monthlyRate === 0) {
        return maxMonthlyPayment * totalPayments;
    }
    
    if (installmentType === 'equal') {
        // Raty równe (annuitetowe)
        return maxMonthlyPayment * (Math.pow(1 + monthlyRate, totalPayments) - 1) / 
               (monthlyRate * Math.pow(1 + monthlyRate, totalPayments));
    } else {
        // Raty malejące
        // Dla rat malejących pierwsza rata jest najwyższa
        // maxMonthlyPayment = (loanAmount / totalPayments) + (loanAmount * monthlyRate)
        // Rozwiązanie: loanAmount = maxMonthlyPayment / (1/totalPayments + monthlyRate)
        return maxMonthlyPayment / (1/totalPayments + monthlyRate);
    }
}

/**
 * Przygotowuje dane wykresu dla kalkulatora zdolności kredytowej
 */
function prepareCreditScoreChartData(expenses: number, loans: number, creditObligations: number, costOfLiving: number, maxMonthlyPayment: number, remainingAfterLoan: number) {
    const data = [];
    
    if (expenses > 0) {
        data.push({ name: 'Wydatki miesięczne', value: expenses, fill: '#FF8042' });
    }
    if (loans > 0) {
        data.push({ name: 'Inne kredyty', value: loans, fill: '#FFBB28' });
    }
    if (creditObligations > 0) {
        data.push({ name: 'Zobowiązania kredytowe', value: creditObligations, fill: '#FF4444' });
    }
    if (costOfLiving > 0) {
        data.push({ name: 'Koszty utrzymania', value: costOfLiving, fill: '#82ca9d' });
    }
    if (maxMonthlyPayment > 0) {
        data.push({ name: 'Maks. rata kredytu', value: maxMonthlyPayment, fill: '#0088FE' });
    }
    if (remainingAfterLoan > 0) {
        data.push({ name: 'Pozostaje po kredycie', value: remainingAfterLoan, fill: '#00C49F' });
    }
    
    return data;
}

interface ScheduleItem {
    month: number;
    principalPart: number;
    interestPart: number;
    totalPayment: number;
    remainingPrincipal: number;
    overpayment: number;
}

/**
 * Generuje harmonogram spłat kredytu
 */
function generateSchedule(
    principal: number, 
    years: number, 
    margin: number, 
    refRate: number, 
    type: string, 
    bridgeMonths: number, 
    bridgeIncrease: number, 
    overpayment: { amount: number; frequency?: string; startMonth?: number; target?: string; interval?: number }
): ScheduleItem[] {
    const schedule: ScheduleItem[] = [];
    const monthlyRate = (margin + refRate) / 100 / 12;
    const totalMonths = years * 12;
    let remainingPrincipal = principal;
    let monthNumber = 1;
    
    // Logika nadpłat
    const overpaymentAmount = overpayment.amount || 0;
    const overpaymentFrequency = overpayment.frequency || 'one-time';
    const overpaymentStartMonth = overpayment.startMonth || 1;
    
    while (remainingPrincipal > 0.01 && monthNumber <= totalMonths) {
        // Obliczenie czy w tym miesiącu jest ubezpieczenie pomostowe
        const currentRate = (monthNumber <= bridgeMonths) ? 
            (margin + refRate + bridgeIncrease) / 100 / 12 : monthlyRate;
        
        let principalPayment: number;
        let interestPayment: number;
        let totalPayment: number;
        
        if (type === 'equal') {
            // Raty równe (annuitetowe)
            const remainingMonths = totalMonths - monthNumber + 1;
            if (currentRate === 0) {
                totalPayment = remainingPrincipal / remainingMonths;
                principalPayment = totalPayment;
                interestPayment = 0;
            } else {
                totalPayment = remainingPrincipal * (currentRate * Math.pow(1 + currentRate, remainingMonths)) / 
                              (Math.pow(1 + currentRate, remainingMonths) - 1);
                interestPayment = remainingPrincipal * currentRate;
                principalPayment = totalPayment - interestPayment;
            }
        } else {
            // Raty malejące
            principalPayment = principal / totalMonths;
            interestPayment = remainingPrincipal * currentRate;
            totalPayment = principalPayment + interestPayment;
        }
        
        // Sprawdzenie nadpłaty
        let currentOverpayment = 0;
        if (overpaymentAmount > 0 && monthNumber >= overpaymentStartMonth) {
            if (overpaymentFrequency === 'one-time' && monthNumber === overpaymentStartMonth) {
                currentOverpayment = overpaymentAmount;
            } else if (overpaymentFrequency === 'monthly') {
                currentOverpayment = overpaymentAmount;
            } else if (overpaymentFrequency === 'yearly' && (monthNumber - overpaymentStartMonth) % 12 === 0) {
                currentOverpayment = overpaymentAmount;
            }
        }
        
        // Zastosowanie nadpłaty
        if (currentOverpayment > 0) {
            principalPayment += Math.min(currentOverpayment, remainingPrincipal - principalPayment);
            totalPayment += currentOverpayment;
        }
        
        // Upewnienie się, że nie spłacamy więcej niż pozostało
        if (principalPayment > remainingPrincipal) {
            principalPayment = remainingPrincipal;
            totalPayment = principalPayment + interestPayment;
        }
        
        remainingPrincipal -= principalPayment;
        
        schedule.push({
            month: monthNumber,
            principalPart: Math.round(principalPayment * 100) / 100,
            interestPart: Math.round(interestPayment * 100) / 100,
            totalPayment: Math.round(totalPayment * 100) / 100,
            remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
            overpayment: currentOverpayment
        });
        
        monthNumber++;
        
        // Zabezpieczenie przed nieskończoną pętlą
        if (monthNumber > 600) break; // Maksymalnie 50 lat
    }
    
    return schedule;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RentalInput extends Record<string, any> {
    calculationType: string;
    purchasePrice: number;
    monthlyRent: number;
    downPayment: number;
    adminFees: number;
    utilities: number;
    insurance: number;
    otherCosts: number;
    vacancyRate: number;
    interestRate: number;
    loanYears: number;
    taxationType: string;
    taxScale: string;
    propertyAppreciation: number;
    rentGrowth: number;
    renovationCosts: number | null;
    otherInitialCosts: number | null;
    managementFee: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CreditScoreInput extends Record<string, any> {
    calculationType: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    otherLoans: number;
    householdSize: number;
    loanTerm: number;
    interestRate: number;
    installmentType: string;
    secondBorrowerIncome: number;
    employmentType: string;
    creditCardLimits: number;
    accountOverdrafts: number;
    dstiRatio: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PurchaseInput extends Record<string, any> {
    propertyValue: number;
    loanAmount: number;
    loanTerm: number;
    bankMargin: number;
    referenceRate: number;
    installmentType: string;
    useSimulationRate?: boolean;
    referenceRateChange?: number;
    bridgeInsuranceMonths?: number;
    bridgeInsuranceMarginIncrease?: number;
    overpaymentAmount?: number;
    overpaymentFrequency?: string;
    overpaymentStartMonth?: number;
    overpaymentTarget?: string;
    overpaymentInterval?: number;
    notaryFeeType?: string;
    customNotaryFee?: number;
    pccTaxRate?: number;
    agencyCommission?: number;
    bankCommission?: number;
}

// ===== GŁÓWNA FUNKCJA OBSŁUGI REQUESTÓW =====

export async function POST(request: NextRequest) {
    try {
        const input = await request.json();
        
        // Sprawdzenie typu kalkulacji
        const calculationType = input.calculationType;
        
        if (calculationType === 'rental') {
            return handleRentalCalculation(input as RentalInput);
        } else if (calculationType === 'credit-score') {
            return handleCreditScoreCalculation(input as CreditScoreInput);
        } else {
            return handlePurchaseCalculation(input as PurchaseInput);
        }
        
    } catch (error) {
        console.error('Błąd podczas obliczeń:', error);
        return NextResponse.json(
            { error: 'Błąd podczas obliczeń' },
            { status: 500 }
        );
    }
}

// ===== OBSŁUGA KALKULATORA WYNAJMU =====
function handleRentalCalculation(input: RentalInput) {
    try {
        const purchasePrice = parseFloat(input.purchasePrice.toString()) || 0;
        const monthlyRent = parseFloat(input.monthlyRent.toString()) || 0;
        const downPayment = parseFloat(input.downPayment.toString()) || 0;
        const loanAmount = purchasePrice - downPayment;
        
        // Koszty miesięczne
        const adminFees = parseFloat(input.adminFees.toString()) || 0;
        const utilities = parseFloat(input.utilities.toString()) || 0;
        const insurance = parseFloat(input.insurance.toString()) || 0;
        const otherCosts = parseFloat(input.otherCosts.toString()) || 0;
        const managementFee = input.managementFee ? parseFloat(input.managementFee.toString()) : 0;
        const vacancyRate = parseFloat(input.vacancyRate.toString()) || 0;
        
        // Parametry kredytu
        const interestRate = parseFloat(input.interestRate.toString()) || 0;
        const loanYears = parseInt(input.loanYears.toString()) || 25;
        
        // Obliczenia podstawowe
        const annualRentIncome = monthlyRent * 12;
        const effectiveRentalMonths = 12 * (1 - vacancyRate / 100);
        const vacancyMonths = 12 - effectiveRentalMonths;
        const netIncome = monthlyRent * effectiveRentalMonths;
        
        // Koszty roczne
        const annualCosts = adminFees * 12 + utilities * 12 + insurance + otherCosts * 12 + managementFee * 12;
        const monthCosts = adminFees + utilities + otherCosts + managementFee;
        
        // ROI podstawowe
        const actualInvestment = downPayment + 
            (input.renovationCosts ? parseFloat(input.renovationCosts.toString()) : 0) + 
            (input.otherInitialCosts ? parseFloat(input.otherInitialCosts.toString()) : 0);
        const annualNetIncome = netIncome - annualCosts;
        const roi = actualInvestment > 0 ? (annualNetIncome / actualInvestment) * 100 : 0;
        
        // Obliczenia kredytowe
        let monthlyPayment = 0;
        if (loanAmount > 0 && interestRate > 0) {
            monthlyPayment = calculateLoanPaymentRental(loanAmount, interestRate, loanYears);
        }
        
        const monthlyCashFlow = monthlyRent - monthCosts - monthlyPayment;
        const annualCashFlow = monthlyCashFlow * effectiveRentalMonths - (monthlyPayment * vacancyMonths);
        const cashOnCashReturn = actualInvestment > 0 ? (annualCashFlow / actualInvestment) * 100 : 0;
        
        // Obliczenia podatkowe
        let annualInterest = 0;
        if (loanAmount > 0 && interestRate > 0) {
            annualInterest = loanAmount * (interestRate / 100);
        }
        
        const taxationType = input.taxationType || 'ryczalt';
        const taxScale = input.taxScale || '12';
        const taxAmount = calculateTaxRental(annualRentIncome, annualCosts, annualInterest, taxationType, taxScale);
        
        // Wartości netto po podatkach
        const netAnnualCashFlow = annualCashFlow - taxAmount;
        const netCashOnCashReturn = actualInvestment > 0 ? (netAnnualCashFlow / actualInvestment) * 100 : 0;
        
        // Przygotowanie danych do wykresów
        const costBreakdown = prepareCostBreakdownData(adminFees, utilities, insurance, otherCosts, monthlyPayment);
        const incomeVsCosts = prepareIncomeVsCostsData(annualRentIncome, adminFees, utilities, insurance, otherCosts, monthlyPayment, taxAmount);
        
        // Projekcja wieloletnia
        const propertyAppreciation = parseFloat(input.propertyAppreciation.toString()) || 3;
        const rentGrowth = parseFloat(input.rentGrowth.toString()) || 2;
        
        const projection = generateProjectionRental(
            purchasePrice,
            monthlyRent,
            loanAmount,
            loanYears,
            netAnnualCashFlow,
            propertyAppreciation,
            rentGrowth
        );
        
        // Przygotowanie odpowiedzi
        const response = {
            annualIncome: annualRentIncome,
            netAnnualIncome: netIncome,
            roi: roi,
            taxAmount: taxAmount,
            netCashFlow: netAnnualCashFlow,
            netCocReturn: netCashOnCashReturn,
            costBreakdown: costBreakdown,
            incomeVsCosts: incomeVsCosts,
            projection: projection
        };
        
        // Dodaj dane kredytowe tylko jeśli istnieją
        if (loanAmount > 0) {
            Object.assign(response, {
                loanAmount: loanAmount,
                monthlyLoanPayment: monthlyPayment,
                cashFlow: annualCashFlow,
                cocReturn: cashOnCashReturn
            });
        }
        
        return NextResponse.json(response);
        
    } catch (error) {
        console.error('Error calculating rental profitability:', error);
        return NextResponse.json(
            { error: "Błąd podczas obliczeń" },
            { status: 500 }
        );
    }
}

// ===== OBSŁUGA KALKULATORA ZDOLNOŚCI KREDYTOWEJ =====
function handleCreditScoreCalculation(input: CreditScoreInput) {
    try {
        // Walidacja i rzutowanie danych wejściowych
        const monthlyIncome = parseFloat(input.monthlyIncome.toString()) || 0;
        const monthlyExpenses = parseFloat(input.monthlyExpenses.toString()) || 0;
        const otherLoans = parseFloat(input.otherLoans.toString()) || 0;
        const householdSize = parseInt(input.householdSize.toString()) || 1;
        const loanTerm = parseInt(input.loanTerm.toString()) || 25;
        const interestRate = parseFloat(input.interestRate.toString()) || 5.0;
        const installmentType = input.installmentType || 'equal';
        const secondBorrowerIncome = parseFloat(input.secondBorrowerIncome.toString()) || 0;
        const employmentType = input.employmentType || 'umowa_o_prace';
        const creditCardLimits = parseFloat(input.creditCardLimits.toString()) || 0;
        const accountOverdrafts = parseFloat(input.accountOverdrafts.toString()) || 0;
        const dstiRatio = parseFloat(input.dstiRatio.toString()) || 50;
        
        // Obliczenia podstawowe
        const totalNetIncome = monthlyIncome + secondBorrowerIncome;
        const employmentWeight = getEmploymentWeight(employmentType);
        const adjustedIncome = totalNetIncome * employmentWeight;
        
        // Koszty utrzymania
        const costOfLiving = calculateLivingCosts(householdSize, totalNetIncome);
        
        // Zobowiązania kredytowe (5% limitów kart kredytowych + 10% overdraftów + inne kredyty)
        const creditObligations = (creditCardLimits * 0.05) + (accountOverdrafts * 0.10) + otherLoans;
        
        // Dostępne środki na kredyt
        const availableForLoan = adjustedIncome - monthlyExpenses - costOfLiving - creditObligations;
        
        // Maksymalna rata kredytu (zgodnie z wskaźnikiem DSTI)
        const maxMonthlyPayment = Math.min(
            availableForLoan,
            (adjustedIncome * dstiRatio / 100) - monthlyExpenses - costOfLiving - creditObligations
        );
        
        // Debug logging
        console.log('Credit Score Calculation Debug:', {
            totalNetIncome,
            employmentType,
            employmentWeight,
            adjustedIncome,
            costOfLiving,
            creditObligations,
            availableForLoan,
            maxMonthlyPayment,
            dstiRatio
        });
        
        // Obliczenie maksymalnej kwoty kredytu
        const stressTestRate = interestRate + INTEREST_RATE_STRESS_BUFFER;
        let maxLoanAmount = 0;
        let creditCapacity = 0;
        
        if (maxMonthlyPayment > 0) {
            maxLoanAmount = calculateMaxLoanAmount(maxMonthlyPayment, stressTestRate, loanTerm, installmentType);
            creditCapacity = maxMonthlyPayment;
        }
        
        // Sprawdzenie ograniczeń maksymalnego okresu kredytowania
        const effectiveLoanTerm = Math.min(loanTerm, MAX_LOAN_TERM_YEARS);
        if (effectiveLoanTerm < loanTerm) {
            maxLoanAmount = calculateMaxLoanAmount(maxMonthlyPayment, stressTestRate, effectiveLoanTerm, installmentType);
        }
        
        // Obliczenie ile zostanie po spłacie kredytu
        const remainingAfterLoan = adjustedIncome - monthlyExpenses - costOfLiving - creditObligations - maxMonthlyPayment;
        
        // Przygotowanie danych do wykresu
        const chartData = prepareCreditScoreChartData(
            monthlyExpenses,
            otherLoans,
            creditObligations - otherLoans, // Tylko karty kredytowe i overdrafty
            costOfLiving,
            maxMonthlyPayment,
            Math.max(0, remainingAfterLoan)
        );
        
        const response = {
            creditCapacity: Math.max(0, Math.round(creditCapacity)),
            maxLoanAmount: Math.max(0, Math.round(maxLoanAmount)),
            chartData: chartData,
            details: {
                totalNetIncome: totalNetIncome,
                adjustedIncome: adjustedIncome,
                costOfLiving: costOfLiving,
                creditObligations: creditObligations,
                availableForLoan: Math.max(0, availableForLoan),
                stressTestRate: stressTestRate,
                employmentWeight: employmentWeight
            }
        };
        
        return NextResponse.json(response);
        
    } catch (error) {
        console.error('Error calculating credit score:', error);
        return NextResponse.json(
            { error: "Błąd podczas obliczeń zdolności kredytowej" },
            { status: 500 }
        );
    }
}

// ===== OBSŁUGA KALKULATORA ZAKUPU NIERUCHOMOŚCI =====
function handlePurchaseCalculation(input: PurchaseInput) {
    try {
        // Inicjalizacja wyników
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: any = {
            pccTax: null,
            notaryFee: null,
            bankCommissionAmount: null,
            courtFees: null,
            agencyCommissionAmount: null,
            schedule: null,
            firstInstallment: null,
            lastInstallment: null,
            totalRepayment: null,
            totalInterest: null,
            overpaymentResults: null,
            simulationResults: null,
            baseSchedule: null,
        };

        // 1. Walidacja i rzutowanie typów
        const propertyValue = parseFloat(input.propertyValue.toString()) || 0;
        const loanAmount = parseFloat(input.loanAmount.toString()) || 0;
        const loanTerm = parseInt(input.loanTerm.toString()) || 0;

        // 2. Obliczenie kosztów początkowych
        if (propertyValue > 0) {
            // Obsługa własnej opłaty notarialnej
            if (input.notaryFeeType === 'custom' && input.customNotaryFee) {
                results.notaryFee = parseFloat(input.customNotaryFee.toString());
            } else {
                results.notaryFee = calculateNotaryFee(propertyValue);
            }
            
            // Obsługa podatku PCC z możliwością zwolnienia
            const pccTaxRate = parseFloat((input.pccTaxRate?.toString() || '2')) / 100 || 0.02;
            results.pccTax = propertyValue * pccTaxRate;
            
            const agencyCommission = parseFloat((input.agencyCommission?.toString() || '0')) / 100 || 0;
            results.agencyCommissionAmount = propertyValue * agencyCommission;
            
            results.courtFees = 200 + 150; // Opłata za wpis hipoteki + opłata za wpis do księgi wieczystej
        }
        
        if (loanAmount > 0) {
            const bankCommission = parseFloat((input.bankCommission?.toString() || '0')) / 100 || 0;
            results.bankCommissionAmount = loanAmount * bankCommission;
        }

        // 3. Generowanie harmonogramu i powiązanych obliczeń
        if (loanAmount > 0 && loanTerm > 0) {
            const bankMargin = parseFloat(input.bankMargin.toString()) || 0;
            const referenceRate = parseFloat(input.referenceRate.toString()) || 0;
            const installmentType = input.installmentType || 'equal';

            // Logika symulacji
            const useSimulationRate = input.useSimulationRate === true;
            const rateChange = parseFloat((input.referenceRateChange?.toString() || '0')) || 0;
            
            let effectiveReferenceRate = referenceRate;
            if (useSimulationRate && rateChange !== 0) {
                effectiveReferenceRate += rateChange;
            }

            const bridgeMonths = parseInt((input.bridgeInsuranceMonths?.toString() || '0')) || 0;
            const bridgeIncrease = parseFloat((input.bridgeInsuranceMarginIncrease?.toString() || '0')) || 0;
            
            // Podstawowy harmonogram (bez nadpłat)
            const baseSchedule = generateSchedule(loanAmount, loanTerm, bankMargin, effectiveReferenceRate, installmentType, bridgeMonths, bridgeIncrease, { amount: 0 });
            const baseTotalInterest = baseSchedule.reduce((sum, payment) => sum + payment.interestPart, 0);

            // Harmonogram z nadpłatami
            const overpayment = {
                amount: parseFloat((input.overpaymentAmount?.toString() || '0')) || 0,
                frequency: input.overpaymentFrequency || 'one-time',
                startMonth: parseInt((input.overpaymentStartMonth?.toString() || '1')) || 1,
                target: input.overpaymentTarget || 'shorten-period',
                interval: parseInt((input.overpaymentInterval?.toString() || '1')) || 1,
            };

            const finalSchedule = (overpayment.amount > 0) ? 
                generateSchedule(loanAmount, loanTerm, bankMargin, effectiveReferenceRate, installmentType, bridgeMonths, bridgeIncrease, overpayment) : 
                baseSchedule;
            
            results.schedule = finalSchedule;
            results.baseSchedule = (overpayment.amount > 0) ? baseSchedule : null;

            if (finalSchedule.length > 0) {
                const overpaymentTotalInterest = finalSchedule.reduce((sum, payment) => sum + payment.interestPart, 0);
                results.totalInterest = overpaymentTotalInterest;
                results.totalRepayment = loanAmount + overpaymentTotalInterest;
                results.firstInstallment = finalSchedule[0].totalPayment;
                results.lastInstallment = finalSchedule[finalSchedule.length - 1].totalPayment;
                
                if (overpayment.amount > 0) {
                    results.overpaymentResults = {
                        savedInterest: baseTotalInterest - overpaymentTotalInterest,
                        newLoanTerm: finalSchedule.length
                    };
                }
            }

            // 4. Symulacja zmiany stóp procentowych (tylko jeśli NIE jest głównym wynikiem)
            if (!useSimulationRate && rateChange !== 0) {
                const newRefRate = referenceRate + rateChange;
                if (bankMargin + newRefRate > 0) {
                    const simulationSchedule = generateSchedule(loanAmount, loanTerm, bankMargin, newRefRate, installmentType, bridgeMonths, bridgeIncrease, { amount: 0 });
                    if (simulationSchedule.length > 0) {
                        results.simulationResults = {
                            newFirstInstallment: simulationSchedule[0].totalPayment,
                            newLastInstallment: simulationSchedule[simulationSchedule.length - 1].totalPayment
                        };
                    }
                }
            }
        }

        // Przygotowanie i odesłanie odpowiedzi
        const response = {
            message: "Obliczenia wykonane pomyślnie.",
            calculationResults: results
        };

        return NextResponse.json(response);
        
    } catch (error) {
        console.error('Error calculating purchase:', error);
        return NextResponse.json(
            { error: "Błąd podczas obliczeń zakupu" },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}