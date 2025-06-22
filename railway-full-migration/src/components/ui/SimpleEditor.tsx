'use client';

import React, { useState } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  height?: number;
}

export default function SimpleEditor({ value, onChange, height = 300 }: Props) {
  const [content, setContent] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange(newValue);
  };

  const handleSmartFormat = () => {
    console.log('Smart Format clicked - content:', content);
    
    if (!content.trim()) {
      alert('Brak tekstu do formatowania');
      return;
    }

    // Przetwórz tekst podobnie jak w Tiptap
    const processedText = content
      .replace(/^[•\u2022\u2023\u25E6\u2043\u2219]\s+/gm, '* ')
      .replace(/^[-–—]\s+/gm, '* ')
      .replace(/^\d+\.\s+/gm, '1. ')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/^\s+/gm, '')
      .replace(/^(.{1,60}):?\s*$/gm, (match, title) => {
        if (title.length < 60 && !title.endsWith('.') && !title.match(/^\d+\./)) {
          return `### ${title.replace(/:$/, '')}`;
        }
        return match;
      });

    console.log('Processed text:', processedText);
    setContent(processedText);
    onChange(processedText);
  };

  const handleBold = () => {
    console.log('Bold clicked');
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      
      if (selectedText) {
        const newContent = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        setContent(newContent);
        onChange(newContent);
      }
    }
  };

  return (
    <div className="border rounded overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border-b bg-gray-50 text-sm flex-wrap">
        <button 
          type="button" 
          onClick={handleBold}
          className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
        >
          <b>B</b>
        </button>
        <button 
          type="button" 
          onClick={handleSmartFormat}
          className="px-2 py-1 rounded bg-green-100 hover:bg-green-200"
        >
          Smart Format
        </button>
        <button 
          type="button" 
          onClick={() => {
            setContent('');
            onChange('');
          }}
          className="px-2 py-1 rounded bg-red-100 hover:bg-red-200"
        >
          Clear
        </button>
      </div>
      
      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        className="w-full p-3 resize-none outline-none border-0"
        style={{ minHeight: `${height}px` }}
        placeholder="Wklej tekst z Gemini AI tutaj..."
      />
      
      {/* Preview */}
      <div className="border-t p-3 bg-gray-50">
        <div className="text-xs text-gray-600 mb-2">Podgląd (markdown):</div>
        <div className="text-sm whitespace-pre-wrap font-mono bg-white p-2 rounded border max-h-32 overflow-y-auto">
          {content || 'Brak treści...'}
        </div>
      </div>
    </div>
  );
} 