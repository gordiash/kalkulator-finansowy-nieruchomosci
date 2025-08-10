import { GET } from '@/app/api/user/profile/route'
import { createMocks } from 'node-mocks-http'
import { PrismaClient } from '@prisma/client'

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn()
    }
  }))
}))

describe('GET /api/user/profile', () => {
  it('powinien zwrócić 401 gdy brak autoryzacji', async () => {
    const { req } = createMocks({
      method: 'GET',
      headers: {}
    })
    const response = await GET(req)
    expect(response.status).toBe(401)
  })

  it('powinien zwrócić 404 gdy użytkownik nie istnieje', async () => {
    const { req } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer valid-token' }
    })
    PrismaClient().user.findUnique.mockResolvedValue(null)
    const response = await GET(req)
    expect(response.status).toBe(404)
  })

  it('powinien zwrócić 200 i dane użytkownika', async () => {
    const mockUser = { id: 1, name: 'Test User' }
    const { req } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer valid-token' }
    })
    PrismaClient().user.findUnique.mockResolvedValue(mockUser)
    const response = await GET(req)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(mockUser)
  })
}) 