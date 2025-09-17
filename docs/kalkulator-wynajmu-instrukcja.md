# Instrukcja obsługi - Kalkulator Opłacalności Wynajmu

## Opis kalkulatora
Kalkulator Opłacalności Wynajmu analizuje rentowność inwestycji w nieruchomość przeznaczoną na wynajem. Oblicza ROI, cash flow, czas zwrotu kapitału oraz wszystkie koszty związane z inwestycją.

## Dostęp do kalkulatora
- **URL**: `/kalkulator-wynajmu`
- **Pre-wypełnianie**: Można przekazać cenę przez URL: `?cena=500000`

## Pola wymagane

### Podstawowe informacje o inwestycji
- **Cena zakupu nieruchomości** (PLN) - cena nieruchomości
- **Miesięczny czynsz** (PLN) - przewidywany miesięczny przychód z wynajmu
- **Powierzchnia** (m²) - powierzchnia nieruchomości

### Koszty początkowe
- **Koszty transakcyjne** (PLN) - podatek PCC, notariusz, wpis do KW
- **Koszty remontu** (PLN) - koszty przygotowania do wynajmu
- **Inne koszty początkowe** (PLN) - dodatkowe koszty inwestycji

### Koszty miesięczne
- **Opłaty administracyjne** (PLN) - zarząd, administracja
- **Media** (PLN) - prąd, gaz, woda (jeśli wliczone w czynsz)
- **Ubezpieczenie** (PLN) - miesięczna składka ubezpieczenia
- **Inne koszty miesięczne** (PLN) - dodatkowe koszty eksploatacji

### Parametry wynajmu
- **Okres pustostanów** (miesiące) - średni okres pustostanów w roku
- **Wzrost czynszu** (%) - roczny wzrost czynszu
- **Inflacja kosztów** (%) - roczny wzrost kosztów eksploatacji

### Finansowanie (opcjonalne)
- **Wkład własny** (PLN) - kwota własna w inwestycji
- **Wkład własny** (%) - procentowy udział własnego kapitału
- **Oprocentowanie kredytu** (%) - roczne oprocentowanie
- **Okres kredytowania** (lata) - na ile lat zaciągasz kredyt

## Jak korzystać
1. **Wypełnij podstawowe dane** - cenę nieruchomości, czynsz i powierzchnię
2. **Ustaw koszty początkowe** - transakcyjne, remont, inne
3. **Określ koszty miesięczne** - administracja, media, ubezpieczenie
4. **Ustaw parametry wynajmu** - pustostany, wzrost czynszu i kosztów
5. **Opcjonalnie dodaj finansowanie** - jeśli planujesz kredyt
6. **Kliknij "Oblicz"** - zobaczysz analizę opłacalności

## Wyniki
Kalkulator wyświetla:

### Kluczowe wskaźniki
- **ROI (Return on Investment)** - roczny zwrot z inwestycji
- **Cash Flow** - miesięczny przepływ gotówki
- **Net CoC (Cash on Cash)** - zwrot z zainwestowanej gotówki
- **Czas zwrotu kapitału** - po ilu latach zwróci się inwestycja

### Analiza finansowa
- **Przychody roczne** - całkowite przychody z wynajmu
- **Koszty roczne** - wszystkie koszty eksploatacji
- **Zysk netto** - przychody minus koszty
- **Wartość nieruchomości za 10 lat** - prognoza wzrostu wartości

### Wykresy analityczne
- **Wykres przepływów gotówki** - cash flow w czasie
- **Struktura kosztów** - podział kosztów na kategorie
- **Analiza ROI** - zwrot z inwestycji w czasie
- **Porównanie scenariuszy** - z kredytem i bez kredytu

## Funkcje dodatkowe
- **Eksport do PDF** - szczegółowy raport analizy
- **Zapisywanie kalkulacji** - dostępne po zalogowaniu
- **Symulacja różnych scenariuszy** - analiza wrażliwości
- **Porównanie inwestycji** - analiza kilku nieruchomości

## Ważne informacje
- **ROI** pokazuje roczny zwrot względem zainwestowanej gotówki
- **Cash Flow** to miesięczny przepływ gotówki po opłatach
- **Net CoC** uwzględnia tylko rzeczywiście zainwestowaną gotówkę
- Wyniki są orientacyjne i zależą od aktualnych warunków rynkowych

## Rozwiązywanie problemów
- **Błąd walidacji**: Sprawdź czy wszystkie wymagane pola są wypełnione
- **Ujemny cash flow**: Sprawdź czy czynsz pokrywa koszty eksploatacji
- **Niska rentowność**: Rozważ obniżenie kosztów lub zwiększenie czynszu
- **Brak wyników**: Sprawdź połączenie internetowe i spróbuj ponownie

## FAQ
**Jak interpretować ROI w kalkulatorze?**
ROI pokazuje roczny zwrot względem zainwestowanej gotówki. Dla wynajmu często istotniejszy jest cash flow oraz neto CoC.

**Czy uwzględniacie pustostany?**
Tak, podaj w miesiącach średni okres pustostanów w roku – wpływa na przychody.

**Czy mogę dodać finansowanie kredytem?**
Tak, sekcja Finansowanie pozwala uwzględnić wkład własny, oprocentowanie i okres kredytowania.

**Co to jest Net CoC?**
Net Cash on Cash to zwrot z rzeczywiście zainwestowanej gotówki, uwzględniający finansowanie kredytem.
