import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { handler } from '../bdlApi';

// Deklaracja globalna dla testów
declare global {
  namespace NodeJS {
    interface Global {
      fetch: jest.Mock;
    }
  }
}

// Mock dla fetch API
global.fetch = jest.fn() as jest.Mock;

describe('BDL API Handler', () => {
  beforeEach(() => {
    // Czyszczenie mocków przed każdym testem
    jest.clearAllMocks();
    process.env.REACT_APP_GUS_BDL_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    // Czyszczenie zmiennych środowiskowych po każdym teście
    delete process.env.REACT_APP_GUS_BDL_API_KEY;
  });

  describe('Obsługa CORS i walidacja wejścia', () => {
    it('powinien obsłużyć zapytanie CORS OPTIONS', async () => {
      const event = {
        httpMethod: 'OPTIONS'
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    });

    it('powinien zwrócić błąd gdy brak klucza API', async () => {
      delete process.env.REACT_APP_GUS_BDL_API_KEY;

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Units',
          params: { name: 'powiat warszawski' }
        })
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toHaveProperty('error', 'Brak klucza API GUS BDL');
    });

    it('powinien zwrócić błąd gdy brak body w zapytaniu', async () => {
      const event = {
        httpMethod: 'POST'
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toHaveProperty('error', 'Brak danych w żądaniu');
    });

    it('powinien zwrócić błąd gdy body nie jest poprawnym JSON', async () => {
      const event = {
        httpMethod: 'POST',
        body: 'invalid json'
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toHaveProperty('error', expect.stringContaining('Unexpected token'));
    });
  });

  describe('Zapytania do API GUS', () => {
    it('powinien poprawnie wysłać zapytanie do API GUS', async () => {
      const mockResponse = {
        results: [{ id: 1, name: 'Powiat Warszawski' }]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Units',
          params: { name: 'powiat warszawski', level: '4' }
        })
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://bdl.stat.gov.pl/api/v1/Units'),
        expect.objectContaining({
          headers: {
            'X-ClientId': 'test-api-key',
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('powinien poprawnie obsłużyć parametry z polskimi znakami', async () => {
      const mockResponse = {
        results: [{ id: 1, name: 'Powiat Łódzki' }]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Units',
          params: { name: 'powiat łódzki', level: '4' }
        })
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('powiat łódzki'),
        expect.any(Object)
      );
    });

    it('powinien poprawnie zakodować parametry URL', async () => {
      const mockResponse = { results: [] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Units',
          params: { 
            name: 'powiat & specjalne = znaki?',
            level: '4'
          }
        })
      } as HandlerEvent;

      await handler(event);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('name=powiat+%26+specjalne+%3D+znaki%3F'),
        expect.any(Object)
      );
    });
  });

  describe('Obsługa błędów API', () => {
    it('powinien obsłużyć błąd 404 z API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Not Found'
      });

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Units',
          params: { name: 'nieistniejący powiat' }
        })
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toHaveProperty('error', 'Nie znaleziono danych dla podanych parametrów');
    });

    it('powinien obsłużyć błąd 401 z API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Unauthorized'
      });

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Units',
          params: { name: 'powiat warszawski' }
        })
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.body)).toHaveProperty('error', 'Nieprawidłowy klucz API');
    });

    it('powinien obsłużyć błąd 403 z API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Forbidden'
      });

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Units',
          params: { name: 'powiat warszawski' }
        })
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(403);
      expect(JSON.parse(response.body)).toHaveProperty('error', 'Brak dostępu do zasobu');
    });

    it('powinien obsłużyć pusty wynik z API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] })
      });

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Data',
          params: { 'unit-id': '1', 'year': '2023' }
        })
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toHaveProperty('error', 'Brak danych dla podanych parametrów');
    });

    it('powinien obsłużyć błąd sieci', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Units',
          params: { name: 'powiat warszawski' }
        })
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toHaveProperty('error', 'Network error');
    });

    it('powinien obsłużyć nieprawidłową odpowiedź JSON z API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          endpoint: 'Units',
          params: { name: 'powiat warszawski' }
        })
      } as HandlerEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toHaveProperty('error', 'Invalid JSON');
    });
  });
}); 