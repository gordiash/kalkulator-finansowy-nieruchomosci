/**
 * Test integracji z EstymatorAI External API
 * Sprawdza czy API odpowiada poprawnie
 */

import { estymatorAIService } from '@/lib/EstymatorAIService';

async function testEstymatorAIIntegration() {
  console.log('🧪 [Test] Rozpoczynam test integracji EstymatorAI...');
  
  try {
    // Test 1: Sprawdzenie dostępności API
    console.log('📡 [Test] Sprawdzam dostępność API...');
    const isHealthy = await estymatorAIService.checkHealth();
    
    if (isHealthy) {
      console.log('✅ [Test] API EstymatorAI jest dostępne');
    } else {
      console.log('❌ [Test] API EstymatorAI jest niedostępne');
      return;
    }

    // Test 2: Przykładowa wycena
    console.log('🏠 [Test] Testuję wycenę mieszkania...');
    const testInput = {
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

    const result = await estymatorAIService.getValuation(testInput);
    
    if (result.success && result.price) {
      console.log('✅ [Test] Wycena zakończona sukcesem!');
      console.log('💰 [Test] Cena:', result.price, 'PLN');
      console.log('📊 [Test] Metoda:', result.method);
      console.log('🎯 [Test] Dokładność:', result.confidence);
      console.log('📝 [Test] Notatka:', result.note);
      
      // Walidacja wyniku
      if (result.price > 50000 && result.price < 5000000) {
        console.log('✅ [Test] Cena w prawidłowym zakresie');
      } else {
        console.log('❌ [Test] Cena poza prawidłowym zakresem');
      }
      
      if (result.minPrice && result.maxPrice) {
        console.log('📈 [Test] Widełki:', result.minPrice, '-', result.maxPrice, 'PLN');
      }
      
    } else {
      console.log('❌ [Test] Błąd wyceny:', result.error);
    }

  } catch (error) {
    console.error('💥 [Test] Błąd podczas testu:', error);
  }
}

// Uruchom test jeśli plik jest wykonywany bezpośrednio
if (require.main === module) {
  testEstymatorAIIntegration()
    .then(() => {
      console.log('🏁 [Test] Test zakończony');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [Test] Test zakończony błędem:', error);
      process.exit(1);
    });
}

export { testEstymatorAIIntegration };
