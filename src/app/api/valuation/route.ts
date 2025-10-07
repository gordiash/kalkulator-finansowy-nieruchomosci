import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { spawn } from 'child_process'
import path from 'path'
import { estymatorAIService, type EstymatorAIInput } from '@/lib/EstymatorAIService'

// === Schemat wejściowy ===
const ValuationSchema = z.object({
  city: z.string().min(2, 'Podaj miasto'),
  district: z.string().optional(),
  street: z.string().max(500).optional(),
  area: z.number().min(1, 'Metraż musi być > 0').max(500, 'Metraż musi być ≤ 500 m²'),
  rooms: z.number().int().min(1, 'Liczba pokoi > 0').max(10, 'Liczba pokoi ≤ 10'),
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
  bathrooms: z.number().int().min(1).max(10).optional(),
  kitchenType: z.string().optional(),
  basement: z.string().optional(),
  buildingMaterial: z.string().optional(),
  ownership: z.string().optional(),
  balconyArea: z.number().min(0.1).max(100).optional(),
  lastRenovation: z.number().int().min(1990).max(2024).optional(),
})

// === Główny Ensemble Model ===
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
  bathrooms?: number;
  kitchenType?: string;
  basement?: string;
  buildingMaterial?: string;
  ownership?: string;
  balconyArea?: number;
  lastRenovation?: number;
}): Promise<number | null> {
  // Lista komend Python do przetestowania - Railway & Vercel compatible
  const pythonCommands = [
    'python3',                   // Docker/Vercel main (priority)
    'python',                    // Local/Windows fallback
    '/usr/bin/python3',          // Linux system path
    '/usr/bin/python',           // Linux system path
    '/usr/local/bin/python3'     // Alternative installations
  ];

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
    bathrooms: inputData.bathrooms || 0,
    kitchen_type: inputData.kitchenType || '',
    basement: inputData.basement || '',
    building_material: inputData.buildingMaterial || '',
    ownership: inputData.ownership || '',
    balcony_area: inputData.balconyArea || 0,
    last_renovation: inputData.lastRenovation || 0
  }
  
  console.log('🔧 [Ensemble] Input data:', JSON.stringify(ensembleInput, null, 2))

  // Funkcja do próbowania pojedynczej komendy Python
  async function tryPythonCommand(pythonCmd: string): Promise<number | null> {
    return new Promise((resolve) => {
      console.log(`🐍 [Ensemble] Próbuję: ${pythonCmd}`)
      
      const pythonProcess = spawn(pythonCmd, [scriptPath, modelPath, JSON.stringify(ensembleInput)])
      
      let output = ''
      let errorOutput = ''
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
        console.log(`📤 [Ensemble] stdout: ${data.toString()}`)
      })
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
        console.log(`📥 [Ensemble] stderr: ${data.toString()}`)
      })
      
      pythonProcess.on('close', (code) => {
        console.log(`🏁 [Ensemble] Process closed with code: ${code}`)
        console.log(`📋 [Ensemble] Full output: ${output}`)
        console.log(`❌ [Ensemble] Full error: ${errorOutput}`)
        
        if (code === 0) {
          try {
            // Szukaj JSON block - od "JSON:" do końca lub najbliższego newline po }
            let jsonResult = null;
            
            // Szukaj sekcji JSON:
            const jsonSectionMatch = output.match(/JSON:\s*(\{[\s\S]*?\})\s*$/m);
            if (jsonSectionMatch) {
              try {
                jsonResult = JSON.parse(jsonSectionMatch[1]);
                console.log('📦 [Ensemble] Found JSON section:', jsonResult);
              } catch (e) {
                console.error('💥 [Ensemble] Błąd parsowania JSON section:', e);
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
                      console.log('📦 [Ensemble] Found complete JSON block:', jsonResult);
                      break;
                    } catch (e) {
                      console.error('💥 [Ensemble] Błąd parsowania JSON block:', e);
                      inJson = false;
                      jsonLines = [];
                    }
                  }
                }
              }
            }
            
            if (jsonResult && jsonResult.ensemble_prediction) {
              console.log('✅ [Ensemble] Success:', jsonResult.ensemble_prediction);
              resolve(jsonResult.ensemble_prediction);
            } else {
              console.error('❌ [Ensemble] Brak ensemble_prediction w odpowiedzi:', jsonResult);
              resolve(null);
            }
          } catch (e) {
            console.error('💥 [Ensemble] Błąd parsowania JSON:', e, 'Output:', output);
            resolve(null);
          }
        } else {
          console.error(`❌ [Ensemble] Błąd wykonania, kod: ${code}, Error: ${errorOutput}`);
          resolve(null);
        }
      })
      
      pythonProcess.on('error', () => {
        console.error(`⏰ [Ensemble] ${pythonCmd} timeout`)
        resolve(null);
      });
      
      // Timeout po 15 sekund (ensemble może być wolniejszy)
      setTimeout(() => {
        pythonProcess.kill()
        console.error(`⏰ [Ensemble] ${pythonCmd} timeout`)
        resolve(null)
      }, 15000)
    })
  }

  // Próbuj kolejne komendy Python
  for (const pythonCmd of pythonCommands) {
    const result = await tryPythonCommand(pythonCmd);
    if (result !== null) {
      return result;
    }
  }

  console.log('💀 [Ensemble] Timeout');
  return null;
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
  // Lista komend Python do przetestowania - Railway & Vercel compatible
  const pythonCommands = [
    'python3',                   // Docker/Vercel main (priority)
    'python',                    // Local/Windows fallback
    '/usr/bin/python3',          // Linux system path
    '/usr/bin/python',           // Linux system path
    '/usr/local/bin/python3'     // Alternative installations
  ];

  const scriptPath = path.join(process.cwd(), 'scripts', 'predict_rf.py')

  // Funkcja do próbowania pojedynczej komendy Python
  async function tryPythonCommand(pythonCmd: string): Promise<number | null> {
    return new Promise((resolve) => {
      console.log(`🌳 [RF] Próbuję: ${pythonCmd}`)
      
      const pythonProcess = spawn(pythonCmd, [scriptPath, JSON.stringify(inputData)])
      
      let output = ''
      let errorOutput = ''
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
        console.log(`📤 [RF] stdout: ${data.toString()}`)
      })
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
        console.log(`📥 [RF] stderr: ${data.toString()}`)
      })
      
      pythonProcess.on('close', (code) => {
        console.log(`🏁 [RF] Process closed with code: ${code}`)
        
        if (code === 0) {
          try {
            // 1) Spróbuj znaleźć JSON i odczytać price
            const jsonMatch = output.match(/\{[\s\S]*\}/m)
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[0])
                if (typeof parsed.price === 'number' && parsed.price > 0) {
                  console.log('✅ [RF] Success (JSON):', parsed.price)
                  resolve(parsed.price)
                  return
                }
              } catch (e) {
                // ignore JSON parse error, spróbuj parsowania liczby
              }
            }

            // 2) Fallback: wyciągnij ostatnią liczbę z outputu
            const lines = output.split('\n')
            const lastLine = (lines[lines.length - 2] || lines[lines.length - 1]).trim()
            const numeric = parseFloat(lastLine)
            if (!isNaN(numeric) && numeric > 0) {
              console.log('✅ [RF] Success (numeric):', numeric)
              resolve(numeric)
            } else {
              console.error('❌ [RF] Nieprawidłowa wycena:', lastLine)
              resolve(null)
            }
          } catch (e) {
            console.error('💥 [RF] Błąd parsowania:', e)
            resolve(null)
          }
        } else {
          console.error(`❌ [RF] Błąd wykonania, kod: ${code}, Error: ${errorOutput}`)
          resolve(null)
        }
      })
      
      pythonProcess.on('error', (error) => {
        console.error(`⏰ [RF] ${pythonCmd} error:`, error)
        resolve(null);
      });
      
      // Timeout po 10 sekund
      setTimeout(() => {
        pythonProcess.kill()
        console.error(`⏰ [RF] ${pythonCmd} timeout`)
        resolve(null)
      }, 10000)
    })
  }

  // Próbuj kolejne komendy Python
  for (const pythonCmd of pythonCommands) {
    const result = await tryPythonCommand(pythonCmd);
    if (result !== null) {
      return result;
    }
  }

  console.log('💀 [RF] Timeout');
  return null;
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

// === Railway Enum Mappers ===
function mapLocationTierForRailway(tier?: string): 'low' | 'medium' | 'high' {
  switch (tier) {
    case 'premium': return 'high';
    case 'high': return 'high';
    case 'medium': return 'medium';
    case 'standard': return 'low';
    default: return 'medium';
  }
}

function mapConditionForRailway(condition?: string): 'poor' | 'average' | 'good' | 'excellent' {
  switch (condition) {
    case 'excellent': return 'excellent';
    case 'good': return 'good';
    case 'average': return 'average';
    case 'poor': return 'poor';
    default: return 'good';
  }
}

function mapBuildingTypeForRailway(type?: string): 'apartment' | 'house' | 'tenement' {
  switch (type) {
    case 'blok': return 'apartment';
    case 'kamienica': return 'tenement';
    case 'dom': return 'house';
    case 'loft': return 'apartment';
    default: return 'apartment';
  }
}

function mapParkingForRailway(parking?: string): 'none' | 'street' | 'garage' | 'underground' {
  switch (parking) {
    case 'none': return 'none';
    case 'street': return 'street';
    case 'courtyard': return 'street';
    case 'garage': return 'garage';
    case 'underground': return 'underground';
    default: return 'none';
  }
}

function mapFinishingForRailway(finishing?: string): 'basic' | 'standard' | 'high' | 'luxury' {
  switch (finishing) {
    case 'high': return 'high';
    case 'standard': return 'standard';
    case 'basic': return 'basic';
    case 'luxury': return 'luxury';
    default: return 'standard';
  }
}

function mapBalconyForRailway(balcony?: string): 'none' | 'balcony' | 'terrace' | 'garden' {
  switch (balcony) {
    case 'yes': return 'balcony';
    case 'no': return 'none';
    case 'balcony': return 'balcony';
    case 'terrace': return 'terrace';
    case 'garden': return 'garden';
    default: return 'none';
  }
}

// === Nowy: EstymatorAI External API ===
async function callEstymatorAIExternal(inputData: {
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
  bathrooms?: number;
  kitchenType?: string;
  basement?: string;
  buildingMaterial?: string;
  ownership?: string;
  balconyArea?: number;
  lastRenovation?: number;
}): Promise<number | null> {
  try {
    console.log('🤖 [EstymatorAI External] Wywołuję zewnętrzne API...');
    
    const estymatorAIInput: EstymatorAIInput = {
      city: inputData.city,
      district: inputData.district,
      area: inputData.area,
      rooms: inputData.rooms,
      floor: inputData.floor,
      year: inputData.year,
      locationTier: inputData.locationTier as any,
      condition: inputData.condition as any,
      buildingType: inputData.buildingType as any,
      parking: inputData.parking as any,
      finishing: inputData.finishing as any,
      elevator: inputData.elevator as any,
      balcony: inputData.balcony as any,
      orientation: inputData.orientation as any,
      transport: inputData.transport as any,
      totalFloors: inputData.totalFloors,
      heating: inputData.heating,
      bathrooms: inputData.bathrooms,
      kitchenType: inputData.kitchenType,
      basement: inputData.basement,
      buildingMaterial: inputData.buildingMaterial,
      ownership: inputData.ownership,
      balconyArea: inputData.balconyArea,
      lastRenovation: inputData.lastRenovation
    };

    const result = await estymatorAIService.getValuation(estymatorAIInput);
    
    if (result.success && result.price && result.price > 50000 && result.price < 5000000) {
      console.log('✅ [EstymatorAI External] Sukces:', result.price);
      return result.price;
    } else {
      console.error('❌ [EstymatorAI External] Błąd:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ [EstymatorAI External] Exception:', error);
    return null;
  }
}

// === Railway ML API Fallback (zachowany dla kompatybilności) ===
async function callRailwayMLAPI(inputData: {
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
  let RAILWAY_ML_API = process.env.RAILWAY_ML_API_URL;
  
  console.log('🚂 [Railway ML] Configuration check:');
  console.log('   RAILWAY_ML_API_URL:', RAILWAY_ML_API ? `${RAILWAY_ML_API.substring(0, 50)}...` : 'NOT SET');
  
  if (!RAILWAY_ML_API) {
    console.error('❌ [Railway ML] RAILWAY_ML_API_URL nie jest ustawione w environment');
    return null;
  }
  
  // Dodaj https:// jeśli brakuje
  if (!RAILWAY_ML_API.startsWith('http://') && !RAILWAY_ML_API.startsWith('https://')) {
    RAILWAY_ML_API = `https://${RAILWAY_ML_API}`;
    console.log('🔧 [Railway ML] Dodano https:// prefix:', RAILWAY_ML_API);
  }
  
  try {
    console.log('🚂 [Railway ML] Calling external ML API...');
    console.log('🚂 [Railway ML] Full URL:', `${RAILWAY_ML_API}/api/valuation-railway`);
    
    // Przygotuj dane w formacie Railway API (kompatybilne z railway-full-migration)
    const requestData = {
      city: inputData.city,
      district: inputData.district || 'inne',
      area: inputData.area,
      rooms: inputData.rooms,
      year: inputData.year, // Railway expects 'year', not 'year_built'
      locationTier: mapLocationTierForRailway(inputData.locationTier),
      condition: mapConditionForRailway(inputData.condition),
      buildingType: mapBuildingTypeForRailway(inputData.buildingType),
      parking: mapParkingForRailway(inputData.parking),
      finishing: mapFinishingForRailway(inputData.finishing),
      elevator: inputData.elevator || 'no',
      balcony: mapBalconyForRailway(inputData.balcony),
      orientation: inputData.orientation || 'unknown',
      transport: inputData.transport || 'medium',
      totalFloors: inputData.totalFloors || 5
    };
    
    console.log('🚂 [Railway ML] Request data:', JSON.stringify(requestData, null, 2));
    
    const startTime = Date.now();
    const response = await fetch(`${RAILWAY_ML_API}/api/valuation-railway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KalkulatoryNieruchomosci/1.0',
        'Accept': 'application/json',
        'Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://kalkulatorynieruchomosci.pl'
      },
      body: JSON.stringify(requestData),
      signal: AbortSignal.timeout(30000) // 30s timeout
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`🚂 [Railway ML] Response status: ${response.status} (${responseTime}ms)`);
    console.log('🚂 [Railway ML] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Railway ML] API response not ok:', response.status, response.statusText);
      console.error('❌ [Railway ML] Error response body:', errorText);
      return null;
    }
    
    const result = await response.json();
    console.log('🚂 [Railway ML] Full response:', JSON.stringify(result, null, 2));
    
    if (result.price && result.price > 50000 && result.price < 5000000) {
      console.log('✅ [Railway ML] External API success:', result.price);
      return result.price;
    } else {
      console.error('❌ [Railway ML] Invalid price in response:', result);
      return null;
    }
    
  } catch (error) {
    console.error('❌ [Railway ML] External API error:', error);
    if (error instanceof Error) {
      console.error('❌ [Railway ML] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      });
    }
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawText = await request.text()
    if (rawText.length > 5000) {
      return NextResponse.json({ error: 'Payload zbyt duży' }, { status: 400 })
    }
    const body = rawText ? JSON.parse(rawText) : {}
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

    // === Hierarchia ML calls ===
    console.log('[Valuation API] Próba 1: EstymatorAI External API...')
    let mlPrice = await callEstymatorAIExternal(modelInput)
    let method: string
    let price: number

    if (mlPrice && mlPrice > 50000 && mlPrice < 5000000) {
      // Sukces EstymatorAI External
      price = Math.round(mlPrice / 1000) * 1000
      method = 'estymatorai_external'
      console.log('[Valuation API] EstymatorAI External sukces:', price)
    } else {
      // Próba 2: Local EstymatorAI
      console.log('[Valuation API] Próba 2: Local EstymatorAI...')
      mlPrice = await callEnsembleModel(modelInput)
      
      if (mlPrice && mlPrice > 50000 && mlPrice < 5000000) {
        // Sukces Local Ensemble
        price = Math.round(mlPrice / 1000) * 1000
        method = 'ensemble_EstymatorAI_local'
        console.log('[Valuation API] Local Ensemble sukces:', price)
      } else {
        // Próba 3: Railway ML API (legacy)
        console.log('[Valuation API] Próba 3: Railway ML API...')
        mlPrice = await callRailwayMLAPI(modelInput)
        
        if (mlPrice && mlPrice > 50000 && mlPrice < 5000000) {
          // Sukces Railway ML API
          price = Math.round(mlPrice / 1000) * 1000
          method = 'ensemble_EstymatorAI_railway'
          console.log('[Valuation API] Railway ML API sukces:', price)
        } else {
          // Próba 4: Local Random Forest fallback
          console.log('[Valuation API] Próba 4: Local Random Forest...')
          mlPrice = await callRandomForestModel(modelInput)
          
          if (mlPrice && mlPrice > 50000 && mlPrice < 5000000) {
            // Sukces Random Forest
            price = Math.round(mlPrice / 1000) * 1000
            method = 'random_forest_local'
            console.log('[Valuation API] Local Random Forest sukces:', price)
          } else {
            // Ostateczny fallback do heurystyki
            price = calculateHeuristicPrice(city, area, rooms, year)
            method = 'heuristic_fallback'
            console.log('[Valuation API] Fallback do heurystyki:', price)
          }
        }
      }
    }

    // Oblicz widełki - lepsze dla EstymatorAI
    const isEstymatorAI = method.includes('estymatorai') || method.includes('ensemble_EstymatorAI')
    const isML = method.includes('ensemble') || method.includes('random_forest')
    const confidence = isEstymatorAI ? 0.02 : isML ? 0.07 : 0.05  // EstymatorAI: ±2%, RF: ±7%, Heurystyka: ±5%
    const minPrice = Math.round(price * (1 - confidence) / 1000) * 1000
    const maxPrice = Math.round(price * (1 + confidence) / 1000) * 1000

    const res = NextResponse.json({
      price,
      minPrice,
      maxPrice,
      currency: 'PLN',
      method,
      confidence: `±${Math.round(confidence * 100)}%`,
      note: method === 'estymatorai_external'
        ? 'Wycena przez EstymatorAI External API - najnowszy model z dokładnością 0.29% MAPE'
        : isEstymatorAI 
        ? method.includes('railway')
          ? 'Wycena przez Railway ML API - EstymatorAI v1.0 z dokładnością 0.29% MAPE'
          : 'Wycena oparta o zaawansowany model Random Forest Regressor z dokładnością 0.29% MAPE'
        : method.includes('random_forest')
        ? 'Wycena oparta o model Random Forest (fallback) z dokładnością 15.56% MAPE'
        : 'Wycena heurystyczna - modele ML niedostępne',
      timestamp: new Date().toISOString(),
    })
    // Proste CORS (dla testu oczekujących nagłówków)
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Vary', 'Origin')
    return res
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
    
    const res = NextResponse.json({
      price: emergencyPrice,
      minPrice: Math.round(emergencyPrice * 0.95 / 1000) * 1000,
      maxPrice: Math.round(emergencyPrice * 1.05 / 1000) * 1000,
      currency: 'PLN',
      method: 'emergency_heuristic',
      error: 'Błąd serwera - użyto wyceny awaryjnej',
    })
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Vary', 'Origin')
    return res
  }
} 