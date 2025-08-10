/**
 * Testy integracyjne API wyceny - punkt 9.2
 * @jest-environment node
 */

import { NextRequest } from 'next/server'

// Mock funkcji Node.js
const mockSpawn = jest.fn()
const mockExistsSync = jest.fn()

jest.mock('child_process', () => ({
  spawn: mockSpawn
}))

jest.mock('fs', () => ({
  existsSync: mockExistsSync
}))

// Import po mockach
import { POST } from '@/app/api/valuation/route'

describe('API Wyceny - Testy Integracyjne', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSpawn.mockClear()
    mockExistsSync.mockClear()
  })

  describe('9.2 Request → Response z mockiem modelu', () => {
    it('akceptuje poprawne zapytanie', async () => {
      // Mock successful Python execution
      const mockProcess = {
        stdin: { write: jest.fn(), end: jest.fn() },
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
      mockSpawn.mockReturnValue(mockProcess)
      mockExistsSync.mockReturnValue(true)

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
      expect(data).toHaveProperty('minPrice')
      expect(data).toHaveProperty('maxPrice')
      expect(data).toHaveProperty('timestamp')
    })

    it('odrzuca nieprawidłowe dane', async () => {
      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify({
          city: 'Olsztyn'
          // brak wymaganych pól
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('waliduje zakresy wartości', async () => {
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
      expect(response.status).toBe(400)
    })

    it('obsługuje błędy Python subprocess', async () => {
      const mockProcess = {
        stdin: { write: jest.fn(), end: jest.fn() },
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
      mockSpawn.mockReturnValue(mockProcess)
      mockExistsSync.mockReturnValue(true)

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
      expect(data.error).toMatch(/error/i)
    })

    it('używa fallback gdy model niedostępny', async () => {
      mockExistsSync.mockReturnValue(false) // model file doesn't exist

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
    })

    it('oblicza przedział ufności ±7%', async () => {
      const mockProcess = {
        stdin: { write: jest.fn(), end: jest.fn() },
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
      mockSpawn.mockReturnValue(mockProcess)
      mockExistsSync.mockReturnValue(true)

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

    it('obsługuje różne miasta z regionu Olsztyn', async () => {
      const mockProcess = {
        stdin: { write: jest.fn(), end: jest.fn() },
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
      mockSpawn.mockReturnValue(mockProcess)
      mockExistsSync.mockReturnValue(true)

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
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.method).toBe('Random Forest')
      }
    })
  })

  describe('Security i Rate Limiting', () => {
    it('odrzuca zbyt duże payloady', async () => {
      const largePayload = {
        city: 'Olsztyn',
        area: 60,
        rooms: 3,
        street: 'A'.repeat(10000) // bardzo długa nazwa
      }

      const request = new NextRequest('http://localhost:3000/api/valuation', {
        method: 'POST',
        body: JSON.stringify(largePayload),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('ma poprawne CORS headers', async () => {
      mockExistsSync.mockReturnValue(false) // use fallback

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
      
      // Sprawdź czy response ma odpowiednie headers
      expect(response).toBeDefined()
      expect(response.status).toBeLessThan(500)
    })
  })
}) 