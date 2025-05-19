import { Handler } from '@netlify/functions';

interface BdlApiRequest {
  endpoint: string;
  params?: Record<string, string>;
}

const BDL_API_BASE_URL = 'https://bdl.stat.gov.pl/api/v1';

const handler: Handler = async (event) => {
  // Obsługa CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    };
  }

  try {
    if (!process.env.REACT_APP_GUS_BDL_API_KEY) {
      throw new Error('Brak klucza API GUS BDL');
    }

    if (!event.body) {
      throw new Error('Brak danych w żądaniu');
    }

    const { endpoint, params }: BdlApiRequest = JSON.parse(event.body);
    
    // Budowanie URL z parametrami
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${BDL_API_BASE_URL}/${endpoint}${queryParams ? '?' + queryParams : ''}`;

    const response = await fetch(url, {
      headers: {
        'X-ClientId': process.env.REACT_APP_GUS_BDL_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Wystąpił błąd serwera' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    };
  }
};

export { handler }; 