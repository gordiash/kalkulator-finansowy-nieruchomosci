/**
 * Testy integracyjne API wyceny
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/valuation/route'

// Mock subprocess dla Python
jest.mock('child_process', () => ({
  spawn: jest.fn()
}))

// Mock fs dla sprawdzania plików modelu
jest.mock('fs', () => ({
  existsSync: jest.fn()
}))

import { spawn } from 'child_process'
import { existsSync } from 'fs'

describe('/api/valuation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Walidacja zapytań', () => {
    it('odrzuca zapytania bez wymaganych pól', async () => {
      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn'
          // brak area i rooms
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('area')
    })

    it('odrzuca nieprawidłowe typy danych', async () => {
      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn',
          area: 'sześćdziesiąt', // string zamiast number
          rooms: 3
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toMatch(/validation|invalid/i)
    })

    it('odrzuca wartości poza zakresem', async () => {
      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn',
          area: 2000, // zbyt duże
          rooms: 3
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toMatch(/area.*range|zakres/i)
    })

    it('akceptuje poprawne dane minimalne', async () => {
      // Mock successful Python execution
      const mockSpawn = spawn as jest.MockedFunction<typeof spawn>
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(JSON.stringify({
                price: 650000,
                currency: 'PLN',
                method: 'Random Forest'
              }))
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0) // success exit code
          }
        })
      }
      mockSpawn.mockReturnValue(mockProcess as any)
      ;(existsSync as jest.Mock).mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn',
          area: 60,
          rooms: 3
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.price).toBe(650000)
      expect(data.method).toBe('Random Forest')
    })
  })

  describe('Integracja z modelem ML', () => {
    it('wywołuje skrypt Python z poprawnymi parametrami', async () => {
      const mockSpawn = spawn as jest.MockedFunction<typeof spawn>
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(JSON.stringify({
                price: 650000,
                currency: 'PLN',
                method: 'Random Forest'
              }))
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0)
          }
        })
      }
      mockSpawn.mockReturnValue(mockProcess as any)
      ;(existsSync as jest.Mock).mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn',
          district: 'Kortowo',
          street: 'Warszawska',
          area: 60,
          rooms: 3,
          floor: 2,
          year: 2015
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      await POST(request)

      expect(mockSpawn).toHaveBeenCalledWith('python', [
        'scripts/predict_rf.py'
      ], expect.objectContaining({
        stdio: ['pipe', 'pipe', 'pipe']
      }))

      // Sprawdź czy dane zostały przekazane do stdin
      const mockStdin = mockProcess.stdout
      expect(mockStdin.on).toHaveBeenCalledWith('data', expect.any(Function))
    })

    it('obsługuje błędy Python subprocess', async () => {
      const mockSpawn = spawn as jest.MockedFunction<typeof spawn>
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback('Python error: Model not found')
            }
          })
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(1) // error exit code
          }
        })
      }
      mockSpawn.mockReturnValue(mockProcess as any)
      ;(existsSync as jest.Mock).mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn',
          area: 60,
          rooms: 3
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toMatch(/model.*error/i)
    })

    it('używa fallback gdy model niedostępny', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(false) // model file doesn't exist

      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn',
          area: 60,
          rooms: 3
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.method).toBe('Heurystyka')
      expect(data.price).toBeGreaterThan(0)
      expect(data.note).toMatch(/fallback|heurystyka/i)
    })
  })

  describe('Format odpowiedzi', () => {
    it('zwraca poprawny format JSON', async () => {
      const mockSpawn = spawn as jest.MockedFunction<typeof spawn>
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(JSON.stringify({
                price: 650000,
                currency: 'PLN',
                method: 'Random Forest',
                confidence: 'Wysoka'
              }))
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0)
          }
        })
      }
      mockSpawn.mockReturnValue(mockProcess as any)
      ;(existsSync as jest.Mock).mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn',
          area: 60,
          rooms: 3
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('price')
      expect(data).toHaveProperty('minPrice')
      expect(data).toHaveProperty('maxPrice')
      expect(data).toHaveProperty('currency', 'PLN')
      expect(data).toHaveProperty('method')
      expect(data).toHaveProperty('timestamp')
      expect(typeof data.price).toBe('number')
      expect(data.minPrice).toBeLessThan(data.price)
      expect(data.maxPrice).toBeGreaterThan(data.price)
    })

    it('oblicza przedział ufności (±7%)', async () => {
      const mockSpawn = spawn as jest.MockedFunction<typeof spawn>
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(JSON.stringify({
                price: 1000000,
                currency: 'PLN',
                method: 'Random Forest'
              }))
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0)
          }
        })
      }
      mockSpawn.mockReturnValue(mockProcess as any)
      ;(existsSync as jest.Mock).mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn',
          area: 60,
          rooms: 3
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.price).toBe(1000000)
      expect(data.minPrice).toBe(930000) // -7%
      expect(data.maxPrice).toBe(1070000) // +7%
    })
  })

  describe('Obsługa różnych miast', () => {
    it('obsługuje miasta z regionu Olsztyn', async () => {
      const mockSpawn = spawn as jest.MockedFunction<typeof spawn>
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(JSON.stringify({
                price: 650000,
                currency: 'PLN',
                method: 'Random Forest'
              }))
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0)
          }
        })
      }
      mockSpawn.mockReturnValue(mockProcess as any)
      ;(existsSync as jest.Mock).mockReturnValue(true)

      const cities = ['Olsztyn', 'Stawiguda', 'Barczewo', 'Dywity']
      
      for (const city of cities) {
        const request = new NextRequest('http://localhost:3000/api/valuation', {
          method: 'POST',
          body: JSON.stringify({
            city,
            area: 60,
            rooms: 3
          }),
          headers: { 'Content-Type': 'application/json' }
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
        
        const data = await response.json()
        expect(data.method).toBe('Random Forest')
      }
    })

    it('używa fallback dla nieznanych miast', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Nieznane Miasto',
          area: 60,
          rooms: 3
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.method).toBe('Heurystyka')
      expect(data.note).toMatch(/nieznane miasto|fallback/i)
    })
  })

  describe('Rate limiting i security', () => {
    it('obsługuje CORS headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn',
          area: 60,
          rooms: 3
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    })

    it('odrzuca zbyt duże payloady', async () => {
      const largePayload = {
        city: 'Olsztyn',
        area: 60,
        rooms: 3,
        street: 'A'.repeat(10000) // bardzo długa nazwa ulicy
      }

      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify(largePayload),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })
  })
}) 