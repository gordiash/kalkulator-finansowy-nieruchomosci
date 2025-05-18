import { fetchPropertyPrices } from '../bdlApi';

// Mock dla fetch API
global.fetch = jest.fn();

describe('BDL API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset środowiskowych zmiennych przed każdym testem
    process.env.REACT_APP_GUS_BDL_API_KEY = 'test-api-key';
  });

  test('fetchPropertyPrices throws error when API key is missing', async () => {
    // Usuń zmienną środowiskową z kluczem API
    delete process.env.REACT_APP_GUS_BDL_API_KEY;

    await expect(fetchPropertyPrices('Warszawa', 2023)).rejects.toThrow('Brak klucza API GUS BDL');
  });

  test('fetchPropertyPrices calls unit search endpoint with correct parameters', async () => {
    // Mock dla pierwszego fetch (wyszukiwanie jednostki)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ id: '1465', name: 'Warszawa' }]
      })
    });

    // Mock dla drugiego fetch (pobieranie danych o cenach)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            values: [
              { year: 2023, quarter: 'I', val: 12500.50 },
              { year: 2023, quarter: 'II', val: 12600.75 },
              { year: 2023, quarter: 'III', val: 12700.25 },
              { year: 2023, quarter: 'IV', val: 12800.10 }
            ]
          }
        ]
      })
    });

    await fetchPropertyPrices('Warszawa', 2023);

    // Sprawdź, czy pierwszy fetch został wywołany z odpowiednimi parametrami
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://bdl.stat.gov.pl/api/v1/Units?name=Warszawa',
      {
        headers: {
          'X-ClientId': 'test-api-key',
          'Content-Type': 'application/json',
        },
      }
    );
  });

  test('fetchPropertyPrices throws error when unit is not found', async () => {
    // Mock dla przypadku, gdy nie znaleziono jednostki
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] })
    });

    await expect(fetchPropertyPrices('NieistniejąceMiasto', 2023)).rejects.toThrow('Nie znaleziono miasta o podanej nazwie');
  });

  test('fetchPropertyPrices calls data endpoint with correct parameters', async () => {
    // Mock dla pierwszego fetch (wyszukiwanie jednostki)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ id: '1465', name: 'Warszawa' }]
      })
    });

    // Mock dla drugiego fetch (pobieranie danych o cenach)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            values: [
              { year: 2023, quarter: 'I', val: 12500.50 },
              { year: 2023, quarter: 'II', val: 12600.75 },
              { year: 2023, quarter: 'III', val: 12700.25 },
              { year: 2023, quarter: 'IV', val: 12800.10 }
            ]
          }
        ]
      })
    });

    await fetchPropertyPrices('Warszawa', 2023);

    // Sprawdź, czy drugi fetch został wywołany z odpowiednimi parametrami
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://bdl.stat.gov.pl/api/v1/Data?subject-id=P2425&unit-id=1465&year=2023',
      {
        headers: {
          'X-ClientId': 'test-api-key',
          'Content-Type': 'application/json',
        },
      }
    );
  });

  test('fetchPropertyPrices returns properly formatted price data', async () => {
    // Mock dla pierwszego fetch (wyszukiwanie jednostki)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ id: '1465', name: 'Warszawa' }]
      })
    });

    // Mock dla drugiego fetch (pobieranie danych o cenach)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            values: [
              { year: 2023, quarter: 'I', val: 12500.50 },
              { year: 2023, quarter: 'II', val: 12600.75 },
              { year: 2023, quarter: 'III', val: 12700.25 },
              { year: 2023, quarter: 'IV', val: 12800.10 }
            ]
          }
        ]
      })
    });

    const result = await fetchPropertyPrices('Warszawa', 2023);

    // Sprawdź, czy dane zostały poprawnie sformatowane
    expect(result).toEqual([
      { city: 'Warszawa', price: 12500.50, year: 2023, quarter: 'I' },
      { city: 'Warszawa', price: 12600.75, year: 2023, quarter: 'II' },
      { city: 'Warszawa', price: 12700.25, year: 2023, quarter: 'III' },
      { city: 'Warszawa', price: 12800.10, year: 2023, quarter: 'IV' }
    ]);
  });

  test('fetchPropertyPrices handles API errors properly', async () => {
    // Mock dla nieudanego zapytania
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(fetchPropertyPrices('Warszawa', 2023)).rejects.toThrow('Nie udało się znaleźć podanego miasta');
  });
}); 