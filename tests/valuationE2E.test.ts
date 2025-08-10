/**
 * Testy E2E dla kalkulatora wyceny
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ValuationCalculator from '@/components/ValuationCalculator'

// Mock całego flow
global.fetch = jest.fn()

// Mock router dla testów nawigacji
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useSearchParams: () => ({
    get: jest.fn()
  })
}))

// Mock lokalizacji
jest.mock('@/hooks/useLocations', () => ({
  __esModule: true,
  default: () => ({
    cities: ['Olsztyn', 'Stawiguda', 'Barczewo', 'Dywity'],
    districts: ['Kortowo', 'Centrum', 'Nagórki', 'Redykajny'],
    loading: false,
    error: null
  })
}))

// Mock analytics
const mockTrackValuationSubmitted = jest.fn()
const mockTrackValuationResultViewed = jest.fn()
const mockTrackValuationError = jest.fn()
const mockTrackActionButtonClick = jest.fn()

jest.mock('@/lib/analytics', () => ({
  valuationAnalytics: {
    trackValuationSubmitted: mockTrackValuationSubmitted,
    trackValuationResultViewed: mockTrackValuationResultViewed,
    trackValuationError: mockTrackValuationError,
    trackActionButtonClick: mockTrackActionButtonClick
  }
}))

describe('Kalkulator Wyceny - E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
    mockPush.mockClear()
  })

  describe('Happy Path - Pełny przepływ', () => {
    const mockSuccessResponse = {
      price: 684000,
      minPrice: 636120,
      maxPrice: 731880,
      currency: 'PLN',
      method: 'Random Forest',
      confidence: 'Wysoka',
      note: 'Wycena oparta o model AI',
      timestamp: '2024-01-15T10:30:00Z'
    }

    it('przeprowadza pełny flow wyceny mieszkania', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      })

      render(<ValuationCalculator />)

      // Krok 1: Sprawdź czy formularz jest widoczny
      expect(screen.getByText(/wycena oparta o sztuczną inteligencję/i)).toBeInTheDocument()
      expect(screen.getByText(/random forest/i)).toBeInTheDocument()
      expect(screen.getByText(/566 ofertach/i)).toBeInTheDocument()

      // Krok 2: Wypełnij wszystkie pola formularza
      const cityInput = screen.getByLabelText(/miasto/i)
      const districtInput = screen.getByLabelText(/dzielnica/i)
      const streetInput = screen.getByLabelText(/ulica/i)
      const areaInput = screen.getByLabelText(/metraż/i)
      const roomsInput = screen.getByLabelText(/liczba pokoi/i)
      const floorInput = screen.getByLabelText(/piętro/i)
      const yearInput = screen.getByLabelText(/rok budowy/i)

      fireEvent.change(cityInput, { target: { value: 'Olsztyn' } })
      fireEvent.change(districtInput, { target: { value: 'Kortowo' } })
      fireEvent.change(streetInput, { target: { value: 'Warszawska' } })
      fireEvent.change(areaInput, { target: { value: '60' } })
      fireEvent.change(roomsInput, { target: { value: '3' } })
      fireEvent.change(floorInput, { target: { value: '2' } })
      fireEvent.change(yearInput, { target: { value: '2015' } })

      // Krok 3: Sprawdź czy przycisk jest aktywny
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      expect(submitButton).not.toBeDisabled()

      // Krok 4: Wyślij formularz
      fireEvent.click(submitButton)

      // Krok 5: Sprawdź stan loading
      expect(screen.getByText(/obliczanie wyceny/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      // Krok 6: Poczekaj na wynik i sprawdź odpowiedź
      await waitFor(() => {
        expect(screen.getByText(/684.*000.*PLN/)).toBeInTheDocument()
        expect(screen.getByText(/Random Forest/i)).toBeInTheDocument()
        expect(screen.getByText(/636.*120.*-.*731.*880/)).toBeInTheDocument()
        expect(screen.getByText(/wysoka/i)).toBeInTheDocument()
      })

      // Krok 7: Sprawdź czy przyciski akcji są widoczne
      expect(screen.getByText(/💳.*rata kredytu/i)).toBeInTheDocument()
      expect(screen.getByText(/🏠.*wynajem/i)).toBeInTheDocument()
      expect(screen.getByText(/📊.*koszty zakupu/i)).toBeInTheDocument()

      // Krok 8: Sprawdź wywołania analytics
      expect(mockTrackValuationSubmitted).toHaveBeenCalledWith({
        city: 'Olsztyn',
        district: 'Kortowo',
        street: 'Warszawska',
        area: 60,
        rooms: 3,
        floor: 2,
        year: 2015,
        timestamp: expect.any(String)
      })

      expect(mockTrackValuationResultViewed).toHaveBeenCalledWith({
        city: 'Olsztyn',
        district: 'Kortowo',
        street: 'Warszawska',
        area: 60,
        rooms: 3,
        floor: 2,
        year: 2015,
        price: 684000,
        method: 'Random Forest'
      })

      // Krok 9: Test nawigacji do innych kalkulatorów
      const creditButton = screen.getByText(/💳.*rata kredytu/i)
      fireEvent.click(creditButton)

      expect(mockTrackActionButtonClick).toHaveBeenCalledWith('credit_calculator', 684000)
    })

    it('obsługuje wycenę z minimalnymi danymi', async () => {
      const mockMinimalResponse = {
        price: 450000,
        minPrice: 418500,
        maxPrice: 481500,
        currency: 'PLN',
        method: 'Random Forest',
        confidence: 'Średnia'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMinimalResponse
      })

      render(<ValuationCalculator />)

      // Wypełnij tylko wymagane pola
      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '45' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '2' } })

      fireEvent.click(screen.getByRole('button', { name: /wycena mieszkania/i }))

      await waitFor(() => {
        expect(screen.getByText(/450.*000.*PLN/)).toBeInTheDocument()
        expect(screen.getByText(/średnia/i)).toBeInTheDocument()
      })

      // Sprawdź czy API zostało wywołane z undefined dla opcjonalnych pól
      expect(fetch).toHaveBeenCalledWith('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: 'Olsztyn',
          district: '',
          street: '',
          area: 45,
          rooms: 2,
          floor: 0,
          year: undefined
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('obsługuje błąd serwera z graceful fallback', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Błąd modelu ML' })
      })

      render(<ValuationCalculator />)

      // Wypełnij formularz
      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '60' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '3' } })

      fireEvent.click(screen.getByRole('button', { name: /wycena mieszkania/i }))

      await waitFor(() => {
        expect(screen.getByText(/błąd modelu ml/i)).toBeInTheDocument()
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      // Sprawdź czy błąd został zatrackowany
      expect(mockTrackValuationError).toHaveBeenCalledWith('Błąd modelu ML', {
        city: 'Olsztyn',
        area: 60,
        rooms: 3
      })
    })

    it('obsługuje timeout sieci', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('fetch timeout'))

      render(<ValuationCalculator />)

      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '60' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '3' } })

      fireEvent.click(screen.getByRole('button', { name: /wycena mieszkania/i }))

      await waitFor(() => {
        expect(screen.getByText(/fetch timeout/i)).toBeInTheDocument()
      })
    })

    it('obsługuje odpowiedź z fallback heurystyką', async () => {
      const mockFallbackResponse = {
        price: 398000,
        minPrice: 370140,
        maxPrice: 425860,
        currency: 'PLN',
        method: 'Heurystyka',
        confidence: 'Niska',
        note: 'Wycena oparta o heurystykę - nieznane miasto'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFallbackResponse
      })

      render(<ValuationCalculator />)

      // Test z nieznanym miastem
      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Nieznane Miasto' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '60' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '3' } })

      fireEvent.click(screen.getByRole('button', { name: /wycena mieszkania/i }))

      await waitFor(() => {
        expect(screen.getByText(/398.*000.*PLN/)).toBeInTheDocument()
        expect(screen.getByText(/heurystyka/i)).toBeInTheDocument()
        expect(screen.getByText(/niska/i)).toBeInTheDocument()
        expect(screen.getByText(/nieznane miasto/i)).toBeInTheDocument()
      })
    })

    it('obsługuje bardzo duże mieszkania', async () => {
      const mockLargeResponse = {
        price: 2500000,
        minPrice: 2325000,
        maxPrice: 2675000,
        currency: 'PLN',
        method: 'Random Forest',
        confidence: 'Średnia',
        note: 'Duże mieszkanie - ograniczona ilość danych porównawczych'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLargeResponse
      })

      render(<ValuationCalculator />)

      fireEvent.change(screen.getByLabelText(/miasto/i), { target: { value: 'Olsztyn' } })
      fireEvent.change(screen.getByLabelText(/metraż/i), { target: { value: '200' } })
      fireEvent.change(screen.getByLabelText(/liczba pokoi/i), { target: { value: '8' } })

      fireEvent.click(screen.getByRole('button', { name: /wycena mieszkania/i }))

      await waitFor(() => {
        expect(screen.getByText(/2.*500.*000.*PLN/)).toBeInTheDocument()
        expect(screen.getByText(/ograniczona ilość danych/i)).toBeInTheDocument()
      })
    })

    it('obsługuje bardzo stare budynki', async () => {
      render(<ValuationCalculator />)

      const yearInput = screen.getByLabelText(/rok budowy/i)
      
      // Test roku 1900
      fireEvent.change(yearInput, { target: { value: '1900' } })
      expect(yearInput).toHaveValue(1900)

      // Test roku przed 1800 (nie powinien zaakceptować)
      fireEvent.change(yearInput, { target: { value: '1700' } })
      expect(yearInput).toHaveValue(null)
    })
  })

  describe('Responsywność i Accessibility', () => {
    it('działa na urządzeniach mobilnych', () => {
      // Symuluj viewport mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      render(<ValuationCalculator />)

      // Sprawdź czy wszystkie elementy są widoczne
      expect(screen.getByLabelText(/miasto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/metraż/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /wycena mieszkania/i })).toBeInTheDocument()
    })

    it('obsługuje nawigację klawiaturą', () => {
      render(<ValuationCalculator />)

      const cityInput = screen.getByLabelText(/miasto/i)
      const areaInput = screen.getByLabelText(/metraż/i)
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })

      // Test tabulacji
      cityInput.focus()
      expect(document.activeElement).toBe(cityInput)

      // Test Enter na przycisku
      submitButton.focus()
      fireEvent.keyDown(submitButton, { key: 'Enter' })
      expect(screen.getByText(/podaj prawidłowy metraż/i)).toBeInTheDocument()
    })

    it('ma poprawne kontrasy kolorów', () => {
      render(<ValuationCalculator />)

      // Sprawdź czy elementy mają odpowiednie klasy Tailwind dla kontrastów
      const submitButton = screen.getByRole('button', { name: /wycena mieszkania/i })
      expect(submitButton).toHaveClass('bg-blue-600', 'text-white')

      const errorElement = screen.queryByRole('alert')
      if (errorElement) {
        expect(errorElement).toHaveClass('text-red-800', 'bg-red-50')
      }
    })
  })

  describe('Performance', () => {
    it('nie wykonuje niepotrzebnych re-renderów', async () => {
      const renderSpy = jest.fn()
      
      const TestComponent = () => {
        renderSpy()
        return <ValuationCalculator />
      }

      render(<TestComponent />)
      
      const initialRenderCount = renderSpy.mock.calls.length

      // Zmiana w polu nie powinna powodować zbyt wielu re-renderów
      const cityInput = screen.getByLabelText(/miasto/i)
      fireEvent.change(cityInput, { target: { value: 'Olsztyn' } })

      // Sprawdź czy liczba renderów jest rozsądna
      expect(renderSpy.mock.calls.length - initialRenderCount).toBeLessThan(5)
    })

    it('debounce\'uje walidację pól', async () => {
      render(<ValuationCalculator />)

      const areaInput = screen.getByLabelText(/metraż/i)
      
      // Szybkie wpisywanie nie powinno powodować wielu walidacji
      fireEvent.change(areaInput, { target: { value: '6' } })
      fireEvent.change(areaInput, { target: { value: '60' } })
      fireEvent.change(areaInput, { target: { value: '600' } })

      // Ostatnia wartość powinna być zaakceptowana
      expect(areaInput).toHaveValue(600)
    })
  })
}) 