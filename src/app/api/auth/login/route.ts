import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import pool from '../../../../lib/db'
import { verifyPassword, generateRandomToken } from '../../../../lib/auth'
import prisma from '../../../../lib/prisma'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
  timestamp: z.string().optional(),
  userAgent: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = loginSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Nieprawidłowe dane logowania' } },
        { status: 400 },
      )
    }

    const { email, password } = parsed.data

    const user = await prisma.users.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Nieprawidłowy email lub hasło' } },
        { status: 401 },
      )
    }

    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Nieprawidłowy email lub hasło' } },
        { status: 401 },
      )
    }

    // Create session (7 dni)
    const token = generateRandomToken(32)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.sessions.create({
      data: {
        user_id: BigInt(user.id),
        token,
        expires_at: expiresAt,
      },
    })

    const response = NextResponse.json({ token, user: { id: String(user.id), email: user.email } })
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })
    return response
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Wystąpił błąd podczas logowania' } },
      { status: 500 },
    )
  }
}


