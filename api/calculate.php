<?php
// Tłumienie wyświetlania błędów, aby nie psuć odpowiedzi JSON
ini_set('display_errors', 0);
error_reporting(0);

// UWAGA: Przed wdrożeniem na produkcję, zmień poniższy adres na domenę Twojej aplikacji frontendowej!
$allowed_origin = 'http://localhost:8000'; // Przykładowo: 'https://www.kalkulatory-nieruchomosci.pl'
header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Obsługa zapytania wstępnego (preflight request) CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

/**
 * Oblicza szacunkową wysokość taksy notarialnej na podstawie wartości nieruchomości.
 * @param float $value Wartość nieruchomości.
 * @return float Szacunkowa taksa notarialna z VAT.
 */
function calculateNotaryFee(float $value): float {
    $fee = 0.0;
    if ($value <= 3000) {
        $fee = 100;
    } else if ($value <= 10000) {
        $fee = 100 + ($value - 3000) * 0.03;
    } else if ($value <= 30000) {
        $fee = 310 + ($value - 10000) * 0.02;
    } else if ($value <= 60000) {
        $fee = 710 + ($value - 30000) * 0.01;
    } else if ($value <= 1000000) {
        $fee = 1010 + ($value - 60000) * 0.004;
    } else if ($value <= 2000000) {
        $fee = 4770 + ($value - 1000000) * 0.002;
    } else {
        $fee = 6770 + ($value - 2000000) * 0.0025;
        if ($fee > 10000) {
            $fee = 10000;
        }
    }
    return $fee * 1.23;
}

/**
 * Oblicza ratę annuitetową dla kalkulatora wynajmu
 * @param float $loanAmount Kwota kredytu
 * @param float $annualRate Oprocentowanie roczne (%)
 * @param int $years Okres kredytowania w latach
 * @return float Miesięczna rata kredytu
 */
function calculateLoanPaymentRental($loanAmount, $annualRate, $years) {
    $monthlyRate = $annualRate / 100 / 12;
    $numberOfPayments = $years * 12;
    
    if ($monthlyRate === 0) {
        return $loanAmount / $numberOfPayments;
    }
    
    $payment = $loanAmount * ($monthlyRate * pow(1 + $monthlyRate, $numberOfPayments)) / 
               (pow(1 + $monthlyRate, $numberOfPayments) - 1);
    
    return $payment;
}

/**
 * Oblicza podatek na podstawie typu opodatkowania
 * @param float $income Przychód roczny
 * @param float $costs Koszty roczne
 * @param float $interestAmount Odsetki od kredytu roczne
 * @param string $taxationType Typ opodatkowania ('ryczalt' lub 'skala')
 * @param string $taxScale Skala podatkowa ('12' lub '32')
 * @return float Kwota podatku
 */
function calculateTaxRental($income, $costs, $interestAmount, $taxationType, $taxScale = '12') {
    if ($taxationType === 'ryczalt') {
        // Ryczałt od przychodu
        if ($income <= 100000) {
            return $income * 0.085; // 8.5%
        } else {
            return $income * 0.125; // 12.5%
        }
    } else {
        // Skala podatkowa od dochodu
        $taxableIncome = $income - $costs - $interestAmount;
        if ($taxableIncome <= 0) return 0;
        
        $rate = floatval($taxScale) / 100;
        return $taxableIncome * $rate;
    }
}

/**
 * Przygotowuje dane dla wykresu kosztów miesięcznych
 */
function prepareCostBreakdownData($adminFees, $utilities, $insurance, $otherCosts, $monthlyLoanPayment) {
    $data = [];
    
    if ($adminFees > 0) {
        $data[] = ['name' => 'Czynsz administracyjny', 'value' => $adminFees];
    }
    if ($utilities > 0) {
        $data[] = ['name' => 'Media', 'value' => $utilities];
    }
    if ($insurance > 0) {
        $data[] = ['name' => 'Ubezpieczenie', 'value' => $insurance / 12];
    }
    if ($otherCosts > 0) {
        $data[] = ['name' => 'Inne koszty', 'value' => $otherCosts];
    }
    if ($monthlyLoanPayment > 0) {
        $data[] = ['name' => 'Rata kredytu', 'value' => $monthlyLoanPayment];
    }
    
    return $data;
}

/**
 * Przygotowuje dane dla wykresu przychody vs koszty
 */
function prepareIncomeVsCostsData($annualIncome, $adminFees, $utilities, $insurance, $otherCosts, $monthlyLoanPayment, $taxAmount) {
    $annualCosts = $adminFees * 12 + $utilities * 12 + $insurance + $otherCosts * 12;
    $loanPayments = $monthlyLoanPayment * 12;
    $netIncome = $annualIncome - $annualCosts - $loanPayments - $taxAmount;

    return [
        ['name' => 'Przychód roczny', 'Kwota' => $annualIncome, 'fill' => '#00C49F'],
        ['name' => 'Koszty operacyjne', 'Kwota' => $annualCosts, 'fill' => '#FF8042'],
        ['name' => 'Raty kredytu', 'Kwota' => $loanPayments, 'fill' => '#FFBB28'],
        ['name' => 'Podatki', 'Kwota' => $taxAmount, 'fill' => '#FF4444'],
        ['name' => 'Dochód netto', 'Kwota' => $netIncome, 'fill' => $netIncome >= 0 ? '#0088FE' : '#FF0000']
    ];
}

/**
 * Generuje projekcję wieloletnią
 */
function generateProjectionRental($purchasePrice, $monthlyRent, $loanAmount, $loanYears, $netCashFlow, $propertyAppreciation, $rentGrowth) {
    $appreciationRate = $propertyAppreciation / 100;
    $rentGrowthRate = $rentGrowth / 100;
    
    $projection = [];
    $remainingLoan = $loanAmount;
    
    for ($year = 1; $year <= 10; $year++) {
        $propertyValue = $purchasePrice * pow(1 + $appreciationRate, $year);
        $yearlyRent = $monthlyRent * pow(1 + $rentGrowthRate, $year);
        
        // Spłata kapitału kredytu w danym roku (uproszczone)
        $yearlyPrincipalPayment = $loanAmount > 0 ? $loanAmount / $loanYears : 0;
        $remainingLoan = max(0, $remainingLoan - $yearlyPrincipalPayment);
        
        $equity = $propertyValue - $remainingLoan;
        $yearlyNetCashFlow = $netCashFlow * pow(1 + $rentGrowthRate, $year - 1);
        
        $projection[] = [
            'year' => $year,
            'propertyValue' => round($propertyValue),
            'remainingLoan' => round($remainingLoan),
            'equity' => round($equity),
            'yearlyRent' => round($yearlyRent * 12),
            'cashFlow' => round($yearlyNetCashFlow)
        ];
    }
    
    return $projection;
}

/**
 * ===== FUNKCJE KALKULATORA ZDOLNOŚCI KREDYTOWEJ =====
 */

/**
 * Oblicza realistyczne koszty utrzymania na podstawie liczby osób
 * @param int $people Liczba osób w gospodarstwie domowym
 * @return float Miesięczne koszty utrzymania
 */
function calculateLivingCosts($people) {
    if ($people === 1) return 1300;
    if ($people === 2) return 2200;
    if ($people === 3) return 3000;
    if ($people === 4) return 3800;
    return 3800 + ($people - 4) * 700; // każda kolejna osoba +700 zł
}

/**
 * Oblicza wagę dla typu umowy o pracę
 * @param string $employmentType Typ umowy
 * @return float Waga (1.0 dla UoP, 0.8 dla B2B, 0.7 dla umów zleceń)
 */
function getEmploymentWeight($employmentType) {
    switch ($employmentType) {
        case 'employment':
            return 1.0;
        case 'b2b':
            return 0.8;
        case 'contract':
            return 0.7;
        default:
            return 1.0;
    }
}

/**
 * Oblicza maksymalną kwotę kredytu na podstawie raty
 * @param float $maxMonthlyPayment Maksymalna miesięczna rata
 * @param float $interestRate Oprocentowanie roczne (%)
 * @param int $termYears Okres kredytowania w latach
 * @param string $installmentType Typ rat ('equal' lub 'decreasing')
 * @return float Maksymalna kwota kredytu
 */
function calculateMaxLoanAmount($maxMonthlyPayment, $interestRate, $termYears, $installmentType) {
    $r = $interestRate / 100 / 12; // Miesięczne oprocentowanie
    $n = $termYears * 12; // Całkowita liczba rat
    
    if ($installmentType === 'equal') {
        // Raty równe (annuitetowe)
        if ($r > 0) {
            return $maxMonthlyPayment * ((pow(1 + $r, $n) - 1) / ($r * pow(1 + $r, $n)));
        } else {
            return $maxMonthlyPayment * $n; // Przypadek bez odsetek
        }
    } else {
        // Raty malejące - uproszczone obliczenie
        if ($r > 0) {
            return $maxMonthlyPayment * $n / (1 + ($r * $n / 2));
        } else {
            return $maxMonthlyPayment * $n;
        }
    }
}

/**
 * Przygotowuje dane dla wykresu struktury dochodów i wydatków
 * @param array $data Dane wejściowe
 * @return array Dane dla wykresu kołowego
 */
function prepareCreditScoreChartData($expenses, $loans, $creditObligations, $costOfLiving, $maxMonthlyPayment, $remainingAfterLoan) {
    $chartData = [];
    
    if ($expenses > 0) {
        $chartData[] = ['name' => 'Stałe opłaty', 'value' => $expenses, 'fill' => '#EF4444'];
    }
    if ($loans > 0) {
        $chartData[] = ['name' => 'Inne kredyty', 'value' => $loans, 'fill' => '#F97316'];
    }
    if ($creditObligations > 0) {
        $chartData[] = ['name' => 'Zobowiązania kredytowe', 'value' => $creditObligations, 'fill' => '#F59E0B'];
    }
    if ($costOfLiving > 0) {
        $chartData[] = ['name' => 'Koszty utrzymania', 'value' => $costOfLiving, 'fill' => '#EAB308'];
    }
    if ($maxMonthlyPayment > 0) {
        $chartData[] = ['name' => 'Dostępna rata kredytu', 'value' => $maxMonthlyPayment, 'fill' => '#22C55E'];
    }
    if ($remainingAfterLoan > 0) {
        $chartData[] = ['name' => 'Pozostałe środki', 'value' => $remainingAfterLoan, 'fill' => '#3B82F6'];
    }
    
    return $chartData;
}

/**
 * Generuje harmonogram spłat kredytu.
 * @param float $principal Kwota kredytu.
 * @param int $years Okres kredytowania w latach.
 * @param float $margin Marża banku.
 * @param float $refRate Wskaźnik referencyjny.
 * @param string $type Rodzaj rat ('equal' lub 'decreasing').
 * @param int $bridgeMonths Liczba miesięcy ubezpieczenia pomostowego.
 * @param float $bridgeIncrease Podwyższenie marży w okresie ubezpieczenia.
 * @param array $overpayment Dane dotyczące nadpłaty.
 * @return array Harmonogram spłat.
 */
function generateSchedule(float $principal, int $years, float $margin, float $refRate, string $type, int $bridgeMonths, float $bridgeIncrease, array $overpayment): array {
    // Uzupełnienie domyślnych wartości dla nadpłaty, aby uniknąć błędów "Undefined Index"
    $overpayment = array_merge([
        'amount' => 0.0,
        'frequency' => 'one-time',
        'startMonth' => 1,
        'target' => 'shorten-period',
        'interval' => 1,
    ], $overpayment);

    $schedule = [];
    $originalN = $years * 12;
    $n = $originalN;
    
    $normalRate = ($margin + $refRate) / 100 / 12;
    $bridgeRate = ($margin + $refRate + $bridgeIncrease) / 100 / 12;

    if (!($principal > 0 && $years > 0 && ($normalRate > 0 || $bridgeRate > 0))) {
        return [];
    }

    $remainingBalance = $principal;
    $month = 1;
    $payment = null;

    while ($remainingBalance > 0 && $month <= $originalN * 2) { // Zabezpieczenie przed nieskończoną pętlą
        $currentRate = ($month <= $bridgeMonths) ? $bridgeRate : $normalRate;
        
        $interestPart = $remainingBalance * $currentRate;
        $principalPart = 0;

        // Obliczenie zaplanowanej części kapitałowej
        if ($type === 'equal') {
                    $opAmount = (float)$overpayment['amount'];
        $interval = isset($overpayment['interval']) ? (int)$overpayment['interval'] : 1;
        $interval = max(1, $interval); // Minimum interwał to 1
        
        $isOverpaymentMonth = $opAmount > 0 && $month >= (int)$overpayment['startMonth'] &&
            (($overpayment['frequency'] === 'one-time' && $month === (int)$overpayment['startMonth']) ||
             ($overpayment['frequency'] === 'monthly' && ($month - (int)$overpayment['startMonth']) % $interval === 0) ||
             ($overpayment['frequency'] === 'yearly' && ($month - (int)$overpayment['startMonth']) % ($interval * 12) === 0));

            $needsRecalculation = is_null($payment) || 
                                  ($month === $bridgeMonths + 1 && $bridgeMonths > 0 && $bridgeIncrease > 0) ||
                                  ($isOverpaymentMonth && $overpayment['target'] === 'lower-installment');

            if ($needsRecalculation) {
                 $remainingN = $n - $month + 1;
                 if ($remainingN > 0 && (pow(1 + $currentRate, $remainingN) - 1) > 0) {
                     $payment = ($remainingBalance * $currentRate * pow(1 + $currentRate, $remainingN)) / (pow(1 + $currentRate, $remainingN) - 1);
                 } else {
                     $payment = $remainingBalance + $interestPart;
                 }
            }
            $principalPart = $payment - $interestPart;
        } else { // decreasing
            $principalPart = $principal / $originalN;
        }

        $opAmount = (float)$overpayment['amount'];
        $interval = isset($overpayment['interval']) ? (int)$overpayment['interval'] : 1;
        $interval = max(1, $interval); // Minimum interwał to 1
        
        $isOverpaymentMonth = $opAmount > 0 && $month >= (int)$overpayment['startMonth'] && 
            (($overpayment['frequency'] === 'one-time' && $month === (int)$overpayment['startMonth']) ||
             ($overpayment['frequency'] === 'monthly' && ($month - (int)$overpayment['startMonth']) % $interval === 0) ||
             ($overpayment['frequency'] === 'yearly' && ($month - (int)$overpayment['startMonth']) % ($interval * 12) === 0));
        
        $currentOverpayment = $isOverpaymentMonth ? $opAmount : 0;
        
        // --- NOWA, POPRAWIONA LOGIKA OBSŁUGI PŁATNOŚCI ---
        
        $totalPayment = $principalPart + $interestPart + $currentOverpayment;
        
        // Jeśli pozostałe saldo jest mniejsze niż standardowa płatność, dostosuj płatność
        if ($remainingBalance + 0.001 < $principalPart) { // +0.001 dla uniknięcia błędów zaokrągleń
            $actualPrincipalPart = $remainingBalance;
            $actualOverpayment = 0; // nie ma miejsca na nadpłatę
            $totalPayment = $actualPrincipalPart + $interestPart;
        } else {
            $actualPrincipalPart = $principalPart;
            $actualOverpayment = $currentOverpayment;
        }

        // Łączna kwota, o którą zmniejszy się kapitał
        $totalPrincipalPaid = $actualPrincipalPart + $actualOverpayment;
        
        // Aktualizacja salda
        $remainingBalance -= $totalPrincipalPaid;
        
        if ($overpayment['target'] === 'shorten-period' && $remainingBalance > 0) {
             $n = $month + floor($remainingBalance / ($principal / $originalN));
        }

        $schedule[] = [
            'month' => $month,
            'principalPart' => round($actualPrincipalPart, 2),
            'interestPart' => round($interestPart, 2),
            'totalPayment' => round($totalPayment, 2),
            'overpayment' => round($actualOverpayment, 2),
            'remainingBalance' => round($remainingBalance, 2)
        ];

        if ($remainingBalance < 0.01) {
            break;
        }

        $month++;
    }

    return $schedule;
}

// Odczytanie danych wejściowych z ciała żądania
$input = json_decode(file_get_contents('php://input'), true);

// Walidacja danych (prosty przykład)
if (empty($input)) {
    http_response_code(400);
    echo json_encode(["message" => "Brak danych wejsciowych."]);
    exit();
}

// Sprawdzanie typu kalkulacji
$isCreditScoreCalculator = isset($input['calculationType']) && $input['calculationType'] === 'credit-score';
$isRentalCalculator = isset($input['monthlyRent']) || isset($input['purchasePrice']);

if ($isCreditScoreCalculator) {
    // ===== KALKULATOR ZDOLNOŚCI KREDYTOWEJ =====
    try {
        // Walidacja podstawowych danych
        if (!isset($input['monthlyIncome']) || $input['monthlyIncome'] <= 0) {
            throw new Exception('Nieprawidłowy miesięczny dochód');
        }
        
        // Pobieranie danych wejściowych
        $monthlyIncome = floatval($input['monthlyIncome']);
        $monthlyExpenses = isset($input['monthlyExpenses']) ? floatval($input['monthlyExpenses']) : 0;
        $otherLoans = isset($input['otherLoans']) ? floatval($input['otherLoans']) : 0;
        $householdSize = isset($input['householdSize']) ? intval($input['householdSize']) : 1;
        
        // Parametry kredytu
        $loanTerm = isset($input['loanTerm']) ? intval($input['loanTerm']) : 30;
        $interestRate = isset($input['interestRate']) ? floatval($input['interestRate']) : 7.5;
        $installmentType = isset($input['installmentType']) ? $input['installmentType'] : 'equal';
        
        // Dodatkowe pola
        $secondBorrowerIncome = isset($input['secondBorrowerIncome']) ? floatval($input['secondBorrowerIncome']) : 0;
        $employmentType = isset($input['employmentType']) ? $input['employmentType'] : 'employment';
        $creditCardLimits = isset($input['creditCardLimits']) ? floatval($input['creditCardLimits']) : 0;
        $accountOverdrafts = isset($input['accountOverdrafts']) ? floatval($input['accountOverdrafts']) : 0;
        $dstiRatio = isset($input['dstiRatio']) ? floatval($input['dstiRatio']) : 50;
        
        // Obliczenia
        $employmentWeight = getEmploymentWeight($employmentType);
        $totalIncome = ($monthlyIncome * $employmentWeight) + $secondBorrowerIncome;
        $creditObligations = ($creditCardLimits + $accountOverdrafts) * 0.03;
        $costOfLiving = calculateLivingCosts($householdSize);
        
        // Maksymalna możliwa rata na podstawie DSTI
        $maxRateFromDSTI = $totalIncome * ($dstiRatio / 100);
        $availableForLoan = $maxRateFromDSTI - $otherLoans;
        
        // Sprawdzenie czy rata jest możliwa do sfinansowania
        $totalNecessaryExpenses = $monthlyExpenses + $costOfLiving + $creditObligations + $otherLoans;
        $remainingIncome = $totalIncome - $totalNecessaryExpenses;
        
        if ($availableForLoan > 0 && $remainingIncome > 0) {
            $maxMonthlyPayment = min($availableForLoan, $remainingIncome * 0.8); // Margines bezpieczeństwa
            $maxLoanAmount = calculateMaxLoanAmount($maxMonthlyPayment, $interestRate, $loanTerm, $installmentType);
            
            // Przygotowanie danych dla wykresu
            $remainingAfterLoan = $totalIncome - $monthlyExpenses - $otherLoans - $creditObligations - $costOfLiving - $maxMonthlyPayment;
            $chartData = prepareCreditScoreChartData(
                $monthlyExpenses, 
                $otherLoans, 
                $creditObligations, 
                $costOfLiving, 
                $maxMonthlyPayment, 
                max(0, $remainingAfterLoan)
            );
            
            $response = [
                'creditCapacity' => round($maxMonthlyPayment, 2),
                'maxLoanAmount' => round($maxLoanAmount),
                'chartData' => $chartData,
                'totalIncome' => round($totalIncome, 2),
                'availableForLoan' => round($availableForLoan, 2),
                'dstiUsed' => round(($maxMonthlyPayment + $otherLoans) / $totalIncome * 100, 2)
            ];
        } else {
            $response = [
                'creditCapacity' => 0,
                'maxLoanAmount' => 0,
                'chartData' => [],
                'totalIncome' => round($totalIncome, 2),
                'availableForLoan' => 0,
                'dstiUsed' => 0
            ];
        }
        
        http_response_code(200);
        echo json_encode($response);
        exit();
        
    } catch (Exception $e) {
        error_log('Error calculating credit score: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "Błąd podczas obliczeń zdolności kredytowej"]);
        exit();
    }
    
} else if ($isRentalCalculator) {
    // ===== KALKULATOR WYNAJMU =====
    try {
        // Walidacja podstawowych danych
        if (!isset($input['purchasePrice']) || !isset($input['monthlyRent']) || 
            $input['purchasePrice'] <= 0 || $input['monthlyRent'] <= 0) {
            throw new Exception('Nieprawidłowe dane wejściowe');
        }
        
        // Obliczenia podstawowe
        $vacancyMonths = isset($input['vacancyPeriod']) ? $input['vacancyPeriod'] : 1;
        $effectiveRentalMonths = 12 - $vacancyMonths;
        $annualRentIncome = $input['monthlyRent'] * $effectiveRentalMonths;
        
        // Koszty miesięczne
        $adminFees = isset($input['adminFees']) ? $input['adminFees'] : 0;
        $utilities = isset($input['utilities']) ? $input['utilities'] : 0;
        $insurance = isset($input['insurance']) ? $input['insurance'] : 0;
        $otherCosts = isset($input['otherCosts']) ? $input['otherCosts'] : 0;
        
        $monthCosts = $adminFees + $utilities + ($insurance / 12) + $otherCosts;
        $annualCosts = $monthCosts * 12;
        
        // Obliczenia dla kredytu
        $loanAmount = 0;
        $monthlyPayment = 0;
        $downPaymentAmount = 0;
        
        if (isset($input['downPayment']) && isset($input['interestRate']) && isset($input['loanYears'])) {
            if (isset($input['downPaymentType']) && $input['downPaymentType'] === 'percent') {
                $downPaymentAmount = ($input['purchasePrice'] * $input['downPayment']) / 100;
            } else {
                $downPaymentAmount = $input['downPayment'];
            }
            
            $loanAmount = $input['purchasePrice'] - $downPaymentAmount;
            
            if ($loanAmount > 0) {
                $monthlyPayment = calculateLoanPaymentRental($loanAmount, $input['interestRate'], $input['loanYears']);
            }
        } else {
            // Brak kredytu - 100% wkład własny
            $downPaymentAmount = $input['purchasePrice'];
        }
        
        $transactionCosts = isset($input['transactionCosts']) ? $input['transactionCosts'] : 0;
        $renovationCosts = isset($input['renovationCosts']) ? $input['renovationCosts'] : 0;
        
        $actualInvestment = $downPaymentAmount + $transactionCosts + $renovationCosts;
        $totalInvestment = $input['purchasePrice'] + $transactionCosts + $renovationCosts;
        $netIncome = $annualRentIncome - $annualCosts;
        $roi = ($netIncome / $totalInvestment) * 100;
        
        // Cash Flow i Cash-on-Cash Return
        $monthlyCashFlow = $input['monthlyRent'] - $monthCosts - $monthlyPayment;
        $annualCashFlow = $monthlyCashFlow * $effectiveRentalMonths - ($monthlyPayment * $vacancyMonths);
        $cashOnCashReturn = $actualInvestment > 0 ? ($annualCashFlow / $actualInvestment) * 100 : 0;
        
        // Obliczenia podatkowe
        $annualInterest = 0;
        if ($loanAmount > 0 && isset($input['interestRate'])) {
            // Uproszczone obliczenie - pierwszego roku odsetek
            $annualInterest = $loanAmount * ($input['interestRate'] / 100);
        }
        
        $taxationType = isset($input['taxationType']) ? $input['taxationType'] : 'ryczalt';
        $taxScale = isset($input['taxScale']) ? $input['taxScale'] : '12';
        $taxAmount = calculateTaxRental($annualRentIncome, $annualCosts, $annualInterest, $taxationType, $taxScale);
        
        // Wartości netto po podatkach
        $netAnnualCashFlow = $annualCashFlow - $taxAmount;
        $netCashOnCashReturn = $actualInvestment > 0 ? ($netAnnualCashFlow / $actualInvestment) * 100 : 0;
        
        // Przygotowanie danych do wykresów
        $costBreakdown = prepareCostBreakdownData($adminFees, $utilities, $insurance, $otherCosts, $monthlyPayment);
        $incomeVsCosts = prepareIncomeVsCostsData($annualRentIncome, $adminFees, $utilities, $insurance, $otherCosts, $monthlyPayment, $taxAmount);
        
        // Projekcja wieloletnia
        $propertyAppreciation = isset($input['propertyAppreciation']) ? $input['propertyAppreciation'] : 3;
        $rentGrowth = isset($input['rentGrowth']) ? $input['rentGrowth'] : 2;
        $loanYears = isset($input['loanYears']) ? $input['loanYears'] : 25;
        
        $projection = generateProjectionRental(
            $input['purchasePrice'],
            $input['monthlyRent'],
            $loanAmount,
            $loanYears,
            $netAnnualCashFlow,
            $propertyAppreciation,
            $rentGrowth
        );
        
        // Przygotowanie odpowiedzi
        $response = [
            'annualIncome' => $annualRentIncome,
            'netAnnualIncome' => $netIncome,
            'roi' => $roi,
            'taxAmount' => $taxAmount,
            'netCashFlow' => $netAnnualCashFlow,
            'netCocReturn' => $netCashOnCashReturn,
            'costBreakdown' => $costBreakdown,
            'incomeVsCosts' => $incomeVsCosts,
            'projection' => $projection
        ];
        
        // Dodaj dane kredytowe tylko jeśli istnieją
        if ($loanAmount > 0) {
            $response['loanAmount'] = $loanAmount;
            $response['monthlyLoanPayment'] = $monthlyPayment;
            $response['cashFlow'] = $annualCashFlow;
            $response['cocReturn'] = $cashOnCashReturn;
        }
        
        http_response_code(200);
        echo json_encode($response);
        exit();
        
    } catch (Exception $e) {
        error_log('Error calculating rental profitability: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "Błąd podczas obliczeń"]);
        exit();
    }
}

// --- Główna logika obliczeniowa ---
$results = [
    'pccTax' => null,
    'notaryFee' => null,
    'bankCommissionAmount' => null,
    'courtFees' => null,
    'agencyCommissionAmount' => null,
    'schedule' => null,
    'firstInstallment' => null,
    'lastInstallment' => null,
    'totalRepayment' => null,
    'totalInterest' => null,
    'overpaymentResults' => null,
    'simulationResults' => null,
    'baseSchedule' => null,
];

// 1. Walidacja i rzutowanie typów
$propertyValue = isset($input['propertyValue']) && is_numeric($input['propertyValue']) ? (float)$input['propertyValue'] : 0.0;
$loanAmount = isset($input['loanAmount']) && is_numeric($input['loanAmount']) ? (float)$input['loanAmount'] : 0.0;
$loanTerm = isset($input['loanTerm']) && is_numeric($input['loanTerm']) ? (int)$input['loanTerm'] : 0;
$marketType = $input['marketType'] ?? 'secondary';


// 2. Obliczenie kosztów początkowych
if ($propertyValue > 0) {
    // Obsługa własnej opłaty notarialnej
    if (isset($input['notaryFeeType']) && $input['notaryFeeType'] === 'custom' && isset($input['customNotaryFee']) && is_numeric($input['customNotaryFee'])) {
        $results['notaryFee'] = (float)$input['customNotaryFee'];
    } else {
        $results['notaryFee'] = calculateNotaryFee($propertyValue);
    }
    
    // Obsługa podatku PCC z możliwością zwolnienia
    $pccTaxRate = isset($input['pccTaxRate']) && is_numeric($input['pccTaxRate']) ? (float)$input['pccTaxRate'] / 100 : 0.02;
    $results['pccTax'] = $propertyValue * $pccTaxRate;
    
    $agencyCommission = isset($input['agencyCommission']) && is_numeric($input['agencyCommission']) ? (float)$input['agencyCommission'] / 100 : 0.0;
    $results['agencyCommissionAmount'] = $propertyValue * $agencyCommission;
    
    $results['courtFees'] = 200 + 150; // Opłata za wpis hipoteki + opłata za wpis do księgi wieczystej
}
if ($loanAmount > 0) {
    $bankCommission = isset($input['bankCommission']) && is_numeric($input['bankCommission']) ? (float)$input['bankCommission'] / 100 : 0.0;
    $results['bankCommissionAmount'] = $loanAmount * $bankCommission;
}

// 3. Generowanie harmonogramu i powiązanych obliczeń
if ($loanAmount > 0 && $loanTerm > 0) {
    $bankMargin = isset($input['bankMargin']) && is_numeric($input['bankMargin']) ? (float)$input['bankMargin'] : 0.0;
    $referenceRate = isset($input['referenceRate']) && is_numeric($input['referenceRate']) ? (float)$input['referenceRate'] : 0.0;
    $installmentType = $input['installmentType'] ?? 'equal';

    // Logika symulacji
    $useSimulationRate = isset($input['useSimulationRate']) && $input['useSimulationRate'] === true;
    $rateChange = isset($input['referenceRateChange']) && is_numeric($input['referenceRateChange']) ? (float)$input['referenceRateChange'] : 0.0;
    
    $effectiveReferenceRate = $referenceRate;
    if ($useSimulationRate && $rateChange !== 0) {
        $effectiveReferenceRate += $rateChange;
    }

    $bridgeMonths = isset($input['bridgeInsuranceMonths']) && is_numeric($input['bridgeInsuranceMonths']) ? (int)$input['bridgeInsuranceMonths'] : 0;
    $bridgeIncrease = isset($input['bridgeInsuranceMarginIncrease']) && is_numeric($input['bridgeInsuranceMarginIncrease']) ? (float)$input['bridgeInsuranceMarginIncrease'] : 0.0;
    
    // Podstawowy harmonogram (bez nadpłat)
    $baseSchedule = generateSchedule($loanAmount, $loanTerm, $bankMargin, $effectiveReferenceRate, $installmentType, $bridgeMonths, $bridgeIncrease, ['amount' => 0]);
    $baseTotalInterest = array_sum(array_column($baseSchedule, 'interestPart'));

    // Harmonogram z nadpłatami
    $overpayment = [
        'amount' => isset($input['overpaymentAmount']) && is_numeric($input['overpaymentAmount']) ? (float)$input['overpaymentAmount'] : 0.0,
        'frequency' => $input['overpaymentFrequency'] ?? 'one-time',
        'startMonth' => isset($input['overpaymentStartMonth']) && is_numeric($input['overpaymentStartMonth']) ? (int)$input['overpaymentStartMonth'] : 1,
        'target' => $input['overpaymentTarget'] ?? 'shorten-period',
        'interval' => isset($input['overpaymentInterval']) && is_numeric($input['overpaymentInterval']) ? (int)$input['overpaymentInterval'] : 1,
    ];

    $finalSchedule = ($overpayment['amount'] > 0) ? generateSchedule($loanAmount, $loanTerm, $bankMargin, $effectiveReferenceRate, $installmentType, $bridgeMonths, $bridgeIncrease, $overpayment) : $baseSchedule;
    
    $results['schedule'] = $finalSchedule;
    $results['baseSchedule'] = ($overpayment['amount'] > 0) ? $baseSchedule : null;

    if (!empty($finalSchedule)) {
        $overpaymentTotalInterest = array_sum(array_column($finalSchedule, 'interestPart'));
        $results['totalInterest'] = $overpaymentTotalInterest;
        $results['totalRepayment'] = $loanAmount + $overpaymentTotalInterest;
        $results['firstInstallment'] = $finalSchedule[0]['totalPayment'];
        $results['lastInstallment'] = end($finalSchedule)['totalPayment'];
        
        if($overpayment['amount'] > 0) {
            $results['overpaymentResults'] = [
                'savedInterest' => $baseTotalInterest - $overpaymentTotalInterest,
                'newLoanTerm' => count($finalSchedule)
            ];
        }
    }

    // 4. Symulacja zmiany stóp procentowych (tylko jeśli NIE jest głównym wynikiem)
    if (!$useSimulationRate && $rateChange !== 0) {
        $newRefRate = $referenceRate + $rateChange;
        if ($bankMargin + $newRefRate > 0) {
            $simulationSchedule = generateSchedule($loanAmount, $loanTerm, $bankMargin, $newRefRate, $installmentType, $bridgeMonths, $bridgeIncrease, ['amount' => 0]);
            if (!empty($simulationSchedule)) {
                $results['simulationResults'] = [
                    'newFirstInstallment' => $simulationSchedule[0]['totalPayment'],
                    'newLastInstallment' => end($simulationSchedule)['totalPayment']
                ];
            }
        }
    }
}

// Ustawienie kodu odpowiedzi HTTP - 200 OK
http_response_code(200);

// Przygotowanie i odesłanie odpowiedzi
$response = [
    "message" => "Obliczenia wykonane pomyslnie.",
    "calculationResults" => $results
];

// Usunięcie logów przed finalnym etapem
$log_file = __DIR__ . '/debug_log.txt';
if (file_exists($log_file)) {
    unlink($log_file);
}

echo json_encode($response, JSON_PRETTY_PRINT); 