import axios from 'axios';
import { gusInflationFetcher } from './gusInflationFetcher';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('gusInflationFetcher', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-12-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  test('fetchInflationData should return data from API', async () => {
    // Mock danych
    const mockData = {
      data: {
        status: 'success',
        data: [
          {
            date: '2023-11-15',
            value: 4.9,
            subject: 'Wskaźnik cen towarów i usług konsumpcyjnych',
            year: 2023,
            month: 11
          }
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'https://api-sdp.stat.gov.pl/api/1.1.0'
      }
    };
    
    mockedAxios.get.mockResolvedValueOnce(mockData);
    
    const result = await gusInflationFetcher.fetchInflationData();
    
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('https://api-sdp.stat.gov.pl/api/1.1.0'),
      expect.any(Object)
    );
    
    expect(result).toEqual([
      {
        date: '2023-11-15',
        value: 4.9,
        source: 'GUS',
        description: 'Wskaźnik cen towarów i usług konsumpcyjnych'
      }
    ]);
  });

  test('getCurrentInflation should return the current inflation value', async () => {
    // Mock danych
    const mockData = {
      data: {
        status: 'success',
        data: [
          {
            date: '2023-11-15',
            value: 4.9,
            subject: 'Wskaźnik cen towarów i usług konsumpcyjnych',
            year: 2023,
            month: 11
          }
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'https://api-sdp.stat.gov.pl/api/1.1.0'
      }
    };
    
    mockedAxios.get.mockResolvedValueOnce(mockData);
    
    const result = await gusInflationFetcher.getCurrentInflation();
    
    expect(result).toBe(4.9);
  });

  test('fetchInflationData with custom limit should return historical data', async () => {
    // Mock danych
    const mockData = {
      data: {
        status: 'success',
        data: [
          {
            date: '2023-11-15',
            value: 4.9,
            subject: 'Wskaźnik cen towarów i usług konsumpcyjnych',
            year: 2023,
            month: 11
          },
          {
            date: '2022-11-15',
            value: 17.5,
            subject: 'Wskaźnik cen towarów i usług konsumpcyjnych',
            year: 2022,
            month: 11
          },
          {
            date: '2021-11-15',
            value: 7.8,
            subject: 'Wskaźnik cen towarów i usług konsumpcyjnych',
            year: 2021,
            month: 11
          },
          {
            date: '2020-11-15',
            value: 3.0,
            subject: 'Wskaźnik cen towarów i usług konsumpcyjnych',
            year: 2020,
            month: 11
          },
          {
            date: '2019-11-15',
            value: 2.6,
            subject: 'Wskaźnik cen towarów i usług konsumpcyjnych',
            year: 2019,
            month: 11
          }
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'https://api-sdp.stat.gov.pl/api/1.1.0'
      }
    };
    
    mockedAxios.get.mockResolvedValueOnce(mockData);
    
    const result = await gusInflationFetcher.fetchInflationData({ limit: 5 });
    
    expect(result.length).toBe(5);
    expect(result[0].value).toBe(4.9);
    expect(result[1].value).toBe(17.5);
  });

  test('should use cached data if available', async () => {
    // Ustawienie mock danych w localStorage
    const cachedData = JSON.stringify({
      timestamp: Date.now(),
      data: [
        {
          date: '2023-11-15',
          value: 4.9,
          source: 'GUS',
          description: 'Wskaźnik cen towarów i usług konsumpcyjnych'
        }
      ]
    });
    
    localStorage.setItem('gus_inflation_data', cachedData);
    
    const result = await gusInflationFetcher.fetchInflationData();
    
    // Sprawdzenie czy axios.get nie został wywołany (dane zostały pobrane z cache)
    expect(mockedAxios.get).not.toHaveBeenCalled();
    
    expect(result).toEqual([
      {
        date: '2023-11-15',
        value: 4.9,
        source: 'GUS',
        description: 'Wskaźnik cen towarów i usług konsumpcyjnych'
      }
    ]);
  });

  test('should fetch new data if cache is outdated', async () => {
    // Ustawienie przestarzałych danych w localStorage (tydzień temu)
    const outdatedTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 dni temu
    const cachedData = JSON.stringify({
      timestamp: outdatedTimestamp,
      data: [
        {
          date: '2023-11-08',
          value: 4.8,
          source: 'GUS',
          description: 'Wskaźnik cen towarów i usług konsumpcyjnych'
        }
      ]
    });
    
    localStorage.setItem('gus_inflation_data', cachedData);
    
    const mockApiData = {
      data: {
        status: 'success',
        data: [
          {
            date: '2023-11-15',
            value: 4.9,
            subject: 'Wskaźnik cen towarów i usług konsumpcyjnych',
            year: 2023,
            month: 11
          }
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'https://api-sdp.stat.gov.pl/api/1.1.0'
      }
    };
    
    mockedAxios.get.mockResolvedValueOnce(mockApiData);
    
    const result = await gusInflationFetcher.fetchInflationData();
    
    // Sprawdzenie czy axios.get został wywołany (dane były przestarzałe)
    expect(mockedAxios.get).toHaveBeenCalled();
    
    expect(result).toEqual([
      {
        date: '2023-11-15',
        value: 4.9,
        source: 'GUS',
        description: 'Wskaźnik cen towarów i usług konsumpcyjnych'
      }
    ]);
  });
}); 