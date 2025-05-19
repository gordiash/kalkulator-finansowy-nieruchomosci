/// <reference types="node" />
import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';

// Deklaracja typów dla zmiennych środowiskowych
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_GUS_BDL_API_KEY: string;
    }
  }
}

interface BdlApiRequest {
  endpoint: string;
  params?: Record<string, string>;
}

const BDL_API_BASE_URL = 'https://bdl.stat.gov.pl/api/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  // Obsługa CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders
    };
  }

  try {
    const apiKey = process.env.REACT_APP_GUS_BDL_API_KEY;
    if (!apiKey) {
      throw new Error('Brak klucza API GUS BDL');
    }

    if (!event.body) {
      throw new Error('Brak danych w żądaniu');
    }

    const { endpoint, params }: BdlApiRequest = JSON.parse(event.body);
    
    // Budowanie URL z parametrami
    let url = `${BDL_API_BASE_URL}/${endpoint}`;
    
    // Jeśli są parametry, dodaj je do URL
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await fetch(url, {
      headers: {
        'X-ClientId': apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Szczegółowa obsługa różnych kodów błędów
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Błąd API GUS:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        body: errorText
      });

      let errorMessage = '';
      switch (response.status) {
        case 404:
          errorMessage = 'Nie znaleziono danych dla podanych parametrów';
          break;
        case 401:
          errorMessage = 'Nieprawidłowy klucz API';
          break;
        case 403:
          errorMessage = 'Brak dostępu do zasobu';
          break;
        default:
          errorMessage = `Błąd API GUS: ${response.status} ${response.statusText}`;
      }

      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: errorMessage,
          details: errorText
        }),
        headers: corsHeaders
      };
    }

    const data = await response.json();
    console.log('Odpowiedź API:', data);

    // Sprawdzenie czy odpowiedź zawiera oczekiwane dane
    if (!data || (Array.isArray(data.results) && data.results.length === 0)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          error: 'Brak danych dla podanych parametrów',
          details: 'Odpowiedź API nie zawiera wyników'
        }),
        headers: corsHeaders
      };
    }

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: corsHeaders
    };
  } catch (error: any) {
    console.error('Błąd w funkcji Netlify:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Wystąpił błąd serwera',
        details: error.toString()
      }),
      headers: corsHeaders
    };
  }
};

export { handler }; 