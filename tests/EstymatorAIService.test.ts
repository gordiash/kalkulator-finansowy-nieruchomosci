/**
 * Testy jednostkowe dla EstymatorAIService
 */

import { EstymatorAIService } from '@/lib/EstymatorAIService';

// Mock fetch
global.fetch = jest.fn();

describe('EstymatorAIService', () => {
  let service: EstymatorAIService;

  beforeEach(() => {
    service = new EstymatorAIService();
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getValuation', () => {
    it('powinien zwrócić sukces dla prawidłowej odpowiedzi API', async () => {
      // Mock odpowiedzi API
      const mockResponse = {
        price: 450000,
        minPrice: 441000,
        maxPrice: 459000,
        pricePerSqm: 6923,
        method: 'estymatorai_external',
        confidence: '±2%',
        note: 'Wycena przez EstymatorAI External API',
        timestamp: '2024-01-01T00:00:00.000Z'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const input = {
        city: 'Olsztyn',
        district: 'Śródmieście',
        area: 65,
        rooms: 3,
        floor: 2,
        year: 2015,
        locationTier: 'premium' as const,
        condition: 'good' as const,
        buildingType: 'blok' as const,
        parking: 'street' as const,
        finishing: 'standard' as const,
        elevator: 'yes' as const,
        balcony: 'yes' as const,
        orientation: 'south' as const,
        transport: 'good' as const,
        totalFloors: 5
      };

      const result = await service.getValuation(input);

      expect(result.success).toBe(true);
      expect(result.price).toBe(450000);
      expect(result.minPrice).toBe(441000);
      expect(result.maxPrice).toBe(459000);
      expect(result.method).toBe('estymatorai_external');
      expect(result.confidence).toBe('±2%');
    });

    it('powinien zwrócić błąd dla nieprawidłowej odpowiedzi API', async () => {
      // Mock odpowiedzi z błędem
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error')
      });

      const input = {
        city: 'Olsztyn',
        area: 65,
        rooms: 3
      };

      const result = await service.getValuation(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('API error: 500');
    });

    it('powinien zwrócić błąd dla nieprawidłowej ceny w odpowiedzi', async () => {
      // Mock odpowiedzi z nieprawidłową ceną
      const mockResponse = {
        price: 1000, // Za niska cena
        method: 'estymatorai_external'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const input = {
        city: 'Olsztyn',
        area: 65,
        rooms: 3
      };

      const result = await service.getValuation(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Nieprawidłowa odpowiedź z API EstymatorAI');
    });

    it('powinien obsłużyć błąd sieci', async () => {
      // Mock błędu sieci
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const input = {
        city: 'Olsztyn',
        area: 65,
        rooms: 3
      };

      const result = await service.getValuation(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('checkHealth', () => {
    it('powinien zwrócić true dla dostępnego API', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      const result = await service.checkHealth();

      expect(result).toBe(true);
    });

    it('powinien zwrócić false dla niedostępnego API', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503
      });

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });

    it('powinien zwrócić false dla błędu sieci', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });
  });

  describe('prepareRequestData', () => {
    it('powinien przygotować dane w prawidłowym formacie', () => {
      const input = {
        city: 'Olsztyn',
        district: 'Śródmieście',
        area: 65,
        rooms: 3,
        floor: 2,
        year: 2015,
        locationTier: 'premium' as const,
        condition: 'good' as const,
        buildingType: 'blok' as const,
        parking: 'street' as const,
        finishing: 'standard' as const,
        elevator: 'yes' as const,
        balcony: 'yes' as const,
        orientation: 'south' as const,
        transport: 'good' as const,
        totalFloors: 5,
        heating: 'miejskie',
        bathrooms: 1,
        kitchenType: 'anex',
        basement: 'nie',
        buildingMaterial: 'cegła',
        ownership: 'własność',
        balconyArea: 8,
        lastRenovation: 2020
      };

      // Dostęp do prywatnej metody przez any
      const requestData = (service as any).prepareRequestData(input);

      expect(requestData.city).toBe('Olsztyn');
      expect(requestData.district).toBe('Śródmieście');
      expect(requestData.area).toBe(65);
      expect(requestData.rooms).toBe(3);
      expect(requestData.floor).toBe(2);
      expect(requestData.year).toBe(2015);
      expect(requestData.locationTier).toBe('premium');
      expect(requestData.condition).toBe('good');
      expect(requestData.buildingType).toBe('blok');
      expect(requestData.parking).toBe('street');
      expect(requestData.finishing).toBe('standard');
      expect(requestData.elevator).toBe('yes');
      expect(requestData.balcony).toBe('yes');
      expect(requestData.orientation).toBe('south');
      expect(requestData.transport).toBe('good');
      expect(requestData.totalFloors).toBe(5);
      expect(requestData.heating).toBe('miejskie');
      expect(requestData.bathrooms).toBe(1);
      expect(requestData.kitchenType).toBe('anex');
      expect(requestData.basement).toBe('nie');
      expect(requestData.buildingMaterial).toBe('cegła');
      expect(requestData.ownership).toBe('własność');
      expect(requestData.balconyArea).toBe(8);
      expect(requestData.lastRenovation).toBe(2020);
    });

    it('powinien ustawić domyślne wartości dla opcjonalnych pól', () => {
      const input = {
        city: 'Olsztyn',
        area: 65,
        rooms: 3
      };

      const requestData = (service as any).prepareRequestData(input);

      expect(requestData.district).toBe('');
      expect(requestData.floor).toBe(0);
      expect(requestData.year).toBe(1990);
      expect(requestData.locationTier).toBe('medium');
      expect(requestData.condition).toBe('good');
      expect(requestData.buildingType).toBe('blok');
      expect(requestData.parking).toBe('none');
      expect(requestData.finishing).toBe('standard');
      expect(requestData.elevator).toBe('no');
      expect(requestData.balcony).toBe('no');
      expect(requestData.orientation).toBe('unknown');
      expect(requestData.transport).toBe('medium');
      expect(requestData.totalFloors).toBe(5);
      expect(requestData.heating).toBe('');
      expect(requestData.bathrooms).toBe(1);
      expect(requestData.kitchenType).toBe('');
      expect(requestData.basement).toBe('');
      expect(requestData.buildingMaterial).toBe('');
      expect(requestData.ownership).toBe('');
      expect(requestData.balconyArea).toBe(0);
      expect(requestData.lastRenovation).toBe(0);
    });
  });

  describe('isValidResponse', () => {
    it('powinien zwrócić true dla prawidłowej odpowiedzi', () => {
      const response = {
        price: 450000,
        method: 'estymatorai_external'
      };

      const isValid = (service as any).isValidResponse(response);

      expect(isValid).toBe(true);
    });

    it('powinien zwrócić false dla zbyt niskiej ceny', () => {
      const response = {
        price: 1000,
        method: 'estymatorai_external'
      };

      const isValid = (service as any).isValidResponse(response);

      expect(isValid).toBe(false);
    });

    it('powinien zwrócić false dla zbyt wysokiej ceny', () => {
      const response = {
        price: 10000000,
        method: 'estymatorai_external'
      };

      const isValid = (service as any).isValidResponse(response);

      expect(isValid).toBe(false);
    });

    it('powinien zwrócić false dla braku ceny', () => {
      const response = {
        method: 'estymatorai_external'
      };

      const isValid = (service as any).isValidResponse(response);

      expect(isValid).toBe(false);
    });

    it('powinien zwrócić false dla null/undefined', () => {
      expect((service as any).isValidResponse(null)).toBe(false);
      expect((service as any).isValidResponse(undefined)).toBe(false);
    });
  });
});
