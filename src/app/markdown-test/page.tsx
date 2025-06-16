'use client';

import { useState } from 'react';
import MarkdownEditor from '@/components/ui/MarkdownEditor';

const EXAMPLE_GEMINI_TEXT = `Mechanizm Działania Programów Wsparcia – Teoria i Rynkowa Rzeczywistość #
## ### Szczytne Założenia Programów Rządowych #
Programy rządowe, w założeniu, mają szczytny i słuszny cel: ułatwienie obywatelom, zwłaszcza młodym i kupującym pierwszą nieruchomość, dostępu do własnego mieszkania. Realizują to poprzez:
Zwiększenie zdolności kredytowej: Dzięki dopłatom do rat lub, co kluczowe w wielu przypadkach, zwiększeniu maksymalnej kwoty kredytu, która może zostać udzielona. Pieniądze dla osób, które miały problem z zaoszczędzeniem wymaganych 10-20% wartości nieruchomości.
Obniżenie kosztu kredytu: Preferencyjne oprocentowanie, zmniejszenie kosztów mieszkańcówi całkowity koszt zobowiązania, przynajmniej w początkowym okresie kredytowania.
Teoretycznie, dzięki takiemu wsparciu, bariera wejścia na rynek nieruchomości powinna się obniżyć. W praktyce jednak rynek napisał zgoła inny, bardziej skomplikowany scenariusz.
## — #
### Rynek Rynkowy: Zderzenie Popytu z Ograniczoną Podażą #
Głównym i niemal natychmiastowym efektem wprowadzenia programów wsparcia jest szok popytowy. W krótkim czasie na rynek wkracza ogromna grupa nowych kupujących, których zdolność kredytowa została sztuczne podnoszona.
Problem polega na tym, że podaż, czyli liczba dostępnych na sprzedaż mieszkań, jest niemal sztywna w krótkim średnim terminie. Proces budowy w Polsce trwa długo – od zakupu działki, przez projekt, uzyskanie pozwoleń, po samą budowę mijają lata. Do tego dochodzą ograniczenia w wykwalifikowanych pracowników budowlanych i niestabilne ceny materiałów. Liczba ofert na rynku wtórnym również jest ograniczona.
Co się dzieje, gdy wiele osób chce kupić ten sam, ograniczony produkt? Zgodnie z podstawowym prawem ekonomii – ceny rosną w zawrotnym tempie.
Studium przypadku: Dziedzictwo "Bezpiecznego Kredytu 2%" #
Doskonale pamiętamy, co wydarzyło się w drugiej połowie 2023 i na początku 2024 roku. Program "Bezpieczny Kredyt 2%" zadziałał jak potężny katalizator wzrostów. Analizy NBP już po 3 latach jak Otodom Analytics jednoznacznie pokazały, że w największych miastach Polski mieszkań w ciągu zaledwie kilku miesięcy podrożały nawet w górę o 50%, a w niektórych przypadkach więcej.
Sprzedający, świadomi, że kupujący dysponują większym budżetem, błyskawicznie podnosili ceny ofertowe. W efekcie, duża część rządowych dopłat nie trafiła do kieszeni kredytobiorcy w postaci oszczędności, lecz została skonsumowana przez wyższą cenę zakupu nieruchomości.
## — #
## ### Psychologia Rynku: Efekt FOMO (Fear Of Missing Out) #`;

export default function MarkdownTestPage() {
  const [content, setContent] = useState('');

  const loadExample = () => {
    setContent(EXAMPLE_GEMINI_TEXT);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🪄 Markdown Editor - Test Smart Format</h1>
        <p className="text-gray-600">
          Edytor Markdown z inteligentnym formatowaniem tekstu z Gemini AI
        </p>
      </div>

      <div className="mb-4 flex gap-3">
        <button
          onClick={loadExample}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg font-medium text-blue-800 transition-colors"
        >
          📋 Załaduj przykład z Gemini AI
        </button>
        <button
          onClick={() => setContent('')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-800 transition-colors"
        >
          🗑️ Wyczyść
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Wklej tutaj tekst z Gemini AI lub napisz własny w Markdown..."
          rows={20}
        />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">💡 Jak używać Smart Format:</h3>
        <div className="text-blue-700 text-sm space-y-1">
          <div>1. <strong>Wklej tekst z Gemini AI</strong> - zostanie automatycznie sformatowany</div>
          <div>2. <strong>Lub kliknij "🪄 Smart Format"</strong> aby ręcznie poprawić formatowanie</div>
          <div>3. <strong>Przełącz na "👁️ Podgląd"</strong> aby zobaczyć renderowany Markdown</div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="font-medium text-blue-800 mb-1">🔄 Co robi Smart Format:</div>
          <div className="text-blue-600 text-xs grid grid-cols-1 md:grid-cols-2 gap-1">
            <div>• <code>• punkt</code> → <code>* punkt</code></div>
            <div>• <code>- punkt</code> → <code>* punkt</code></div>
            <div>• <code>Nagłówek:</code> → <code>## Nagłówek</code></div>
            <div>• Normalizacja akapitów i spacji</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Liczba znaków: {content.length} | Liczba linii: {content.split('\n').length}
      </div>
    </div>
  );
} 