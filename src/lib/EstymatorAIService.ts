/**
 * Serwis EstymatorAI - integracja z zewnętrznym API
 * Model Random Forest Regressor z dokładnością MAPE 0.29%
 * Łączy się z estymatorai-production.up.railway.app
 */

export interface EstymatorAIInput {
  city: string;
  district?: string;
  area: number;
  rooms: number;
  floor?: number;
  year?: number;
  locationTier?: 'premium' | 'high' | 'medium' | 'standard';
  condition?: 'excellent' | 'good' | 'average' | 'poor';
  buildingType?: 'blok' | 'kamienica' | 'dom' | 'loft';
  parking?: 'none' | 'street' | 'courtyard' | 'garage';
  finishing?: 'high' | 'standard' | 'basic';
  elevator?: 'no' | 'yes';
  balcony?: 'no' | 'yes';
  orientation?: 'north' | 'south' | 'east' | 'west';
  transport?: 'poor' | 'medium' | 'good' | 'excellent';
  totalFloors?: number;
  heating?: string;
  bathrooms?: number;
  kitchenType?: string;
  basement?: string;
  buildingMaterial?: string;
  ownership?: string;
  balconyArea?: number;
  lastRenovation?: number;
}

export interface EstymatorAIResponse {
  success: boolean;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  pricePerSqm?: number;
  method?: string;
  confidence?: string;
  note?: string;
  error?: string;
  timestamp?: string;
  modelInfo?: {
    type: string;
    version: string;
    accuracy: string;
  };
}

export class EstymatorAIService {
  private readonly apiUrl: string;
  private readonly timeout: number;

  constructor() {
    // URL API EstymatorAI - można nadpisać przez zmienną środowiskową
    this.apiUrl = process.env.ESTYMATORAI_API_URL || 'https://estymatorai-production.up.railway.app';
    this.timeout = 30000; // 30 sekund timeout
  }

  /**
   * Wywołuje API EstymatorAI dla wyceny nieruchomości
   */
  async getValuation(input: EstymatorAIInput): Promise<EstymatorAIResponse> {
    try {
      console.log('🤖 [EstymatorAI] Rozpoczynam wycenę...');
      console.log('🤖 [EstymatorAI] URL:', this.apiUrl);
      console.log('🤖 [EstymatorAI] Input:', JSON.stringify(input, null, 2));

      // Przygotuj dane w formacie oczekiwanym przez EstymatorAI API
      const requestData = this.prepareRequestData(input);
      
      const startTime = Date.now();
      
      const response = await fetch(`${this.apiUrl}/api/valuation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'KalkulatoryNieruchomosci/1.0',
          'Accept': 'application/json',
          'Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://kalkulatorynieruchomosci.pl'
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(this.timeout)
      });

      const responseTime = Date.now() - startTime;
      console.log(`🤖 [EstymatorAI] Response status: ${response.status} (${responseTime}ms)`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [EstymatorAI] API response not ok:', response.status, response.statusText);
        console.error('❌ [EstymatorAI] Error response body:', errorText);
        
        return {
          success: false,
          error: `API error: ${response.status} ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }

      const result = await response.json();
      console.log('🤖 [EstymatorAI] Full response:', JSON.stringify(result, null, 2));

      // Walidacja odpowiedzi
      if (this.isValidResponse(result)) {
        console.log('✅ [EstymatorAI] Sukces:', result.price);
        
        return {
          success: true,
          price: result.price,
          minPrice: result.minPrice,
          maxPrice: result.maxPrice,
          pricePerSqm: result.pricePerSqm || Math.round(result.price / input.area),
          method: 'estymatorai_external',
          confidence: result.confidence || '±2%',
          note: result.note || 'Wycena przez EstymatorAI v1.0 z dokładnością 0.29% MAPE',
          timestamp: result.timestamp || new Date().toISOString(),
          modelInfo: {
            type: 'Random Forest Regressor',
            version: '1.0',
            accuracy: '0.29% MAPE'
          }
        };
      } else {
        console.error('❌ [EstymatorAI] Nieprawidłowa odpowiedź:', result);
        
        return {
          success: false,
          error: 'Nieprawidłowa odpowiedź z API EstymatorAI',
          timestamp: new Date().toISOString()
        };
      }

    } catch (error) {
      console.error('❌ [EstymatorAI] Błąd wywołania API:', error);
      
      if (error instanceof Error) {
        console.error('❌ [EstymatorAI] Szczegóły błędu:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 500)
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Przygotowuje dane wejściowe w formacie oczekiwanym przez EstymatorAI API
   */
  private prepareRequestData(input: EstymatorAIInput): Record<string, unknown> {
    return {
      city: input.city.trim(),
      district: input.district?.trim() || '',
      area: input.area,
      rooms: input.rooms,
      floor: input.floor || 0,
      year: input.year || 1990,
      locationTier: input.locationTier || 'medium',
      condition: input.condition || 'good',
      buildingType: input.buildingType || 'blok',
      parking: input.parking || 'none',
      finishing: input.finishing || 'standard',
      elevator: input.elevator || 'no',
      balcony: input.balcony || 'no',
      orientation: input.orientation || 'unknown',
      transport: input.transport || 'medium',
      totalFloors: input.totalFloors || 5,
      heating: input.heating || '',
      bathrooms: input.bathrooms || 1,
      kitchenType: input.kitchenType || '',
      basement: input.basement || '',
      buildingMaterial: input.buildingMaterial || '',
      ownership: input.ownership || '',
      balconyArea: input.balconyArea || 0,
      lastRenovation: input.lastRenovation || 0
    };
  }

  /**
   * Sprawdza czy odpowiedź z API jest prawidłowa
   */
  private isValidResponse(response: any): boolean {
    return !!(
      response &&
      typeof response.price === 'number' &&
      response.price > 50000 &&
      response.price < 5000000 &&
      response.price > 0
    );
  }

  /**
   * Sprawdza dostępność API EstymatorAI
   */
  async checkHealth(): Promise<boolean> {
    try {
      console.log('🏥 [EstymatorAI] Sprawdzam dostępność API...');
      
      const response = await fetch(`${this.apiUrl}/api/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'KalkulatoryNieruchomosci/1.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 sekund dla health check
      });

      if (response.ok) {
        console.log('✅ [EstymatorAI] API dostępne');
        return true;
      } else {
        console.log('❌ [EstymatorAI] API niedostępne:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ [EstymatorAI] Błąd health check:', error);
      return false;
    }
  }
}

// Singleton instance
export const estymatorAIService = new EstymatorAIService();
