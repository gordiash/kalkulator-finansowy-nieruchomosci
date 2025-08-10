import { PUT } from '@/app/api/user/profile/route'
import { createMocks } from 'node-mocks-http'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      update: jest.fn(),
      findUnique: jest.fn()
    },
    profileAuditLog: {
      create: jest.fn()
    }
  }))
}))

const mockValidToken = jwt.sign({ userId: 123 }, 'secret')

describe('PUT /api/user/profile', () => {
  it('powinien zwrócić 401 gdy brak autoryzacji', async () => {
    const { req } = createMocks({
      method: 'PUT',
      headers: {}
    })
    const response = await PUT(req)
    expect(response.status).toBe(401)
  })

  it('powinien zwrócić 400 przy nieprawidłowych danych', async () => {
    const { req } = createMocks({
      method: 'PUT',
      headers: { authorization: `Bearer ${mockValidToken}` },
      body: { name: '' }
    })
    const response = await PUT(req)
    expect(response.status).toBe(400)
  })

  it('powinien zaktualizować profil i zwrócić 200', async () => {
    const mockUser = { id: 123, name: 'Nowe Imię' }
    const { req } = createMocks({
      method: 'PUT',
      headers: { authorization: `Bearer ${mockValidToken}` },
      body: { name: 'Nowe Imię' }
    })
    PrismaClient().user.update.mockResolvedValue(mockUser)
    const response = await PUT(req)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(mockUser)
  })
}) 