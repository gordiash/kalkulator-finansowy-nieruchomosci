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
    console.log('Railway Valuation Request:', body);

    // Walidacja danych
    const validatedData = valuationSchema.parse(body);

    // Wywołaj Python script dla predykcji
    const prediction = await callPythonModel(validatedData);

    console.log('Railway Valuation Response:', prediction);
    return NextResponse.json(prediction);

  } catch (error) {
    console.error('Railway Valuation Error:', error);

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

async function callPythonModel(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // Ścieżka do skryptu Python
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_ensemble_railway.py');
    
    // Sprawdź czy skrypt istnieje
    const fs = require('fs');
    if (!fs.existsSync(scriptPath)) {
      console.log('Python script not found, using heuristic');
      resolve(calculateHeuristicPrice(data));
      return;
    }

    // Wywołaj Python script
    const pythonProcess = spawn('python3', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wyślij dane do Python
    pythonProcess.stdin.write(JSON.stringify(data));
    pythonProcess.stdin.end();

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (parseError) {
          console.error('Failed to parse Python output:', parseError);
          resolve(calculateHeuristicPrice(data));
        }
      } else {
        console.error('Python script error:', error);
        resolve(calculateHeuristicPrice(data));
      }
    });

    // Timeout po 30 sekundach
    setTimeout(() => {
      pythonProcess.kill();
      resolve(calculateHeuristicPrice(data));
    }, 30000);
  });
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