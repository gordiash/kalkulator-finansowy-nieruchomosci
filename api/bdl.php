<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Wczytanie konfiguracji
$config = include __DIR__ . '/config.php';
$apiKey = $config['gus_api_key'];
$rateLimits = $config['rate_limits'];

// Funkcja do logowania
function logToFile($message, $type = 'info') {
    $logDir = __DIR__ . '/logs';
    if (!file_exists($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/api_' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    $logEntry = "[$timestamp][$type][$clientIP] $message" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

// Ulepszenie obsługi błędów
function handleError($message, $statusCode = 500, $isTechnical = true) {
    // Loguj wszystkie błędy
    logToFile($message, 'error');
    
    // Dla klienta zwróć ogólny komunikat w przypadku błędów technicznych
    $clientMessage = $isTechnical ? 
        'Wystąpił błąd techniczny podczas komunikacji z API GUS' : 
        $message;
    
    http_response_code($statusCode);
    echo json_encode(['error' => $clientMessage]);
    exit();
}

// Implementacja prostego rate limiting
function checkRateLimit($limits) {
    $cacheDir = __DIR__ . '/cache';
    if (!file_exists($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }
    
    // Plik licznika na sekundę
    $secondFile = $cacheDir . '/rate_second_' . date('YmdHis');
    // Plik licznika na 15 minut
    $minutesFile = $cacheDir . '/rate_15min_' . date('YmdH') . floor(date('i') / 15);
    
    // Sprawdzenie limitu na sekundę
    if (file_exists($secondFile)) {
        $count = (int)file_get_contents($secondFile);
        if ($count >= $limits['per_second']) {
            logToFile("Przekroczono limit żądań na sekundę: {$limits['per_second']}", 'warning');
            handleError('Przekroczono limit żądań na sekundę', 429, false);
        }
        file_put_contents($secondFile, $count + 1);
    } else {
        file_put_contents($secondFile, 1);
    }
    
    // Sprawdzenie limitu na 15 minut
    if (file_exists($minutesFile)) {
        $count = (int)file_get_contents($minutesFile);
        if ($count >= $limits['per_15min']) {
            logToFile("Przekroczono limit żądań na 15 minut: {$limits['per_15min']}", 'warning');
            handleError('Przekroczono limit żądań na 15 minut', 429, false);
        }
        file_put_contents($minutesFile, $count + 1);
    } else {
        file_put_contents($minutesFile, 1);
    }
    
    // Usuwanie starych plików liczników
    $files = glob($cacheDir . '/rate_second_*');
    $currentTime = time();
    foreach ($files as $file) {
        if ($currentTime - filemtime($file) > 5) { // Usuwaj pliki starsze niż 5 sekund
            @unlink($file);
        }
    }
}

// Funkcja do wykonywania żądań do API GUS
function makeGusApiRequest($endpoint, $params = []) {
    global $apiKey;
    
    // Budowanie URL
    $url = "https://bdl.stat.gov.pl/api/v1/{$endpoint}";

    if (!empty($params)) {
        $queryParams = [];
        foreach ($params as $key => $value) {
            if (is_array($value)) {
                foreach ($value as $val) {
                    $queryParams[] = urlencode($key) . '=' . urlencode($val);
                }
            } else {
                $queryParams[] = urlencode($key) . '=' . urlencode($value);
            }
        }
        $url .= '?' . implode('&', $queryParams);
    }
    
    // Inicjalizacja cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-ClientId: ' . $apiKey,
        'Content-Type: application/json'
    ]);
    
    // Wykonanie żądania
    $response = curl_exec($ch);
    if ($response === false) {
        $curlError = curl_error($ch);
        logToFile("Błąd cURL: $curlError", 'error');
        handleError("Błąd podczas komunikacji z API GUS: $curlError");
    }
    
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // Loguj wszystkie odpowiedzi z kodem błędu
    if ($httpCode >= 400) {
        logToFile("API GUS zwróciło kod błędu: $httpCode, odpowiedź: $response", 'error');
        handleError("API GUS zwróciło kod błędu: $httpCode", $httpCode, false);
    }
    
    return ['code' => $httpCode, 'data' => json_decode($response, true)];
}

// Funkcja pobierająca dostępne lata dla wskaźnika
function fetchAvailableYears($variableId) {
    // Pobierz metadane zmiennej z API
    $response = makeGusApiRequest("Subjects/{$variableId}");
    
    // Pobierz dostępne lata z odpowiedzi
    $years = [];
    if (isset($response['data']['years']) && is_array($response['data']['years'])) {
        $years = $response['data']['years'];
    } elseif (isset($response['data']['availableYears']) && is_array($response['data']['availableYears'])) {
        $years = $response['data']['availableYears'];
    }
    
    return $years;
}

// Funkcja inicjalizująca dane aplikacji
function initializeAppData() {
    // Domyślne wskaźniki używane w aplikacji
    $defaultIndicators = [
        'P3786' => [
            'name' => 'Cena transakcyjna m²',
            'primaryId' => '633697',
            'secondaryId' => '633702'
        ],
        'P3788' => [
            'name' => 'Średnia cena lokali mieszkalnych sprzedanych w ramach transakcji rynkowych',
            'primaryId' => '633667',
            'secondaryId' => '633672'
        ],
        'P3794' => [
            'name' => 'Domyślny wskaźnik cen'
        ]
    ];
    
    // Pobierz lata dla wskaźników
    $yearsData = [];
    foreach ($defaultIndicators as $id => $info) {
        $years = fetchAvailableYears($id);
        $yearsData[$id] = $years;
    }
    
    // Przygotuj dane inicjalizacyjne
    $initData = [
        'indicators' => $defaultIndicators,
        'availableYears' => $yearsData,
        'defaultIndicator' => 'P3788'
    ];
    
    return $initData;
}

// Obsługa preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Sprawdzenie metody HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    handleError('Metoda niedozwolona', 405, false);
}

// Wywołanie sprawdzenia limitów
checkRateLimit($rateLimits);

// Pobierz dane JSON
$inputJSON = file_get_contents('php://input');
if (!$inputJSON) {
    handleError('Nie można odczytać danych wejściowych', 400, false);
}

$input = json_decode($inputJSON, TRUE);
if (json_last_error() !== JSON_ERROR_NONE) {
    handleError('Nieprawidłowy format JSON: ' . json_last_error_msg(), 400, false);
}

// Cache na 1 godzinę
header('Cache-Control: public, max-age=3600');

// Obsługa specjalnego żądania inicjalizacji
if (isset($input['action']) && $input['action'] === 'init') {
    logToFile("Inicjalizacja aplikacji - pobieranie lat");
    
    // Sprawdź cache
    $cacheDir = __DIR__ . '/cache';
    $cacheFile = $cacheDir . '/init_data.json';
    $cacheTime = 3600; // 1 godzina
    
    // Użyj cache jeśli istnieje i nie jest przestarzały
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
        $cachedData = file_get_contents($cacheFile);
        logToFile("Użyto danych z cache dla inicjalizacji");
        http_response_code(200);
        echo $cachedData;
        exit();
    }
    
    // Pobierz dane inicjalizacyjne
    $initData = initializeAppData();
    
    // Zapisz do cache
    file_put_contents($cacheFile, json_encode(['success' => true, 'data' => $initData]));
    
    // Zwróć odpowiedź
    http_response_code(200);
    echo json_encode(['success' => true, 'data' => $initData]);
    exit();
}

// Standardowe przetwarzanie żądania do API GUS
if (!isset($input['endpoint'])) {
    handleError('Brak wymaganego parametru endpoint', 400, false);
}

$endpoint = $input['endpoint'];
$params = isset($input['params']) ? $input['params'] : [];

logToFile("Żądanie do API GUS - Endpoint: $endpoint, Parametry: " . json_encode($params));

// Wykonaj żądanie do API GUS
$response = makeGusApiRequest($endpoint, $params);

// Zwrócenie odpowiedzi
http_response_code($response['code']);
echo json_encode($response['data']);
?>