import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź czy użytkownik jest zalogowany
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Walidacja danych wejściowych
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Aktualne hasło i nowe hasło są wymagane' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Nowe hasło musi mieć co najmniej 6 znaków' },
        { status: 400 }
      );
    }

    // Zmień hasło przez Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Błąd podczas zmiany hasła:', updateError);
      return NextResponse.json(
        { error: 'Nie udało się zmienić hasła' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Hasło zostało pomyślnie zmienione' });
  } catch (error) {
    console.error('Błąd podczas zmiany hasła:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
} 