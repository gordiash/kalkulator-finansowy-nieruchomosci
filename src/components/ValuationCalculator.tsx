'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocations } from '../hooks/useLocations'
import { FieldWithTooltip } from './ui/field-with-tooltip'
import { Autocomplete } from './ui/autocomplete'
import { Input } from './ui/input'
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
    heating?: string
    bathrooms?: string
    kitchenType?: string
    basement?: string
    buildingMaterial?: string
    ownership?: string
    balconyArea?: string
    lastRenovation?: string
  }
}

// Progress steps
const STEPS = [
  { id: 'basic', title: 'Podstawowe dane', description: 'Lokalizacja i podstawowe informacje' },
  { id: 'property', title: 'Opis nieruchomości', description: 'Szczegóły techniczne mieszkania' },
  { id: 'additional', title: 'Dodatkowe cechy', description: 'Udogodnienia i wyposażenie' },
  { id: 'details', title: 'Szczegóły', description: 'Opcjonalne informacje dla lepszej precyzji' },
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
  totalFloors: 'Liczba pięter w budynku. Wpływa na prestiż i dostępność mieszkania.',
  heating: 'Typ ogrzewania w mieszkaniu. Centralne jest najwygodniejsze i najczęściej preferowane.',
  bathrooms: 'Liczba łazienek w mieszkaniu. Więcej łazienek zwiększa komfort i wartość.',
  kitchenType: 'Typ kuchni - osobna, aneks czy otwarta. Wpływa na funkcjonalność mieszkania.',
  basement: 'Dodatkowa powierzchnia - piwnica, komórka lokatorska lub schowek.',
  buildingMaterial: 'Materiał z którego zbudowany jest budynek. Wpływa na izolację i trwałość.',
  ownership: 'Forma własności mieszkania. Pełna własność vs prawo spółdzielcze.',
  balconyArea: 'Powierzchnia balkonu lub tarasu w metrach kwadratowych.',
  lastRenovation: 'Rok ostatniego remontu. Świeży remont zwiększa wartość mieszkania.'
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
    totalFloors: initialData?.totalFloors || '',
    heating: initialData?.heating || '',
    bathrooms: initialData?.bathrooms || '',
    kitchenType: initialData?.kitchenType || '',
    basement: initialData?.basement || '',
    buildingMaterial: initialData?.buildingMaterial || '',
    ownership: initialData?.ownership || '',
    balconyArea: initialData?.balconyArea || '',
    lastRenovation: initialData?.lastRenovation || ''
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
    } else if (name === 'bathrooms') {
      if (value === '') {
        setForm({ ...form, [name]: value })
      } else {
        const numValue = parseInt(value)
        if (numValue > 0 && numValue <= 10) {
          setForm({ ...form, [name]: value })
        }
      }
    } else if (name === 'balconyArea') {
      if (value === '') {
        setForm({ ...form, [name]: value })
      } else {
        const numValue = parseFloat(value)
        if (numValue > 0 && numValue <= 100) {
          setForm({ ...form, [name]: value })
        }
      }
    } else if (name === 'lastRenovation') {
      if (value === '') {
        setForm({ ...form, [name]: value })
      } else {
        const numValue = parseInt(value)
        if (value.length <= 4 && (numValue >= 1990 && numValue <= new Date().getFullYear() || value.length < 4)) {
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
    setCurrentStep(4) // Go to result step

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
          district: form.district.trim() || undefined,
          street: form.street.trim() || undefined,
          area: parseFloat(form.area),
          rooms: parseInt(form.rooms),
          floor: form.floor ? parseInt(form.floor) : undefined,
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
          heating: form.heating,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
          kitchenType: form.kitchenType,
          basement: form.basement,
          buildingMaterial: form.buildingMaterial,
          ownership: form.ownership,
          balconyArea: form.balconyArea ? parseFloat(form.balconyArea) : undefined,
          lastRenovation: form.lastRenovation ? parseInt(form.lastRenovation) : undefined
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
      {/* Model Info Header - Modernized */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-2xl font-bold text-white">EstymatorAI</h3>
                  <span className="bg-emerald-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/50">
                    v2.1
                  </span>
                </div>
                <p className="text-blue-100 text-sm mt-1">Najdokładniejszy model wyceny w Polsce</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">0.79%</div>
              <div className="text-xs text-blue-200 uppercase tracking-wide">Błąd MAPE</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-2xl font-bold text-white">7000+</div>
                <div className="text-blue-200 text-sm">Ofert treningowych</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-2xl font-bold text-emerald-400">0.95+</div>
                <div className="text-blue-200 text-sm">Współczynnik R²</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-2xl font-bold text-purple-300">&lt;3s</div>
                <div className="text-blue-200 text-sm">Czas odpowiedzi</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-2xl font-bold text-orange-300">3</div>
                <div className="text-blue-200 text-sm">Algorytmy ML</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps - Modernized */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex flex-col items-center relative z-10">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-lg
                    ${index < currentStep 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white ring-4 ring-emerald-100' 
                      : index === currentStep
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-4 ring-blue-100 scale-110'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }
                  `}>
                    {index < currentStep ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-semibold transition-colors duration-300 ${
                      index < currentStep ? 'text-emerald-600' : 
                      index === currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-xs mt-1 hidden md:block transition-colors duration-300 ${
                      index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 px-4 flex items-center">
                    <div className={`
                      w-full h-2 rounded-full transition-all duration-700 relative overflow-hidden
                      ${index < currentStep ? 'bg-emerald-200' : 'bg-gray-200'}
                    `}>
                      <div className={`
                        h-full rounded-full transition-all duration-700
                        ${index < currentStep 
                          ? 'w-full bg-gradient-to-r from-emerald-500 to-emerald-600' 
                          : 'w-0 bg-gradient-to-r from-blue-500 to-blue-600'
                        }
                      `} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 0: Basic Data - Modernized */}
        {currentStep === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🏠</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Podstawowe dane mieszkania</h2>
                  <p className="text-gray-600 mt-1">Podaj lokalizację i podstawowe informacje o mieszkaniu</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-8">
                {/* Pierwsza grupa - Miasto i Dzielnica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Miasto */}
                  <div className="space-y-2">
                    <FieldWithTooltip
                      label="Miasto"
                      tooltip={tooltips.city}
                      required
                      htmlFor="city"
                    >
                      <div className="relative">
                        <Autocomplete
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          options={cities}
                          loading={locationsLoading}
                          required
                          placeholder="np. Olsztyn"
                          className="w-full h-12 pl-10 pr-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📍
                        </div>
                      </div>
                    </FieldWithTooltip>
                  </div>

                  {/* Dzielnica */}
                  <div className="space-y-2">
                    <FieldWithTooltip
                      label="Dzielnica"
                      tooltip={tooltips.district}
                      htmlFor="district"
                    >
                      <div className="relative">
                        <Autocomplete
                          name="district"
                          value={form.district}
                          onChange={handleChange}
                          options={districts}
                          placeholder="np. Kortowo"
                          className="w-full h-12 pl-10 pr-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          🏢
                        </div>
                      </div>
                    </FieldWithTooltip>
                  </div>
                </div>

                {/* Druga grupa - Metraż i Pokoje */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Metraż */}
                  <div className="space-y-2">
                    <FieldWithTooltip
                      label="Metraż (m²)"
                      tooltip={tooltips.area}
                      required
                      htmlFor="area"
                    >
                      <div className="relative">
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
                          placeholder="60"
                          className="w-full h-12 pl-4 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-center font-semibold text-lg bg-gradient-to-r from-blue-50 to-indigo-50"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          m²
                        </div>
                      </div>
                    </FieldWithTooltip>
                  </div>

                  {/* Liczba pokoi */}
                  <div className="space-y-2">
                    <FieldWithTooltip
                      label="Liczba pokoi"
                      tooltip={tooltips.rooms}
                      required
                      htmlFor="rooms"
                    >
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setForm({ ...form, rooms: num.toString() })}
                              className={`
                                relative p-3 rounded-lg border-2 transition-all duration-200 font-bold hover:scale-105
                                ${form.rooms === num.toString()
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                                }
                              `}
                            >
                              <div className="text-center">
                                <div className="text-2xl">{num}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {num === 1 ? 'pokój' : 'pokoje'}
                                </div>
                              </div>
                              {form.rooms === num.toString() && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
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
                          className="w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-center"
                        />
                      </div>
                    </FieldWithTooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Property Details - Modernized */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <span className="text-indigo-600 text-lg">📋</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Opis nieruchomości</h2>
                  <p className="text-gray-600 mt-1">Dodatkowe informacje zwiększające dokładność wyceny</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              
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
          </div>
        )}

        {/* Step 2: Additional Features - Modernized */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">✨</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dodatkowe cechy</h2>
                  <p className="text-gray-600 mt-1">Udogodnienia i wyposażenie wpływające na wartość</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              
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
          </div>
        )}

        {/* Step 3: Additional Details - Modernized */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🔍</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Szczegółowe informacje</h2>
                  <p className="text-gray-600 mt-1">Te informacje są opcjonalne, ale mogą zwiększyć dokładność wyceny</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-200/50">
                <p className="text-sm text-blue-700 flex items-center">
                  <span className="mr-2">💡</span>
                  <strong className="mr-1">Wskazówka:</strong> Możesz pominąć ten krok lub wypełnić wybrane pola dla lepszej precyzji.
                </p>
              </div>
            </div>
            
            <div className="p-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ogrzewanie */}
                <FieldWithTooltip
                  label="Typ ogrzewania"
                  tooltip={tooltips.heating}
                  htmlFor="heating"
                >
                  <select
                    id="heating"
                    name="heating"
                    value={form.heating}
                    onChange={(e) => setForm({ ...form, heating: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Wybierz typ ogrzewania</option>
                    <option value="central">🏢 Centralne miejskie</option>
                    <option value="gas">🔥 Gazowe</option>
                    <option value="electric">⚡ Elektryczne</option>
                    <option value="coal">⚫ Węglowe</option>
                    <option value="heat_pump">🌡️ Pompa ciepła</option>
                  </select>
                </FieldWithTooltip>

                {/* Liczba łazienek */}
                <FieldWithTooltip
                  label="Liczba łazienek"
                  tooltip={tooltips.bathrooms}
                  htmlFor="bathrooms"
                >
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    max="10"
                    placeholder="np. 1"
                  />
                </FieldWithTooltip>

                {/* Typ kuchni */}
                <FieldWithTooltip
                  label="Typ kuchni"
                  tooltip={tooltips.kitchenType}
                  htmlFor="kitchenType"
                >
                  <select
                    id="kitchenType"
                    name="kitchenType"
                    value={form.kitchenType}
                    onChange={(e) => setForm({ ...form, kitchenType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Wybierz typ kuchni</option>
                    <option value="separate">🍽️ Osobna kuchnia</option>
                    <option value="kitchenette">🏠 Aneks kuchenny</option>
                    <option value="open">🌐 Otwarta kuchnia</option>
                  </select>
                </FieldWithTooltip>

                {/* Piwnica/komórka */}
                <FieldWithTooltip
                  label="Piwnica/komórka"
                  tooltip={tooltips.basement}
                  htmlFor="basement"
                >
                  <select
                    id="basement"
                    name="basement"
                    value={form.basement}
                    onChange={(e) => setForm({ ...form, basement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Wybierz opcję</option>
                    <option value="none">❌ Brak</option>
                    <option value="basement">🏠 Piwnica</option>
                    <option value="storage">📦 Komórka lokatorska</option>
                    <option value="both">🏠📦 Piwnica + komórka</option>
                  </select>
                </FieldWithTooltip>

                {/* Materiał budynku */}
                <FieldWithTooltip
                  label="Materiał budynku"
                  tooltip={tooltips.buildingMaterial}
                  htmlFor="buildingMaterial"
                >
                  <select
                    id="buildingMaterial"
                    name="buildingMaterial"
                    value={form.buildingMaterial}
                    onChange={(e) => setForm({ ...form, buildingMaterial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Wybierz materiał</option>
                    <option value="brick">🧱 Cegła</option>
                    <option value="concrete">🏗️ Beton</option>
                    <option value="reinforced_concrete">🏢 Żelbet</option>
                    <option value="brick_concrete">🧱🏗️ Cegła + beton</option>
                    <option value="other">❓ Inny</option>
                  </select>
                </FieldWithTooltip>

                {/* Forma własności */}
                <FieldWithTooltip
                  label="Forma własności"
                  tooltip={tooltips.ownership}
                  htmlFor="ownership"
                >
                  <select
                    id="ownership"
                    name="ownership"
                    value={form.ownership}
                    onChange={(e) => setForm({ ...form, ownership: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Wybierz formę własności</option>
                    <option value="full">📜 Pełna własność</option>
                    <option value="cooperative">🏢 Spółdzielcze lokatorskie</option>
                    <option value="cooperative_ownership">🏢📜 Spółdzielcze własnościowe</option>
                  </select>
                </FieldWithTooltip>

                {/* Powierzchnia balkonu */}
                <FieldWithTooltip
                  label="Powierzchnia balkonu (m²)"
                  tooltip={tooltips.balconyArea}
                  htmlFor="balconyArea"
                >
                  <Input
                    id="balconyArea"
                    name="balconyArea"
                    value={form.balconyArea}
                    onChange={handleChange}
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    placeholder="np. 6.5"
                  />
                </FieldWithTooltip>

                {/* Ostatni remont */}
                <FieldWithTooltip
                  label="Ostatni remont"
                  tooltip={tooltips.lastRenovation}
                  htmlFor="lastRenovation"
                >
                  <Input
                    id="lastRenovation"
                    name="lastRenovation"
                    value={form.lastRenovation}
                    onChange={handleChange}
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    placeholder="np. 2020"
                  />
                </FieldWithTooltip>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Results - Modernized */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              {status === 'loading' && (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-600/10 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Obliczamy wycenę...</h2>
                  <p className="text-gray-600 text-lg mb-6">Analizujemy dane przy użyciu EstymatorAI</p>
                  <div className="max-w-sm mx-auto">
                    <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full animate-pulse transition-all duration-1000" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Preprocessing...</span>
                      <span>85%</span>
                    </div>
                  </div>
                </div>
              )}

              {status === 'success' && result && (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-4xl">💰</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Wycena gotowa!</h2>
                    <p className="text-gray-600 text-lg">Oto oszacowana wartość Twojego mieszkania</p>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-8 border border-emerald-200 shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-300/20 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative text-center">
                      <div className="text-lg text-emerald-700 mb-3 font-medium">Szacowana wartość</div>
                      <div className="text-5xl font-bold text-emerald-800 mb-6 tracking-tight">
                        {formatCurrency(result.price)}
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 inline-block border border-emerald-200/50">
                        <div className="text-lg text-emerald-700 font-medium">
                          Przedział: {formatCurrency(result.minPrice)} – {formatCurrency(result.maxPrice)}
                        </div>
                        {result.confidence && (
                          <div className="text-sm text-emerald-600 mt-2 bg-emerald-100/50 px-3 py-1 rounded-full inline-block">
                            Pewność: {result.confidence}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Method and timestamp - Modernized */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-blue-600">🤖</span>
                        </div>
                        <div>
                          <div className="text-sm text-blue-700 font-medium">Metoda wyceny</div>
                          <div className="text-lg font-bold text-blue-900">
                            {result.method.includes('random_forest') ? 'Random Forest AI' : 
                             result.method.includes('heuristic_fallback') ? 'Heurystyka' : 
                             result.method.includes('ensemble') ? 'EstymatorAI' :
                             result.method}
                          </div>
                        </div>
                      </div>
                    </div>
                    {result.timestamp && (
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <span className="text-gray-600">⏱️</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-700 font-medium">Czas wyceny</div>
                            <div className="text-lg font-bold text-gray-900">
                              {new Date(result.timestamp).toLocaleString('pl-PL')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons - Modernized */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Co dalej?</h3>
                      <p className="text-gray-600">Sprawdź powiązane kalkulatory finansowe</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <Link
                        href={`/kalkulator-zdolnosci-kredytowej?kwota=${result.price}`}
                        className="group block bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">💳</div>
                          <div className="font-bold text-lg mb-2">Rata kredytu</div>
                          <div className="text-blue-100 text-sm">Sprawdź miesięczną ratę hipoteki</div>
                        </div>
                      </Link>
                      <Link
                        href={`/kalkulator-wynajmu?cena=${result.price}`}
                        className="group block bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🏘️</div>
                          <div className="font-bold text-lg mb-2">Rentowność</div>
                          <div className="text-emerald-100 text-sm">Oblicz zysk z wynajmu</div>
                        </div>
                      </Link>
                      <Link
                        href={`/kalkulator-zakupu-nieruchomosci?cena=${result.price}`}
                        className="group block bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">💰</div>
                          <div className="font-bold text-lg mb-2">Koszty zakupu</div>
                          <div className="text-indigo-100 text-sm">Poznaj wszystkie wydatki</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="text-center border-t border-gray-200 pt-8">
                    <Button
                      type="button"
                      onClick={() => {
                        setCurrentStep(0)
                        setStatus('idle')
                        setResult(null)
                      }}
                      variant="outline"
                      className="px-8 py-3 rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 hover:scale-105 font-semibold"
                    >
                      <span className="mr-2">🔄</span>
                      Nowa wycena
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
                      setCurrentStep(3)
                    }}
                    variant="outline"
                  >
                    Spróbuj ponownie
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons - Modernized */}
        {currentStep < 4 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className={`
                    px-8 py-3 rounded-xl border-2 transition-all duration-300 font-semibold
                    ${currentStep === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105 hover:shadow-lg border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }
                  `}
                >
                  <span className="mr-2">←</span>
                  Wstecz
                </Button>

                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700">
                    Krok {currentStep + 1} z {STEPS.length - 1}
                  </div>
                  {!isCurrentStepValid && currentStep === 0 && (
                    <div className="text-sm text-red-600 mt-1 bg-red-50 px-3 py-1 rounded-full inline-block">
                      Wypełnij wymagane pola
                    </div>
                  )}
                </div>

                {currentStep === 3 ? (
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => {
                        const mockEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>
                        handleSubmit(mockEvent)
                      }}
                      disabled={!isFormValid || status === 'loading'}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 hover:scale-105 hover:shadow-xl font-semibold"
                    >
                      <span className="mr-2">🏠</span>
                      Oblicz wycenę
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        const mockEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>
                        handleSubmit(mockEvent)
                      }}
                      disabled={!isFormValid || status === 'loading'}
                      variant="outline"
                      className="px-8 py-3 rounded-xl border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-all duration-300 hover:scale-105 font-semibold"
                    >
                      <span className="mr-2">⚡</span>
                      Pomiń szczegóły
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid}
                    className={`
                      px-8 py-3 rounded-xl font-semibold transition-all duration-300
                      ${!isCurrentStepValid 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl'
                      }
                    `}
                  >
                    Dalej
                    <span className="ml-2">→</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
} 