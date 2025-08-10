'use client';

import React from 'react';

type Props = {
  data: Record<string, unknown>;
  result?: Record<string, unknown>;
}

const PLN = (v: unknown) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(v || 0));
const toNumber = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const labels: Record<string, string> = {
  // Zakup
  cena_zakupu: 'Cena zakupu',
  prowizja_posrednika_zakup: 'Prowizja pośrednika (zakup)',
  podatek_PCC: 'Podatek PCC',
  taksa_notarialna: 'Taksa notarialna',
  wpis_do_ksiegi_wieczystej: 'Wpis do KW',
  oplata_za_wypis_aktow_notarialnych: 'Wypis aktów notarialnych',
  oplata_sadowa: 'Opłata sądowa',
  oplata_bankowa_za_przelew: 'Opłata bankowa za przelew',
  koszty_operatu_szacunkowego: 'Operat szacunkowy',
  koszty_doradcy_kredytowego: 'Doradca kredytowy',

  // Remont
  materialy_wykonczeniowe: 'Materiały wykończeniowe',
  materialy_instalacyjne: 'Materiały instalacyjne',
  sprzet_AGD_RTV: 'Sprzęt AGD/RTV',
  meble: 'Meble',
  ekipa_remontowa: 'Ekipa remontowa',
  hydraulik: 'Hydraulik',
  elektryk: 'Elektryk',
  stolarz: 'Stolarz',
  inne_uslugi_remontowe: 'Inne usługi remontowe',
  projektant_wnetrz: 'Projektant wnętrz',
  nadzor_budowlany: 'Nadzór budowlany',
  wywoz_gruzu: 'Wywóz gruzu',
  transport_materialow: 'Transport materiałów',

  // Utrzymanie (miesięczne)
  czynsz_administracyjny: 'Czynsz administracyjny (mies.)',
  media_prad: 'Prąd (mies.)',
  media_gaz: 'Gaz (mies.)',
  media_woda: 'Woda (mies.)',
  internet: 'Internet (mies.)',
  ubezpieczenie_nieruchomosci: 'Ubezpieczenie (mies.)',
  podatek_od_nieruchomosci: 'Podatek od nieruchomości (mies.)',
  czas_trwania_flipa: 'Czas trwania flipa (miesiące)',

  // Finansowanie
  typ_finansowania: 'Typ finansowania',
  wysokosc_kredytu: 'Kwota kredytu',
  oprocentowanie_kredytu: 'Oprocentowanie (% rocznie)',
  okres_kredytowania: 'Okres kredytowania (miesiące)',
  prowizja_bankowa: 'Prowizja bankowa',
  ubezpieczenie_kredytu: 'Ubezpieczenie kredytu',
  oplata_za_wczesniejsza_splate: 'Opłata za wcześniejszą spłatę',

  // Sprzedaż
  cena_sprzedazy: 'Cena sprzedaży',
  prowizja_posrednika_sprzedaz: 'Prowizja pośrednika (sprzedaż)',
  koszty_marketingu_fotograf: 'Marketing: fotograf',
  koszty_marketingu_home_staging: 'Marketing: home staging',
  koszty_marketingu_ogloszenia_online: 'Marketing: ogłoszenia online',
  koszty_marketingu_inne_promocja: 'Marketing: inne/promocja',
  oplata_notarialna_przy_sprzedazy: 'Opłata notarialna przy sprzedaży',
  inne_koszty_sprzedazy: 'Inne koszty sprzedaży',

  // Podatki
  stawka_podatku_od_zysku: 'Stawka podatku od zysku (%)',
  inne_podatki: 'Inne podatki',
};

type GroupDef = {
  title: string;
  keys: string[];
  currency?: boolean;
  resultKey?: string;
  monthly?: boolean; // koszty miesięczne * czas_trwania_flipa
};

const groupDefs: GroupDef[] = [
  { title: 'Koszty zakupu', keys: ['cena_zakupu','prowizja_posrednika_zakup','podatek_PCC','taksa_notarialna','wpis_do_ksiegi_wieczystej','oplata_za_wypis_aktow_notarialnych','oplata_sadowa','oplata_bankowa_za_przelew','koszty_operatu_szacunkowego','koszty_doradcy_kredytowego'], currency: true, resultKey: 'koszt_zakupu_brutto' },
  { title: 'Koszty remontu', keys: ['materialy_wykonczeniowe','materialy_instalacyjne','sprzet_AGD_RTV','meble','ekipa_remontowa','hydraulik','elektryk','stolarz','inne_uslugi_remontowe','projektant_wnetrz','nadzor_budowlany','wywoz_gruzu','transport_materialow'], currency: true, resultKey: 'koszt_remontu_calkowity' },
  { title: 'Utrzymanie (miesięczne)', keys: ['czynsz_administracyjny','media_prad','media_gaz','media_woda','internet','ubezpieczenie_nieruchomosci','podatek_od_nieruchomosci','czas_trwania_flipa'], currency: true, resultKey: 'koszty_utrzymania', monthly: true },
  { title: 'Finansowanie', keys: ['typ_finansowania','wysokosc_kredytu','oprocentowanie_kredytu','okres_kredytowania','prowizja_bankowa','ubezpieczenie_kredytu','oplata_za_wczesniejsza_splate'], currency: true, resultKey: 'koszty_finansowania' },
  { title: 'Sprzedaż', keys: ['cena_sprzedazy','prowizja_posrednika_sprzedaz','koszty_marketingu_fotograf','koszty_marketingu_home_staging','koszty_marketingu_ogloszenia_online','koszty_marketingu_inne_promocja','oplata_notarialna_przy_sprzedazy','inne_koszty_sprzedazy'], currency: true, resultKey: 'koszty_sprzedazy' },
  { title: 'Podatki', keys: ['stawka_podatku_od_zysku','inne_podatki'], resultKey: 'podatek' },
];

export default function FlipperDetailsSection({ data, result }: Props) {
  if (!data) return null;
  return (
    <div className="space-y-6">
      {groupDefs.map((group) => {
        let visible = group.keys.filter((k) => (data as Record<string, unknown>)[k] != null && (data as Record<string, unknown>)[k] !== '' && (data as Record<string, unknown>)[k] !== '0');
        // Specjalna logika: dla finansowania ukryj pola kredytowe, gdy typ to gotówka
        if (group.title === 'Finansowanie') {
          const rawType = String((data as Record<string, unknown>)['typ_finansowania'] ?? '').toLowerCase();
          const normalized = rawType.normalize('NFD').replace(/\p{Diacritic}/gu, ''); // usuń diakrytyki
          const isCash = normalized.includes('gotow'); // "gotowka", "gotówka"
          if (isCash) {
            visible = visible.filter((k) => k === 'typ_finansowania');
          }
        }
        if (visible.length === 0) return null;
        // Wylicz podsumowanie
        let summary = 0;
        if (group.resultKey && result && result[group.resultKey] != null) {
          summary = toNumber(result[group.resultKey]);
        } else {
          if (group.monthly) {
            const months = Math.max(1, toNumber((data as Record<string, unknown>)['czas_trwania_flipa']));
            const monthlySum = visible
              .filter((k) => k !== 'czas_trwania_flipa')
              .reduce((acc, k) => acc + toNumber((data as Record<string, unknown>)[k]), 0);
            summary = monthlySum * months;
          } else {
            summary = visible.reduce((acc, k) => acc + toNumber((data as Record<string, unknown>)[k]), 0);
          }
        }
        return (
          <div key={group.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{group.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visible.map((key) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{labels[key] || key}</span>
                  <span className="font-medium text-gray-900">
                    {group.currency && key !== 'typ_finansowania' && key !== 'oprocentowanie_kredytu' && key !== 'czas_trwania_flipa' && key !== 'okres_kredytowania'
                      ? PLN((data as Record<string, unknown>)[key])
                      : (key === 'oprocentowanie_kredytu' || key === 'stawka_podatku_od_zysku') ? `${(data as Record<string, unknown>)[key] as string}%`
                      : (key === 'czas_trwania_flipa' || key === 'okres_kredytowania') ? `${(data as Record<string, unknown>)[key] as string}`
                      : String((data as Record<string, unknown>)[key])}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
              <span className="text-gray-700 font-semibold">Podsumowanie kosztów</span>
              <span className="text-gray-900 font-bold">{PLN(summary)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}


