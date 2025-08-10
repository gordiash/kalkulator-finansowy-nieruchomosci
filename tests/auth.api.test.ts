import { NextResponse } from 'next/server'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { POST as loginHandler } from '@/app/api/auth/login/route'
import { generateJWT } from '@/lib/auth'

jest.mock('mysql2/promise', () => {
  const connection = {
    execute: jest.fn(),
    end: jest.fn()
  }
  const fn = jest.fn(() => connection)
  return {
    __esModule: true,
    default: {
      createConnection: fn
    },
    createConnection: fn
  }
})

const mysqlMock = require('mysql2/promise')

describe('Auth API', () => {
  beforeEach(() => {
    mysqlMock.createConnection().execute.mockReset()
  })

  it('registers new user', async () => {
    const { execute } = mysqlMock.createConnection()
    // first execute: select; second: insert
    execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 1 }])

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@y.com', password: 'pass' }),
      headers: { 'Content-Type': 'application/json' }
    }) as any
    const res: any = await registerHandler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.token).toBeDefined()
  })

  it('login returns token for correct creds', async () => {
    const passwordHash = await require('bcryptjs').hash('pass', 10)
    const { execute } = mysqlMock.createConnection()
    execute.mockResolvedValueOnce([[{ id: 2, password_hash: passwordHash }]])

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@y.com', password: 'pass' }),
      headers: { 'Content-Type': 'application/json' }
    }) as any
    const res: any = await loginHandler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.token).toBeDefined()
  })

  it('login fails on wrong password', async () => {
    const passwordHash = await require('bcryptjs').hash('pass', 10)
    const { execute } = mysqlMock.createConnection()
    execute.mockResolvedValueOnce([[{ id: 3, password_hash: passwordHash }]])

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@y.com', password: 'wrong' }),
      headers: { 'Content-Type': 'application/json' }
    }) as any
    const res: any = await loginHandler(req)
    expect(res.status).toBe(401)
  })
}) 