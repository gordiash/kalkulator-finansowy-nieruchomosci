/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = await getSupabaseServerClient();
    
    // Wyloguj użytkownika przez Supabase
    await supabase.auth.signOut();
    
    const response = NextResponse.json({ ok: true });

    // Wygaszamy wszystkie ciasteczka Supabase (sb-*)
    const allCookies = cookieStore.getAll();
    allCookies.forEach(({ name }) => {
      if (name.startsWith('sb-')) {
        response.cookies.set(name, '', { 
          maxAge: 0, 
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
} 