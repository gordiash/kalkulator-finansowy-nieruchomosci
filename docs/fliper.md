# Kalkulator Flippera Nieruchomości – Specyfikacja

## 1. Pola wejściowe

### A. Zakup nieruchomości
- `cena_zakupu` – kwota (PLN)
- `prowizja_posrednika_zakup` – kwota lub %
- `podatek_PCC` – kwota lub %
- `taksa_notarialna` – kwota
- `wpis_do_ksiegi_wieczystej` – kwota
- `oplata_za_wypis_aktow_notarialnych` – kwota
- `oplata_sadowa` – kwota
- `oplata_bankowa_za_przelew` – kwota
- `koszty_operatu_szacunkowego` – kwota
- `koszty_doradcy_kredytowego` – kwota

### B. Remont / modernizacja
**Materiały**
- `materialy_wykonczeniowe` – kwota
- `materialy_instalacyjne` – kwota
- `sprzet_AGD_RTV` – kwota
- `meble` – kwota

**Robocizna**
- `ekipa_remontowa` – kwota
- `hydraulik` – kwota
- `elektryk` – kwota
- `stolarz` – kwota
- `inne_uslugi_remontowe` – kwota

**Pozostałe koszty remontowe**
- `projektant_wnetrz` – kwota
- `nadzor_budowlany` – kwota
- `wywoz_gruzu` – kwota
- `transport_materialow` – kwota

### C. Utrzymanie nieruchomości w trakcie flipu (miesięczne × liczba miesięcy)
- `czynsz_administracyjny` – kwota/mies.
- `media_prad` – kwota/mies.
- `media_gaz` – kwota/mies.
- `media_woda` – kwota/mies.
- `internet` – kwota/mies.
- `ubezpieczenie_nieruchomosci` – kwota/mies.
- `podatek_od_nieruchomosci` – kwota/mies.
- `czas_trwania_flipa` – liczba miesięcy

### D. Finansowanie
- `typ_finansowania` – (gotówka | kredyt)
- `wysokosc_kredytu` – kwota
- `oprocentowanie_kredytu` – % rocznie
- `okres_kredytowania` – liczba miesięcy
- `prowizja_bankowa` – kwota lub %
- `ubezpieczenie_kredytu` – kwota
- `oplata_za_wczesniejsza_splate` – kwota

### E. Sprzedaż nieruchomości
- `cena_sprzedazy` – kwota
- `prowizja_posrednika_sprzedaz` – kwota lub %
- `koszty_marketingu_fotograf` – kwota
- `koszty_marketingu_home_staging` – kwota
- `koszty_marketingu_ogloszenia_online` – kwota
- `koszty_marketingu_inne_promocja` – kwota
- `oplata_notarialna_przy_sprzedazy` – kwota
- `inne_koszty_sprzedazy` – kwota

### F. Podatki
- `stawka_podatku_od_zysku` – %
- `inne_podatki` – kwota

---

## 2. Logika obliczeń

1. **Koszt zakupu brutto**
koszt_zakupu_brutto = cena_zakupu
+ prowizja_posrednika_zakup
+ podatek_PCC
+ taksa_notarialna
+ wpis_do_ksiegi_wieczystej
+ oplata_za_wypis_aktow_notarialnych
+ oplata_sadowa
+ oplata_bankowa_za_przelew
+ koszty_operatu_szacunkowego
+ koszty_doradcy_kredytowego


2. **Koszty remontu**
koszt_remontu_calkowity = materialy_wykonczeniowe
+ materialy_instalacyjne
+ sprzet_AGD_RTV
+ meble
+ ekipa_remontowa
+ hydraulik
+ elektryk
+ stolarz
+ inne_uslugi_remontowe
+ projektant_wnetrz
+ nadzor_budowlany
+ wywoz_gruzu
+ transport_materialow


3. **Koszty utrzymania**
koszty_utrzymania = (czynsz_administracyjny
+ media_prad
+ media_gaz
+ media_woda
+ internet
+ ubezpieczenie_nieruchomosci
+ podatek_od_nieruchomosci) * czas_trwania_flipa


4. **Koszty finansowania (jeśli kredyt)**
odsetki = (wysokosc_kredytu * (oprocentowanie_kredytu / 100) * okres_kredytowania) / 12
koszty_finansowania = odsetki
+ prowizja_bankowa
+ ubezpieczenie_kredytu
+ oplata_za_wczesniejsza_splate


5. **Całkowite koszty inwestycji**
koszty_calkowite = koszt_zakupu_brutto
+ koszt_remontu_calkowity
+ koszty_utrzymania
+ koszty_finansowania


6. **Koszty sprzedaży**
koszty_sprzedazy = prowizja_posrednika_sprzedaz
+ koszty_marketingu_fotograf
+ koszty_marketingu_home_staging
+ koszty_marketingu_ogloszenia_online
+ koszty_marketingu_inne_promocja
+ oplata_notarialna_przy_sprzedazy
+ inne_koszty_sprzedazy


7. **Zysk brutto**
zysk_brutto = cena_sprzedazy - (koszty_calkowite + koszty_sprzedazy)


8. **Podatek od zysku**
podatek = zysk_brutto * (stawka_podatku_od_zysku / 100) + inne_podatki


9. **Zysk netto**
zysk_netto = zysk_brutto - podatek


10. **ROI**
ROI = (zysk_netto / koszty_calkowite) * 100


---

## 3. Wyniki kalkulatora

- `koszt_zakupu_brutto`
- `koszt_remontu_calkowity`
- `koszty_utrzymania`
- `koszty_finansowania`
- `koszty_calkowite`
- `koszty_sprzedazy`
- `zysk_brutto`
- `podatek`
- `zysk_netto`
- `ROI`
- `czas_trwania_flipa` (miesiące)
- `sredni_miesieczny_zysk_netto` = `zysk_netto / czas_trwania_flipa`
