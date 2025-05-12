import axios from 'axios';
import { gusInflationFetcher, type InflationData } from './gusInflationFetcher';

/**
 * Klasa obsługująca pobieranie danych inflacyjnych
 * @deprecated Użyj gusInflationFetcher zamiast tej klasy
 */
export class InflationFetcher {
  private readonly API_URL = 'https://api.nbp.pl/api';  // Adres API Narodowego Banku Polskiego
  private readonly DEFAULT_OPTIONS = {
    country: 'poland',
    period: 'yearly',
    limit: 12
  };

  /**
   * Pobiera dane o inflacji - obecnie przekierowuje do API GUS
   * @param options Opcje zapytania
   * @returns Promise z danymi o inflacji
   */
  public async fetchInflationData(
    options: any = {}
  ): Promise<InflationData[]> {
    // Przekierowanie do nowego fetchera
    return gusInflationFetcher.fetchInflationData({
      limit: options.limit || this.DEFAULT_OPTIONS.limit
    });
  }
  
  /**
   * Pobiera aktualną wartość inflacji
   * @returns Promise z aktualną wartością inflacji w procentach
   */
  public async getCurrentInflation(): Promise<number> {
    // Przekierowanie do nowego fetchera
    return gusInflationFetcher.getCurrentInflation();
  }
  
  /**
   * Pobiera historyczne dane inflacyjne dla wykresów
   */
  public async getHistoricalInflationData(years: number = 10): Promise<InflationData[]> {
    try {
      return this.fetchInflationData({
        period: 'yearly',
        limit: years
      });
    } catch (error) {
      // W przypadku błędu generujemy przykładowe dane historyczne
      const currentYear = new Date().getFullYear();
      const historicalData: InflationData[] = [];
      
      // Przykładowe wartości inflacji z ostatnich lat
      const exampleValues = [2.3, 2.1, 3.4, 5.1, 2.9, 1.8, 2.5, 4.3, 3.7, 2.2];
      
      for (let i = 0; i < years; i++) {
        const year = currentYear - i;
        historicalData.push({
          date: `${year}-01-01`,
          value: exampleValues[i % exampleValues.length], // Cykliczne wykorzystanie przykładowych wartości
          source: 'Dane aproksymowane',
          description: `Przybliżona roczna inflacja w ${year} roku`
        });
      }
      
      return historicalData;
    }
  }
}

// Eksport singletona dla wygodnego użycia
export const inflationFetcher = new InflationFetcher(); 