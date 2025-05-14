/**
 * Narzędzia do bezpiecznej pracy z localStorage
 */

/**
 * Bezpieczne przechowywanie danych w localStorage z opcjonalnym szyfrowaniem
 */
export class SecureStorage {
  private readonly prefix: string;

  /**
   * Tworzy nową instancję SecureStorage
   * @param prefix Prefiks dla kluczy w localStorage
   */
  constructor(prefix: string = 'app') {
    this.prefix = prefix;
  }

  /**
   * Zapisuje dane w localStorage
   * @param key Klucz do zapisania
   * @param value Wartość do zapisania
   * @param encrypt Czy szyfrować dane
   */
  setItem(key: string, value: any, encrypt: boolean = false): void {
    try {
      const prefixedKey = `${this.prefix}_${key}`;
      let valueToStore: string;

      if (typeof value === 'object') {
        valueToStore = JSON.stringify(value);
      } else {
        valueToStore = String(value);
      }

      if (encrypt) {
        valueToStore = this.encryptData(valueToStore);
      }

      localStorage.setItem(prefixedKey, valueToStore);
    } catch (error) {
      console.error(`Błąd podczas zapisywania do localStorage: ${key}`, error);
    }
  }

  /**
   * Pobiera dane z localStorage
   * @param key Klucz do pobrania
   * @param defaultValue Domyślna wartość
   * @param decrypt Czy dane są zaszyfrowane
   */
  getItem<T>(key: string, defaultValue: T, decrypt: boolean = false): T {
    try {
      const prefixedKey = `${this.prefix}_${key}`;
      const value = localStorage.getItem(prefixedKey);

      if (value === null) {
        return defaultValue;
      }

      let parsedValue = value;
      
      if (decrypt) {
        parsedValue = this.decryptData(value);
      }

      try {
        return JSON.parse(parsedValue) as T;
      } catch {
        return parsedValue as unknown as T;
      }
    } catch (error) {
      console.error(`Błąd podczas odczytu z localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Usuwa dane z localStorage
   * @param key Klucz do usunięcia
   */
  removeItem(key: string): void {
    try {
      const prefixedKey = `${this.prefix}_${key}`;
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error(`Błąd podczas usuwania z localStorage: ${key}`, error);
    }
  }

  /**
   * Czyści dane z localStorage z danym prefiksem
   */
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.prefix}_`)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error(`Błąd podczas czyszczenia localStorage`, error);
    }
  }

  /**
   * Konfiguruje automatyczne czyszczenie localStorage po określonym czasie
   * @param key Klucz do monitorowania
   * @param expiryTimeMs Czas wygaśnięcia w milisekundach
   */
  setupAutoExpiry(key: string, expiryTimeMs: number): void {
    try {
      const prefixedKey = `${this.prefix}_${key}`;
      const expiryKey = `${prefixedKey}_expiry`;
      
      // Ustawiamy czas wygaśnięcia
      const expiryTime = Date.now() + expiryTimeMs;
      localStorage.setItem(expiryKey, expiryTime.toString());
      
      // Sprawdzamy czy dane powinny już wygasnąć
      this.checkExpiry(key);
    } catch (error) {
      console.error(`Błąd podczas konfiguracji wygasania: ${key}`, error);
    }
  }

  /**
   * Sprawdza czy dane powinny wygasnąć
   * @param key Klucz do sprawdzenia
   * @returns Czy dane wygasły
   */
  private checkExpiry(key: string): boolean {
    try {
      const prefixedKey = `${this.prefix}_${key}`;
      const expiryKey = `${prefixedKey}_expiry`;
      const expiryTimeStr = localStorage.getItem(expiryKey);
      
      if (expiryTimeStr) {
        const expiryTime = parseInt(expiryTimeStr, 10);
        
        if (Date.now() > expiryTime) {
          localStorage.removeItem(prefixedKey);
          localStorage.removeItem(expiryKey);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Błąd podczas sprawdzania wygasania: ${key}`, error);
      return false;
    }
  }

  /**
   * Bardzo proste szyfrowanie danych (do zastąpienia bardziej bezpiecznym rozwiązaniem w produkcji)
   * @param data Dane do zaszyfrowania
   * @returns Zaszyfrowany ciąg znaków
   */
  private encryptData(data: string): string {
    // To jest bardzo prosta implementacja - w produkcji należy użyć
    // np. Web Crypto API lub bibliotek kryptograficznych
    try {
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.error('Błąd podczas szyfrowania danych', error);
      return data;
    }
  }

  /**
   * Bardzo proste deszyfrowanie danych (do zastąpienia bardziej bezpiecznym rozwiązaniem w produkcji)
   * @param data Dane do odszyfrowania
   * @returns Odszyfrowany ciąg znaków
   */
  private decryptData(data: string): string {
    // To jest bardzo prosta implementacja - w produkcji należy użyć
    // np. Web Crypto API lub bibliotek kryptograficznych
    try {
      return decodeURIComponent(atob(data));
    } catch (error) {
      console.error('Błąd podczas deszyfrowania danych', error);
      return data;
    }
  }
}

// Eksport domyślnej instancji do użycia w aplikacji
export const secureStorage = new SecureStorage('kalk_nieruch'); 