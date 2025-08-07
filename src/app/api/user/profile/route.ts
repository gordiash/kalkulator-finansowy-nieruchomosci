import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź czy użytkownik jest zalogowany
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    // Pobierz dane użytkownika z Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Błąd podczas pobierania profilu:', profileError);
      return NextResponse.json(
        { error: 'Nie udało się pobrać profilu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      profile: profile || null,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania profilu:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź czy użytkownik jest zalogowany
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address } = body;

    // Aktualizuj profil użytkownika
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: name || null,
        phone: phone || null,
        address: address || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      console.error('Błąd podczas aktualizacji profilu:', updateError);
      return NextResponse.json(
        { error: 'Nie udało się zaktualizować profilu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Profil został pomyślnie zaktualizowany',
      profile 
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji profilu:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
} 