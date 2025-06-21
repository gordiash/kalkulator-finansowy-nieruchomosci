'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from './input'

interface AutocompleteProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  options: string[]
  loading?: boolean
  required?: boolean
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export function Autocomplete({
  name,
  value,
  onChange,
  placeholder,
  options,
  loading = false,
  required = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const comboboxId = `combobox-${name}`
  const listboxId = `listbox-${name}`

  // Filtruj opcje na podstawie wprowadzonego tekstu
  useEffect(() => {
    if (!value || value.length === 0) {
      setFilteredOptions(options.slice(0, 10)) // Pokaż pierwsze 10 opcji
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10) // Maksymalnie 10 wyników
      setFilteredOptions(filtered)
    }
    setActiveIndex(-1) // Reset active index when options change
  }, [value, options])

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    // Opóźnienie żeby kliknięcie na opcję mogło się wykonać
    setTimeout(() => {
      setIsOpen(false)
      setActiveIndex(-1)
    }, 150)
  }

  const handleOptionClick = (option: string) => {
    // Symuluj event change
    const event = {
      target: { name, value: option }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(event)
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex(0)
      return
    }

    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
        inputRef.current?.blur()
        break
        
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
        
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
        
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[activeIndex])
        }
        break
        
      case 'Tab':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex] as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [activeIndex])

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={inputRef}
        id={comboboxId}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full"
        role="combobox"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-autocomplete="list"
        aria-haspopup="listbox"
      />
      
      {loading && (
        <div 
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          aria-hidden="true"
        >
          <div 
            className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"
            role="status"
            aria-label="Ładowanie opcji"
          ></div>
        </div>
      )}

      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={`Lista opcji dla ${ariaLabel || name}`}
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto mt-1"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => handleOptionClick(option)}
              className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${
                index === activeIndex 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      {isOpen && filteredOptions.length === 0 && value.length > 0 && (
        <div 
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1"
          role="status"
          aria-live="polite"
        >
          <div className="px-3 py-2 text-sm text-gray-500">
            Brak wyników dla "{value}"
          </div>
        </div>
      )}
    </div>
  )
} 