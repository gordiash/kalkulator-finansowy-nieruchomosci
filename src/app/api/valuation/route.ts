import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

    const { city, district, area, rooms, year } = parsed.data

    // === Heurystyka cenowa (MVP) ===
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

    // Korekta za liczbę pokoi (każdy pokój powyżej 2 -> +20k)
    if (rooms > 2) {
      price += (rooms - 2) * 20000
    }

    // Korekta za rok budowy
    if (year) {
      if (year > 2010) price *= 1.05
      else if (year < 1970) price *= 0.9
    }

    // Zaokrąglamy do najbliższej 1000
    price = Math.round(price / 1000) * 1000

    // Oblicz widełki ±5%
    const minPrice = Math.round(price * 0.95 / 1000) * 1000
    const maxPrice = Math.round(price * 1.05 / 1000) * 1000

    return NextResponse.json({
      price,
      minPrice,
      maxPrice,
      currency: 'PLN',
      method: 'heuristic_v0.1',
      note: 'Szacunek oparty o ceny ofertowe z portali ogłoszeniowych',
    })
  } catch (error) {
    console.error('[Valuation API] Błąd:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
} 