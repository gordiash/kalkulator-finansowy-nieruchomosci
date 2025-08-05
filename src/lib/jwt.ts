import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Generowanie tokenu JWT
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Weryfikacja tokenu JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Błąd weryfikacji tokenu:', error);
    return null;
  }
}

// Hashowanie hasła
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Porównywanie hasła z hashem
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
} 
