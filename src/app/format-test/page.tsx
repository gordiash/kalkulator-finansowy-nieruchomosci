// @ts-nocheck
'use client';

import { useState } from 'react';

export default function FormatTestPage() {
  const [text, setText] = useState('');

  const handleSmartFormat = () => {
    console.log('🪄 Smart Format clicked!', text);
    
    if (!text.trim()) {
      alert('❌ Wklej tekst do formatowania');
      return;
    }

    const processedText = text
      // Różne bullet points -> markdown
      .replace(/^[•\u2022\u2023\u25E6\u2043\u2219]\s+/gm, '* ')
      // Myślniki -> markdown  
      .replace(/^[-–—]\s+/gm, '* ')
      // Numerowane listy
      .replace(/^\d+\.\s+/gm, '1. ')
      // Podwójne nowe linie
      .replace(/\n\s*\n/g, '\n\n')
      // Usuń spacje na początku
      .replace(/^\s+/gm, '')
      // Wykryj nagłówki
      .replace(/^(.{1,60}):?\s*$/gm, (match, title) => {
        if (title.length < 60 && !title.endsWith('.') && !title.match(/^\d+\./)) {
          return `### ${title.replace(/:$/, '')}`;
        }
        return match;
      });

    console.log('📝 Original:', text);
    console.log('✨ Processed:', processedText);
    
    setText(processedText);
    alert('✅ Tekst został przeformatowany! Sprawdź wynik.');
  };

  const exampleText = `Wprowadzenie do React:
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
React jest potężnym narzędziem do tworzenia nowoczesnych aplikacji webowych.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🪄 Smart Format Test</h1>
          <p className="text-gray-600">Przetestuj automatyczne formatowanie tekstu z Gemini AI</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Instrukcje testowania:</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Skopiuj przykładowy tekst poniżej lub wklej własny tekst z Gemini AI</li>
              <li>Kliknij przycisk "🪄 Smart Format"</li>
              <li>Sprawdź jak formatowanie zostało poprawione</li>
              <li>Porównaj tekst przed i po formatowaniu</li>
            </ol>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">Przykładowy tekst do testowania:</h3>
              <button 
                onClick={() => setText(exampleText)}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                📋 Skopiuj przykład
              </button>
            </div>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">{exampleText}</pre>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex gap-3 mb-4">
            <button 
              onClick={handleSmartFormat}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
            >
              🪄 Smart Format
            </button>
            <button 
              onClick={() => setText('')}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
            >
              🗑️ Clear
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-80 p-4 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Wklej tekst z Gemini AI tutaj i kliknij 'Smart Format' aby go przeformatować..."
          />

          <div className="mt-4 text-sm text-gray-600">
            <strong>Znaki:</strong> {text.length} | <strong>Linie:</strong> {text.split('\n').length}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">🎯 Co robi Smart Format:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <code>• Punkt listy</code> → <code>* Punkt listy</code></li>
            <li>• <code>- Punkt listy</code> → <code>* Punkt listy</code></li>
            <li>• <code>Nagłówek:</code> → <code>### Nagłówek</code></li>
            <li>• Usuwa nadmiarowe spacje i normalizuje akapity</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 