# Instrukcja obsługi - Kalkulator Wyceny Mieszkania

## Opis kalkulatora
Kalkulator Wyceny Mieszkania wykorzystuje zaawansowany model EstymatorAI v2.7 z dokładnością 0.13% MAPE do wyceny wartości nieruchomości na podstawie parametrów technicznych i lokalizacyjnych.

## Dostęp do kalkulatora
- **URL**: `/kalkulator-wyceny`
- **Pre-wypełnianie**: Można przekazać parametry przez URL: `?miasto=Warszawa&metraz=50&pokoje=2&rok=2010&dzielnica=Śródmieście`

## Pola wymagane
### Podstawowe (wymagane)
- **Miasto** - wybierz z listy dostępnych miast
- **Metraż** - powierzchnia mieszkania w m²
- **Liczba pokoi** - całkowita liczba pokoi (włącznie z salonem)

### Dodatkowe (opcjonalne, zwiększają precyzję)
- **Rok budowy** - rok powstania budynku
- **Dzielnica** - wybierz z listy dostępnych dzielnic dla danego miasta
- **Piętro** - numer piętra mieszkania
- **Stan techniczny** - wybierz z opcji: Bardzo dobry, Dobry, Średni, Zły
- **Typ budynku** - wybierz z opcji: Blok, Kamienica, Dom jednorodzinny, Apartamentowiec
- **Materiał budynku** - wybierz z opcji: Cegła, Beton, Drewno, Inne
- **Ogrzewanie** - wybierz z opcji: Miejskie, Gazowe, Elektryczne, Węglowe, Inne
- **Balkon/Taras** - zaznacz jeśli mieszkanie ma balkon lub taras
- **Miejsce parkingowe** - zaznacz jeśli jest dostępne
- **Winda** - zaznacz jeśli budynek ma windę

## Jak korzystać
1. **Wypełnij podstawowe pola** - miasto, metraż i liczba pokoi są obowiązkowe
2. **Dodaj szczegóły** - wypełnij dodatkowe pola dla zwiększenia precyzji wyceny
3. **Kliknij "Oblicz wycenę"** - kalkulator wyświetli szacowaną wartość mieszkania
4. **Zapisz wynik** - po obliczeniu możesz zapisać kalkulację (wymagane logowanie)

## Wyniki
Kalkulator wyświetla:
- **Szacowaną wartość mieszkania** w PLN
- **Przedział ufności** - zakres wartości z prawdopodobieństwem 95%
- **Wskaźniki jakości** - dokładność modelu i liczbę podobnych transakcji
- **Wykresy analityczne** - wizualizacja danych i trendów

## Funkcje dodatkowe
- **Eksport do PDF** - możliwość pobrania raportu wyceny
- **Zapisywanie kalkulacji** - dostępne po zalogowaniu w Panel → Kalkulacje
- **Historia wycen** - dostęp do poprzednich kalkulacji

## Ważne informacje
- Wycena jest wynikiem modelu statystycznego i **nie stanowi porady inwestycyjnej**
- Model został wytrenowany na danych historycznych i może nie uwzględniać aktualnych trendów rynkowych
- Dokładność 0.13% MAPE oznacza średni błąd względny na poziomie 0.13%
- Wyniki są orientacyjne i powinny być weryfikowane przez profesjonalnego rzeczoznawcę

## Rozwiązywanie problemów
- **Błąd walidacji**: Sprawdź czy wszystkie wymagane pola są wypełnione
- **Nieprawidłowe wartości**: Upewnij się, że metraż i liczba pokoi są liczbami dodatnimi
- **Brak wyników**: Sprawdź połączenie internetowe i spróbuj ponownie

## FAQ
**Czy muszę podawać wszystkie pola?**
Nie, wymagane są tylko miasto, metraż i liczba pokoi. Pozostałe pola pomagają zwiększyć precyzję.

**Czy mogę zapisać wynik?**
Tak, po obliczeniu możesz zapisać kalkulację w Panel → Kalkulacje (wymagane logowanie).

**Czy wycena jest doradztwem?**
Nie. To wynik modelu statystycznego i nie stanowi porady inwestycyjnej ani operatu szacunkowego.
