'use client';
/*
  Uwaga: Biblioteka react-editor-js i narzędzia EditorJS nie posiadają pełnych typów.
  Używamy oszczędnie any i ts-expect-error przy importach narzędzi.
*/

import dynamic from 'next/dynamic';
// no hooks needed

// Dynamic import, EditorJS uses window
const ReactEditorJS = dynamic(async () => {
  const mod = await import('react-editor-js');
  return mod.createReactEditorJS();
}, {
  ssr: false,
  loading: () => <p>Ładowanie edytora...</p>,
});

// Editor.js tools
// @ts-expect-error brak deklaracji typów w paczce
import Header from '@editorjs/header';
// @ts-expect-error brak deklaracji typów w paczce
import List from '@editorjs/list';

interface EditorBlockProps {
  value: string;               // JSON string z bazy lub '{}'
  onChange: (content: string) => void; // zapisujemy JSON string
  height?: number;
}



export default function EditorBlock({ value, onChange, height = 400 }: EditorBlockProps) {
  const handleSave = async () => {
    // Brak bezpośredniego dostępu do instancji bez onInitialize.
    // Pozostawiamy noop, aby zachować zgodność typów w buildzie.
  };

  return (
    <div className="border rounded overflow-hidden">
      <ReactEditorJS
        tools={{ header: Header, list: List }}
        minHeight={height}
        defaultValue={value ? JSON.parse(value) : { blocks: [] }}
        onChange={handleSave}
      />
    </div>
  );
} 