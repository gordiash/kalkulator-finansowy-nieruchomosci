import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { spawn } from 'child_process';
import path from 'path';

// Schema walidacji
const valuationSchema = z.object({
  city: z.string().min(2, 'Miasto musi mieć minimum 2 znaki'),
  district: z.string().optional(),
  area: z.number().min(10, 'Powierzchnia musi być większa niż 10m²').max(1000, 'Powierzchnia nie może być większa niż 1000m²'),
  rooms: z.number().int().min(1, 'Liczba pokoi musi być większa niż 0').max(10, 'Liczba pokoi nie może być większa niż 10'),
  floor: z.number().int().min(0).max(50).optional(),
  year: z.number().int().min(1900).max(2024).optional(),
  locationTier: z.enum(['low', 'medium', 'high']).optional(),
  condition: z.enum(['poor', 'average', 'good', 'excellent']).optional(),
  buildingType: z.enum(['apartment', 'house', 'tenement']).optional(),
  parking: z.enum(['none', 'street', 'garage', 'underground']).optional(),
  finishing: z.enum(['basic', 'standard', 'high', 'luxury']).optional(),
  elevator: z.enum(['yes', 'no']).optional(),
  balcony: z.enum(['none', 'balcony', 'terrace', 'garden']).optional(),
  orientation: z.enum(['north', 'south', 'east', 'west', 'unknown']).optional(),
  transport: z.enum(['poor', 'medium', 'good', 'excellent']).optional(),
  totalFloors: z.number().int().min(1).max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🚂 Railway Valuation Request:', body);

    // Walidacja danych
    const validatedData = valuationSchema.parse(body);

    // Wywołaj Python script dla predykcji
    const prediction = await callPythonEnsembleModel(validatedData);

    console.log('🚂 Railway Valuation Response:', prediction);
    return NextResponse.json(prediction);

  } catch (error) {
    console.error('❌ Railway Valuation Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Nieprawidłowe dane wejściowe', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    // Fallback do heurystyki
    try {
      const body = await request.json();
      const fallbackResult = calculateHeuristicPrice(body);
      
      return NextResponse.json({
        ...fallbackResult,
        note: 'Używana heurystyka - modele ML niedostępne na Railway'
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Błąd serwera' },
        { status: 500 }
      );
    }
  }
}

async function callPythonEnsembleModel(data: any): Promise<any> {
  return new Promise((resolve) => {
    console.log('🔬 Trying to call ensemble model...');
    
    // Użyj bardziej kompatybilnego skryptu
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_ensemble_compatible.py');
    const modelPath = path.join(process.cwd(), 'models', 'ensemble_optimized_0.78pct.pkl');
    
    console.log('📍 Script path:', scriptPath);
    console.log('📍 Model path:', modelPath);
    
    // Sprawdź czy skrypt istnieje
    const fs = require('fs');
    if (!fs.existsSync(scriptPath)) {
      console.log('❌ Python script not found, using heuristic');
      resolve(calculateHeuristicPrice(data));
      return;
    }
    
    if (!fs.existsSync(modelPath)) {
      console.log('❌ Model file not found, using heuristic');
      resolve(calculateHeuristicPrice(data));
      return;
    }

    // Przygotuj dane w formacie ensemble
    const ensembleData = {
      city: data.city,
      district: data.district || 'inne',
      area: data.area,
      rooms: data.rooms,
      year_built: data.year || 1990,
      location_tier: data.locationTier || 'medium',
      building_age_category: mapAgeCategory(data.year || 1990),
      building_type: data.buildingType || 'apartment',
      parking: data.parking || 'none',
      finishing: data.finishing || 'standard',
      elevator: data.elevator === 'yes' ? 'yes' : 'no',
      balcony: data.balcony !== 'none' ? 'balcony' : 'none',
      orientation: data.orientation || 'unknown',
      transport: data.transport || 'medium',
      total_floors: data.totalFloors || 5
    };

    console.log('🔧 Ensemble input data:', ensembleData);

    // Wywołaj Python script z ensemble modelem
    console.log(`[Ensemble] Używam skryptu: ${scriptPath}`);
    console.log(`[Ensemble] Używam modelu: ${modelPath}`);

    const pythonProcess = spawn('python', [scriptPath, modelPath, JSON.stringify(ensembleData)], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('🐍 Python stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.log('🐍 Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python process closed with code: ${code}`);
      
      if (code === 0) {
        try {
          // Szukaj JSON w output
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            console.log('✅ Ensemble prediction success:', result);
            
            // Zwróć w standardowym formacie
            resolve({
              price: Math.round(result.ensemble_prediction / 1000) * 1000,
              minPrice: Math.round(result.ensemble_prediction * 0.98 / 1000) * 1000,
              maxPrice: Math.round(result.ensemble_prediction * 1.02 / 1000) * 1000,
              currency: 'PLN',
              method: 'ensemble_v2.0_railway',
              confidence: '±2%',
              note: 'Wycena oparta o zaawansowany model Ensemble z dokładnością 0.78% MAPE',
              timestamp: new Date().toISOString(),
              debug: {
                individual_predictions: result.individual_predictions,
                input_data: ensembleData
              }
            });
          } else {
            console.error('❌ No JSON found in Python output:', output);
            resolve(calculateHeuristicPrice(data));
          }
        } catch (parseError) {
          console.error('❌ Failed to parse Python output:', parseError, 'Output:', output);
          resolve(calculateHeuristicPrice(data));
        }
      } else {
        console.error('❌ Python script error:', error);
        resolve(calculateHeuristicPrice(data));
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('❌ Failed to spawn Python process:', err);
      resolve(calculateHeuristicPrice(data));
    });

    // Timeout po 30 sekundach
    setTimeout(() => {
      console.log('⏰ Python process timeout');
      pythonProcess.kill();
      resolve(calculateHeuristicPrice(data));
    }, 30000);
  });
}

function mapAgeCategory(year: number): string {
  if (year >= 2015) return 'very_new';
  if (year >= 2010) return 'new';
  if (year >= 2000) return 'modern';
  if (year >= 1990) return 'renovated';
  return 'old';
}

function calculateHeuristicPrice(data: any) {
  const { city, area, rooms, year } = data;
  
  // Bazowe ceny za m² dla różnych miast
  let basePricePerSqm = 7000;
  
  switch (city?.toLowerCase()) {
    case 'olsztyn':
      basePricePerSqm = 7500;
      break;
    case 'stawiguda':
    case 'dywity':
      basePricePerSqm = 6500;
      break;
    case 'warszawa':
      basePricePerSqm = 15000;
      break;
    case 'kraków':
      basePricePerSqm = 12000;
      break;
    case 'gdańsk':
      basePricePerSqm = 11000;
      break;
    default:
      basePricePerSqm = 7000;
  }

  let price = area * basePricePerSqm;

  // Korekty
  if (rooms > 2) {
    price += (rooms - 2) * 15000;
  }

  if (year && year > 2010) {
    price *= 1.05;
  } else if (year && year < 1970) {
    price *= 0.9;
  }

  // Zaokrąglij do tysięcy
  price = Math.round(price / 1000) * 1000;

  const confidence = 0.05; // ±5%
  const minPrice = Math.round(price * (1 - confidence) / 1000) * 1000;
  const maxPrice = Math.round(price * (1 + confidence) / 1000) * 1000;

  return {
    price,
    minPrice,
    maxPrice,
    currency: 'PLN',
    method: 'heuristic_railway',
    confidence: `±${Math.round(confidence * 100)}%`,
    note: 'Wycena heurystyczna - Railway fallback',
    timestamp: new Date().toISOString()
  };
} 