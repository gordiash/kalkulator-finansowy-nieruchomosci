'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Autocomplete } from '@/components/ui/autocomplete'
import { FieldWithTooltip } from '@/components/ui/field-with-tooltip'
import { formatCurrency } from '@/lib/utils'
import { useLocations } from '@/hooks/useLocations'
import { useAccessibilityCheck } from '@/lib/accessibility'
import { valuationAnalytics } from '@/lib/analytics'
import Link from 'next/link'

interface ValuationResponse {
  price: number
  minPrice: number
  maxPrice: number
  currency: string
  method: string
  confidence?: string
  note?: string
  timestamp?: string
}

// Definicje tooltipów z wyjaśnieniami pojęć
const tooltips = {
  city: 'Miasto gdzie znajduje się mieszkanie. Model został wytrenowany głównie na danych z Olsztyna i okolic.',
  district: 'Dzielnica lub osiedle. Lokalizacja znacząco wpływa na cenę nieruchomości. Opcjonalne pole.',
  street: 'Nazwa ulicy. Pomaga w precyzyjniejszej wycenie, ale nie jest wymagana.',
  area: 'Powierzchnia mieszkania w metrach kwadratowych. Jeden z najważniejszych czynników wpływających na cenę.',
  rooms: 'Liczba pokoi (bez kuchni i łazienki). Wpływa na funkcjonalność i atrakcyjność mieszkania.',
  floor: 'Piętro na którym znajduje się mieszkanie. 0 oznacza parter. Wyższe piętra mogą być bardziej atrakcyjne.',
  year: 'Rok budowy budynku. Nowsze budynki zazwyczaj mają wyższe ceny ze względu na lepszy standard.',
  locationTier: 'Klasa lokalizacji mieszkania. Premium (centrum, prestiżowe dzielnice), Standard (typowe osiedla).',
  condition: 'Stan techniczny mieszkania. Nowe (po remoncie), Dobre (mieszkalne), Do remontu.',
  buildingType: 'Typ budynku mieszkalnego. Wpływa na atrakcyjność i cenę nieruchomości.',
  parking: 'Dostępność miejsca parkingowego. Znacząco wpływa na wartość mieszkania, szczególnie w centrach miast.',
  finishing: 'Standard wykończenia mieszkania. Deweloperski, pod klucz czy do remontu.',
  elevator: 'Dostępność windy w budynku. Szczególnie ważna dla wyższych pięter.',
  balcony: 'Posiadanie balkonu, tarasu lub loggi. Zwiększa atrakcyjność mieszkania.',
  orientation: 'Strona świata, na którą wychodzą główne okna. Wpływa na nasłonecznienie.',
  transport: 'Dostęp do komunikacji publicznej. Ważny czynnik dla mieszkańców bez samochodu.',
  totalFloors: 'Liczba pięter w budynku. Wpływa na prestiż i dostępność mieszkania.'
}

interface ValuationCalculatorProps {
  initialData?: {
    city?: string
    district?: string
    street?: string
    area?: string
    rooms?: string
    floor?: string
    year?: string
    locationTier?: string
    condition?: string
    buildingType?: string
    parking?: string
    finishing?: string
    elevator?: string
    balcony?: string
    orientation?: string
    transport?: string
    totalFloors?: string
  }
}

export default function ValuationCalculator({ initialData }: ValuationCalculatorProps = {}) {
  const [form, setForm] = useState({
    city: initialData?.city || 'Olsztyn',
    district: initialData?.district || '',
    street: initialData?.street || '',
    area: initialData?.area || '',
    rooms: initialData?.rooms || '',
    floor: initialData?.floor || '',
    year: initialData?.year || '',
    locationTier: initialData?.locationTier || 'medium',
    condition: initialData?.condition || 'good',
    buildingType: initialData?.buildingType || 'apartment',
    parking: initialData?.parking || 'none',
    finishing: initialData?.finishing || 'standard',
    elevator: initialData?.elevator || 'no',
    balcony: initialData?.balcony || 'none',
    orientation: initialData?.orientation || 'unknown',
    transport: initialData?.transport || 'medium',
    totalFloors: initialData?.totalFloors || '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [result, setResult] = useState<ValuationResponse | null>(null)
  const [error, setError] = useState('')
  const [formStartTime] = useState(Date.now())

  const { cities, districts, loading: locationsLoading } = useLocations()
  
  // Sprawdzenie accessibility w development
  useAccessibilityCheck()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Formatowanie numerów z walidacją
    if (name === 'area') {
      if (value === '') {
        setForm({ ...form, [name]: value })
      } else {
        const numValue = parseFloat(value)
        if (numValue > 0 && numValue <= 1000) {
          setForm({ ...form, [name]: value })
        }
      }
    } else if (name === 'rooms') {
      if (value === '') {
        setForm({ ...form, [name]: value })
      } else {
        const numValue = parseInt(value)
        if (numValue > 0 && numValue <= 20) {
          setForm({ ...form, [name]: value })
        }
      }
    } else if (name === 'floor') {
      if (value === '') {
        setForm({ ...form, [name]: value })
      } else {
        const numValue = parseInt(value)
        if (numValue >= 0 && numValue <= 50) {
          setForm({ ...form, [name]: value })
        }
      }
    } else if (name === 'year') {
      if (value === '') {
        setForm({ ...form, [name]: value })
      } else {
        const numValue = parseInt(value)
        // Pozwól na wpisywanie niepełnych lat (np. "20" dla "2020")
        if (value.length <= 4 && (numValue >= 1800 && numValue <= new Date().getFullYear() + 5 || value.length < 4)) {
          setForm({ ...form, [name]: value })
        }
      }
    } else if (name === 'totalFloors') {
      if (value === '') {
        setForm({ ...form, [name]: value })
      } else {
        const numValue = parseInt(value)
        if (numValue > 0 && numValue <= 100) {
          setForm({ ...form, [name]: value })
        }
      }
    } else {
      setForm({ ...form, [name]: value })
    }

    // Wyczyść dzielnicę gdy zmienia się miasto
    if (name === 'city') {
      setForm({ ...form, city: value, district: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    
    // Walidacja
    if (!form.area || parseFloat(form.area) <= 0) {
      setError('Podaj prawidłowy metraż mieszkania')
      setStatus('error')
      return
    }
    
    if (!form.rooms || parseInt(form.rooms) <= 0) {
      setError('Podaj prawidłową liczbę pokoi')
      setStatus('error')
      return
    }

    try {
      // Konwersja pól numerycznych
      const payload: Record<string, unknown> = {
        city: form.city.trim(),
        area: parseFloat(form.area),
        rooms: parseInt(form.rooms),
        floor: form.floor ? parseInt(form.floor) : 0,
        year: form.year ? parseInt(form.year) : undefined,
        locationTier: form.locationTier,
        condition: form.condition,
        buildingType: form.buildingType,
        parking: form.parking,
        finishing: form.finishing,
        elevator: form.elevator,
        balcony: form.balcony,
        orientation: form.orientation,
        transport: form.transport,
        totalFloors: form.totalFloors ? parseInt(form.totalFloors) : undefined,
      }

      // Usuń puste opcjonalne pola tekstowe, aby spełnić walidację backendu (min 2 znaki)
      if (form.district.trim().length >= 2) {
        payload.district = form.district.trim()
      }
      if (form.street.trim().length >= 2) {
        payload.street = form.street.trim()
      }

      // Analytics: Formularz wysłany
      valuationAnalytics.trackValuationSubmitted({
        ...payload,
        timestamp: new Date(formStartTime).toISOString()
      })

      console.log('Wysyłam zapytanie:', payload)

      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Błąd serwera')
      }
      
      console.log('Otrzymana odpowiedź:', data)
      setResult(data)
      setStatus('success')

      // Analytics: Wynik otrzymany
      valuationAnalytics.trackValuationResultViewed({
        ...payload,
        price: data.price,
        method: data.method
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd'
      setError(errorMessage)
      setStatus('error')
      console.error('Błąd wyceny:', error)

      // Analytics: Błąd wyceny
      valuationAnalytics.trackValuationError(errorMessage, {
        city: form.city,
        area: form.area ? parseFloat(form.area) : undefined,
        rooms: form.rooms ? parseInt(form.rooms) : undefined
      })
    }
  }

  const isFormValid = form.city && form.area && form.rooms

  return (
    <div className="space-y-6">
      {/* Nagłówek z informacją o modelu */}
      <div 
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
        role="banner"
        aria-labelledby="ai-info-title"
      >
        <h3 id="ai-info-title" className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          🚀 Wycena oparta o zaawansowaną sztuczną inteligencję
          <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-2 py-1 rounded-full font-normal border border-green-200">
            ENSEMBLE v2.0
          </span>
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            Używamy <span className="font-medium">zaawansowanego modelu Ensemble</span> (LightGBM + Random Forest + CatBoost) wytrenowanego na {' '}
            <span className="font-medium">566 ofertach z regionu Olsztyn</span>.
          </p>
          <div className="flex flex-wrap gap-4 text-xs">
            <span>🎯 Dokładność: <span className="font-medium text-green-700">MAPE 0.77%</span></span>
            <span>📊 R²: <span className="font-medium">0.95+</span></span>
            <span>⚡ Czas odpowiedzi: <span className="font-medium">&lt;3s</span></span>
          </div>
          <p className="text-xs mt-2 text-blue-700">
            Model łączy 3 algorytmy ML z inteligentnym ważeniem. Automatyczny fallback: Ensemble → Random Forest → Heurystyka.
            Uwzględnia lokalizację, stan mieszkania, typ budynku i parking dla maksymalnej precyzji.
          </p>
        </div>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        aria-labelledby="valuation-form-title"
        noValidate
      >
        <h2 id="valuation-form-title" className="sr-only">
          Formularz wyceny mieszkania
        </h2>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-900 mb-4">
            Dane mieszkania
          </legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Miasto */}
            <FieldWithTooltip
              label="Miasto"
              tooltip={tooltips.city}
              required
              htmlFor="city"
            >
              <Autocomplete
                name="city"
                value={form.city}
                onChange={handleChange}
                options={cities}
                loading={locationsLoading}
                required
                placeholder="np. Olsztyn"
                aria-label="Miasto gdzie znajduje się mieszkanie"
                aria-describedby="help-city"
              />
            </FieldWithTooltip>

            {/* Dzielnica */}
            <FieldWithTooltip
              label="Dzielnica"
              tooltip={tooltips.district}
              htmlFor="district"
            >
              <Autocomplete
                name="district"
                value={form.district}
                onChange={handleChange}
                options={districts}
                placeholder="np. Kortowo"
                aria-label="Dzielnica lub osiedle"
                aria-describedby="help-district"
              />
            </FieldWithTooltip>

            {/* Ulica */}
            <FieldWithTooltip
              label="Ulica"
              tooltip={tooltips.street}
              htmlFor="street"
            >
              <Input 
                id="street"
                name="street" 
                value={form.street} 
                onChange={handleChange} 
                placeholder="np. Warszawska"
                aria-label="Nazwa ulicy"
                aria-describedby="help-street"
              />
            </FieldWithTooltip>

            {/* Metraż */}
            <FieldWithTooltip
              label="Metraż (m²)"
              tooltip={tooltips.area}
              required
              htmlFor="area"
            >
              <Input
                id="area"
                name="area"
                value={form.area}
                onChange={handleChange}
                type="number"
                step="0.1"
                min="1"
                max="1000"
                required
                placeholder="np. 60"
                aria-label="Powierzchnia mieszkania w metrach kwadratowych"
                aria-describedby="help-area"
              />
            </FieldWithTooltip>

            {/* Liczba pokoi */}
            <FieldWithTooltip
              label="Liczba pokoi"
              tooltip={tooltips.rooms}
              required
              htmlFor="rooms"
            >
              <Input
                id="rooms"
                name="rooms"
                value={form.rooms}
                onChange={handleChange}
                type="number"
                min="1"
                max="20"
                required
                placeholder="np. 3"
                aria-label="Liczba pokoi w mieszkaniu"
                aria-describedby="help-rooms"
              />
            </FieldWithTooltip>

            {/* Piętro */}
            <FieldWithTooltip
              label="Piętro"
              tooltip={tooltips.floor}
              htmlFor="floor"
            >
              <Input 
                id="floor"
                name="floor" 
                value={form.floor} 
                onChange={handleChange} 
                type="number" 
                min="0" 
                max="50"
                placeholder="np. 2"
                aria-label="Piętro na którym znajduje się mieszkanie"
                aria-describedby="help-floor"
              />
            </FieldWithTooltip>

            {/* Rok budowy */}
            <FieldWithTooltip
              label="Rok budowy"
              tooltip={tooltips.year}
              htmlFor="year"
            >
              <Input 
                id="year"
                name="year" 
                value={form.year} 
                onChange={handleChange} 
                type="number" 
                min="1800"
                max={new Date().getFullYear() + 5}
                placeholder="np. 2015"
                aria-label="Rok budowy budynku"
                aria-describedby="help-year"
              />
            </FieldWithTooltip>

            {/* Klasa lokalizacji */}
            <FieldWithTooltip
              label="Klasa lokalizacji"
              tooltip={tooltips.locationTier}
              htmlFor="locationTier"
            >
              <select
                id="locationTier"
                name="locationTier"
                value={form.locationTier}
                onChange={(e) => setForm({ ...form, locationTier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Klasa lokalizacji mieszkania"
                aria-describedby="help-locationTier"
              >
                <option value="premium">Premium (centrum, prestiżowe dzielnice)</option>
                <option value="high">Wysoka (dobre dzielnice, dobra komunikacja)</option>
                <option value="medium">Średnia (typowe osiedla mieszkaniowe)</option>
                <option value="standard">Standard (osiedla peryferyjne)</option>
              </select>
            </FieldWithTooltip>

            {/* Stan mieszkania */}
            <FieldWithTooltip
              label="Stan mieszkania"
              tooltip={tooltips.condition}
              htmlFor="condition"
            >
              <select
                id="condition"
                name="condition"
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Stan techniczny mieszkania"
                aria-describedby="help-condition"
              >
                <option value="new">Nowy/Po remoncie</option>
                <option value="good">Dobry (mieszkalny)</option>
                <option value="renovated">Wymaga odświeżenia</option>
                <option value="poor">Do generalnego remontu</option>
              </select>
            </FieldWithTooltip>

            {/* Typ budynku */}
            <FieldWithTooltip
              label="Typ budynku"
              tooltip={tooltips.buildingType}
              htmlFor="buildingType"
            >
              <select
                id="buildingType"
                name="buildingType"
                value={form.buildingType}
                onChange={(e) => setForm({ ...form, buildingType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Typ budynku mieszkalnego"
                aria-describedby="help-buildingType"
              >
                <option value="apartment">Blok/Apartamentowiec</option>
                <option value="tenement">Kamienica</option>
                <option value="house">Dom jednorodzinny</option>
                <option value="townhouse">Dom szeregowy</option>
              </select>
            </FieldWithTooltip>

            {/* Parking */}
            <FieldWithTooltip
              label="Miejsce parkingowe"
              tooltip={tooltips.parking}
              htmlFor="parking"
            >
              <select
                id="parking"
                name="parking"
                value={form.parking}
                onChange={(e) => setForm({ ...form, parking: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Dostępność miejsca parkingowego"
                aria-describedby="help-parking"
              >
                <option value="none">Brak</option>
                <option value="street">Parking uliczny</option>
                <option value="paid">Płatne miejsce w garażu</option>
                <option value="included">Miejsce w cenie</option>
              </select>
            </FieldWithTooltip>

            {/* Standard wykończenia */}
            <FieldWithTooltip
              label="Standard wykończenia"
              tooltip={tooltips.finishing}
              htmlFor="finishing"
            >
              <select
                id="finishing"
                name="finishing"
                value={form.finishing}
                onChange={(e) => setForm({ ...form, finishing: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Standard wykończenia mieszkania"
                aria-describedby="help-finishing"
              >
                <option value="developer">Standard deweloperski</option>
                <option value="standard">Standardowe wykończenie</option>
                <option value="premium">Wykończenie premium</option>
                <option value="to_finish">Do wykończenia</option>
              </select>
            </FieldWithTooltip>

            {/* Winda */}
            <FieldWithTooltip
              label="Winda w budynku"
              tooltip={tooltips.elevator}
              htmlFor="elevator"
            >
              <select
                id="elevator"
                name="elevator"
                value={form.elevator}
                onChange={(e) => setForm({ ...form, elevator: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Dostępność windy w budynku"
                aria-describedby="help-elevator"
              >
                <option value="no">Brak windy</option>
                <option value="yes">Jest winda</option>
                <option value="planned">Planowana winda</option>
              </select>
            </FieldWithTooltip>

            {/* Balkon/Taras */}
            <FieldWithTooltip
              label="Balkon/Taras"
              tooltip={tooltips.balcony}
              htmlFor="balcony"
            >
              <select
                id="balcony"
                name="balcony"
                value={form.balcony}
                onChange={(e) => setForm({ ...form, balcony: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Posiadanie balkonu lub tarasu"
                aria-describedby="help-balcony"
              >
                <option value="none">Brak</option>
                <option value="balcony">Balkon</option>
                <option value="terrace">Taras</option>
                <option value="loggia">Loggia</option>
                <option value="garden">Ogródek</option>
              </select>
            </FieldWithTooltip>

            {/* Orientacja */}
            <FieldWithTooltip
              label="Strona świata"
              tooltip={tooltips.orientation}
              htmlFor="orientation"
            >
              <select
                id="orientation"
                name="orientation"
                value={form.orientation}
                onChange={(e) => setForm({ ...form, orientation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Strona świata głównych okien"
                aria-describedby="help-orientation"
              >
                <option value="unknown">Nieznana</option>
                <option value="north">Północ</option>
                <option value="south">Południe</option>
                <option value="east">Wschód</option>
                <option value="west">Zachód</option>
                <option value="south-west">Południowy-zachód</option>
                <option value="south-east">Południowy-wschód</option>
                <option value="north-west">Północny-zachód</option>
                <option value="north-east">Północny-wschód</option>
              </select>
            </FieldWithTooltip>

            {/* Komunikacja */}
            <FieldWithTooltip
              label="Dostęp do komunikacji"
              tooltip={tooltips.transport}
              htmlFor="transport"
              tooltipPosition="top"
            >
              <select
                id="transport"
                name="transport"
                value={form.transport}
                onChange={(e) => setForm({ ...form, transport: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Dostęp do komunikacji publicznej"
                aria-describedby="help-transport"
              >
                <option value="poor">Słaby (daleko od przystanków)</option>
                <option value="medium">Średni (kilka przystanków)</option>
                <option value="good">Dobry (blisko centrum)</option>
                <option value="excellent">Doskonały (węzeł komunikacyjny)</option>
              </select>
            </FieldWithTooltip>

            {/* Liczba pięter w budynku */}
            <FieldWithTooltip
              label="Piętra w budynku"
              tooltip={tooltips.totalFloors}
              htmlFor="totalFloors"
              tooltipPosition="top"
            >
              <input
                type="number"
                id="totalFloors"
                name="totalFloors"
                value={form.totalFloors}
                onChange={handleChange}
                placeholder="np. 5"
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Liczba pięter w budynku"
                aria-describedby="help-totalFloors"
              />
            </FieldWithTooltip>
          </div>
        </fieldset>

        {/* Błędy */}
        {error && (
          <div 
            className="bg-red-100 border border-red-200 rounded-lg p-4"
            role="alert"
            aria-live="polite"
          >
            <p className="text-red-800 text-sm flex items-center">
              <span className="text-lg mr-2" aria-hidden="true">❌</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Przycisk submit */}
        <button
          type="submit"
          disabled={status === 'loading' || !isFormValid}
          className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-describedby={!isFormValid ? 'form-validation-help' : undefined}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center">
              <div 
                className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                role="status"
                aria-label="Obliczanie wyceny"
              ></div>
              Obliczanie wyceny...
            </span>
          ) : (
            <>
              <span className="mr-2" aria-hidden="true">🏠</span>
              Oblicz wartość mieszkania
            </>
          )}
        </button>
        
        {!isFormValid && (
          <div id="form-validation-help" className="text-sm text-gray-600 text-center">
            Wypełnij wymagane pola: miasto, metraż i liczbę pokoi
          </div>
        )}
      </form>

      {/* Wyniki */}
      {status === 'success' && result && (
        <section 
          className="bg-green-100 border border-green-200 rounded-lg p-6 space-y-4"
          role="region"
          aria-labelledby="results-title"
          aria-live="polite"
        >
          <div className="text-center">
            <h2 id="results-title" className="text-2xl font-bold text-green-900 mb-2">
              <span className="mr-2" aria-hidden="true">💰</span>
              Szacowana wartość mieszkania
            </h2>
            <div className="text-4xl font-bold text-green-800 mb-2">
              {formatCurrency(result.minPrice)} – {formatCurrency(result.maxPrice)}
            </div>
            <div className="text-lg text-green-700">
              Wartość średnia: <span className="font-semibold">{formatCurrency(result.price)}</span>
            </div>
            {result.confidence && (
              <p className="text-sm text-green-600 mt-1">
                Przedział ufności: {result.confidence}
              </p>
            )}
          </div>

          {/* Metoda wyceny */}
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Metoda wyceny:</span>
              <span className="font-medium text-gray-900">
                {result.method === 'random_forest_v1.0' ? '🤖 Random Forest AI' : 
                 result.method === 'heuristic_fallback_v1.0' ? '📊 Heurystyka' : 
                 result.method}
              </span>
            </div>
            {result.timestamp && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Czas wyceny:</span>
                <span className="text-gray-500">
                  {new Date(result.timestamp).toLocaleString('pl-PL')}
                </span>
              </div>
            )}
          </div>

          {result.note && (
            <div className="text-sm text-green-700 bg-green-100 rounded-lg p-3">
              <span className="mr-2" aria-hidden="true">ℹ️</span>
              {result.note}
            </div>
          )}

          {/* Akcje - linki do innych kalkulatorów */}
          <div className="space-y-3 pt-4 border-t border-green-200">
            <h3 className="font-semibold text-green-900 text-center">
              <span className="mr-2" aria-hidden="true">🔗</span>
              Sprawdź też inne kalkulatory
            </h3>
            <nav aria-label="Linki do innych kalkulatorów">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href={`/kalkulator-zdolnosci-kredytowej?kwota=${result.price}`}
                  className="block text-center bg-green-600 hover:bg-green-700 focus:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label={`Oblicz ratę kredytu dla kwoty ${formatCurrency(result.price)}`}
                  onClick={() => valuationAnalytics.trackActionButtonClick('credit', {
                    city: form.city,
                    area: parseFloat(form.area),
                    rooms: parseInt(form.rooms),
                    price: result.price,
                    method: result.method
                  })}
                >
                  <span className="mr-2" aria-hidden="true">💳</span>
                  Rata kredytu
                </Link>
                <Link
                  href={`/kalkulator-wynajmu?cena=${result.price}`}
                  className="block text-center bg-emerald-700 hover:bg-emerald-800 focus:bg-emerald-800 text-white py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  aria-label={`Sprawdź rentowność wynajmu dla ceny ${formatCurrency(result.price)}`}
                  onClick={() => valuationAnalytics.trackActionButtonClick('rental', {
                    city: form.city,
                    area: parseFloat(form.area),
                    rooms: parseInt(form.rooms),
                    price: result.price,
                    method: result.method
                  })}
                >
                  <span className="mr-2" aria-hidden="true">🏘️</span>
                  Wynajem
                </Link>
                <Link
                  href={`/kalkulator-zakupu-nieruchomosci?cena=${result.price}`}
                  className="block text-center bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 text-white py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label={`Zobacz koszty zakupu dla ceny ${formatCurrency(result.price)}`}
                  onClick={() => valuationAnalytics.trackActionButtonClick('purchase', {
                    city: form.city,
                    area: parseFloat(form.area),
                    rooms: parseInt(form.rooms),
                    price: result.price,
                    method: result.method
                  })}
                >
                  <span className="mr-2" aria-hidden="true">💰</span>
                  Koszty zakupu
                </Link>
              </div>
            </nav>
          </div>
        </section>
      )}
    </div>
  )
} 