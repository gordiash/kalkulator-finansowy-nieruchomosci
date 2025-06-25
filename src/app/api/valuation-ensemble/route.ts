import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface ValuationRequest {
  city: string;
  district: string;
  area: number;
  rooms: number;
  year_built: number;
  location_tier?: string;
  building_age_category?: string;
}

interface EnsembleResult {
  ensemble_prediction: number;
  individual_predictions: Record<string, number>;
  input_data: ValuationRequest;
  price_per_sqm: number;
  model_path: string;
}

// Mapowanie tier i age category
function mapLocationTier(city: string, district: string): string {
  if (city === 'Olsztyn') {
    if (['Śródmieście', 'Centrum', 'Zatorze'].includes(district)) return 'premium';
    if (['Kortowo', 'Jaroty', 'Nagórki'].includes(district)) return 'high';
    if (['Pieczewo', 'Gutkowo', 'Generałów'].includes(district)) return 'medium';
  }
  return 'standard';
}

function mapBuildingAgeCategory(year_built: number): string {
  if (year_built >= 2015) return 'very_new';
  if (year_built >= 2010) return 'new';
  if (year_built >= 2000) return 'modern';
  if (year_built >= 1990) return 'renovated';
  return 'old';
}

// Heurystyczna wycena jako fallback
function heuristicValuation(data: ValuationRequest): number {
  let pricePerSqm = 8000;
  
  // Korekty miasto/dzielnica
  if (data.city === 'Olsztyn') {
    if (['Śródmieście', 'Kortowo'].includes(data.district)) {
      pricePerSqm *= 1.2;
    } else if (['Jaroty', 'Nagórki'].includes(data.district)) {
      pricePerSqm *= 1.1;
    }
  } else if (data.city === 'Dywity') {
    pricePerSqm *= 0.9;
  } else if (data.city === 'Stawiguda') {
    pricePerSqm *= 0.85;
  } else {
    pricePerSqm *= 0.8;
  }
  
  // Korekta za wiek
  const age = 2024 - data.year_built;
  if (age <= 5) pricePerSqm *= 1.15;
  else if (age <= 10) pricePerSqm *= 1.1;
  else if (age <= 20) pricePerSqm *= 1.05;
  else if (age > 35) pricePerSqm *= 0.9;
  
  return Math.round(data.area * pricePerSqm);
}

// Sprawdź dostępne komendy Python
function getPythonCommands(): string[] {
  // Lista komend Python do przetestowania - Railway & Vercel compatible
  return [
    'python3',                   // Docker/Vercel main (priority)
    'python',                    // Local/Windows fallback
    '/usr/bin/python3',          // Linux system path
    '/usr/bin/python',           // Linux system path
    '/usr/local/bin/python3'     // Alternative installations
  ];
}

async function runEnsemblePrediction(inputData: ValuationRequest): Promise<EnsembleResult | null> {
  const scriptPath = path.join(process.cwd(), 'scripts', 'predict_ensemble_compatible.py');
  const modelPath = 'models/ensemble_optimized_0.79pct.pkl';
  
  console.log('🐍 [Ensemble] Attempting Python prediction...');
  console.log('📁 [Ensemble] Script path:', scriptPath);
  console.log('🤖 [Ensemble] Model path:', modelPath);
  console.log('📊 [Ensemble] Input data:', JSON.stringify(inputData));
  
  // Sprawdź czy pliki istnieją
  if (!fs.existsSync(scriptPath)) {
    console.error('❌ [Ensemble] Script not found:', scriptPath);
    return null;
  }
  
  if (!fs.existsSync(path.join(process.cwd(), modelPath))) {
    console.error('❌ [Ensemble] Model not found:', modelPath);
    return null;
  }
  
  const pythonCommands = getPythonCommands();
  
  for (const pythonCmd of pythonCommands) {
    console.log(`🧪 [Ensemble] Trying Python command: ${pythonCmd}`);
    
    try {
      const result = await new Promise<EnsembleResult | null>((resolve) => {
        const pythonProcess = spawn(pythonCmd, [
          scriptPath,
          modelPath,
          JSON.stringify(inputData)
        ], {
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 30000 // 30 sekund timeout
        });
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
          const chunk = data.toString();
          output += chunk;
          console.log(`📤 [Ensemble] ${pythonCmd} stdout:`, chunk.trim());
        });
        
        pythonProcess.stderr.on('data', (data) => {
          const chunk = data.toString();
          errorOutput += chunk;
          console.log(`⚠️ [Ensemble] ${pythonCmd} stderr:`, chunk.trim());
        });
        
        pythonProcess.on('close', (code) => {
          console.log(`🏁 [Ensemble] ${pythonCmd} process closed with code: ${code}`);
          
          if (code === 0) {
            try {
              // Znajdź JSON w output
              const jsonMatch = output.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                console.log(`✅ [Ensemble] ${pythonCmd} success:`, result.ensemble_prediction);
                resolve(result);
              } else {
                console.error(`❌ [Ensemble] ${pythonCmd} - Nie znaleziono JSON w output:`, output);
                resolve(null);
              }
            } catch (error) {
              console.error(`❌ [Ensemble] ${pythonCmd} - Błąd parsowania JSON:`, error, output);
              resolve(null);
            }
          } else {
            console.error(`❌ [Ensemble] ${pythonCmd} failed with code ${code}:`, errorOutput);
            resolve(null);
          }
        });
        
        pythonProcess.on('error', (error) => {
          console.error(`❌ [Ensemble] ${pythonCmd} spawn error:`, error.message);
          resolve(null);
        });
        
        // Timeout
        setTimeout(() => {
          console.error(`⏰ [Ensemble] ${pythonCmd} timeout`);
          pythonProcess.kill();
          resolve(null);
        }, 30000);
      });
      
      if (result) {
        console.log(`🎯 [Ensemble] Success with ${pythonCmd}`);
        return result;
      }
    } catch (error) {
      console.error(`❌ [Ensemble] ${pythonCmd} exception:`, error);
      continue;
    }
  }
  
  console.error('❌ [Ensemble] All Python commands failed');
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Walidacja danych wejściowych
    const { city, district, area, rooms, year_built } = body;
    
    if (!city || !district || !area || !rooms || !year_built) {
      return NextResponse.json(
        { error: 'Brakuje wymaganych pól: city, district, area, rooms, year_built' },
        { status: 400 }
      );
    }
    
    if (area <= 0 || area > 500) {
      return NextResponse.json(
        { error: 'Powierzchnia musi być między 1 a 500 m²' },
        { status: 400 }
      );
    }
    
    if (rooms <= 0 || rooms > 10) {
      return NextResponse.json(
        { error: 'Liczba pokoi musi być między 1 a 10' },
        { status: 400 }
      );
    }
    
    if (year_built < 1900 || year_built > 2030) {
      return NextResponse.json(
        { error: 'Rok budowy musi być między 1900 a 2030' },
        { status: 400 }
      );
    }
    
    // Przygotuj dane dla modelu
    const inputData: ValuationRequest = {
      city,
      district,
      area: Number(area),
      rooms: Number(rooms),
      year_built: Number(year_built),
      location_tier: mapLocationTier(city, district),
      building_age_category: mapBuildingAgeCategory(Number(year_built))
    };
    
    console.log('🔮 [API] Ensemble prediction request:', inputData);
    
    // Spróbuj ensemble prediction
    const ensembleResult = await runEnsemblePrediction(inputData);
    
    if (ensembleResult) {
      console.log('✅ [API] Ensemble prediction success:', ensembleResult.ensemble_prediction);
      
      return NextResponse.json({
        success: true,
        prediction: ensembleResult.ensemble_prediction,
        price_per_sqm: ensembleResult.price_per_sqm,
        method: 'ensemble_EstymatorAI',
        model_info: {
          type: 'EstymatorAI v2.1',
          models: Object.keys(ensembleResult.individual_predictions),
          individual_predictions: ensembleResult.individual_predictions
        },
        input_data: inputData,
        confidence: 'high',
        timestamp: new Date().toISOString()
      });
    }
    
    // Fallback do heurystyki
    console.log('⚠️ [API] EstymatorAI failed, using heuristic fallback');
    const heuristicPrice = heuristicValuation(inputData);
    
    return NextResponse.json({
      success: true,
      prediction: heuristicPrice,
      price_per_sqm: Math.round(heuristicPrice / inputData.area),
      method: 'heuristic_fallback',
      model_info: {
        type: 'Heuristic Model',
        reason: 'EstymatorAI unavailable'
      },
      input_data: inputData,
      confidence: 'medium',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [API] Valuation ensemble error:', error);
    
    return NextResponse.json(
      { 
        error: 'Błąd wewnętrzny serwera',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 