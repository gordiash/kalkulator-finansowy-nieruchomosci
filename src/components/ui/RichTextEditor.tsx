'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3,
  Heading1,
  Code,
  Quote,
  Link,
  Minus,
  Eye,
  Edit3
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isQuote, setIsQuote] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Funkcja do wklejania z formatowaniem markdown
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    const html = e.clipboardData.getData('text/html');
    
    let cleanText = text;
    
    // Jeśli jest HTML, wyczyść go
    if (html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      cleanText = tempDiv.textContent || tempDiv.innerText || '';
    }
    
         // Przygotuj tekst - zamień niektóre znaki na markdown
     const processedText = cleanText
       // Zamień bullet points na markdown
       .replace(/^[•·]/gm, '- ')
       .replace(/^[\u2022\u2023\u25E6\u2043\u2219]/gm, '- ')
       // Zamień numerowane listy na markdown
       .replace(/^(\d+)\./gm, '$1. ')
       // Zamień nagłówki na markdown
       .replace(/^(.*?):$/gm, '## $1')
       // Napraw niepoprawną składnię nagłówków z bold
       .replace(/\*\*##\s+(.*?)\*\*/g, '## **$1**')
       .replace(/\*\*#\s+(.*?)\*\*/g, '# **$1**')
       .replace(/\*\*###\s+(.*?)\*\*/g, '### **$1**')
       // Zamień pogrubienie na markdown
       .replace(/\*\*(.*?)\*\*/g, '**$1**')
       .replace(/__(.*?)__/g, '**$1**')
       // Dodatkowe czyszczenie
       .replace(/\n\s*\n/g, '\n\n') // Usuń nadmiarowe puste linie
       .replace(/^\s+|\s+$/gm, ''); // Usuń spacje na początku i końcu linii
    
    // Wstaw przetworzony tekst
    const textarea = e.currentTarget as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + processedText + value.substring(end);
    
    onChange(newValue);
    
    // Ustaw kursor po wklejonym tekście
    setTimeout(() => {
      textarea.setSelectionRange(start + processedText.length, start + processedText.length);
      textarea.focus();
    }, 0);
  };

  // Funkcje formatowania
  const formatText = (command: string) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText = '';
    let newCursorPos = start;
    
    switch (command) {
      case 'bold':
        newText = `**${selectedText}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        newCursorPos = start + 1;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        newCursorPos = start + 1;
        break;
      case 'heading1':
        newText = `# ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'heading2':
        newText = `## ${selectedText}`;
        newCursorPos = start + 3;
        break;
      case 'heading3':
        newText = `### ${selectedText}`;
        newCursorPos = start + 4;
        break;
      case 'list':
        newText = `- ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'orderedList':
        newText = `1. ${selectedText}`;
        newCursorPos = start + 3;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'link':
        const url = prompt('Wprowadź URL:');
        if (url) {
          newText = `[${selectedText}](${url})`;
          newCursorPos = start + selectedText.length + 3;
        } else {
          return;
        }
        break;
      case 'hr':
        newText = `---\n${selectedText}`;
        newCursorPos = start + 4;
        break;
    }
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    
    // Ustaw kursor
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const toggleBold = () => {
    formatText('bold');
    setIsBold(!isBold);
  };

  const toggleItalic = () => {
    formatText('italic');
    setIsItalic(!isItalic);
  };

  const toggleCode = () => {
    formatText('code');
    setIsCode(!isCode);
  };

  const toggleQuote = () => {
    formatText('quote');
    setIsQuote(!isQuote);
  };

  const insertHeading = (level: number) => {
    formatText(`heading${level}`);
  };

  const insertList = (ordered: boolean = false) => {
    formatText(ordered ? 'orderedList' : 'list');
  };

  const insertHorizontalRule = () => {
    formatText('hr');
  };

  const insertLink = () => {
    formatText('link');
  };

  // Obsługa skrótów klawiszowych
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          toggleBold();
          break;
        case 'i':
          e.preventDefault();
          toggleItalic();
          break;
        case 'k':
          e.preventDefault();
          insertLink();
          break;
        case 'e':
          e.preventDefault();
          setIsPreview(!isPreview);
          break;
      }
    }
  };

  // Synchronizuj treść z props
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.value) {
      editorRef.current.value = value;
    }
  }, [value]);

  // Aktualizuj stan przycisków na podstawie selekcji
  useEffect(() => {
    const updateButtonStates = () => {
      if (editorRef.current) {
        const textarea = editorRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        
        // Sprawdź czy wybrany tekst jest już sformatowany
        setIsBold(selectedText.startsWith('**') && selectedText.endsWith('**'));
        setIsItalic(selectedText.startsWith('*') && selectedText.endsWith('*') && !selectedText.startsWith('**'));
        setIsCode(selectedText.startsWith('`') && selectedText.endsWith('`'));
        setIsQuote(selectedText.startsWith('> '));
      }
    };

    document.addEventListener('selectionchange', updateButtonStates);
    return () => document.removeEventListener('selectionchange', updateButtonStates);
  }, [value]);

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <Button
          variant={isBold ? 'default' : 'ghost'}
          size="sm"
          onClick={toggleBold}
          className="h-8 w-8 p-0"
          title="Pogrubienie (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={isItalic ? 'default' : 'ghost'}
          size="sm"
          onClick={toggleItalic}
          className="h-8 w-8 p-0"
          title="Kursywa (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(1)}
          className="h-8 w-8 p-0"
          title="Nagłówek 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(2)}
          className="h-8 w-8 p-0"
          title="Nagłówek 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(3)}
          className="h-8 w-8 p-0"
          title="Nagłówek 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertList(false)}
          className="h-8 w-8 p-0"
          title="Lista punktowana"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertList(true)}
          className="h-8 w-8 p-0"
          title="Lista numerowana"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <Button
          variant={isCode ? 'default' : 'ghost'}
          size="sm"
          onClick={toggleCode}
          className="h-8 w-8 p-0"
          title="Kod"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant={isQuote ? 'default' : 'ghost'}
          size="sm"
          onClick={toggleQuote}
          className="h-8 w-8 p-0"
          title="Cytat"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertHorizontalRule}
          className="h-8 w-8 p-0"
          title="Linia pozioma"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className="h-8 w-8 p-0"
          title="Wstaw link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <Button
          variant={isPreview ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="h-8 w-8 p-0"
          title="Podgląd (Ctrl+E)"
        >
          {isPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Editor/Preview */}
      <div className="bg-white rounded-b-lg">
        {isPreview ? (
          <div
            ref={previewRef}
            className="min-h-[20rem] max-h-[40rem] overflow-y-auto p-4 outline-none"
            style={{
              lineHeight: '1.6',
              color: '#374151',
            }}
          >
                         <div className="prose prose-sm max-w-none">
               <ReactMarkdown>{value || placeholder || 'Rozpocznij pisanie...'}</ReactMarkdown>
                               {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4 p-2 bg-gray-100 rounded text-xs">
                    <summary>Debug: Markdown content</summary>
                    <pre className="whitespace-pre-wrap">{value}</pre>
                    <div className="mt-2 p-2 bg-blue-100 rounded">
                      <strong>Test ReactMarkdown:</strong>
                      <ReactMarkdown># Test Heading\n- Test item 1\n- Test item 2</ReactMarkdown>
                    </div>
                    <div className="mt-2 p-2 bg-green-100 rounded">
                      <strong>Instrukcje:</strong>
                      <ul className="mt-1 text-xs">
                        <li>• Nagłówki: # H1, ## H2, ### H3</li>
                        <li>• Bold: **tekst** lub przycisk B</li>
                        <li>• Listy: - element lub przycisk listy</li>
                        <li>• Przełącz tryb: przycisk Oko/Ołówek</li>
                      </ul>
                    </div>
                  </details>
                )}
             </div>
                         <style dangerouslySetInnerHTML={{
               __html: `
                                   .prose h1 {
                    font-size: 2.5rem !important;
                    font-weight: 800 !important;
                    margin: 2rem 0 1rem 0 !important;
                    color: #111827 !important;
                    border-bottom: 2px solid #e5e7eb !important;
                    padding-bottom: 0.5rem !important;
                    line-height: 1.2 !important;
                  }
                  .prose h2 {
                    font-size: 2rem !important;
                    font-weight: 700 !important;
                    margin: 1.5rem 0 1rem 0 !important;
                    color: #1f2937 !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    padding-bottom: 0.25rem !important;
                    line-height: 1.3 !important;
                  }
                  .prose h3 {
                    font-size: 1.75rem !important;
                    font-weight: 700 !important;
                    margin: 1.5rem 0 1rem 0 !important;
                    color: #1f2937 !important;
                    line-height: 1.3 !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    padding-bottom: 0.25rem !important;
                  }
                  .prose h4 {
                    font-size: 1.5rem !important;
                    font-weight: 600 !important;
                    margin: 1.25rem 0 0.75rem 0 !important;
                    color: #374151 !important;
                    line-height: 1.4 !important;
                  }
                 .prose p {
                   margin: 1rem 0;
                   line-height: 1.7;
                 }
                 .prose ul {
                   list-style-type: disc !important;
                   padding-left: 1.5rem !important;
                   margin: 1rem 0 !important;
                   display: block !important;
                 }
                 .prose ol {
                   list-style-type: decimal !important;
                   padding-left: 1.5rem !important;
                   margin: 1rem 0 !important;
                   display: block !important;
                 }
                 .prose li {
                   margin: 0.5rem 0 !important;
                   line-height: 1.6 !important;
                   display: list-item !important;
                   list-style-position: outside !important;
                   color: #374151 !important;
                 }
                 .prose strong {
                   font-weight: 600;
                   color: #1f2937;
                 }
                 .prose h1 strong {
                   font-weight: 800 !important;
                   color: #000000 !important;
                   text-decoration: underline !important;
                 }
                 .prose h2 strong {
                   font-weight: 700 !important;
                   color: #000000 !important;
                   text-decoration: underline !important;
                 }
                                   .prose h3 strong {
                    font-weight: 800 !important;
                    color: #000000 !important;
                    text-decoration: underline !important;
                  }
                  .prose h4 strong {
                    font-weight: 700 !important;
                    color: #000000 !important;
                    text-decoration: underline !important;
                  }
                 .prose em {
                   font-style: italic;
                   color: #4b5563;
                 }
                 .prose code {
                   background-color: #f3f4f6;
                   padding: 0.125rem 0.25rem;
                   border-radius: 0.25rem;
                   font-family: 'Courier New', monospace;
                   font-size: 0.875rem;
                   color: #dc2626;
                 }
                 .prose blockquote {
                   border-left: 4px solid #3b82f6;
                   padding-left: 1rem;
                   margin: 1rem 0;
                   color: #6b7280;
                   font-style: italic;
                   background-color: #f8fafc;
                   padding: 1rem;
                   border-radius: 0.25rem;
                 }
                 .prose hr {
                   border: none;
                   border-top: 2px solid #e5e7eb;
                   margin: 2rem 0;
                 }
                 .prose a {
                   color: #3b82f6;
                   text-decoration: underline;
                 }
                 .prose a:hover {
                   color: #2563eb;
                 }
               `
             }} />
          </div>
        ) : (
          <textarea
            ref={editorRef}
            className="min-h-[20rem] max-h-[40rem] w-full p-4 outline-none resize-none border-0 bg-transparent"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Rozpocznij pisanie...'}
            style={{
              lineHeight: '1.6',
              color: '#374151',
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
          />
        )}
      </div>
    </div>
  );
} 