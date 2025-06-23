import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { spawn } from 'child_process'
import path from 'path'

// === Schemat wejściowy ===
const ValuationSchema = z.object({
  city: z.string().min(2, 'Podaj miasto'),
  district: z.string().min(2, 'Podaj dzielnicę').optional(),
  street: z.string().min(2).optional(),
  area: z.number().positive('Metraż musi być > 0'),
  rooms: z.number().int().positive('Liczba pokoi > 0'),
  floor: z.number().int().nonnegative().optional(),
  year: z.number().int().optional(),
  locationTier: z.enum(['premium', 'high', 'medium', 'standard']).optional(),
  condition: z.enum(['new', 'good', 'renovated', 'poor']).optional(),
  buildingType: z.enum(['apartment', 'tenement', 'house', 'townhouse']).optional(),
  parking: z.enum(['none', 'street', 'paid', 'included']).optional(),
  finishing: z.enum(['developer', 'standard', 'premium', 'to_finish']).optional(),
  elevator: z.enum(['no', 'yes', 'planned']).optional(),
  balcony: z.enum(['none', 'balcony', 'terrace', 'loggia', 'garden']).optional(),
  orientation: z.enum(['unknown', 'north', 'south', 'east', 'west', 'south-west', 'south-east', 'north-west', 'north-east']).optional(),
  transport: z.enum(['poor', 'medium', 'good', 'excellent']).optional(),
  totalFloors: z.number().int().positive().optional(),
})

// === Funkcja do wywołania Ensemble modelu ===
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
}): Promise<number | null> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_ensemble_compatible.py')
    const modelPath = path.join(process.cwd(), 'models', 'ensemble_optimized_0.78pct.pkl')
    
    // Mapowanie condition -> building_age_category
    const conditionToAgeCategory = {
      'new': 'very_new',
      'good': inputData.year >= 2010 ? 'new' : inputData.year >= 2000 ? 'modern' : 'renovated',
      'renovated': 'renovated',
      'poor': 'old'
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
      building_type: inputData.buildingType || 'apartment',
      parking: inputData.parking || 'none',
      finishing: inputData.finishing || 'standard',
      elevator: inputData.elevator || 'no',
      balcony: inputData.balcony || 'none',
      orientation: inputData.orientation || 'unknown',
      transport: inputData.transport || 'medium',
      total_floors: inputData.totalFloors || 0
    }
    
    console.log('[Ensemble] Input data:', JSON.stringify(ensembleInput, null, 2))
    
    const pythonProcess = spawn('bash', ['-c', `source venv/bin/activate && python ${scriptPath} ${modelPath} '${JSON.stringify(ensembleInput)}'`])
    
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
    const pythonProcess = spawn('bash', ['-c', `source venv/bin/activate && python ${scriptPath} '${JSON.stringify(inputData)}'`])
    
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
    const parsed = ValuationSchema.safeParse(body)

    if (!parsed.success) {
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

    // === Próba użycia Ensemble modelu ===
    console.log('[Valuation API] Wywołuję Ensemble model...')
    let mlPrice = await callEnsembleModel(modelInput)
    let method: string
    let price: number

    if (mlPrice && mlPrice > 50000 && mlPrice < 5000000) {
      // Sukces Ensemble
      price = Math.round(mlPrice / 1000) * 1000
      method = 'ensemble_v2.0_0.78pct'
      console.log('[Valuation API] Ensemble sukces:', price)
    } else {
      // Fallback do Random Forest
      console.log('[Valuation API] Ensemble failed, próba Random Forest...')
      mlPrice = await callRandomForestModel(modelInput)
      
      if (mlPrice && mlPrice > 50000 && mlPrice < 5000000) {
        // Sukces Random Forest
        price = Math.round(mlPrice / 1000) * 1000
        method = 'random_forest_v1.0_fallback'
        console.log('[Valuation API] Random Forest fallback sukces:', price)
      } else {
        // Ostateczny fallback do heurystyki
        price = calculateHeuristicPrice(city, area, rooms, year)
        method = 'heuristic_fallback_v1.0'
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
        ? 'Wycena oparta o zaawansowany model Ensemble (LightGBM + Random Forest + CatBoost) z dokładnością 0.78% MAPE'
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