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

    // Pobierz kalkulacje użytkownika
    const { data: calculations, error: calculationsError } = await supabase
      .from('calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (calculationsError) {
      console.error('Błąd podczas pobierania kalkulacji:', calculationsError);
      return NextResponse.json(
        { error: 'Nie udało się pobrać kalkulacji' },
        { status: 500 }
      );
    }

    return NextResponse.json(calculations || []);
  } catch (error) {
    console.error('Błąd podczas pobierania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sprawdź czy użytkownik jest zalogowany
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const calculationData = await request.json();

    // Zapisz kalkulację
    const { data: calculation, error: saveError } = await supabase
      .from('calculations')
      .insert({
        user_id: user.id,
        calculation_type: calculationData.type,
        input_data: calculationData.input,
        result_data: calculationData.result,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Błąd podczas zapisywania kalkulacji:', saveError);
      return NextResponse.json(
        { error: 'Nie udało się zapisać kalkulacji' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Kalkulacja została pomyślnie zapisana',
      calculation 
    });
  } catch (error) {
    console.error('Błąd podczas zapisywania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
} 