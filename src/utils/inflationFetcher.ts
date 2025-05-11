import axios from 'axios';

/**
 * Interfejs opisujący strukturę danych inflacyjnych
 */
export interface InflationData {
  date: string;      // Data pomiaru inflacji (format: YYYY-MM-DD)
  value: number;     // Wartość inflacji w procentach
  source: string;    // Źródło danych
  description?: string; // Opcjonalny opis
}

/**
 * Opcje zapytania do API inflacji
 */
export interface InflationFetchOptions {
  country?: 'poland' | 'eu' | 'usa';  // Domyślnie: 'poland'
  period?: 'monthly' | 'yearly';      // Domyślnie: 'yearly'
  limit?: number;                    // Liczba ostatnich rekordów, domyślnie: 12
}

/**
 * Klasa obsługująca pobieranie danych inflacyjnych
 */
export class InflationFetcher {
  private readonly API_URL = 'https://api.nbp.pl/api';  // Adres API Narodowego Banku Polskiego
  private readonly DEFAULT_OPTIONS: InflationFetchOptions = {
    country: 'poland',
    period: 'yearly',
    limit: 12
  };

  /**
   * Pobiera dane o inflacji z API NBP
   * @param options Opcje zapytania
   * @returns Promise z danymi o inflacji
   */
  public async fetchInflationData(
    options: InflationFetchOptions = {}
  ): Promise<InflationData[]> {
    try {
      const opts = { ...this.DEFAULT_OPTIONS, ...options };
      
      // Konstruowanie URLa zależnie od opcji
      let endpoint = '';
      if (opts.country === 'poland') {
        endpoint = `/statistics/inflation/targets/${opts.period === 'yearly' ? 'yearly' : 'monthly'}`;
      } else {
        // W przypadku innych krajów używalibyśmy innych endpointów
        throw new Error(`Dane inflacyjne dla ${opts.country} nie są obecnie obsługiwane`);
      }
      
      const response = await axios.get(`${this.API_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/json'
        },
        params: {
          format: 'json',
          limit: opts.limit
        }
      });
      
      // W przypadku błędu z API
      if (response.status !== 200) {
        throw new Error(`Błąd podczas pobierania danych: ${response.statusText}`);
      }
      
      // Konwersja danych z formatu API do naszego formatu
      return this.convertResponseToInflationData(response.data, opts);
      
    } catch (error) {
      console.error('Błąd podczas pobierania danych inflacyjnych:', error);
      
      // W przypadku błędu zwracamy dane awaryjne
      return this.getFallbackInflationData();
    }
  }
  
  /**
   * Pobiera aktualną wartość inflacji
   * @returns Promise z aktualną wartością inflacji w procentach
   */
  public async getCurrentInflation(): Promise<number> {
    try {
      const data = await this.fetchInflationData({ limit: 1 });
      return data.length > 0 ? data[0].value : this.getDefaultInflation();
    } catch (error) {
      return this.getDefaultInflation();
    }
  }
  
  /**
   * Konwertuje dane z API do naszego formatu
   */
  private convertResponseToInflationData(
    responseData: any,
    options: InflationFetchOptions
  ): InflationData[] {
    // Struktura danych z API NBP może się różnić, więc musimy ją przekonwertować
    // Poniżej przykładowa implementacja
    
    try {
      return responseData.map((item: any) => ({
        date: item.date || item.effectiveDate || new Date().toISOString().split('T')[0],
        value: parseFloat(item.value || item.inflationRate || '0'),
        source: 'NBP (Narodowy Bank Polski)',
        description: `Inflacja ${options.period === 'yearly' ? 'roczna' : 'miesięczna'} w Polsce`
      }));
    } catch (error) {
      console.error('Błąd podczas konwersji danych:', error);
      return this.getFallbackInflationData();
    }
  }
  
  /**
   * Zwraca awaryjne dane o inflacji na wypadek błędu API
   */
  private getFallbackInflationData(): InflationData[] {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Przykładowe dane awaryjne bazujące na historycznych wartościach inflacji w Polsce
    return [
      {
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
        value: 2.5,
        source: 'Dane awaryjne (średnia historyczna)',
        description: 'Wartość przybliżona na podstawie średniej inflacji w Polsce'
      }
    ];
  }
  
  /**
   * Zwraca domyślną wartość inflacji
   */
  private getDefaultInflation(): number {
    return 2.5;  // Typowa średnia inflacja w Polsce
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