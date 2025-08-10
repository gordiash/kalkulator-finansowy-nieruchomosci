// @ts-nocheck
let middleware: any;
let redirectMock: jest.Mock;
let nextMock: jest.Mock;
let getUserMock: jest.Mock;

jest.mock('next/server', () => {
  redirectMock = jest.fn((url) => ({ type: 'redirect', url, headers: { get: jest.fn(), set: jest.fn() }, cookies: { set: jest.fn() } }));
  nextMock = jest.fn(() => ({ type: 'next', headers: { get: jest.fn(), set: jest.fn() }, cookies: { set: jest.fn() } }));
  return {
    NextResponse: {
      redirect: redirectMock,
      next: nextMock,
    },
    NextRequest: {},
  };
});

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: (...args) => getUserMock(...args),
    },
  })),
}));

jest.mock('@/lib/auth', () => ({ verifyJWT: jest.fn(() => ({ id: '123' })) }))
const { verifyJWT } = require('@/lib/auth')

describe('admin middleware', () => {
  beforeEach(() => {
    getUserMock = jest.fn();
    middleware = require('../middleware').middleware;
    redirectMock?.mockClear?.();
    nextMock?.mockClear?.();
  });

  it('redirects to /login when user is not authenticated', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const makeRequest = (path='/admin', token?: string) => {
      const url = new URL('http://localhost'+path);
      return {
        nextUrl: Object.assign(url, {
          clone: () => new URL(url.toString())
        }),
        cookies: { getAll: () => [], get: (name: string)=> name==='token' && token ? { value: token } : undefined },
        url: url.toString(),
      } as any;
    };

    const request = makeRequest();

    const res = await middleware(request);
    expect(redirectMock).toHaveBeenCalled();
    expect(res.type).toBe('redirect');
  });

  it('allows access when user is authenticated', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: '123' } } });
    const makeRequest = (path='/admin', token?: string) => {
      const url = new URL('http://localhost'+path);
      return {
        nextUrl: Object.assign(url, { clone: () => new URL(url.toString()) }),
        cookies: { getAll: () => [], get: (name: string)=> name==='token' && token ? { value: token } : undefined },
        url: url.toString(),
      } as any;
    };
    const res = await middleware(makeRequest('/admin', 'abc'));
    expect(nextMock).toHaveBeenCalled();
    expect(res.type).toBe('next');
  });
}); 