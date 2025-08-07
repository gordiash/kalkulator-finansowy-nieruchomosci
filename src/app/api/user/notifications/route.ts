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

    // Pobierz ustawienia powiadomień użytkownika
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('newsletter_subscription, email_notifications')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Błąd podczas pobierania ustawień powiadomień:', profileError);
      return NextResponse.json(
        { error: 'Nie udało się pobrać ustawień powiadomień' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      newsletter_subscription: profile?.newsletter_subscription || false,
      email_notifications: profile?.email_notifications || false,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania ustawień powiadomień:', error);
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

    const { newsletter_subscription, email_notifications } = await request.json();

    // Aktualizuj ustawienia powiadomień
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        newsletter_subscription: newsletter_subscription || false,
        email_notifications: email_notifications || false,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      console.error('Błąd podczas aktualizacji ustawień powiadomień:', updateError);
      return NextResponse.json(
        { error: 'Nie udało się zaktualizować ustawień powiadomień' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Ustawienia powiadomień zostały pomyślnie zaktualizowane',
      profile 
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji ustawień powiadomień:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
} 