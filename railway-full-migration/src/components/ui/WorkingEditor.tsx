'use client';

interface WorkingEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

export default function WorkingEditor({ value, onChange, height = 300 }: WorkingEditorProps) {
  const handleSmartFormat = () => {
    console.log('Smart Format clicked!');
    
    if (!value || !value.trim()) {
      alert('Brak tekstu do formatowania');
      return;
    }

    // Przetwórz tekst z Gemini AI
    const processedText = value
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

    console.log('Original:', value);
    console.log('Processed:', processedText);
    
    onChange(processedText);
    alert('Tekst został przeformatowany! Sprawdź wynik.');
  };

  const handleBold = () => {
    console.log('Bold clicked!');
    const textarea = document.querySelector('#working-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      
      if (selectedText) {
        const newContent = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
        onChange(newContent);
        console.log('Bold applied to:', selectedText);
      } else {
        alert('Zaznacz tekst, aby go pogrubić');
      }
    }
  };

  const handleClear = () => {
    console.log('Clear clicked!');
    onChange('');
  };

  return (
    <div className="border rounded overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border-b bg-gray-50 text-sm flex-wrap">
        <button 
          type="button" 
          onClick={handleBold}
          className="px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
        >
          <b>B</b> Bold
        </button>
        <button 
          type="button" 
          onClick={handleSmartFormat}
          className="px-3 py-1 rounded bg-green-100 hover:bg-green-200 transition-colors font-medium"
        >
          🪄 Smart Format
        </button>
        <button 
          type="button" 
          onClick={handleClear}
          className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 transition-colors"
        >
          🗑️ Clear
        </button>
      </div>
      
      {/* Editor */}
      <textarea
        id="working-editor"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 resize-none outline-none border-0 font-mono"
        style={{ minHeight: `${height}px` }}
        placeholder="Wklej tekst z Gemini AI tutaj i kliknij 'Smart Format' aby go przeformatować..."
      />
      
      {/* Instructions */}
      <div className="border-t p-3 bg-blue-50 text-sm">
        <div className="font-medium text-blue-800 mb-1">Instrukcje:</div>
        <div className="text-blue-700">
          1. Wklej tekst z Gemini AI<br/>
          2. Kliknij &quot;Smart Format&quot; aby automatycznie poprawić formatowanie<br/>
          3. Lub zaznacz tekst i kliknij &quot;Bold&quot; aby go pogrubić
        </div>
      </div>
    </div>
  );
} 