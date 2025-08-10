// @ts-nocheck
let POST: any;

const signOutMock = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: { signOut: signOutMock },
  })),
}));

let cookiesMock: jest.Mock;

jest.mock('next/headers', () => {
  cookiesMock = jest.fn(() => ({
    getAll: () => [],
    set: jest.fn(),
  }));
  return { cookies: cookiesMock };
});

const jsonMock = jest.fn();

jest.mock('next/server', () => ({
  NextResponse: {
    json: (...args) => jsonMock(...args),
  },
}));

jsonMock.mockImplementation((body)=>({body}));

describe('logout route', () => {
  beforeEach(() => {
    signOutMock.mockClear();
    jsonMock.mockClear();
    POST = require('../src/app/api/logout/route').POST;
  });

  it('calls supabase signOut and returns ok', async () => {
    const res = await POST();
    expect(signOutMock).toHaveBeenCalled();
    expect(jsonMock).toHaveBeenCalledWith({ ok: true });
    expect(res.body.ok).toBe(true);
  });
}); 