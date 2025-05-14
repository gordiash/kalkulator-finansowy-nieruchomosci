const fetch = require('node-fetch');

// Klucze API są bezpiecznie przechowywane w zmiennych środowiskowych Netlify
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Mailing';

/**
 * Funkcja walidująca adres email
 * @param {string} email - Adres email do walidacji
 * @returns {boolean} Czy adres email jest poprawny
 */
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Funkcja sanityzująca dane wejściowe
 * @param {any} input - Dane wejściowe
 * @returns {string} Sanityzowany string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Usuwamy HTML i znaki specjalne
  return input
    .replace(/<[^>]*>/g, '')  // Usuwanie tagów HTML
    .replace(/[<>'"&]/g, '')  // Usuwanie potencjalnie niebezpiecznych znaków
    .trim();  // Usuwanie białych znaków
}

/**
 * Funkcja Netlify do obsługi zapisu do newslettera
 */
exports.handler = async function(event, context) {
  // Obsługujemy tylko żądania POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: { message: 'Metoda niedozwolona' } })
    };
  }
  
  try {
    // Sprawdzanie nagłówków Origin i Referer
    const origin = event.headers.origin || '';
    const referer = event.headers.referer || '';
    const allowedOrigins = [
      'https://kalkulator-finansowy-nieruchomosci.netlify.app',
      'http://localhost:3000' // Dla testów lokalnych
    ];
    
    // Sprawdzamy czy żądanie pochodzi z dozwolonej domeny
    if (!allowedOrigins.some(allowed => origin.startsWith(allowed) || referer.startsWith(allowed))) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: { message: 'Odmowa dostępu - niedozwolone pochodzenie żądania' } })
      };
    }
    
    // Sprawdzamy czy klucze API są dostępne
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: { message: 'Błąd konfiguracji serwera' } })
      };
    }
    
    // Parsowanie ciała żądania
    const requestBody = JSON.parse(event.body);
    const email = requestBody.email ? sanitizeInput(requestBody.email) : '';
    
    // Walidacja adresu email
    if (!email || !validateEmail(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: { message: 'Nieprawidłowy format adresu email' } })
      };
    }
    
    // Wysłanie żądania do API Airtable
    const airtableResponse = await fetch(
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
                'Email': email
              }
            }
          ]
        })
      }
    );
    
    // Obsługa odpowiedzi z Airtable
    const airtableData = await airtableResponse.json();
    
    if (!airtableResponse.ok) {
      return {
        statusCode: airtableResponse.status,
        body: JSON.stringify({ error: { message: 'Błąd API Airtable' } })
      };
    }
    
    // Zwracamy sukces
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Zapisano do newslettera' }),
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error('Funkcja subscribe - błąd:', error);
    
    // Zwracamy ogólny błąd serwera
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: 'Błąd serwera' } }),
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    };
  }
}; 