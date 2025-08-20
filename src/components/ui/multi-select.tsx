'use client'

import { useId } from 'react'

type MultiSelectProps = {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  className?: string
  'aria-label'?: string
}

export function MultiSelect({ options, value, onChange, placeholder, className = '', 'aria-label': ariaLabel }: MultiSelectProps) {
  const id = useId()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected: string[] = Array.from(e.target.selectedOptions).map(o => o.value)

    // Zasada: "Brak" jest opcją wyłączną. Jeśli zaznaczono inne wartości, usuń "Brak".
    let cleaned = selected
    if (cleaned.includes('Brak') && cleaned.length > 1) {
      cleaned = cleaned.filter(v => v !== 'Brak')
    }

    // Jeśli nic nie wybrano (lub usunięto wszystko), ustaw z powrotem "Brak"
    if (cleaned.length === 0) {
      cleaned = ['Brak']
    }

    onChange(cleaned)
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">{ariaLabel || 'Wybierz'}</label>
      <select
        id={id}
        multiple
        value={value}
        onChange={handleChange}
        size={Math.min(6, Math.max(3, options.length))}
        className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
        aria-label={ariaLabel}
      >
        {options.length === 0 && (
          <option disabled>{placeholder || 'Brak opcji'}</option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt} className="py-1">
            {opt}
          </option>
        ))}
      </select>
      <div className="text-xs text-slate-400 mt-1">
        Ctrl+klik aby wybrać wiele opcji
      </div>
    </div>
  )
}


