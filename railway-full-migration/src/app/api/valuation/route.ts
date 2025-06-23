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
async function callEnsembleModel(inputData: any): Promise<{price: number | null, error: string | null}> {
  return new Promise((resolve) => {
    try {
      const scriptPath = path.join(process.cwd(), 'scripts', 'predict_ensemble_compatible.py')
      const modelPath = path.join(process.cwd(), 'models', 'ensemble_optimized_0.78pct.pkl')
      
      const conditionToAgeCategory = {
        'new': 'very_new', 'good': inputData.year >= 2010 ? 'new' : inputData.year >= 2000 ? 'modern' : 'renovated',
        'renovated': 'renovated', 'poor': 'old'
      }
      
      const ensembleInput = {
        city: inputData.city, district: inputData.district, area: inputData.area, rooms: inputData.rooms,
        year_built: inputData.year, location_tier: inputData.locationTier || 'medium',
        building_age_category: conditionToAgeCategory[inputData.condition as keyof typeof conditionToAgeCategory] || 'modern',
        building_type: inputData.buildingType || 'apartment', parking: inputData.parking || 'none',
        finishing: inputData.finishing || 'standard', elevator: inputData.elevator || 'no',
        balcony: inputData.balcony || 'none', orientation: inputData.orientation || 'unknown',
        transport: inputData.transport || 'medium', total_floors: inputData.totalFloors || 0
      }
      
      console.log('[Ensemble] Script path:', scriptPath)
      
      const pythonCmd = 'python'
      const pythonProcess = spawn(pythonCmd, [scriptPath, modelPath, JSON.stringify(ensembleInput)])
      
      let output = ''
      let errorOutput = ''
      
      pythonProcess.stdout.on('data', (data) => { output += data.toString() })
      pythonProcess.stderr.on('data', (data) => { errorOutput += data.toString() })

      pythonProcess.on('error', (err) => {
        console.error('[Ensemble] BŁĄD PROCESU SPAWN:', err);
        resolve({ price: null, error: `Spawning process failed: ${err.message}` });
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output.trim());
            if (result.ensemble_prediction) {
              resolve({ price: result.ensemble_prediction, error: null });
            } else {
              resolve({ price: null, error: 'Prediction key not found in script output.' });
            }
          } catch (e: any) {
            resolve({ price: null, error: `JSON parsing failed: ${e.message}. Output: ${output}` });
          }
        } else {
          resolve({ price: null, error: `Script exited with code ${code}. Stderr: ${errorOutput}` });
        }
      })
    } catch(e: any) {
      console.error('[Ensemble] BŁĄD SYNCHRONICZNY SPAWN:', e);
      resolve({ price: null, error: `Synchronous spawn error: ${e.message}` });
    }
  })
}

// === Fallback do Random Forest ===
async function callRandomForestModel(inputData: any): Promise<{price: number | null, error: string | null}> {
  return new Promise((resolve) => {
    try {
      const scriptPath = path.join(process.cwd(), 'scripts', 'predict_rf.py')
      console.log('[Random Forest] Script path:', scriptPath)

      const pythonCmd = 'python'
      const pythonProcess = spawn(pythonCmd, [scriptPath, JSON.stringify(inputData)])

      let output = ''
      let errorOutput = ''
      
      pythonProcess.stdout.on('data', (data) => { output += data.toString() })
      pythonProcess.stderr.on('data', (data) => { errorOutput += data.toString() })

      pythonProcess.on('error', (error) => {
        console.error('[Random Forest] BŁĄD PROCESU SPAWN:', error);
        resolve({ price: null, error: `Spawning process failed: ${error.message}` });
      })
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output.trim())
            if (result.predicted_price) {
              resolve({ price: result.predicted_price, error: null })
            } else {
              resolve({ price: null, error: 'Prediction key not found in script output.' })
            }
          } catch (e: any) {
            resolve({ price: null, error: `JSON parsing failed: ${e.message}. Output: ${output}` })
          }
        } else {
          resolve({ price: null, error: `Script exited with code ${code}. Stderr: ${errorOutput}` })
        }
      })
    } catch (e: any) {
      console.error('[Random Forest] BŁĄD SYNCHRONICZNY SPAWN:', e);
      resolve({ price: null, error: `Synchronous spawn error: ${e.message}` });
    }
  })
}

// === Fallback heurystyka ===
function calculateHeuristicPrice(city: string, area: number, rooms: number, year?: number): number {
  let pricePerSqm = 8000;
  switch (city.toLowerCase()) {
    case 'olsztyn': pricePerSqm = 7500; break;
    case 'stawiguda': pricePerSqm = 6500; break;
    case 'olsztyński': pricePerSqm = 6000; break;
    case 'dywity': pricePerSqm = 6500; break;
    default: pricePerSqm = 7000;
  }
  let price = area * pricePerSqm;
  if (rooms > 2) price += (rooms - 2) * 15000;
  if (year) {
    if (year > 2010) price *= 1.05;
    else if (year < 1970) price *= 0.9;
  }
  return Math.round(price / 1000) * 1000;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ValuationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Nieprawidłowe dane wejściowe', details: parsed.error.format() }, { status: 400 });
    }

    const modelInput = {
      city: parsed.data.city.trim(), district: parsed.data.district?.trim() || '',
      area: parsed.data.area, rooms: parsed.data.rooms, floor: parsed.data.floor || 0,
      year: parsed.data.year || 1990, locationTier: parsed.data.locationTier,
      condition: parsed.data.condition, buildingType: parsed.data.buildingType,
      parking: parsed.data.parking, finishing: parsed.data.finishing, elevator: parsed.data.elevator,
      balcony: parsed.data.balcony, orientation: parsed.data.orientation, transport: parsed.data.transport,
      totalFloors: parsed.data.totalFloors,
    }

    let price: number;
    let method: string;
    let mlErrorDetails: string[] = [];

    console.log('[Valuation API] Wywołuję Ensemble model...');
    const ensembleResult = await callEnsembleModel(modelInput);

    if (ensembleResult.price) {
      price = Math.round(ensembleResult.price / 1000) * 1000;
      method = 'ensemble_v2.1_debug';
    } else {
      mlErrorDetails.push(`Ensemble Error: ${ensembleResult.error}`);
      console.log(`[Valuation API] Ensemble failed: ${ensembleResult.error}, próba Random Forest...`);
      const rfResult = await callRandomForestModel(modelInput);

      if (rfResult.price) {
        price = Math.round(rfResult.price / 1000) * 1000;
        method = 'random_forest_v1.1_fallback_debug';
      } else {
        mlErrorDetails.push(`Random Forest Error: ${rfResult.error}`);
        console.log(`[Valuation API] Random Forest failed: ${rfResult.error}, fallback do heurystyki...`);
        price = calculateHeuristicPrice(modelInput.city, modelInput.area, modelInput.rooms, modelInput.year);
        method = 'heuristic_fallback_v1.1';
      }
    }

    const isML = method.includes('ensemble') || method.includes('random_forest');
    const confidence = isML ? (method.includes('ensemble') ? 0.02 : 0.07) : 0.05;
    const note = isML 
      ? `Wycena oparta o model ${method}`
      : `Wycena heurystyczna - modele ML niedostępne. Błędy: ${mlErrorDetails.join('; ')}`;

    return NextResponse.json({
      price,
      minPrice: Math.round(price * (1 - confidence) / 1000) * 1000,
      maxPrice: Math.round(price * (1 + confidence) / 1000) * 1000,
      method, note,
      timestamp: new Date().toISOString(),
      ...(mlErrorDetails.length > 0 && { ml_errors: mlErrorDetails })
    });

  } catch (error: any) {
    console.error('[Valuation API] Błąd KRYTYCZNY:', error);
    return NextResponse.json({ error: 'Krytyczny błąd serwera.', details: error.message }, { status: 500 });
  }
} 