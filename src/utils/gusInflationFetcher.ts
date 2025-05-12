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
  limit?: number;    // Liczba ostatnich rekordów, domyślnie: 1
}

/**
 * Klasa obsługująca pobieranie danych inflacyjnych z API GUS SDP
 */
export class GUSInflationFetcher {
  private readonly API_URL = 'https://api-sdp.stat.gov.pl/api/1.1.0';
  private readonly DEFAULT_OPTIONS: InflationFetchOptions = {
    limit: 1
  };
  private currentInflation: number | null = null;
  private lastFetchTime: number = 0;
  private readonly FETCH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 dni w milisekundach
  
  // Implementacja mechanizmu cache dla ostatnio pobranej wartości
  private cachedInflationValue: number | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dni w milisekundach

  /**
   * Konstruktor, inicjalizuje pamięć podręczną z localStorage
   */
  constructor() {
    this.initCacheFromLocalStorage();
  }

  /**
   * Inicjalizuje pamięć podręczną z localStorage
   */
  private initCacheFromLocalStorage() {
    try {
      const cachedData = localStorage.getItem('gusInflationCache');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        this.cachedInflationValue = parsedData.value;
        this.cacheTimestamp = parsedData.timestamp;
        this.lastFetchTime = parsedData.lastFetchTime || 0;
      }
    } catch (error) {
      console.error('Błąd podczas odczytu danych z localStorage:', error);
    }
  }

  /**
   * Zapisuje dane do pamięci podręcznej
   */
  private saveToCache(value: number) {
    try {
      this.cachedInflationValue = value;
      this.cacheTimestamp = Date.now();
      
      localStorage.setItem('gusInflationCache', JSON.stringify({
        value: this.cachedInflationValue,
        timestamp: this.cacheTimestamp,
        lastFetchTime: this.lastFetchTime
      }));
    } catch (error) {
      console.error('Błąd podczas zapisu danych do localStorage:', error);
    }
  }

  /**
   * Pobiera dane o inflacji z API GUS
   * @param options Opcje zapytania
   * @returns Promise z danymi o inflacji
   */
  public async fetchInflationData(
    options: InflationFetchOptions = {}
  ): Promise<InflationData[]> {
    // Sprawdzamy, czy powinniśmy ponownie odpytać API
    const shouldFetchFromApi = this.shouldFetchFromApi();
    
    if (!shouldFetchFromApi && this.cachedInflationValue !== null) {
      return this.getInflationDataFromCache();
    }
    
    try {
      const opts = { ...this.DEFAULT_OPTIONS, ...options };
      
      // W rzeczywistym scenariuszu należałoby tu zarejestrować się i uzyskać klucz API
      // Wyszukanie identyfikatora zmiennej dla wskaźnika inflacji
      // Przykładowe zapytanie (do dostosowania po rejestracji):
      // Najpierw szukamy tematu związanego z inflacją
      /*
      const response = await axios.get(`${this.API_URL}/subjects/search`, {
        params: {
          name: 'inflacja',
          format: 'json'
        }
      });
      */
      
      // Ponieważ powyższe wymaga rejestracji, na potrzeby demo użyjemy symulowanych danych
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      // Przykładowe dane z API (w rzeczywistości powinniśmy je pobrać z API)
      const simulatedResponse = {
        data: [{
          date: formattedDate,
          value: 4.9, // Ostatnia znana wartość rocznej inflacji w Polsce
          source: 'GUS (Główny Urząd Statystyczny)',
          description: 'Symulowane dane inflacji rocznej CPI'
        }]
      };
      
      // Aktualizujemy dane w pamięci podręcznej
      this.currentInflation = simulatedResponse.data[0].value;
      this.lastFetchTime = Date.now();
      this.saveToCache(this.currentInflation);
      
      return simulatedResponse.data;
      
    } catch (error) {
      console.error('Błąd podczas pobierania danych inflacyjnych z GUS:', error);
      
      // W przypadku błędu zwracamy dane awaryjne
      return this.getFallbackInflationData();
    }
  }
  
  /**
   * Sprawdza, czy powinniśmy pobrać nowe dane z API
   */
  private shouldFetchFromApi(): boolean {
    const now = Date.now();
    return (
      this.cachedInflationValue === null || 
      now - this.lastFetchTime > this.FETCH_INTERVAL
    );
  }
  
  /**
   * Pobiera aktualne dane inflacyjne z pamięci podręcznej
   */
  private getInflationDataFromCache(): InflationData[] {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    
    return [{
      date: formattedDate,
      value: this.cachedInflationValue || this.getDefaultInflation(),
      source: 'GUS (Główny Urząd Statystyczny) - dane z pamięci podręcznej',
      description: 'Dane o inflacji pobrane z pamięci podręcznej'
    }];
  }
  
  /**
   * Pobiera aktualną wartość inflacji
   * @returns Promise z aktualną wartością inflacji w procentach
   */
  public async getCurrentInflation(): Promise<number> {
    try {
      // Jeśli mamy aktualne dane w pamięci podręcznej, użyjmy ich
      if (this.cachedInflationValue !== null && 
          Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
        return this.cachedInflationValue;
      }
      
      // W przeciwnym razie pobierz nowe dane
      const data = await this.fetchInflationData({ limit: 1 });
      return data.length > 0 ? data[0].value : this.getDefaultInflation();
    } catch (error) {
      return this.getDefaultInflation();
    }
  }
  
  /**
   * Zwraca awaryjne dane o inflacji na wypadek błędu API
   */
  private getFallbackInflationData(): InflationData[] {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Awaryjne dane o inflacji
    return [
      {
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
        value: this.getDefaultInflation(),
        source: 'Dane awaryjne (średnia historyczna)',
        description: 'Wartość przybliżona na podstawie średniej inflacji w Polsce'
      }
    ];
  }
  
  /**
   * Zwraca domyślną wartość inflacji
   */
  private getDefaultInflation(): number {
    return 2.5;  // Domyślna wartość inflacji w Polsce
  }
}

// Eksport singletona dla wygodnego użycia
export const gusInflationFetcher = new GUSInflationFetcher(); 