import { useState, useEffect } from 'react'

interface LocationData {
  cities: string[]
  districts: string[]
}

export function useLocations() {
  const [data, setData] = useState<LocationData>({ cities: [], districts: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/locations')
        
        if (!response.ok) {
          throw new Error('Błąd pobierania lokalizacji')
        }

        const result = await response.json()
        setData({
          cities: result.cities || [],
          districts: result.districts || []
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching locations:', err)
        setError(err instanceof Error ? err.message : 'Nieznany błąd')
        // Fallback data dla regionu Olsztyn
        setData({
          cities: ['Olsztyn', 'Stawiguda', 'Dywity', 'olsztyński'],
          districts: [
            'Brzeziny', 'Centrum', 'Dajtki', 'Gutkowo', 'Jaroty', 
            'Kortowo', 'Likusy', 'Nagórki', 'Pieczewo', 'Podgrodzie',
            'Redykajny', 'Śródmieście', 'Zatorze'
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const getDistrictsForCity = (cityName: string): string[] => {
    // Możemy rozszerzyć to o bardziej inteligentne filtrowanie
    // Na razie zwracamy wszystkie dzielnice
    return data.districts
  }

  return {
    cities: data.cities,
    districts: data.districts,
    loading,
    error,
    getDistrictsForCity
  }
} 