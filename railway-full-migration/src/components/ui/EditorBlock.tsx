/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import dynamic from 'next/dynamic';
import { useRef, useEffect } from 'react';

// Dynamic import, EditorJS uses window
const ReactEditorJS = dynamic(
  async () => {
    const mod = await import('react-editor-js');
    return mod.default;
  },
  { ssr: false, loading: () => <p>Ładowanie edytora...</p> }
);

// Editor.js tools
// @ts-expect-error - brak deklaracji typów w paczce
import Header from '@editorjs/header';
// @ts-expect-error - brak deklaracji typów w paczce
import List from '@editorjs/list';

interface EditorBlockProps {
  value: string;               // JSON string z bazy lub '{}'
  onChange: (content: string) => void; // zapisujemy JSON string
  height?: number;
}



export default function EditorBlock({ value, onChange, height = 400 }: EditorBlockProps) {
  const ejRef = useRef<any>(null);

  // wczytaj istniejące bloki JSON
  useEffect(() => {
    if (!ejRef.current) return;
    const editor = ejRef.current._editorJS;
    if (!editor) return;

    try {
      const parsed = value ? JSON.parse(value) : { blocks: [] };
      editor.isReady.then(() => editor.render(parsed));
    } catch {
      // Silent error handling
    }
  }, [value]);

  const handleSave = async () => {
    if (!ejRef.current) return;
    const data = await ejRef.current.save();

    onChange(JSON.stringify(data));
  };

  return (
    <div className="border rounded overflow-hidden">
      <ReactEditorJS
        tools={{ header: Header, list: List }}
        minHeight={height}
        defaultValue={{ blocks: [] }}
        onChange={handleSave}
        ref={ejRef}
      />
    </div>
  );
} 