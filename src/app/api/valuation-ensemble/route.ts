import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

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

async function runEnsemblePrediction(inputData: ValuationRequest): Promise<EnsembleResult | null> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_ensemble_compatible.py');
    
    // Znajdź najnowszy model ensemble
    // const modelPatterns = [
    //   'models/ensemble_optimized_*.pkl',
    //   'models/ensemble_advanced_*.pkl',
    //   'models/random_forest_*.pkl'  // fallback
    // ];
    
    const modelPath = 'models/ensemble_optimized_0.79pct.pkl'; // najnowszy najlepszy model
    
    const pythonProcess = spawn('python', [
      scriptPath,
      modelPath,
      JSON.stringify(inputData)
    ], {
      cwd: process.cwd(),
      timeout: 30000 // 30 sekund timeout
    });
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Znajdź JSON w output
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            resolve(result);
          } else {
            console.error('Nie znaleziono JSON w output:', output);
            resolve(null);
          }
        } catch (error) {
          console.error('Błąd parsowania JSON:', error, output);
          resolve(null);
        }
      } else {
        console.error('Python script failed:', errorOutput);
        resolve(null);
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('Błąd uruchamiania Python:', error);
      resolve(null);
    });
  });
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
    
    console.log('🔮 Ensemble prediction request:', inputData);
    
    // Spróbuj ensemble prediction
    const ensembleResult = await runEnsemblePrediction(inputData);
    
    if (ensembleResult) {
      console.log('✅ Ensemble prediction success:', ensembleResult.ensemble_prediction);
      
      return NextResponse.json({
        success: true,
        prediction: ensembleResult.ensemble_prediction,
        price_per_sqm: ensembleResult.price_per_sqm,
        method: 'ensemble_ml',
        model_info: {
          type: 'Advanced Ensemble',
          models: Object.keys(ensembleResult.individual_predictions),
          individual_predictions: ensembleResult.individual_predictions
        },
        input_data: inputData,
        confidence: 'high',
        timestamp: new Date().toISOString()
      });
    }
    
    // Fallback do heurystyki
    console.log('⚠️ Ensemble failed, using heuristic fallback');
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
    console.error('❌ Valuation ensemble error:', error);
    
    return NextResponse.json(
      { 
        error: 'Błąd wewnętrzny serwera',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 