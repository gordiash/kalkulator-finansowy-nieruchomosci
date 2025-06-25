import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { spawn } from 'child_process'
import path from 'path'

// === Schemat wejściowy ===
const ValuationSchema = z.object({
  city: z.string().min(2, 'Podaj miasto'),
  district: z.string().optional(),
  street: z.string().optional(),
  area: z.number().positive('Metraż musi być > 0'),
  rooms: z.number().int().positive('Liczba pokoi > 0'),
  floor: z.number().int().nonnegative().optional(),
  year: z.number().int().optional(),
  locationTier: z.enum(['premium', 'high', 'medium', 'standard']).optional(),
  condition: z.enum(['excellent', 'good', 'average', 'poor']).optional(),
  buildingType: z.enum(['blok', 'kamienica', 'dom', 'loft']).optional(),
  parking: z.enum(['none', 'street', 'courtyard', 'garage']).optional(),
  finishing: z.enum(['high', 'standard', 'basic']).optional(),
  elevator: z.enum(['no', 'yes']).optional(),
  balcony: z.enum(['no', 'yes']).optional(),
  orientation: z.enum(['north', 'south', 'east', 'west']).optional(),
  transport: z.enum(['poor', 'medium', 'good', 'excellent']).optional(),
  totalFloors: z.number().int().positive().optional(),
  heating: z.string().optional(),
  bathrooms: z.string().optional(),
  kitchenType: z.string().optional(),
  basement: z.string().optional(),
  buildingMaterial: z.string().optional(),
  ownership: z.string().optional(),
  balconyArea: z.string().optional(),
  lastRenovation: z.string().optional(),
})

// === Funkcja do wywołania EstymatorAI ===
async function callEnsembleModel(inputData: {
  city: string;
  district: string;
  area: number;
  rooms: number;
  floor: number;
  year: number;
  locationTier?: string;
  condition?: string;
  buildingType?: string;
  parking?: string;
  finishing?: string;
  elevator?: string;
  balcony?: string;
  orientation?: string;
  transport?: string;
  totalFloors?: number;
  heating?: string;
  bathrooms?: string;
  kitchenType?: string;
  basement?: string;
  buildingMaterial?: string;
  ownership?: string;
  balconyArea?: string;
  lastRenovation?: string;
}): Promise<number | null> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_ensemble_compatible.py')
    const modelPath = path.join(process.cwd(), 'models', 'ensemble_optimized_0.79pct.pkl')
    
    // Mapowanie condition -> building_age_category
    const conditionToAgeCategory = {
      'excellent': 'very_new',
      'good': inputData.year >= 2010 ? 'new' : inputData.year >= 2000 ? 'modern' : 'renovated',
      'average': 'renovated',
      'poor': 'old'
    }
    
    // Mapowanie buildingType frontend -> API
    const buildingTypeMapping = {
      'blok': 'apartment',
      'kamienica': 'tenement', 
      'dom': 'house',
      'loft': 'house'
    }

    // Mapowanie parking frontend -> API
    const parkingMapping = {
      'none': 'none',
      'street': 'street',
      'courtyard': 'street',
      'garage': 'included'
    }

    // Mapowanie finishing frontend -> API
    const finishingMapping = {
      'high': 'premium',
      'standard': 'standard', 
      'basic': 'to_finish'
    }

    // Mapowanie balcony frontend -> API
    const balconyMapping = {
      'yes': 'balcony',
      'no': 'none'
    }

    // Przygotuj dane w formacie oczekiwanym przez ensemble
    const ensembleInput = {
      city: inputData.city,
      district: inputData.district,
      area: inputData.area,
      rooms: inputData.rooms,
      year_built: inputData.year,
      location_tier: inputData.locationTier || 'medium',
      building_age_category: conditionToAgeCategory[inputData.condition as keyof typeof conditionToAgeCategory] || 'modern',
      building_type: buildingTypeMapping[inputData.buildingType as keyof typeof buildingTypeMapping] || 'apartment',
      parking: parkingMapping[inputData.parking as keyof typeof parkingMapping] || 'none',
      finishing: finishingMapping[inputData.finishing as keyof typeof finishingMapping] || 'standard',
      elevator: inputData.elevator || 'no',
      balcony: balconyMapping[inputData.balcony as keyof typeof balconyMapping] || 'none',
      orientation: inputData.orientation || 'unknown',
      transport: inputData.transport || 'medium',
      total_floors: inputData.totalFloors || 0,
      heating: inputData.heating || '',
      bathrooms: inputData.bathrooms || '',
      kitchen_type: inputData.kitchenType || '',
      basement: inputData.basement || '',
      building_material: inputData.buildingMaterial || '',
      ownership: inputData.ownership || '',
      balcony_area: inputData.balconyArea || '',
      last_renovation: inputData.lastRenovation || ''
    }
    
    console.log('[Ensemble] Input data:', JSON.stringify(ensembleInput, null, 2))
    
    const pythonProcess = spawn('python', [scriptPath, modelPath, JSON.stringify(ensembleInput)])
    
    let output = ''
    let errorOutput = ''
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
      console.log('[Ensemble] stdout:', data.toString())
    })
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
      console.log('[Ensemble] stderr:', data.toString())
    })
    
    pythonProcess.on('close', (code) => {
      console.log('[Ensemble] Process closed with code:', code)
      console.log('[Ensemble] Full output:', output)
      console.log('[Ensemble] Full error:', errorOutput)
      
      if (code === 0) {
        try {
          // Szukaj JSON block - od "JSON:" do końca lub najbliższego newline po }
          let jsonResult = null;
          
          // Szukaj sekcji JSON:
          const jsonSectionMatch = output.match(/JSON:\s*(\{[\s\S]*?\})\s*$/m);
          if (jsonSectionMatch) {
            try {
              jsonResult = JSON.parse(jsonSectionMatch[1]);
              console.log('[Ensemble] Found JSON section:', jsonResult);
            } catch (e) {
              console.error('[Ensemble] Błąd parsowania JSON section:', e);
            }
          }
          
          // Fallback - szukaj ostatniego kompletnego JSON block
          if (!jsonResult) {
            const lines = output.split('\n');
            let jsonLines: string[] = [];
            let inJson = false;
            let braceCount = 0;
            
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('{')) {
                inJson = true;
                jsonLines = [trimmed];
                braceCount = (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
              } else if (inJson) {
                jsonLines.push(trimmed);
                braceCount += (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
                
                if (braceCount === 0) {
                  // Kompletny JSON block
                  try {
                    const jsonString = jsonLines.join('');
                    jsonResult = JSON.parse(jsonString);
                    console.log('[Ensemble] Found complete JSON block:', jsonResult);
                    break;
                  } catch (e) {
                    console.error('[Ensemble] Błąd parsowania JSON block:', e);
                    inJson = false;
                    jsonLines = [];
                  }
                }
              }
            }
          }
          
          if (jsonResult && jsonResult.ensemble_prediction) {
            console.log('[Ensemble] Success:', jsonResult.ensemble_prediction);
            resolve(jsonResult.ensemble_prediction);
          } else {
            console.error('[Ensemble] Brak ensemble_prediction w odpowiedzi:', jsonResult);
            resolve(null);
          }
        } catch (e) {
          console.error('[Ensemble] Błąd parsowania JSON:', e, 'Output:', output);
          resolve(null);
        }
      } else {
        console.error('[Ensemble] Błąd wykonania, kod:', code, 'Error:', errorOutput);
        resolve(null);
      }
    })
    
    // Timeout po 15 sekund (ensemble może być wolniejszy)
    setTimeout(() => {
      pythonProcess.kill()
      console.error('[Ensemble] Timeout')
      resolve(null)
    }, 15000)
  })
}

// === Fallback do Random Forest ===
async function callRandomForestModel(inputData: {
  city: string;
  district: string;
  area: number;
  rooms: number;
  floor: number;
  year: number;
}): Promise<number | null> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_rf.py')
    const pythonProcess = spawn('python', [scriptPath, JSON.stringify(inputData)])
    
    let output = ''
    let errorOutput = ''
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim())
          if (result.predicted_price) {
            resolve(result.predicted_price)
          } else {
            console.error('[Random Forest] Brak predicted_price w odpowiedzi:', result)
            resolve(null)
          }
        } catch (e) {
          console.error('[Random Forest] Błąd parsowania JSON:', e, 'Output:', output)
          resolve(null)
        }
      } else {
        console.error('[Random Forest] Błąd wykonania:', errorOutput)
        resolve(null)
      }
    })
    
    // Timeout po 10 sekundach
    setTimeout(() => {
      pythonProcess.kill()
      console.error('[Random Forest] Timeout')
      resolve(null)
    }, 10000)
  })
}

// === Fallback heurystyka ===
function calculateHeuristicPrice(city: string, area: number, rooms: number, year?: number): number {
  let pricePerSqm = 8000 // domyślna średnia PLN/m²
  
  // Ceny dla regionu Olsztyn
  switch (city.toLowerCase()) {
    case 'olsztyn':
      pricePerSqm = 7500
      break
    case 'stawiguda':
      pricePerSqm = 6500
      break
    case 'olsztyński':
      pricePerSqm = 6000
      break
    case 'dywity':
      pricePerSqm = 6500
      break
    default:
      pricePerSqm = 7000
  }

  let price = area * pricePerSqm

  // Korekta za liczbę pokoi
  if (rooms > 2) {
    price += (rooms - 2) * 15000
  }

  // Korekta za rok budowy
  if (year) {
    if (year > 2010) price *= 1.05
    else if (year < 1970) price *= 0.9
  }

  return Math.round(price / 1000) * 1000
}

// Mapowanie tier i age category (nieużywane - usunięte jako komentarz)
// function mapLocationTier(city: string, district: string): string {
//   if (city === 'Olsztyn') {
//     if (['Śródmieście', 'Centrum', 'Zatorze'].includes(district)) return 'premium';
//     if (['Kortowo', 'Jaroty', 'Nagórki'].includes(district)) return 'high';
//     if (['Pieczewo', 'Gutkowo', 'Generałów'].includes(district)) return 'medium';
//   }
//   return 'standard';
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Valuation API] Received body:', JSON.stringify(body, null, 2))
    
    const parsed = ValuationSchema.safeParse(body)

    if (!parsed.success) {
      console.error('[Valuation API] Validation failed:', JSON.stringify(parsed.error.format(), null, 2))
      return NextResponse.json(
        { error: 'Nieprawidłowe dane wejściowe', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { city, district, area, rooms, floor, year, locationTier, condition, buildingType, parking, finishing, elevator, balcony, orientation, transport, totalFloors } = parsed.data

    // Przygotuj dane dla modelu ML
    const modelInput = {
      city: city.trim(),
      district: district?.trim() || '',
      area,
      rooms,
      floor: floor || 0,
      year: year || 1990,
      locationTier,
      condition,
      buildingType,
      parking,
      finishing,
      elevator,
      balcony,
      orientation,
      transport,
      totalFloors,
    }

            // === Próba użycia EstymatorAI ===
        console.log('[Valuation API] Wywołuję EstymatorAI...')
    let mlPrice = await callEnsembleModel(modelInput)
    let method: string
    let price: number

    if (mlPrice && mlPrice > 50000 && mlPrice < 5000000) {
      // Sukces Ensemble
      price = Math.round(mlPrice / 1000) * 1000
              method = 'ensemble_EstymatorAI'
      console.log('[Valuation API] Ensemble sukces:', price)
    } else {
      // Fallback do Random Forest
      console.log('[Valuation API] Ensemble failed, próba Random Forest...')
      mlPrice = await callRandomForestModel(modelInput)
      
      if (mlPrice && mlPrice > 50000 && mlPrice < 5000000) {
        // Sukces Random Forest
        price = Math.round(mlPrice / 1000) * 1000
        method = 'random_forest_fallback'
        console.log('[Valuation API] Random Forest fallback sukces:', price)
      } else {
        // Ostateczny fallback do heurystyki
        price = calculateHeuristicPrice(city, area, rooms, year)
        method = 'heuristic_fallback'
        console.log('[Valuation API] Fallback do heurystyki:', price)
      }
    }

    // Oblicz widełki - lepsze dla Ensemble
    const isEnsemble = method.includes('ensemble')
    const isML = method.includes('ensemble') || method.includes('random_forest')
    const confidence = isEnsemble ? 0.02 : isML ? 0.07 : 0.05  // Ensemble: ±2%, RF: ±7%, Heurystyka: ±5%
    const minPrice = Math.round(price * (1 - confidence) / 1000) * 1000
    const maxPrice = Math.round(price * (1 + confidence) / 1000) * 1000

    return NextResponse.json({
      price,
      minPrice,
      maxPrice,
      currency: 'PLN',
      method,
      confidence: `±${Math.round(confidence * 100)}%`,
      note: isEnsemble 
        ? 'Wycena oparta o zaawansowany model Ensemble (LightGBM + Random Forest + CatBoost) z dokładnością 0.79% MAPE'
        : method.includes('random_forest')
        ? 'Wycena oparta o model Random Forest (fallback) z dokładnością 15.56% MAPE'
        : 'Wycena heurystyczna - modele ML niedostępne',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Valuation API] Błąd:', error)
    
    // Emergency fallback
    const body = await request.json().catch(() => ({}))
    const emergencyPrice = calculateHeuristicPrice(
      body.city || 'olsztyn', 
      body.area || 50, 
      body.rooms || 2, 
      body.year
    )
    
    return NextResponse.json({
      price: emergencyPrice,
      minPrice: Math.round(emergencyPrice * 0.95 / 1000) * 1000,
      maxPrice: Math.round(emergencyPrice * 1.05 / 1000) * 1000,
      currency: 'PLN',
      method: 'emergency_heuristic',
      error: 'Błąd serwera - użyto wyceny awaryjnej',
    })
  }
} 