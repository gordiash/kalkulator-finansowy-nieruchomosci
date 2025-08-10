const { middleware } = require('../middleware')

jest.mock('@/lib/auth', () => ({ verifyJWT: jest.fn() }))
const { verifyJWT } = require('@/lib/auth')

jest.mock('next/server', () => {
  const next = jest.fn(() => ({ type: 'next', headers: { get: jest.fn(), set: jest.fn() }, cookies: { set: jest.fn() } }))
  const redirect = jest.fn((url: any) => ({ type: 'redirect', url, headers: { get: jest.fn(), set: jest.fn() }, cookies: { set: jest.fn() } }))
  return { NextResponse: { next, redirect } }
})

const { NextResponse: RespMock } = require('next/server')

describe('JWT middleware', () => {
  beforeEach(() => {
    RespMock.next.mockClear(); RespMock.redirect.mockClear(); verifyJWT.mockReset()
  })

  const makeRequest = (path: string, token?: string) => {
    return {
      nextUrl: { pathname: path, clone: () => ({}) },
      cookies: { get: (name: string) => name==='token' && token ? { value: token } : undefined },
      headers: { get: () => null },
      url: 'http://localhost'+path
    } as any
  }

  it('allows protected path with valid token', () => {
    verifyJWT.mockReturnValue({ id: 1 })
    const res = middleware(makeRequest('/admin', 'abc'))
    expect(RespMock.next).toHaveBeenCalled()
    expect(res.type).toBe('next')
  })

  it('redirects when no token', () => {
    const res = middleware(makeRequest('/admin'))
    expect(RespMock.redirect).toHaveBeenCalled()
    expect(res.type).toBe('redirect')
  })
}) 