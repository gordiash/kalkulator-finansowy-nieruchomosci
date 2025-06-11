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