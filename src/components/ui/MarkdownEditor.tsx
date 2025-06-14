'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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

  // Prosta konwersja tekstu wklejanego z Google Docs / Word do czytelniejszego Markdown
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text/plain');
    if (!pastedText) return;

    // Zapobiegamy domyślnemu wklejeniu, aby podmienić tekst na przetworzony
    e.preventDefault();

    const converted = pastedText
      // Zastępujemy podwójne nowe linie (akapit) -> zachowujemy
      .replace(/\r?\n\s*\r?\n/g, '\n\n')
      .trim();

    // Wstawiamy skonwertowany tekst
    onChange(converted);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Pasek zakładek */}
      <div className="flex text-sm border-b bg-gray-50">
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
          Edycja
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
          Podgląd
        </button>
      </div>

      {/* Treść */}
      {showPreview ? (
        <div className="p-4 prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm as any]} rehypePlugins={[rehypeRaw as any]}>{
            value || '*Brak treści*'
          }</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-4 min-h-[200px] resize-y outline-none border-0"
        />
      )}
    </div>
  );
} 