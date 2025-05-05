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
 * Wysyła dane subskrybenta do Airtable
 * @param email Adres email subskrybenta
 * @returns Promise z odpowiedzią z API
 */
export const sendSubscriberToAirtable = async (email: string): Promise<Response> => {
  try {
    // Sprawdzanie czy mamy wymagane dane konfiguracyjne
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      throw new Error('Brak konfiguracji Airtable. Sprawdź zmienne środowiskowe.');
    }

    // Przygotowanie danych do wysłania
    const subscriberData: SubscriberData = {
      email
    };

    // Wysłanie żądania do API Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'records': [
            {
              'fields': {
                'Email': subscriberData.email
              }
            }
          ]
        })
      }
    );

    // Sprawdzenie czy odpowiedź jest poprawna
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Błąd API Airtable: ${errorData.error?.message || response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Błąd podczas wysyłania danych do Airtable:', error);
    throw error;
  }
};