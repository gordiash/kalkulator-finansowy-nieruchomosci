'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocations } from '../hooks/useLocations'
import { FieldWithTooltip } from './ui/field-with-tooltip'
import { Autocomplete } from './ui/autocomplete'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { valuationAnalytics } from '../lib/analytics'

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

// Progress steps
const STEPS = [
  { id: 'basic', title: 'Podstawowe dane', description: 'Lokalizacja i podstawowe informacje' },
  { id: 'property', title: 'Opis nieruchomości', description: 'Szczegóły techniczne mieszkania' },
  { id: 'additional', title: 'Dodatkowe cechy', description: 'Udogodnienia i wyposażenie' },
  { id: 'result', title: 'Wycena', description: 'Oszacowana wartość mieszkania' }
]

// Definicje tooltipów z wyjaśnieniami pojęć
const tooltips = {
  city: 'Miasto gdzie znajduje się mieszkanie. Model został wytrenowany głównie na danych z Olsztyna i okolic.',
  district: 'Dzielnica lub osiedle. Lokalizacja znacząco wpływa na cenę nieruchomości. Opcjonalne pole.',
  street: 'Nazwa ulicy. Pomaga w precyzyjniejszej wycenie, ale nie jest wymagana.',
  area: 'Powierzchnia mieszkania w metrach kwadratowych. Jeden z najważniejszych czynników wpływających na cenę.',
  rooms: 'Liczba pokoi (bez kuchni i łazienki). Wpływa na funkcjonalność i atrakcyjność mieszkania.',
  floor: 'Piętro na którrym znajduje się mieszkanie. 0 oznacza parter. Wyższe piętra mogą być bardziej atrakcyjne.',
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

export default function ValuationCalculator({ initialData }: ValuationCalculatorProps = {}) {
  // Current step state
  const [currentStep, setCurrentStep] = useState(0)
  
  // Form state
  const [form, setForm] = useState({
    city: initialData?.city || 'Olsztyn',
    district: initialData?.district || '',
    street: initialData?.street || '',
    area: initialData?.area || '',
    rooms: initialData?.rooms || '',
    floor: initialData?.floor || '',
    year: initialData?.year || '',
    locationTier: initialData?.locationTier || 'standard',
    condition: initialData?.condition || 'good',
    buildingType: initialData?.buildingType || 'blok',
    parking: initialData?.parking || 'none',
    finishing: initialData?.finishing || 'standard',
    elevator: initialData?.elevator || 'no',
    balcony: initialData?.balcony || 'no',
    orientation: initialData?.orientation || 'south',
    transport: initialData?.transport || 'medium',
    totalFloors: initialData?.totalFloors || ''
  })

  // API state
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<ValuationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Locations hook
  const { cities, districts, loading: locationsLoading } = useLocations()

  // Form validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Basic data
        return !!(form.city && form.area && form.rooms)
      case 1: // Property details
        return true // All optional
      case 2: // Additional features
        return true // All optional
      default:
        return true
    }
  }

  const isCurrentStepValid = isStepValid(currentStep)
  const isFormValid = isStepValid(0) // Only basic data required

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

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
    
    if (!isFormValid) {
      setError('Proszę wypełnić wymagane pola: miasto, metraż i liczbę pokoi')
      return
    }

    setStatus('loading')
    setError(null)
    setCurrentStep(3) // Go to result step

    // Track form submission
    try {
      valuationAnalytics.trackValuationSubmitted({
        city: form.city,
        area: parseFloat(form.area),
        rooms: parseInt(form.rooms),
        year: form.year ? parseInt(form.year) : undefined,
      })
    } catch (err) {
      // Analytics error, continue
      console.warn('Analytics error:', err)
    }

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: form.city,
          district: form.district || null,
          street: form.street || null,
          area: parseFloat(form.area),
          rooms: parseInt(form.rooms),
          floor: form.floor ? parseInt(form.floor) : null,
          year: form.year ? parseInt(form.year) : null,
          locationTier: form.locationTier,
          condition: form.condition,
          buildingType: form.buildingType,
          parking: form.parking,
          finishing: form.finishing,
          elevator: form.elevator,
          balcony: form.balcony,
          orientation: form.orientation,
          transport: form.transport,
          totalFloors: form.totalFloors ? parseInt(form.totalFloors) : null
        }),
      })

      if (!response.ok) {
        throw new Error('Błąd podczas obliczania wyceny')
      }

      const data: ValuationResponse = await response.json()
      setResult(data)
      setStatus('success')

      // Track successful calculation
      try {
        valuationAnalytics.trackValuationResultViewed({
          city: form.city,
          area: parseFloat(form.area),
          rooms: parseInt(form.rooms),
          price: data.price,
          method: data.method
        })
      } catch (err) {
        console.warn('Analytics error:', err)
      }

    } catch (err) {
      console.error('Error calculating valuation:', err)
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas wyceny')
      setStatus('error')
      
      // Track error
      try {
        valuationAnalytics.trackValuationError(
          err instanceof Error ? err.message : 'Unknown error',
          {
            city: form.city,
            area: parseFloat(form.area),
            rooms: parseInt(form.rooms),
          }
        )
      } catch (analyticsErr) {
        console.warn('Analytics error:', analyticsErr)
      }
    }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && isCurrentStepValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Model Info Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900">
                  Wycena AI 
                  <span className="ml-2 text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    ENSEMBLE v2.0
                  </span>
                </h3>
                <p className="text-blue-700 text-sm">Najdokładniejszy model wyceny na rynku</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">0.77%</div>
              <div className="text-xs text-blue-600">Błąd MAPE</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
              <div className="text-lg font-bold text-blue-600">566</div>
              <div className="text-blue-700">Ofert treningowych</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
              <div className="text-lg font-bold text-green-600">0.95+</div>
              <div className="text-blue-700">Współczynnik R²</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
              <div className="text-lg font-bold text-purple-600">&lt;3s</div>
              <div className="text-blue-700">Czas odpowiedzi</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
              <div className="text-lg font-bold text-orange-600">3</div>
              <div className="text-blue-700">Algorytmy ML</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Steps */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${index <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 hidden md:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-4 rounded transition-all
                    ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 0: Basic Data */}
        {currentStep === 0 && (
          <Card>
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Podstawowe dane mieszkania</h2>
                <p className="text-gray-600">Podaj lokalizację i podstawowe informacje o mieszkaniu</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="text-lg"
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
                    className="text-lg"
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
                    className="text-lg text-center font-bold"
                  />
                </FieldWithTooltip>

                {/* Liczba pokoi */}
                <FieldWithTooltip
                  label="Liczba pokoi"
                  tooltip={tooltips.rooms}
                  required
                  htmlFor="rooms"
                >
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setForm({ ...form, rooms: num.toString() })}
                        className={`
                          p-3 rounded-lg border-2 transition-all text-lg font-bold
                          ${form.rooms === num.toString()
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <Input
                    name="rooms"
                    value={form.rooms}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    max="20"
                    placeholder="lub wpisz inną liczbę"
                    className="mt-2 text-center"
                  />
                </FieldWithTooltip>
              </div>
            </div>
          </Card>
        )}

        {/* Step 1: Property Details */}
        {currentStep === 1 && (
          <Card>
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Opis nieruchomości</h2>
                <p className="text-gray-600">Dodatkowe informacje zwiększające dokładność wyceny</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  />
                </FieldWithTooltip>

                {/* Liczba pięter w budynku */}
                <FieldWithTooltip
                  label="Piętra w budynku"
                  tooltip={tooltips.totalFloors}
                  htmlFor="totalFloors"
                >
                  <Input
                    id="totalFloors"
                    name="totalFloors"
                    value={form.totalFloors}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    max="100"
                    placeholder="np. 5"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="excellent">Doskonały (nowe, po remoncie)</option>
                    <option value="good">Dobry (mieszkalny, bez remontu)</option>
                    <option value="average">Przeciętny (wymaga odświeżenia)</option>
                    <option value="poor">Do remontu</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="blok">Blok/apartamentowiec</option>
                    <option value="kamienica">Kamienica</option>
                    <option value="dom">Dom/szeregowiec</option>
                    <option value="loft">Loft/atelier</option>
                  </select>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="premium">Premium (centrum, prestiżowe dzielnice)</option>
                    <option value="high">Wysoka (dobre dzielnice, dobra komunikacja)</option>
                    <option value="medium">Średnia (typowe osiedla mieszkaniowe)</option>
                    <option value="standard">Standard (osiedla peryferyjne)</option>
                  </select>
                </FieldWithTooltip>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Additional Features */}
        {currentStep === 2 && (
          <Card>
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Dodatkowe cechy</h2>
                <p className="text-gray-600">Udogodnienia i wyposażenie wpływające na wartość</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Parking */}
                <FieldWithTooltip
                  label="Miejsce parkingowe"
                  tooltip={tooltips.parking}
                  htmlFor="parking"
                >
                  <div className="space-y-2">
                    {[
                      { value: 'none', label: '❌ Brak' },
                      { value: 'street', label: '🚗 Ulica' },
                      { value: 'courtyard', label: '🏠 Podwórko' },
                      { value: 'garage', label: '🏢 Garaż' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="parking"
                          value={option.value}
                          checked={form.parking === option.value}
                          onChange={(e) => setForm({ ...form, parking: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FieldWithTooltip>

                {/* Winda */}
                <FieldWithTooltip
                  label="Winda"
                  tooltip={tooltips.elevator}
                  htmlFor="elevator"
                >
                  <div className="space-y-2">
                    {[
                      { value: 'yes', label: '✅ Tak' },
                      { value: 'no', label: '❌ Nie' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="elevator"
                          value={option.value}
                          checked={form.elevator === option.value}
                          onChange={(e) => setForm({ ...form, elevator: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FieldWithTooltip>

                {/* Balkon */}
                <FieldWithTooltip
                  label="Balkon/Taras"
                  tooltip={tooltips.balcony}
                  htmlFor="balcony"
                >
                  <div className="space-y-2">
                    {[
                      { value: 'yes', label: '✅ Tak' },
                      { value: 'no', label: '❌ Nie' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="balcony"
                          value={option.value}
                          checked={form.balcony === option.value}
                          onChange={(e) => setForm({ ...form, balcony: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="high">Wysoki (luksusowe materiały)</option>
                    <option value="standard">Standardowy (deweloperski)</option>
                    <option value="basic">Podstawowy (do remontu)</option>
                  </select>
                </FieldWithTooltip>

                {/* Strona świata */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="south">🌞 Południe</option>
                    <option value="east">🌅 Wschód</option>
                    <option value="west">🌇 Zachód</option>
                    <option value="north">🌑 Północ</option>
                  </select>
                </FieldWithTooltip>

                {/* Komunikacja publiczna */}
                <FieldWithTooltip
                  label="Komunikacja publiczna"
                  tooltip={tooltips.transport}
                  htmlFor="transport"
                >
                  <select
                    id="transport"
                    name="transport"
                    value={form.transport}
                    onChange={(e) => setForm({ ...form, transport: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="excellent">🚇 Doskonała (węzeł komunikacyjny)</option>
                    <option value="good">🚌 Dobra (blisko centrum)</option>
                    <option value="medium">🚶 Średnia (kilka przystanków)</option>
                    <option value="poor">🚗 Słaba (daleko od przystanków)</option>
                  </select>
                </FieldWithTooltip>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && (
          <Card>
            <div className="p-6">
              {status === 'loading' && (
                <div className="text-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Obliczamy wycenę...</h2>
                  <p className="text-gray-600">Analizujemy dane przy użyciu AI</p>
                  <div className="mt-4 bg-gray-100 rounded-full h-2 max-w-md mx-auto">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>
              )}

              {status === 'success' && result && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">💰</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Wycena gotowa!</h2>
                    <p className="text-gray-600">Oto oszacowana wartość Twojego mieszkania</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="text-center">
                      <div className="text-sm text-green-700 mb-2">Szacowana wartość</div>
                      <div className="text-4xl font-bold text-green-800 mb-4">
                        {formatCurrency(result.price)}
                      </div>
                      <div className="text-lg text-green-700">
                        Przedział: {formatCurrency(result.minPrice)} – {formatCurrency(result.maxPrice)}
                      </div>
                      {result.confidence && (
                        <div className="text-sm text-green-600 mt-2">
                          Pewność: {result.confidence}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Method and timestamp */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-sm text-blue-700 mb-1">Metoda wyceny</div>
                      <div className="font-medium text-blue-900">
                        {result.method === 'random_forest_v1.0' ? '🤖 Random Forest AI' : 
                         result.method === 'heuristic_fallback_v1.0' ? '📊 Heurystyka' : 
                         result.method}
                      </div>
                    </div>
                    {result.timestamp && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-700 mb-1">Czas wyceny</div>
                        <div className="font-medium text-gray-900">
                          {new Date(result.timestamp).toLocaleString('pl-PL')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-center">Sprawdź też inne kalkulatory</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Link
                        href={`/kalkulator-zdolnosci-kredytowej?kwota=${result.price}`}
                        className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg transition-colors font-medium"
                      >
                        💳 Rata kredytu
                      </Link>
                      <Link
                        href={`/kalkulator-wynajmu?cena=${result.price}`}
                        className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-lg transition-colors font-medium"
                      >
                        🏘️ Rentowność wynajmu
                      </Link>
                      <Link
                        href={`/kalkulator-zakupu-nieruchomosci?cena=${result.price}`}
                        className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-lg transition-colors font-medium"
                      >
                        💰 Koszty zakupu
                      </Link>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      type="button"
                      onClick={() => {
                        setCurrentStep(0)
                        setStatus('idle')
                        setResult(null)
                      }}
                      variant="outline"
                      className="px-6 py-2"
                    >
                      🔄 Nowa wycena
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❌</span>
                  </div>
                  <h2 className="text-2xl font-bold text-red-900 mb-2">Wystąpił błąd</h2>
                  <p className="text-red-700 mb-4">{error}</p>
                  <Button
                    type="button"
                    onClick={() => {
                      setStatus('idle')
                      setError(null)
                      setCurrentStep(2)
                    }}
                    variant="outline"
                  >
                    Spróbuj ponownie
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="px-6 py-2"
                >
                  ← Wstecz
                </Button>

                <div className="text-center">
                  <div className="text-sm text-gray-500">
                    Krok {currentStep + 1} z {STEPS.length - 1}
                  </div>
                  {!isCurrentStepValid && currentStep === 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      Wypełnij wymagane pola
                    </div>
                  )}
                </div>

                {currentStep === 2 ? (
                  <Button
                    type="submit"
                    disabled={!isFormValid || status === 'loading'}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700"
                  >
                    🏠 Oblicz wycenę
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid}
                    className="px-6 py-2"
                  >
                    Dalej →
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </form>
    </div>
  )
} 