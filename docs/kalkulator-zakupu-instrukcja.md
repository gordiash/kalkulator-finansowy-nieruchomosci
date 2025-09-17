# Instrukcja obsługi - Kalkulator Zakupu Nieruchomości

## Opis kalkulatora
Kalkulator Zakupu Nieruchomości oblicza wszystkie koszty związane z zakupem nieruchomości, w tym ratę kredytu hipotecznego, podatek PCC, koszty notarialne, wpis do księgi wieczystej oraz opłaty hipoteczne.

## Dostęp do kalkulatora
- **URL**: `/kalkulator-zakupu-nieruchomosci`
- **Pre-wypełnianie**: Można przekazać cenę przez URL: `?cena=500000`

## Pola wymagane

### Podstawowe informacje o nieruchomości
- **Cena nieruchomości** (PLN) - cena zakupu nieruchomości
- **Typ nieruchomości** - wybierz: Mieszkanie, Dom, Lokal użytkowy, Grunt
- **Powierzchnia** (m²) - powierzchnia nieruchomości

### Finansowanie
- **Wkład własny** (PLN) - kwota jaką dysponujesz
- **Wysokość kredytu** (PLN) - kwota kredytu (automatycznie obliczana)
- **Oprocentowanie** (%) - roczne oprocentowanie kredytu
- **Okres kredytowania** (lata) - na ile lat zaciągasz kredyt
- **Typ raty** - wybierz: Równe raty, Malejące raty

### Koszty dodatkowe
- **Koszty notarialne** (PLN) - opcjonalnie, domyślnie obliczane automatycznie
- **Koszty wpisu do KW** (PLN) - opcjonalnie, domyślnie obliczane automatycznie
- **Opłata hipoteczna** (PLN) - opcjonalnie, domyślnie obliczana automatycznie

### Nadpłaty (opcjonalne)
- **Włącz nadpłaty** - zaznacz aby uwzględnić nadpłaty
- **Kwota nadpłaty** (PLN) - miesięczna kwota nadpłaty
- **Cel nadpłaty** - wybierz: Skrócenie okresu, Obniżenie raty

## Jak korzystać
1. **Wypełnij podstawowe dane** - cenę nieruchomości, typ i powierzchnię
2. **Ustaw finansowanie** - wkład własny, oprocentowanie i okres kredytowania
3. **Sprawdź koszty** - kalkulator automatycznie obliczy koszty notarialne i inne
4. **Opcjonalnie dodaj nadpłaty** - jeśli planujesz nadpłacać kredyt
5. **Kliknij "Oblicz"** - zobaczysz szczegółowe wyniki i wykresy

## Wyniki
Kalkulator wyświetla:

### Podsumowanie finansowe
- **Miesięczna rata kredytu** - wysokość raty
- **Całkowita kwota do spłaty** - suma wszystkich rat
- **Całkowite odsetki** - koszt kredytu
- **Koszty zakupu** - podatek PCC + koszty notarialne + wpis do KW + opłata hipoteczna

### Szczegółowe koszty
- **Podatek PCC** - podatek od czynności cywilnoprawnych
- **Koszty notarialne** - wynagrodzenie notariusza
- **Wpis do księgi wieczystej** - opłata sądowa
- **Opłata hipoteczna** - opłata za wpis hipoteki

### Wykresy analityczne
- **Wykres spłaty kredytu** - harmonogram spłat w czasie
- **Struktura raty** - podział na kapitał i odsetki
- **Wpływ nadpłat** - porównanie z nadpłatami i bez

## Funkcje dodatkowe
- **Eksport do PDF** - możliwość pobrania szczegółowego raportu
- **Zapisywanie kalkulacji** - dostępne po zalogowaniu
- **Harmonogram spłat** - szczegółowy plan spłat kredytu
- **Symulacja nadpłat** - analiza wpływu nadpłat na koszt kredytu

## Ważne informacje
- **Podatek PCC** jest obliczany automatycznie według aktualnych stawek
- **Koszty notarialne** są szacowane na podstawie wartości nieruchomości
- **Wpis do KW** i **opłata hipoteczna** są obliczane według stawek sądowych
- Wyniki są orientacyjne i mogą różnić się od rzeczywistych kosztów

## Rozwiązywanie problemów
- **Błąd walidacji**: Sprawdź czy wszystkie wymagane pola są wypełnione poprawnie
- **Nieprawidłowe wartości**: Upewnij się, że cena i wkład własny są liczbami dodatnimi
- **Wkład własny > cena**: Wkład własny nie może być większy od ceny nieruchomości
- **Brak wyników**: Sprawdź połączenie internetowe i spróbuj ponownie

## FAQ
**Jak obliczany jest podatek PCC?**
Podatek PCC wynosi 2% od wartości nieruchomości (mieszkania) lub 2% + 1% (domy).

**Czy mogę zmienić koszty notarialne?**
Tak, możesz wprowadzić własną kwotę w polu "Koszty notarialne".

**Jak działają nadpłaty?**
Nadpłaty mogą skracać okres kredytowania lub obniżać wysokość raty - wybierz cel nadpłaty.

**Czy wyniki są aktualne?**
Kalkulator używa aktualnych stawek podatkowych i sądowych, ale zawsze sprawdź z notariuszem.
