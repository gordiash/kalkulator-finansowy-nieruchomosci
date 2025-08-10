import { compare, hash } from 'bcryptjs'
import crypto from 'crypto'
import { NextRequest } from 'next/server'
import pool from './db'

const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 dni w sekundach

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hashToCompare: string): Promise<boolean> {
  return compare(password, hashToCompare)
}

export async function createSession(userId: number): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)

  const db = pool
  await db.execute(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, sessionToken, expiresAt]
  )

  return sessionToken
}

export async function getUserIdFromRequest(req: NextRequest): Promise<number | null> {
  const sessionToken = req.cookies.get('session')?.value

  if (!sessionToken) {
    return null
  }

  const db = pool
  const [rows] = await db.execute(
    'SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()',
    [sessionToken]
  )

  if ((rows as any[]).length === 0) {
    return null
  }

  return (rows as any[])[0].user_id
}

export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
} 