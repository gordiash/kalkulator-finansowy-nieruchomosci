import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Konfiguracja połączenia z bazą danych
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'cities' lub 'districts'
    const city = searchParams.get('city') // dla filtrowania dzielnic po mieście

    const connection = await mysql.createConnection(dbConfig)

    let query: string
    let params: string[] = []

    if (type === 'cities') {
      query = `
        SELECT DISTINCT city 
        FROM nieruchomosci 
        WHERE city IS NOT NULL AND city != ''
        ORDER BY city
      `
    } else if (type === 'districts') {
      if (city) {
        query = `
          SELECT DISTINCT district 
          FROM nieruchomosci 
          WHERE district IS NOT NULL AND district != '' AND city = ?
          ORDER BY district
        `
        params = [city]
      } else {
        query = `
          SELECT DISTINCT district 
          FROM nieruchomosci 
          WHERE district IS NOT NULL AND district != ''
          ORDER BY district
        `
      }
    } else {
      // Pobierz wszystkie miasta i dzielnice
      const [citiesResult] = await connection.execute(`
        SELECT DISTINCT city 
        FROM nieruchomosci 
        WHERE city IS NOT NULL AND city != ''
        ORDER BY city
      `)

      const [districtsResult] = await connection.execute(`
        SELECT DISTINCT district 
        FROM nieruchomosci 
        WHERE district IS NOT NULL AND district != ''
        ORDER BY district
      `)

      await connection.end()

      return NextResponse.json({
        cities: (citiesResult as Array<{city: string}>).map(row => row.city),
        districts: (districtsResult as Array<{district: string}>).map(row => row.district),
      })
    }

    const [results] = await connection.execute(query, params)
    await connection.end()

    const data = (results as Array<{city?: string, district?: string}>).map(row => 
      type === 'cities' ? row.city : row.district
    )

    return NextResponse.json({
      [type || 'locations']: data,
    })

  } catch (error) {
    console.error('[Locations API] Błąd:', error)
    return NextResponse.json(
      { error: 'Błąd pobierania danych lokalizacji' },
      { status: 500 }
    )
  }
} 