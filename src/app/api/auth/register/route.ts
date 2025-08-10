import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import pool from '@/lib/db'
import { hashPassword, generateRandomToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
  name: z.string().min(2).max(255).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = registerSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Nieprawidłowe dane rejestracji' } },
        { status: 400 },
      )
    }

    const { email, password, name } = parsed.data

    const existing = await prisma.users.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: { code: 'EMAIL_TAKEN', message: 'Email jest już zajęty' } },
        { status: 409 },
      )
    }

    const password_hash = await hashPassword(password)
    const user = await prisma.users.create({
      data: { email, password_hash, name: name ?? null },
    })

    const token = generateRandomToken(32)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.sessions.create({
      data: { user_id: BigInt(user.id), token, expires_at: expiresAt },
    })

    const response = NextResponse.json({ token })
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
      { error: { code: 'SERVER_ERROR', message: 'Wystąpił błąd podczas rejestracji' } },
      { status: 500 },
    )
  }
}


