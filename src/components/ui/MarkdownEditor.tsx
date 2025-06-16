/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
// @ts-ignore
import markdownItAnchor from 'markdown-it-anchor';
// @ts-ignore
import markdownItContainer from 'markdown-it-container';
// @ts-ignore - brak deklaracji typów w paczce
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Wprowadź treść w formacie Markdown...',
  rows = 10,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Funkcja Smart Format dla tekstu z Gemini AI
  const handleSmartFormat = () => {
    console.log('🪄 Smart Format clicked!', value);
    
    if (!value || !value.trim()) {
      alert('❌ Brak tekstu do formatowania');
      return;
    }

    const processedText = value
      // Usuń nadmiarowe spacje i normalizuj białe znaki
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      
      // Usuń linie podziału i separatory
      .replace(/^[-=_*]{3,}$/gm, '') // Usuń linie z myślników, podkreśleń, gwiazdek
      .replace(/^[─━═]{3,}$/gm, '') // Usuń linie Unicode
      .replace(/^\s*[~`]{3,}\s*$/gm, '') // Usuń linie z tyldami i backticks
      .replace(/^\s*[.]{3,}\s*$/gm, '') // Usuń linie z kropkami
      .replace(/^\s*[•]{3,}\s*$/gm, '') // Usuń linie z bullet pointami
      .replace(/^\s*[▪▫■□]{3,}\s*$/gm, '') // Usuń linie z kwadratami
      
      // Wykryj nagłówki z # na początku i popraw je
      .replace(/^#+\s*(.+)$/gm, (match, title) => {
        const cleanTitle = title.replace(/#+\s*$/, '').trim();
        return `## ${cleanTitle}`;
      })
      
      // Wykryj nagłówki kończące się dwukropkiem lub będące krótkie
      .replace(/^([^#\n\r]{1,80}):?\s*$/gm, (match, title) => {
        const cleanTitle = title.replace(/:$/, '').trim();
        // Sprawdź czy to nie jest zwykły tekst (ma mniej niż 80 znaków i nie kończy się kropką)
        if (cleanTitle.length > 5 && cleanTitle.length < 80 && 
            !cleanTitle.endsWith('.') && 
            !cleanTitle.match(/^\d+\./) &&
            !cleanTitle.includes('–') &&
            !cleanTitle.startsWith('*') &&
            !cleanTitle.startsWith('-')) {
          return `## ${cleanTitle}`;
        }
        return match;
      })
      
      // Różne bullet points -> markdown (obsługa różnych typów)
      .replace(/^[•\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u2B1D\u2B1E\u2B24\u2B25]\s+/gm, '* ')
      .replace(/^[–—-]\s+/gm, '* ')
      .replace(/^[\u2013\u2014]\s+/gm, '* ') // En dash i Em dash
      .replace(/^○\s+/gm, '* ') // Białe kółko
      .replace(/^●\s+/gm, '* ') // Czarne kółko
      .replace(/^▪\s+/gm, '* ') // Czarny kwadrat
      .replace(/^▫\s+/gm, '* ') // Biały kwadrat
      .replace(/^>\s+/gm, '* ') // Znak większości używany jako bullet
      .replace(/^»\s+/gm, '* ') // Podwójny znak większości
      .replace(/^→\s+/gm, '* ') // Strzałka w prawo
      .replace(/^➤\s+/gm, '* ') // Gruba strzałka
      .replace(/^✓\s+/gm, '* ') // Checkmark
      .replace(/^✔\s+/gm, '* ') // Heavy checkmark
      .replace(/^⭐\s+/gm, '* ') // Gwiazdka
      .replace(/^🔸\s+/gm, '* ') // Pomarańczowy diament
      .replace(/^🔹\s+/gm, '* ') // Niebieski diament
      
      // Numerowane listy - zachowaj oryginalne numery ale dodaj spację
      .replace(/^(\d+)\.\s*/gm, '$1. ')
      
      // Usuń nadmiarowe spacje na początku linii
      .replace(/^\s+/gm, '')
      
      // Lepsze rozpoznawanie akapitów - dodaj podwójne nowe linie przed zdaniami kończącymi się kropką
      .replace(/\.\s*([A-ZĄĆĘŁŃÓŚŹŻ])/g, '.\n\n$1') // Dodaj podwójną nową linię po kropce przed wielką literą
      .replace(/\?\s*([A-ZĄĆĘŁŃÓŚŹŻ])/g, '?\n\n$1') // Dodaj podwójną nową linię po znaku zapytania
      .replace(/!\s*([A-ZĄĆĘŁŃÓŚŹŻ])/g, '!\n\n$1') // Dodaj podwójną nową linię po wykrzykniku
      
      // Rozpoznaj długie zdania (powyżej 80 znaków) kończące się kropką jako osobne akapity
      .replace(/([^.\n]{80,})\.\s*([A-ZĄĆĘŁŃÓŚŹŻ])/g, '$1.\n\n$2')
      
      // Dodaj podział po zdaniach z dwukropkiem jeśli następne zdanie jest długie
      .replace(/:\s*([A-ZĄĆĘŁŃÓŚŹŻ][^:\n]{40,})/g, ':\n\n$1')
      
      // Normalizuj akapity - podwójne nowe linie
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .replace(/\n\s*\n/g, '\n\n')
      
      // Usuń spacje na końcu linii
      .replace(/\s+$/gm, '')
      
      .trim();

    console.log('📝 Original:', value);
    console.log('✨ Processed:', processedText);
    
    onChange(processedText);
    alert('✅ Tekst został przeformatowany do Markdown!');
  };

  // Ulepszona konwersja tekstu wklejanego z Gemini AI
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text/plain');
    if (!pastedText) return;

    // Zapobiegamy domyślnemu wklejeniu, aby podmienić tekst na przetworzony
    e.preventDefault();

    const converted = pastedText
      // Usuń nadmiarowe spacje i normalizuj białe znaki
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      
      // Usuń linie podziału i separatory
      .replace(/^[-=_*]{3,}$/gm, '') // Usuń linie z myślników, podkreśleń, gwiazdek
      .replace(/^[─━═]{3,}$/gm, '') // Usuń linie Unicode
      .replace(/^\s*[~`]{3,}\s*$/gm, '') // Usuń linie z tyldami i backticks
      .replace(/^\s*[.]{3,}\s*$/gm, '') // Usuń linie z kropkami
      .replace(/^\s*[•]{3,}\s*$/gm, '') // Usuń linie z bullet pointami
      .replace(/^\s*[▪▫■□]{3,}\s*$/gm, '') // Usuń linie z kwadratami
      
      // Wykryj nagłówki z # na początku i popraw je
      .replace(/^#+\s*(.+)$/gm, (match, title) => {
        const cleanTitle = title.replace(/#+\s*$/, '').trim();
        return `## ${cleanTitle}`;
      })
      
      // Wykryj nagłówki kończące się dwukropkiem lub będące krótkie
      .replace(/^([^#\n\r]{1,80}):?\s*$/gm, (match, title) => {
        const cleanTitle = title.replace(/:$/, '').trim();
        if (cleanTitle.length > 5 && cleanTitle.length < 80 && 
            !cleanTitle.endsWith('.') && 
            !cleanTitle.match(/^\d+\./) &&
            !cleanTitle.includes('–') &&
            !cleanTitle.startsWith('*') &&
            !cleanTitle.startsWith('-')) {
          return `## ${cleanTitle}`;
        }
        return match;
      })
      
      // Różne bullet points -> markdown (rozszerzona lista)
      .replace(/^[•\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u2B1D\u2B1E\u2B24\u2B25]\s+/gm, '* ')
      .replace(/^[–—-]\s+/gm, '* ')
      .replace(/^[\u2013\u2014]\s+/gm, '* ') // En dash i Em dash
      .replace(/^○\s+/gm, '* ') // Białe kółko
      .replace(/^●\s+/gm, '* ') // Czarne kółko
      .replace(/^▪\s+/gm, '* ') // Czarny kwadrat
      .replace(/^▫\s+/gm, '* ') // Biały kwadrat
      .replace(/^>\s+/gm, '* ') // Znak większości używany jako bullet
      .replace(/^»\s+/gm, '* ') // Podwójny znak większości
      .replace(/^→\s+/gm, '* ') // Strzałka w prawo
      .replace(/^➤\s+/gm, '* ') // Gruba strzałka
      .replace(/^✓\s+/gm, '* ') // Checkmark
      .replace(/^✔\s+/gm, '* ') // Heavy checkmark
      .replace(/^⭐\s+/gm, '* ') // Gwiazdka
      .replace(/^🔸\s+/gm, '* ') // Pomarańczowy diament
      .replace(/^🔹\s+/gm, '* ') // Niebieski diament
      
      // Numerowane listy - zachowaj oryginalne numery
      .replace(/^(\d+)\.\s*/gm, '$1. ')
      
      // Usuń nadmiarowe spacje na początku linii
      .replace(/^\s+/gm, '')
      
      // Lepsze rozpoznawanie akapitów - dodaj podwójne nowe linie przed zdaniami kończącymi się kropką
      .replace(/\.\s*([A-ZĄĆĘŁŃÓŚŹŻ])/g, '.\n\n$1') // Dodaj podwójną nową linię po kropce przed wielką literą
      .replace(/\?\s*([A-ZĄĆĘŁŃÓŚŹŻ])/g, '?\n\n$1') // Dodaj podwójną nową linię po znaku zapytania
      .replace(/!\s*([A-ZĄĆĘŁŃÓŚŹŻ])/g, '!\n\n$1') // Dodaj podwójną nową linię po wykrzykniku
      
      // Rozpoznaj długie zdania (powyżej 80 znaków) kończące się kropką jako osobne akapity
      .replace(/([^.\n]{80,})\.\s*([A-ZĄĆĘŁŃÓŚŹŻ])/g, '$1.\n\n$2')
      
      // Dodaj podział po zdaniach z dwukropkiem jeśli następne zdanie jest długie
      .replace(/:\s*([A-ZĄĆĘŁŃÓŚŹŻ][^:\n]{40,})/g, ':\n\n$1')
      
      // Normalizuj akapity
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .replace(/\n\s*\n/g, '\n\n')
      
      // Usuń spacje na końcu linii
      .replace(/\s+$/gm, '')
      
      .trim();

    // Wstawiamy skonwertowany tekst
    onChange(converted);
    console.log('📋 Auto-formatted pasted text from Gemini AI');
    console.log('Original text:', pastedText.substring(0, 200));
    console.log('Converted text:', converted.substring(0, 200));
  };

  // Inicjalizujemy parser markdown-it tylko raz
  const mdParser = useMemo(() => {
    const parser = new MarkdownIt({
      html: false, // Wyłączamy HTML dla bezpieczeństwa
      linkify: true,
      typographer: false, // Wyłączamy typographer który może dodawać style
      breaks: true,
    });

    return parser;
  }, []);

  const renderedHtml = useMemo(() => {
    if (!value || !value.trim()) {
      return '<p class="text-gray-500 italic">Brak treści do wyświetlenia</p>';
    }
    
    try {
      // Czyścimy tekst z ukrytych znaków formatowania
      const cleanValue = value
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Usuń zero-width characters
        .replace(/\u00A0/g, ' ') // Zamień non-breaking space na zwykłą spację
        .replace(/[\u2000-\u206F]/g, ' ') // Usuń różne typy spacji Unicode
        .trim();
      
      const html = mdParser.render(cleanValue);
      
      // Dodatkowe czyszczenie HTML - usuń niepotrzebne atrybuty ale zachowaj podstawowe
      const cleanHtml = html
        .replace(/\s+style="[^"]*"/g, '') // Usuń inline styles
        .replace(/\s+class="[^"]*"/g, '') // Usuń wszystkie klasy CSS
        .replace(/\s+data-[^=]*="[^"]*"/g, '') // Usuń data attributes
        .replace(/<p>/g, '<p style="font-weight: 400 !important; font-size: 0.875rem; line-height: 1.7; margin: 0.75rem 0; color: #374151;">') // Dodaj inline style do paragrafów
        .replace(/<div>/g, '<div style="font-weight: 400 !important; font-size: 0.875rem;">') // Dodaj inline style do divów
        .replace(/<span>/g, '<span style="font-weight: 400 !important; font-size: 0.875rem;">') // Dodaj inline style do spanów
        .replace(/<a\s/g, '<a style="color: #374151 !important; text-decoration: underline; font-weight: 400 !important;" ') // Dodaj inline style do linków
        .replace(/<strong>/g, '<strong style="font-weight: 700 !important; color: #1f2937;">') // Zachowaj pogrubienie dla strong
        .replace(/<b>/g, '<b style="font-weight: 700 !important; color: #1f2937;">') // Zachowaj pogrubienie dla b
        .replace(/<em>/g, '<em style="font-style: italic; font-weight: 400 !important;">') // Zachowaj kursywę dla em
        .replace(/<i>/g, '<i style="font-style: italic; font-weight: 400 !important;">'); // Zachowaj kursywę dla i
      
      return cleanHtml;
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return '<p class="text-red-500">Błąd parsowania Markdown</p>';
    }
  }, [mdParser, value]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Pasek zakładek z przyciskami */}
      <div className="flex justify-between items-center text-sm border-b bg-gray-50">
        <div className="flex">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={
              'px-4 py-2 font-medium ' +
              (!showPreview
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800')
            }
          >
            📝 Edycja
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={
              'px-4 py-2 font-medium ' +
              (showPreview
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800')
            }
          >
            👁️ Podgląd
          </button>
        </div>
        
        {/* Przyciski narzędzi */}
        <div className="flex gap-2 px-4 py-2">
          <button
            type="button"
            onClick={handleSmartFormat}
            className="px-3 py-1 rounded bg-green-100 hover:bg-green-200 transition-colors font-medium text-green-800"
          >
            🪄 Smart Format
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 transition-colors font-medium text-red-800"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Treść */}
      {showPreview ? (
        <div className="p-6 bg-white">
          <div className="mb-3 text-xs text-gray-500 border-b pb-2">
            Debug: Renderowany HTML ({renderedHtml.length} znaków)
          </div>
          <div 
            className="markdown-content bg-gray-50 p-4 rounded-lg border"
            style={{ fontWeight: '400', fontSize: '0.875rem' }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
          <div className="mt-2 text-xs text-gray-500 border-t pt-2">
            <div className="mb-1">Raw HTML (pierwsze 200 znaków):</div>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
              {renderedHtml.substring(0, 200)}...
            </pre>
            <div className="mt-1">Markdown input (pierwsze 200 znaków):</div>
            <pre className="bg-blue-50 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
              {value.substring(0, 200)}...
            </pre>
          </div>
        </div>
      ) : (
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-4 min-h-[200px] resize-y outline-none border-0 font-mono"
          />
          
          {/* Instrukcje */}
          <div className="border-t p-3 bg-blue-50 text-sm">
            <div className="font-medium text-blue-800 mb-1">💡 Wskazówki Markdown + Gemini AI:</div>
            <div className="text-blue-700 text-xs">
              • Wklej tekst z Gemini AI - automatycznie usuwa linie podziału (---, ===) i dzieli na akapity<br/>
              • Bullet pointy (•, ○, ●, ▪, →, ✓, 🔸) zostaną zamienione na listy Markdown<br/>
              • Formatowanie: **pogrubiony**, *kursywa*, `kod` działa poprawnie<br/>
              • Długie zdania są automatycznie dzielone na osobne akapity<br/>
              • Kliknij "🪄 Smart Format" aby ręcznie poprawić formatowanie
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 