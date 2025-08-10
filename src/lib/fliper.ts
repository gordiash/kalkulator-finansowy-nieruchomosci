export interface FliperInput {
  // Zakup
  cena_zakupu: number;
  prowizja_posrednika_zakup: number; // kwota
  podatek_PCC: number; // kwota
  taksa_notarialna: number;
  wpis_do_ksiegi_wieczystej: number;
  oplata_za_wypis_aktow_notarialnych: number;
  oplata_sadowa: number;
  oplata_bankowa_za_przelew: number;
  koszty_operatu_szacunkowego: number;
  koszty_doradcy_kredytowego: number;

  // Remont (materiały)
  materialy_wykonczeniowe: number;
  materialy_instalacyjne: number;
  sprzet_AGD_RTV: number;
  meble: number;
  // Remont (robocizna)
  ekipa_remontowa: number;
  hydraulik: number;
  elektryk: number;
  stolarz: number;
  inne_uslugi_remontowe: number;
  // Remont (pozostałe)
  projektant_wnetrz: number;
  nadzor_budowlany: number;
  wywoz_gruzu: number;
  transport_materialow: number;

  // Utrzymanie (miesięczne x czas)
  czynsz_administracyjny: number;
  media_prad: number;
  media_gaz: number;
  media_woda: number;
  internet: number;
  ubezpieczenie_nieruchomosci: number;
  podatek_od_nieruchomosci: number;
  czas_trwania_flipa: number; // w miesiącach

  // Finansowanie
  typ_finansowania: 'gotówka' | 'kredyt';
  wysokosc_kredytu: number;
  oprocentowanie_kredytu: number; // % rocznie
  okres_kredytowania: number; // miesiące
  prowizja_bankowa: number; // kwota
  ubezpieczenie_kredytu: number; // kwota
  oplata_za_wczesniejsza_splate: number; // kwota

  // Sprzedaż
  cena_sprzedazy: number;
  prowizja_posrednika_sprzedaz: number; // kwota
  koszty_marketingu_fotograf: number;
  koszty_marketingu_home_staging: number;
  koszty_marketingu_ogloszenia_online: number;
  koszty_marketingu_inne_promocja: number;
  oplata_notarialna_przy_sprzedazy: number;
  inne_koszty_sprzedazy: number;

  // Podatki
  stawka_podatku_od_zysku: number; // %
  inne_podatki: number; // kwota
}

export interface FliperResult {
  koszt_zakupu_brutto: number;
  koszt_remontu_calkowity: number;
  koszty_utrzymania: number;
  koszty_finansowania: number;
  koszty_calkowite: number;
  koszty_sprzedazy: number;
  zysk_brutto: number;
  podatek: number;
  zysk_netto: number;
  ROI: number;
  czas_trwania_flipa: number;
  sredni_miesieczny_zysk_netto: number;
  miesieczna_rata_kredytu?: number; // Dodane pole dla raty kredytu
}

function n(val: unknown): number {
  const parsed = typeof val === 'string' ? parseFloat(val) : (val as number);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Oblicza miesięczną ratę kredytu (annuitetową)
 */
function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                 (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return payment;
}

export function calculateFliper(input: FliperInput): FliperResult {
  // 1) Koszt zakupu brutto
  const koszt_zakupu_brutto =
    n(input.cena_zakupu) +
    n(input.prowizja_posrednika_zakup) +
    n(input.podatek_PCC) +
    n(input.taksa_notarialna) +
    n(input.wpis_do_ksiegi_wieczystej) +
    n(input.oplata_za_wypis_aktow_notarialnych) +
    n(input.oplata_sadowa) +
    n(input.oplata_bankowa_za_przelew) +
    n(input.koszty_operatu_szacunkowego) +
    n(input.koszty_doradcy_kredytowego);

  // 2) Koszt remontu całkowity
  const koszt_remontu_calkowity =
    n(input.materialy_wykonczeniowe) +
    n(input.materialy_instalacyjne) +
    n(input.sprzet_AGD_RTV) +
    n(input.meble) +
    n(input.ekipa_remontowa) +
    n(input.hydraulik) +
    n(input.elektryk) +
    n(input.stolarz) +
    n(input.inne_uslugi_remontowe) +
    n(input.projektant_wnetrz) +
    n(input.nadzor_budowlany) +
    n(input.wywoz_gruzu) +
    n(input.transport_materialow);

  // 3) Koszty utrzymania
  const koszty_utrzymania_mies =
    n(input.czynsz_administracyjny) +
    n(input.media_prad) +
    n(input.media_gaz) +
    n(input.media_woda) +
    n(input.internet) +
    n(input.ubezpieczenie_nieruchomosci) +
    n(input.podatek_od_nieruchomosci);
  const koszty_utrzymania = koszty_utrzymania_mies * Math.max(0, n(input.czas_trwania_flipa));

  // 4) Koszty finansowania (jeśli kredyt)
  let koszty_finansowania = 0;
  let miesieczna_rata_kredytu = 0;
  if (input.typ_finansowania === 'kredyt' && n(input.wysokosc_kredytu) > 0) {
    const wysokosc_kredytu = n(input.wysokosc_kredytu);
    const oprocentowanie_roczne = n(input.oprocentowanie_kredytu);
    const okres_kredytowania_lat = n(input.okres_kredytowania) / 12; // konwertuj miesiące na lata
    const czas_trwania_flipa = Math.max(1, n(input.czas_trwania_flipa));
    
    // Oblicz miesięczną ratę kredytu
    miesieczna_rata_kredytu = calculateMonthlyPayment(wysokosc_kredytu, oprocentowanie_roczne, okres_kredytowania_lat);
    
    // Koszty finansowania = (miesięczna rata * czas trwania flipa) + prowizja + ubezpieczenie + opłata za wcześniejszą spłatę
    koszty_finansowania = (miesieczna_rata_kredytu * czas_trwania_flipa) + 
                         n(input.prowizja_bankowa) + 
                         n(input.ubezpieczenie_kredytu) + 
                         n(input.oplata_za_wczesniejsza_splate);
  }

  // 5) Całkowite koszty inwestycji
  const koszty_calkowite = koszt_zakupu_brutto + koszt_remontu_calkowity + koszty_utrzymania + koszty_finansowania;

  // 6) Koszty sprzedaży
  const koszty_sprzedazy =
    n(input.prowizja_posrednika_sprzedaz) +
    n(input.koszty_marketingu_fotograf) +
    n(input.koszty_marketingu_home_staging) +
    n(input.koszty_marketingu_ogloszenia_online) +
    n(input.koszty_marketingu_inne_promocja) +
    n(input.oplata_notarialna_przy_sprzedazy) +
    n(input.inne_koszty_sprzedazy);

  // 7) Zysk brutto
  const zysk_brutto = n(input.cena_sprzedazy) - (koszty_calkowite + koszty_sprzedazy);

  // 8) Podatek
  const podatek = zysk_brutto * (Math.max(0, n(input.stawka_podatku_od_zysku)) / 100) + n(input.inne_podatki);

  // 9) Zysk netto
  const zysk_netto = zysk_brutto - Math.max(0, podatek);

  // 10) ROI
  const ROI = koszty_calkowite > 0 ? (zysk_netto / koszty_calkowite) * 100 : 0;

  const czas_trwania_flipa = Math.max(1, Math.floor(n(input.czas_trwania_flipa)) || 1);
  const sredni_miesieczny_zysk_netto = zysk_netto / czas_trwania_flipa;

  return {
    koszt_zakupu_brutto: round2(koszt_zakupu_brutto),
    koszt_remontu_calkowity: round2(koszt_remontu_calkowity),
    koszty_utrzymania: round2(koszty_utrzymania),
    koszty_finansowania: round2(koszty_finansowania),
    koszty_calkowite: round2(koszty_calkowite),
    koszty_sprzedazy: round2(koszty_sprzedazy),
    zysk_brutto: round2(zysk_brutto),
    podatek: round2(podatek),
    zysk_netto: round2(zysk_netto),
    ROI: round2(ROI),
    czas_trwania_flipa,
    sredni_miesieczny_zysk_netto: round2(sredni_miesieczny_zysk_netto),
    miesieczna_rata_kredytu: koszty_finansowania > 0 ? round2(miesieczna_rata_kredytu) : undefined,
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}


