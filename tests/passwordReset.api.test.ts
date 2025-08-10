import { POST as requestHandler } from '@/app/api/auth/password-reset-request/route'
import { POST as resetHandler } from '@/app/api/auth/password-reset/route'

jest.mock('mysql2/promise', () => {
  const connection = {
    execute: jest.fn(),
    end: jest.fn()
  }
  const fn = jest.fn(() => connection)
  return { __esModule: true, createConnection: fn, default: { createConnection: fn } }
})

const mysqlMock = require('mysql2/promise')

describe('Password reset API', () => {
  beforeEach(() => {
    mysqlMock.createConnection().execute.mockReset()
  })

  it('returns ok for existing email and stores token', async () => {
    const { execute } = mysqlMock.createConnection()
    execute
      .mockResolvedValueOnce([[{ id: 5 }]]) // select user
      .mockResolvedValueOnce([{}]) // insert token

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@y.com' }),
      headers: { 'Content-Type': 'application/json' }
    }) as any
    const res: any = await requestHandler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })

  it('resets password with valid token', async () => {
    const { execute } = mysqlMock.createConnection()
    execute
      .mockResolvedValueOnce([[{ user_id: 5 }]]) // select token
      .mockResolvedValueOnce([{}]) // update users
      .mockResolvedValueOnce([{}]) // delete token

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ token: 'abc', newPassword: 'newpass' }),
      headers: { 'Content-Type': 'application/json' }
    }) as any
    const res: any = await resetHandler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })
}) 