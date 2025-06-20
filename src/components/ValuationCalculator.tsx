'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface ValuationResponse {
  price: number
  minPrice: number
  maxPrice: number
  currency: string
  method: string
  note?: string
}

export default function ValuationCalculator() {
  const [form, setForm] = useState({
    city: '',
    district: '',
    street: '',
    area: '',
    rooms: '',
    floor: '',
    year: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [result, setResult] = useState<ValuationResponse | null>(null)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      // Konwersja pól numerycznych
      const payload = {
        ...form,
        area: parseFloat(form.area),
        rooms: parseInt(form.rooms),
        floor: form.floor ? parseInt(form.floor) : undefined,
        year: form.year ? parseInt(form.year) : undefined,
      }

      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Błąd serwera')
      }
      setResult(data)
      setStatus('success')
    } catch (err: any) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Miasto</label>
            <Input name="city" value={form.city} onChange={handleChange} required placeholder="np. Warszawa" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Dzielnica</label>
            <Input name="district" value={form.district} onChange={handleChange} placeholder="np. Mokotów" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Ulica</label>
            <Input name="street" value={form.street} onChange={handleChange} placeholder="np. Puławska" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Metraż (m²)</label>
            <Input
              name="area"
              value={form.area}
              onChange={handleChange}
              type="number"
              step="0.1"
              min="1"
              required
              placeholder="np. 50"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Liczba pokoi</label>
            <Input
              name="rooms"
              value={form.rooms}
              onChange={handleChange}
              type="number"
              min="1"
              required
              placeholder="np. 3"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Piętro</label>
            <Input name="floor" value={form.floor} onChange={handleChange} type="number" min="0" placeholder="np. 2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Rok budowy</label>
            <Input name="year" value={form.year} onChange={handleChange} type="number" placeholder="np. 2008" />
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          {status === 'loading' ? 'Obliczanie…' : 'Oblicz wartość'}
        </button>
      </form>

      {status === 'success' && result && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold mb-2">Szacowana wartość (widełki):</h2>
          <p className="text-3xl font-bold mb-2">
            {formatCurrency(result.minPrice)} – {formatCurrency(result.maxPrice)}
          </p>
          {result.note && <p className="text-sm text-muted-foreground mb-4">{result.note}</p>}
          <p className="text-sm text-gray-500 mb-6">Przedział obliczony ±5% od wartości średniej.</p>

          <div className="space-y-3">
            <Link
              href={`/kalkulator-zdolnosci-kredytowej?kwota=${result.price}`}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
            >
              Oblicz ratę kredytu dla tej kwoty
            </Link>
            <Link
              href={`/kalkulator-wynajmu?cena=${result.price}`}
              className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg"
            >
              Sprawdź rentowność wynajmu
            </Link>
            <Link
              href={`/kalkulator-zakupu-nieruchomosci?cena=${result.price}`}
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
            >
              Zobacz koszty transakcyjne zakupu
            </Link>
          </div>
        </div>
      )}
    </div>
  )
} 