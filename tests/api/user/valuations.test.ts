import { GET, POST } from '@/app/api/user/valuations/route'
import { DELETE } from '@/app/api/user/valuations/[id]/route'
import { verifyToken } from '@/lib/jwt'

// Mock JWT verification
jest.mock('@/lib/jwt', () => ({
  verifyToken: jest.fn()
}))

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    valuationHistory: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn()
    }
  }))
}))

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const mockValuationData = {
  id: '1',
  user_id: 'user123',
  input_params: {
    address: 'ul. Testowa 123',
    area: 65,
    rooms: 3,
    property_type: 'apartment'
  },
  result: {
    estimated_value: 450000,
    confidence: 0.85,
    price_per_m2: 6923
  },
  created_at: new Date('2024-01-15T10:30:00Z'),
  updated_at: new Date('2024-01-15T10:30:00Z')
}

describe('/api/user/valuations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(verifyToken as jest.Mock).mockReturnValue({ userId: 'user123' })
  })

  describe('GET', () => {
    it('should return 401 when no authorization header', async () => {
      const request = new Request('http://localhost/api/user/valuations', {
        method: 'GET',
        headers: {}
      })

      ;(verifyToken as jest.Mock).mockReturnValue(null)
      
      const response = await GET(request)
      expect(response.status).toBe(401)
    })

    it('should return paginated valuations', async () => {
      const request = new Request('http://localhost/api/user/valuations?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      prisma.valuationHistory.findMany.mockResolvedValue([mockValuationData])
      prisma.valuationHistory.count.mockResolvedValue(1)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        valuations: [mockValuationData],
        total: 1,
        page: 1,
        totalPages: 1
      })

      expect(prisma.valuationHistory.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user123' },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 10
      })
    })

    it('should handle pagination correctly', async () => {
      const request = new Request('http://localhost/api/user/valuations?page=2&limit=5', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      prisma.valuationHistory.findMany.mockResolvedValue([])
      prisma.valuationHistory.count.mockResolvedValue(15)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.page).toBe(2)
      expect(data.totalPages).toBe(3)
      expect(data.total).toBe(15)

      expect(prisma.valuationHistory.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user123' },
        orderBy: { created_at: 'desc' },
        skip: 5,
        take: 5
      })
    })
  })

  describe('POST', () => {
    it('should return 401 when no authorization header', async () => {
      const request = new Request('http://localhost/api/user/valuations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input_params: mockValuationData.input_params,
          result: mockValuationData.result
        })
      })

      ;(verifyToken as jest.Mock).mockReturnValue(null)
      
      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should create new valuation', async () => {
      const request = new Request('http://localhost/api/user/valuations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          input_params: mockValuationData.input_params,
          result: mockValuationData.result
        })
      })

      prisma.valuationHistory.create.mockResolvedValue(mockValuationData)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockValuationData)

      expect(prisma.valuationHistory.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user123',
          input_params: mockValuationData.input_params,
          result: mockValuationData.result
        }
      })
    })

    it('should return 400 when missing required fields', async () => {
      const request = new Request('http://localhost/api/user/valuations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          input_params: mockValuationData.input_params
          // missing result
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})

describe('/api/user/valuations/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(verifyToken as jest.Mock).mockReturnValue({ userId: 'user123' })
  })

  describe('DELETE', () => {
    it('should return 401 when no authorization header', async () => {
      const request = new Request('http://localhost/api/user/valuations/1', {
        method: 'DELETE',
        headers: {}
      })

      ;(verifyToken as jest.Mock).mockReturnValue(null)
      
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      expect(response.status).toBe(401)
    })

    it('should delete valuation when user owns it', async () => {
      const request = new Request('http://localhost/api/user/valuations/1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      prisma.valuationHistory.findUnique.mockResolvedValue({
        ...mockValuationData,
        user_id: 'user123'
      })
      prisma.valuationHistory.delete.mockResolvedValue(mockValuationData)

      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Wycena została usunięta')

      expect(prisma.valuationHistory.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      })
      expect(prisma.valuationHistory.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      })
    })

    it('should return 404 when valuation not found', async () => {
      const request = new Request('http://localhost/api/user/valuations/999', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      prisma.valuationHistory.findUnique.mockResolvedValue(null)

      const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) })
      expect(response.status).toBe(404)
    })

    it('should return 403 when user does not own valuation', async () => {
      const request = new Request('http://localhost/api/user/valuations/1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      prisma.valuationHistory.findUnique.mockResolvedValue({
        ...mockValuationData,
        user_id: 'different-user'
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      expect(response.status).toBe(403)
    })
  })
}) 
