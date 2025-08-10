/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ValuationCalculator from '@/components/ValuationCalculator'

// Mock fetch globalnie
global.fetch = jest.fn()

// Mock lokalizacji
jest.mock('@/hooks/useLocations', () => ({
  __esModule: true,
  default: () => ({
    cities: ['Olsztyn', 'Warszawa', 'Kraków'],
    districts: ['Kortowo', 'Centrum', 'Podgórze'],
    loading: false,
    error: null
  })
}))

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  valuationAnalytics: {
    trackValuationSubmitted: jest.fn(),
    trackValuationResultViewed: jest.fn(),
    trackValuationError: jest.fn()
  }
}))

describe('ValuationCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('Walidacja wejścia', () => {
    it('renderuje formularz z wszystkimi polami', () => {
      render(<ValuationCalculator />)
      
      expect(screen.getByLabelText(/miasto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/dzielnica/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ulica/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/metraż/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/liczba pokoi/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/piętro/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rok budowy/i)).toBeInTheDocument()
    })

    it('wyświetla błąd gdy brak wymaganych pól', async () => {
      render(<ValuationCalculator />)
      
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/podaj prawidłowy metraż/i)).toBeInTheDocument()
      })
    })

    it('waliduje zakres metrażu', async () => {
      render(<ValuationCalculator />)
      
      const areaInput = screen.getByLabelText(/metraż/i)
      const roomsInput = screen.getByLabelText(/liczba pokoi/i)
      const cityInput = screen.getByLabelText(/miasto/i)
      
      // Wypełnij wymagane pola
      fireEvent.change(cityInput, { target: { value: 'Olsztyn' } })
      fireEvent.change(roomsInput, { target: { value: '3' } })
      
      // Test zbyt małego metrażu
      fireEvent.change(areaInput, { target: { value: '0' } })
      
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/podaj prawidłowy metraż/i)).toBeInTheDocument()
      })
    })

    it('waliduje liczbę pokoi', async () => {
      render(<ValuationCalculator />)
      
      const areaInput = screen.getByLabelText(/metraż/i)
      const roomsInput = screen.getByLabelText(/liczba pokoi/i)
      const cityInput = screen.getByLabelText(/miasto/i)
      
      // Wypełnij wymagane pola
      fireEvent.change(cityInput, { target: { value: 'Olsztyn' } })
      fireEvent.change(areaInput, { target: { value: '60' } })
      
      // Test nieprawidłowej liczby pokoi
      fireEvent.change(roomsInput, { target: { value: '0' } })
      
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/podaj prawidłową liczbę pokoi/i)).toBeInTheDocument()
      })
    })

    it('pozwala na wpisywanie roku budowy', () => {
      render(<ValuationCalculator />)
      
      const yearInput = screen.getByLabelText(/rok budowy/i)
      
      // Test wpisywania niepełnego roku
      fireEvent.change(yearInput, { target: { value: '20' } })
      expect(yearInput).toHaveValue(20)
      
      // Test pełnego roku
      fireEvent.change(yearInput, { target: { value: '2015' } })
      expect(yearInput).toHaveValue(2015)
      
      // Test usuwania zawartości
      fireEvent.change(yearInput, { target: { value: '' } })
      expect(yearInput).toHaveValue(null)
    })

    it('ogranicza zakres roku budowy', () => {
      render(<ValuationCalculator />)
      
      const yearInput = screen.getByLabelText(/rok budowy/i)
      
      // Test roku poza zakresem (zbyt stary)
      fireEvent.change(yearInput, { target: { value: '1700' } })
      expect(yearInput).toHaveValue(null) // Nie powinien zaakceptować
      
      // Test roku poza zakresem (zbyt nowy)
      const futureYear = new Date().getFullYear() + 10
      fireEvent.change(yearInput, { target: { value: futureYear.toString() } })
      expect(yearInput).toHaveValue(null) // Nie powinien zaakceptować
    })
  })

  describe('Funkcja predykcji', () => {
    const mockSuccessResponse = {
      price: 650000,
      minPrice: 600000,
      maxPrice: 700000,
      currency: 'PLN',
      method: 'Random Forest',
      confidence: 'Wysoka',
      note: 'Wycena oparta o model AI'
    }

    it('wysyła poprawne dane do API', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      })

      render(<ValuationCalculator />)
      
      // Wypełnij formularz
      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/dzielnica/i), { target: { value: 'Kortowo' } })
      fireEvent.change(screen.getByLabelText(/ulica/i), { target: { value: 'Warszawska' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '60' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '3' } })
      fireEvent.change(screen.getByLabelText(/piętro/i), { target: { value: '2' } })
      fireEvent.change(screen.getByLabelText(/rok budowy/i), { target: { value: '2015' } })
      
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/valuation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: 'Olsztyn',
            district: 'Kortowo',
            street: 'Warszawska',
            area: 60,
            rooms: 3,
            floor: 2,
            year: 2015
          })
        })
      })
    })

    it('wyświetla wynik wyceny', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      })

      render(<ValuationCalculator />)
      
      // Wypełnij minimalne wymagane pola
      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '60' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '3' } })
      
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/650.*000.*PLN/)).toBeInTheDocument()
        expect(screen.getByText(/Random Forest/)).toBeInTheDocument()
        expect(screen.getByText(/600.*000.*-.*700.*000/)).toBeInTheDocument()
      })
    })

    it('obsługuje błędy API', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Błąd serwera' })
      })

      render(<ValuationCalculator />)
      
      // Wypełnij formularz
      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '60' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '3' } })
      
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/błąd serwera/i)).toBeInTheDocument()
      })
    })

    it('obsługuje błędy sieci', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<ValuationCalculator />)
      
      // Wypełnij formularz
      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '60' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '3' } })
      
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Stan loading', () => {
    it('wyświetla stan ładowania podczas zapytania', async () => {
      // Mock wolnego API
      ;(fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ price: 650000, currency: 'PLN', method: 'Random Forest' })
          }), 100)
        )
      )

      render(<ValuationCalculator />)
      
      // Wypełnij formularz
      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '60' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '3' } })
      
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      fireEvent.click(submitButton)
      
      // Sprawdź stan loading
      expect(screen.getByText(/obliczanie wyceny/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Przyciski akcji', () => {
    const mockSuccessResponse = {
      price: 650000,
      minPrice: 600000,
      maxPrice: 700000,
      currency: 'PLN',
      method: 'Random Forest'
    }

    it('wyświetla przyciski akcji po otrzymaniu wyniku', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      })

      render(<ValuationCalculator />)
      
      // Wypełnij i wyślij formularz
      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '60' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '3' } })
      
      fireEvent.click(screen.getByRole('button', { name: /wycena mieszkania/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/💳.*rata kredytu/i)).toBeInTheDocument()
        expect(screen.getByText(/🏠.*wynajem/i)).toBeInTheDocument()
        expect(screen.getByText(/📊.*koszty zakupu/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('ma poprawne ARIA labels', () => {
      render(<ValuationCalculator />)
      
      expect(screen.getByLabelText(/miasto gdzie znajduje się mieszkanie/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/powierzchnia mieszkania w metrach kwadratowych/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/liczba pokoi w mieszkaniu/i)).toBeInTheDocument()
    })

    it('ma poprawną strukturę nagłówków', () => {
      render(<ValuationCalculator />)
      
      expect(screen.getByText(/wycena oparta o sztuczną inteligencję/i)).toBeInTheDocument()
      expect(screen.getByText(/dane mieszkania/i)).toBeInTheDocument()
    })

    it('wyświetla komunikaty błędów z odpowiednim role', async () => {
      render(<ValuationCalculator />)
      
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toBeInTheDocument()
        expect(errorAlert).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
}) 