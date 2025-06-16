'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import MarkdownIt from 'markdown-it';

interface Props {
  value: string;
  onChange: (html: string) => void;
  height?: number;
}

export default function RichTextEditor({ value, onChange, height = 300 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1,2,3] },
      }),
      Underline,
      Strike,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none',
        style: `min-height:${height}px; padding: 12px;`,
      },
      handlePaste(view, event) {
        try {
          const clipboard = event.clipboardData;
          if (!clipboard) return false;
          
          const html = clipboard.getData('text/html');
          const text = clipboard.getData('text/plain');
          
          console.log('Paste event:', { hasHtml: !!html, hasText: !!text });
          
          // Jeśli mamy HTML, sprawdź czy to prosty HTML z Gemini/AI
          if (html) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const hasComplexFormatting = tempDiv.querySelector('[style*="font-family"], [class*="docs-"], [class*="gmail-"]');
            
            if (!hasComplexFormatting) {
              return false; // Pozwól na normalne wklejenie HTML
            }
          }
          
          // Dla czystego tekstu lub skomplikowanego HTML, przetwórz jako tekst
          if (text) {
            event.preventDefault();
            
            const processedText = text
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
            
            const md = new MarkdownIt({ 
              linkify: true, 
              breaks: true,
              html: true 
            });
            
            const convertedHtml = md.render(processedText);
            console.log('Converted HTML:', convertedHtml);
            
            if (editor) {
              editor.commands.insertContent(convertedHtml);
            }
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Paste error:', error);
          return false;
        }
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  // Funkcje pomocnicze dla przycisków
  const handleBold = () => {
    console.log('Bold clicked');
    if (editor) {
      editor.chain().focus().toggleBold().run();
    }
  };

  const handleItalic = () => {
    console.log('Italic clicked');
    if (editor) {
      editor.chain().focus().toggleItalic().run();
    }
  };

  const handleSmartFormat = () => {
    console.log('Smart Format clicked');
    if (!editor) {
      console.error('Editor not available');
      return;
    }

    try {
      const { from, to } = editor.state.selection;
      console.log('Selection:', { from, to });
      
      if (from === to) {
        alert('Zaznacz tekst do przeformatowania');
        return;
      }
      
      const selectedText = editor.state.doc.textBetween(from, to);
      console.log('Selected text:', selectedText);
      
      const processedText = selectedText
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
      
      const md = new MarkdownIt({ linkify: true, breaks: true, html: true });
      const convertedHtml = md.render(processedText);
      
      console.log('Processed text:', processedText);
      console.log('Converted HTML:', convertedHtml);
      
      editor.chain().focus().deleteRange({ from, to }).insertContent(convertedHtml).run();
    } catch (error) {
      console.error('Smart Format error:', error);
    }
  };

  if (!editor) {
    return <div className="border rounded p-4">Ładowanie edytora...</div>;
  }

  return (
    <div className="border rounded overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border-b bg-gray-50 text-sm flex-wrap">
        <button 
          type="button" 
          onClick={handleBold} 
          className={buttonCls(editor.isActive('bold'))}
        >
          <b>B</b>
        </button>
        <button 
          type="button" 
          onClick={handleItalic} 
          className={buttonCls(editor.isActive('italic'))}
        >
          <i>I</i>
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          className={buttonCls(editor.isActive('underline'))}
        >
          <u>U</u>
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          className={buttonCls(editor.isActive('strike'))}
        >
          <s>S</s>
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={buttonCls(editor.isActive('bulletList'))}
        >
          • List
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={buttonCls(editor.isActive('orderedList'))}
        >
          1. List
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          className={buttonCls(editor.isActive('heading', { level: 1 }))}
        >
          H1
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          className={buttonCls(editor.isActive('heading', { level: 2 }))}
        >
          H2
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          className={buttonCls(editor.isActive('heading', { level: 3 }))}
        >
          H3
        </button>
        <button 
          type="button" 
          onClick={() => {
            const url = prompt('URL');
            if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }} 
          className={buttonCls(editor.isActive('link'))}
        >
          Link
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().undo().run()} 
          className={buttonCls(false)}
        >
          ↺
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().redo().run()} 
          className={buttonCls(false)}
        >
          ↻
        </button>
        <button 
          type="button" 
          onClick={handleSmartFormat} 
          className={buttonCls(false) + ' bg-green-100 hover:bg-green-200'}
        >
          Smart Format
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} 
          className={buttonCls(false)}
        >
          Clear
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

const buttonCls = (active: boolean) =>
  'px-2 py-1 rounded transition-colors ' + (active ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'); 