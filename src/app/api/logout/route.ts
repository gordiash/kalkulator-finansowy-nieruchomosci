/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  const response = NextResponse.json({ ok: true });

  // Wygaszamy wszystkie ciasteczka Supabase (sb-*)
  cookieStore.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-')) {
      response.cookies.set(name, '', { maxAge: 0, path: '/' });
    }
  });

  return response;
} 