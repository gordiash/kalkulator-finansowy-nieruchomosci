import { POST as createHandler, GET as listHandler } from '@/app/api/calculations/route'
import { GET as getHandler, PUT as updateHandler, DELETE as deleteHandler } from '@/app/api/calculations/[id]/route'

jest.mock('@/lib/auth', () => ({
  getUserIdFromRequest: jest.fn((req: any) => req.mockUserId || null)
}))
const { getUserIdFromRequest } = require('@/lib/auth')

jest.mock('mysql2/promise', () => {
  const connection = { execute: jest.fn(), end: jest.fn() }
  return { __esModule: true, createConnection: () => connection, default: { createConnection: () => connection } }
})
const mysqlMock = require('mysql2/promise').createConnection()

const makeRequest = (method: string, body?: any, userId?: number, idPath='') => {
  const req = new Request('http://localhost'+idPath, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' }
  }) as any
  req.mockUserId = userId
  req.json = async () => body
  return req
}

describe('Calculations API', () => {
  beforeEach(()=>{
    mysqlMock.execute.mockReset()
  })

  it('returns 401 when no token', async () => {
    const res: any = await listHandler(makeRequest('GET'))
    expect(res.status).toBe(401)
  })

  it('lists calculations for user', async () => {
    mysqlMock.execute.mockResolvedValueOnce([[{ id:1,name:'Calc',calc_type:'rent',created_at:'2024' }]])
    const res: any = await listHandler(makeRequest('GET', undefined, 10))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json[0].id).toBe(1)
  })

  it('creates calculation', async () => {
    mysqlMock.execute.mockResolvedValueOnce([{ insertId: 5 }])
    const res: any = await createHandler(makeRequest('POST', { name:'N', calc_type:'rent', data:{} }, 10))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe(5)
  })
}) 