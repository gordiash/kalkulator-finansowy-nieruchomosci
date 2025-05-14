// airtable.ts

// Konfiguracja Airtable
const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_NAME = 'Mailing';

// Interfejs dla danych subskrybenta
interface SubscriberData {
  email: string;
}

/**
 * Waliduje adres email za pomocą wyrażenia regularnego
 * @param email Adres email do walidacji
 * @returns Informacja czy email jest poprawny
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Wysyła dane subskrybenta do Airtable przez bezpieczny endpoint proxy
 * @param email Adres email subskrybenta
 * @returns Promise z odpowiedzią z API
 */
export const sendSubscriberToAirtable = async (email: string): Promise<Response> => {
  try {
    // Dodatkowa walidacja po stronie klienta
    if (!email || !validateEmail(email)) {
      throw new Error('Nieprawidłowy format adresu email.');
    }

    // Przygotowanie danych do wysłania
    const subscriberData: SubscriberData = {
      email
    };

    // Generujemy token CSRF (w prostej formie, w produkcji użylibyśmy bardziej zaawansowanego rozwiązania)
    const csrfToken = generateCSRFToken();
    
    // Używamy punktu końcowego proxy zamiast bezpośredniego dostępu do API Airtable
    // Endpoint proxy powinien być zaimplementowany po stronie serwera (np. z użyciem Netlify Functions)
    const response = await fetch(
      '/api/subscribe',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(subscriberData),
        credentials: 'same-origin' // Dołącza ciasteczka do żądania
      }
    );

    // Sprawdzenie czy odpowiedź jest poprawna
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Błąd API: ${errorData.error?.message || response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Błąd podczas wysyłania danych subskrypcji:', error);
    throw error;
  }
};

/**
 * Generuje prosty token CSRF
 * W produkcji należałoby użyć bardziej zaawansowanego rozwiązania
 */
function generateCSRFToken(): string {
  // Generujemy prosty token CSRF oparty na losowych wartościach
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  
  // Tworzymy heksadecymalną reprezentację losowych danych
  const token = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Zapisujemy token w sessionStorage dla późniejszej weryfikacji
  sessionStorage.setItem('csrf_token', token);
  
  return token;
}