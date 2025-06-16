
'use client';

import { useState } from 'react';
import WorkingEditor from '@/components/ui/WorkingEditor';

export default function TestEditorPage() {
  const [content, setContent] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Test Smart Format Editor</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instrukcje testowania:</h2>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Wklej poniższy przykładowy tekst z Gemini AI do edytora</li>
              <li>Kliknij przycisk &quot;🪄 Smart Format&quot;</li>
              <li>Sprawdź czy formatowanie zostało poprawione</li>
                              <li>Przetestuj funkcję Bold - zaznacz tekst i kliknij &quot;B Bold&quot;</li>
            </ol>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Przykładowy tekst do testowania:</h3>
            <pre className="text-sm whitespace-pre-wrap">{`Wprowadzenie do React
React to biblioteka JavaScript do budowania interfejsów użytkownika.

Główne cechy:
• Komponentowa architektura
• Wirtualny DOM
• Jednokierunkowy przepływ danych
- Łatwe testowanie
- Duża społeczność

Kroki instalacji:
1. Zainstaluj Node.js
2. Uruchom npx create-react-app
3. Rozpocznij kodowanie

Podsumowanie:
React jest potężnym narzędziem do tworzenia nowoczesnych aplikacji webowych.`}</pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Smart Format Editor:</h2>
          <WorkingEditor 
            value={content} 
            onChange={setContent} 
            height={400}
          />
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Wynik (surowy tekst):</h3>
            <pre className="text-sm whitespace-pre-wrap bg-white p-3 rounded border max-h-40 overflow-y-auto">
              {content || 'Brak treści...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 