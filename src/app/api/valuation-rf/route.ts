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
})

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
        } catch (parseError) {
          console.error('[Random Forest] Błąd parsowania JSON:', parseError, 'Output:', output)
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

    const { city, district, area, rooms, floor, year } = parsed.data

    // === Prepare features for Random Forest model ===
    const features = {
      city: city.toLowerCase(),
      district: district?.toLowerCase() || '',
      area,
      rooms,
      floor: floor || 0,
      year: year || 1990,
      building_age: 2024 - (year || 1990),
      rooms_per_area: rooms / area
    }

    try {
      // Call Random Forest model
      const predicted_price = await callRandomForestModel(features)
      
      if (predicted_price === null) {
        // Fallback do heurystyki jeśli model nie działa
        let pricePerSqm = 8000 // domyślna średnia PLN/m²
        switch (city.toLowerCase()) {
          case 'warszawa':
            pricePerSqm = 12000
            break
          case 'kraków':
          case 'krakow':
            pricePerSqm = 10000
            break
          case 'wrocław':
          case 'wroclaw':
            pricePerSqm = 9500
            break
          case 'poznan':
          case 'poznań':
            pricePerSqm = 9000
            break
        }

        let price = area * pricePerSqm
        if (rooms > 2) price += (rooms - 2) * 20000
        if (year) {
          if (year > 2010) price *= 1.05
          else if (year < 1970) price *= 0.9
        }

        price = Math.round(price / 1000) * 1000
        const minPrice = Math.round(price * 0.95 / 1000) * 1000
        const maxPrice = Math.round(price * 1.05 / 1000) * 1000

        return NextResponse.json({
          price,
          minPrice,
          maxPrice,
          currency: 'PLN',
          method: 'heuristic_fallback',
          model: 'fallback',
          error: 'Random Forest model unavailable',
          note: 'Szacunek na podstawie heurystyki (model ML niedostępny)',
        })
      }

      // Calculate confidence interval (±7% for Random Forest)
      const minPrice = Math.round(predicted_price * 0.93 / 1000) * 1000
      const maxPrice = Math.round(predicted_price * 1.07 / 1000) * 1000
      const price = Math.round(predicted_price / 1000) * 1000

      return NextResponse.json({
        price,
        minPrice,
        maxPrice,
        currency: 'PLN',
        method: 'random_forest',
        model: 'RandomForestRegressor',
        confidence: '±7%',
        features_used: Object.keys(features),
        note: 'Predykcja z modelu Random Forest wytrenowanego na danych transakcyjnych',
      })

    } catch (modelError) {
      console.error('[Random Forest] Model error:', modelError)
      
      // Fallback do heurystyki jeśli model nie działa
      let pricePerSqm = 8000 // domyślna średnia PLN/m²
      switch (city.toLowerCase()) {
        case 'warszawa':
          pricePerSqm = 12000
          break
        case 'kraków':
        case 'krakow':
          pricePerSqm = 10000
          break
        case 'wrocław':
        case 'wroclaw':
          pricePerSqm = 9500
          break
        case 'poznan':
        case 'poznań':
          pricePerSqm = 9000
          break
      }

      let price = area * pricePerSqm
      if (rooms > 2) price += (rooms - 2) * 20000
      if (year) {
        if (year > 2010) price *= 1.05
        else if (year < 1970) price *= 0.9
      }

      price = Math.round(price / 1000) * 1000
      const minPrice = Math.round(price * 0.95 / 1000) * 1000
      const maxPrice = Math.round(price * 1.05 / 1000) * 1000

      return NextResponse.json({
        price,
        minPrice,
        maxPrice,
        currency: 'PLN',
        method: 'heuristic_fallback',
        model: 'fallback',
        error: 'Random Forest model unavailable',
        note: 'Szacunek na podstawie heurystyki (model ML niedostępny)',
      })
    }

  } catch (error) {
    console.error('[Valuation RF API] Błąd:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
} 