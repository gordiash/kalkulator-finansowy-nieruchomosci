import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź sesję użytkownika
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Sprawdź sesję
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    return NextResponse.json({
      success: true,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      session: session ? {
        access_token: session.access_token ? 'exists' : null,
        refresh_token: session.refresh_token ? 'exists' : null
      } : null,
      auth_error: authError?.message || null,
      session_error: sessionError?.message || null
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 