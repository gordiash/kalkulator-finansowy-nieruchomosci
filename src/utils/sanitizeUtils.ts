/**
 * Narzędzia do sanityzacji danych wejściowych
 */

/**
 * Sanityzuje dane tekstowe - usuwa potencjalnie niebezpieczne znaki
 * @param input Wejściowy tekst
 * @returns Oczyszczony tekst
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Usuwamy tagi HTML i niebezpieczne znaki
  return input
    .replace(/<[^>]*>/g, '')  // Usuwanie tagów HTML
    .replace(/[<>'"&]/g, '')  // Usuwanie potencjalnie niebezpiecznych znaków
    .trim();  // Usuwanie białych znaków
}

/**
 * Sanityzuje dane liczbowe
 * @param input Dane wejściowe
 * @param defaultValue Domyślna wartość
 * @param min Minimalna wartość
 * @param max Maksymalna wartość
 * @returns Oczyszczona liczba
 */
export function sanitizeNumber(
  input: any, 
  defaultValue: number = 0, 
  min: number | null = null, 
  max: number | null = null
): number {
  let result: number;
  
  // Konwersja do liczby
  if (typeof input === 'string') {
    const cleaned = input.replace(/[^\d.-]/g, '');
    result = parseFloat(cleaned);
  } else if (typeof input === 'number') {
    result = input;
  } else {
    return defaultValue;
  }
  
  // Sprawdzenie czy jest NaN
  if (isNaN(result)) {
    return defaultValue;
  }
  
  // Sprawdzenie zakresu
  if (min !== null && result < min) {
    return min;
  }
  
  if (max !== null && result > max) {
    return max;
  }
  
  return result;
}

/**
 * Sanityzuje dane email
 * @param input Wejściowy email
 * @returns Oczyszczony email lub pusty string jeśli niepoprawny
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Usuwamy białe znaki
  const trimmed = input.trim().toLowerCase();
  
  // Sprawdzamy czy email ma poprawny format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return '';
  }
  
  return trimmed;
}

/**
 * Sanityzuje URL
 * @param input Wejściowy URL
 * @returns Oczyszczony URL lub pusty string jeśli niepoprawny
 */
export function sanitizeUrl(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  try {
    // Próbujemy utworzyć obiekt URL
    const url = new URL(input);
    
    // Dozwolone protokoły
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(url.protocol)) {
      return '';
    }
    
    return url.toString();
  } catch (e) {
    // Niepoprawny URL
    return '';
  }
} 