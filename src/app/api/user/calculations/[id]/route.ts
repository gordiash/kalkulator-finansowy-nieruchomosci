import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź czy użytkownik jest zalogowany
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    // Pobierz kalkulację użytkownika
    const { data: calculation, error: calculationError } = await supabase
      .from('calculations')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (calculationError) {
      if (calculationError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Kalkulacja nie znaleziona' }, { status: 404 });
      }
      console.error('Błąd podczas pobierania kalkulacji:', calculationError);
      return NextResponse.json(
        { error: 'Nie udało się pobrać kalkulacji' },
        { status: 500 }
      );
    }

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Błąd podczas pobierania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź czy użytkownik jest zalogowany
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    // Usuń kalkulację użytkownika
    const { error: deleteError } = await supabase
      .from('calculations')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Błąd podczas usuwania kalkulacji:', deleteError);
      return NextResponse.json(
        { error: 'Nie udało się usunąć kalkulacji' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Kalkulacja została pomyślnie usunięta' 
    });
  } catch (error) {
    console.error('Błąd podczas usuwania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}