import { hashPassword, verifyPassword, generateJWT, verifyJWT } from '@/lib/auth';

describe('auth library', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('secret');
    expect(hash).not.toBe('secret');
    const ok = await verifyPassword('secret', hash);
    expect(ok).toBe(true);
  });

  it('generates and verifies JWT', () => {
    const token = generateJWT({ id: 123, email: 'a@b.com' });
    const payload: any = verifyJWT(token);
    expect(payload.id).toBe(123);
    expect(payload.email).toBe('a@b.com');
  });
}); 