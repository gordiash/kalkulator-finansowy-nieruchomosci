import { NextRequest, NextResponse } from 'next/server';

// ===== WSPÓLNE STAŁE I KONFIGURACJA =====
const INTEREST_RATE_STRESS_BUFFER = 2.5; // Bufor 2.5 p.p. do stress testu stóp procentowych
const MAX_LOAN_TERM_YEARS = 30; // Maksymalny okres kredytowania do obliczeń (w latach)
const LIVING_COST_INCOME_FACTOR = 0.10; // 10% dochodu dodawane do bazowych kosztów życia
const AVG_SALARY_THRESHOLD = 7500; // Próg średniego wynagrodzenia w PLN
const HIGH_SALARY_THRESHOLD = 12000; // Próg wysokiego wynagrodzenia w PLN

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
    
    if (adminFees > 0) {
        data.push({ name: 'Czynsz administracyjny', value: adminFees });
    }
    if (utilities > 0) {
        data.push({ name: 'Media', value: utilities });
    }
    if (insurance > 0) {
        data.push({ name: 'Ubezpieczenie', value: insurance / 12 });
    }
    if (otherCosts > 0) {
        data.push({ name: 'Inne koszty', value: otherCosts });
    }
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
        'umowa_o_prace': 1.0,        // Najlepsza stabilność
        'umowa_zlecenie': 0.8,       // Średnia stabilność
        'dzialalnosc_gospodarcza': 0.7, // Niższa stabilność
        'umowa_o_dzielo': 0.6,       // Najniższa stabilność
        'emeryt_rencista': 0.9       // Wysoka stabilność dla emerytów/rencistów
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
    return [
        { name: 'Wydatki miesięczne', value: expenses, fill: '#FF8042' },
        { name: 'Inne kredyty', value: loans, fill: '#FFBB28' },
        { name: 'Zobowiązania kredytowe', value: creditObligations, fill: '#FF4444' },
        { name: 'Koszty utrzymania', value: costOfLiving, fill: '#82ca9d' },
        { name: 'Maks. rata kredytu', value: maxMonthlyPayment, fill: '#0088FE' },
        { name: 'Pozostaje po kredycie', value: remainingAfterLoan, fill: '#00C49F' }
    ];
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
): any[] {
    const schedule = [];
    const monthlyRate = (margin + refRate) / 100 / 12;
    const totalMonths = years * 12;
    let remainingPrincipal = principal;
    let monthNumber = 1;
    
    // Logika nadpłat
    const overpaymentAmount = overpayment.amount || 0;
    const overpaymentFrequency = overpayment.frequency || 'one-time';
    const overpaymentStartMonth = overpayment.startMonth || 1;
    const overpaymentTarget = overpayment.target || 'shorten-period';
    const overpaymentInterval = overpayment.interval || 1;
    
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

// ===== GŁÓWNA FUNKCJA OBSŁUGI REQUESTÓW =====

export async function POST(request: NextRequest) {
    try {
        const input = await request.json();
        
        // Sprawdzenie typu kalkulacji
        const calculationType = input.calculationType;
        
        if (calculationType === 'rental') {
            return handleRentalCalculation(input);
        } else if (calculationType === 'credit-score') {
            return handleCreditScoreCalculation(input);
        } else {
            return handlePurchaseCalculation(input);
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
function handleRentalCalculation(input: any) {
    try {
        const purchasePrice = parseFloat(input.purchasePrice) || 0;
        const monthlyRent = parseFloat(input.monthlyRent) || 0;
        const downPayment = parseFloat(input.downPayment) || 0;
        const loanAmount = purchasePrice - downPayment;
        
        // Koszty miesięczne
        const adminFees = parseFloat(input.adminFees) || 0;
        const utilities = parseFloat(input.utilities) || 0;
        const insurance = parseFloat(input.insurance) || 0;
        const otherCosts = parseFloat(input.otherCosts) || 0;
        const managementFee = parseFloat(input.managementFee) || 0;
        const vacancyRate = parseFloat(input.vacancyRate) || 0;
        
        // Parametry kredytu
        const interestRate = parseFloat(input.interestRate) || 0;
        const loanYears = parseInt(input.loanYears) || 25;
        
        // Obliczenia podstawowe
        const annualRentIncome = monthlyRent * 12;
        const effectiveRentalMonths = 12 * (1 - vacancyRate / 100);
        const vacancyMonths = 12 - effectiveRentalMonths;
        const netIncome = monthlyRent * effectiveRentalMonths;
        
        // Koszty roczne
        const annualCosts = adminFees * 12 + utilities * 12 + insurance + otherCosts * 12 + managementFee * 12;
        const monthCosts = adminFees + utilities + otherCosts + managementFee;
        
        // ROI podstawowe
        const actualInvestment = downPayment + (parseFloat(input.renovationCosts) || 0) + (parseFloat(input.otherInitialCosts) || 0);
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
        const propertyAppreciation = parseFloat(input.propertyAppreciation) || 3;
        const rentGrowth = parseFloat(input.rentGrowth) || 2;
        
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
function handleCreditScoreCalculation(input: any) {
    try {
        // Walidacja i rzutowanie danych wejściowych
        const monthlyIncome = parseFloat(input.monthlyIncome) || 0;
        const monthlyExpenses = parseFloat(input.monthlyExpenses) || 0;
        const otherLoans = parseFloat(input.otherLoans) || 0;
        const householdSize = parseInt(input.householdSize) || 1;
        const loanTerm = parseInt(input.loanTerm) || 25;
        const interestRate = parseFloat(input.interestRate) || 5.0;
        const installmentType = input.installmentType || 'equal';
        const secondBorrowerIncome = parseFloat(input.secondBorrowerIncome) || 0;
        const employmentType = input.employmentType || 'umowa_o_prace';
        const creditCardLimits = parseFloat(input.creditCardLimits) || 0;
        const accountOverdrafts = parseFloat(input.accountOverdrafts) || 0;
        const dstiRatio = parseFloat(input.dstiRatio) || 50;
        
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
            (adjustedIncome * dstiRatio / 100) - creditObligations
        );
        
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
function handlePurchaseCalculation(input: any) {
    try {
        // Inicjalizacja wyników
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
        const propertyValue = parseFloat(input.propertyValue) || 0;
        const loanAmount = parseFloat(input.loanAmount) || 0;
        const loanTerm = parseInt(input.loanTerm) || 0;
        const marketType = input.marketType || 'secondary';

        // 2. Obliczenie kosztów początkowych
        if (propertyValue > 0) {
            // Obsługa własnej opłaty notarialnej
            if (input.notaryFeeType === 'custom' && input.customNotaryFee) {
                results.notaryFee = parseFloat(input.customNotaryFee);
            } else {
                results.notaryFee = calculateNotaryFee(propertyValue);
            }
            
            // Obsługa podatku PCC z możliwością zwolnienia
            const pccTaxRate = parseFloat(input.pccTaxRate) / 100 || 0.02;
            results.pccTax = propertyValue * pccTaxRate;
            
            const agencyCommission = parseFloat(input.agencyCommission) / 100 || 0;
            results.agencyCommissionAmount = propertyValue * agencyCommission;
            
            results.courtFees = 200 + 150; // Opłata za wpis hipoteki + opłata za wpis do księgi wieczystej
        }
        
        if (loanAmount > 0) {
            const bankCommission = parseFloat(input.bankCommission) / 100 || 0;
            results.bankCommissionAmount = loanAmount * bankCommission;
        }

        // 3. Generowanie harmonogramu i powiązanych obliczeń
        if (loanAmount > 0 && loanTerm > 0) {
            const bankMargin = parseFloat(input.bankMargin) || 0;
            const referenceRate = parseFloat(input.referenceRate) || 0;
            const installmentType = input.installmentType || 'equal';

            // Logika symulacji
            const useSimulationRate = input.useSimulationRate === true;
            const rateChange = parseFloat(input.referenceRateChange) || 0;
            
            let effectiveReferenceRate = referenceRate;
            if (useSimulationRate && rateChange !== 0) {
                effectiveReferenceRate += rateChange;
            }

            const bridgeMonths = parseInt(input.bridgeInsuranceMonths) || 0;
            const bridgeIncrease = parseFloat(input.bridgeInsuranceMarginIncrease) || 0;
            
            // Podstawowy harmonogram (bez nadpłat)
            const baseSchedule = generateSchedule(loanAmount, loanTerm, bankMargin, effectiveReferenceRate, installmentType, bridgeMonths, bridgeIncrease, { amount: 0 });
            const baseTotalInterest = baseSchedule.reduce((sum, payment) => sum + payment.interestPart, 0);

            // Harmonogram z nadpłatami
            const overpayment = {
                amount: parseFloat(input.overpaymentAmount) || 0,
                frequency: input.overpaymentFrequency || 'one-time',
                startMonth: parseInt(input.overpaymentStartMonth) || 1,
                target: input.overpaymentTarget || 'shorten-period',
                interval: parseInt(input.overpaymentInterval) || 1,
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