
'use client';

import { useState } from 'react';

export default function SimpleTestPage() {
  const [text, setText] = useState('');

  const handleSmartFormat = () => {
    console.log('Smart Format clicked!', text);
    
    if (!text.trim()) {
      alert('Wklej tekst do formatowania');
      return;
    }

    const formatted = text
      .replace(/^[•\u2022]\s+/gm, '* ')
      .replace(/^[-–—]\s+/gm, '* ')
      .replace(/^\d+\.\s+/gm, '1. ')
      .replace(/^(.{1,50}):?\s*$/gm, '### $1');

    setText(formatted);
    alert('Tekst przeformatowany!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prosty Test Smart Format</h1>
      
      <div className="mb-4">
        <button 
          onClick={handleSmartFormat}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          🪄 Smart Format
        </button>
        <button 
          onClick={() => setText('')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
        >
          Clear
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-64 p-4 border rounded font-mono"
        placeholder="Wklej tekst z Gemini AI tutaj..."
      />

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Przykład tekstu do testowania:</h3>
        <pre className="text-sm">{`Wprowadzenie:
React to biblioteka JavaScript.

Cechy:
• Komponentowa architektura
• Wirtualny DOM
- Łatwe testowanie

Kroki:
1. Zainstaluj Node.js
2. Uruchom create-react-app`}</pre>
      </div>
    </div>
  );
} 