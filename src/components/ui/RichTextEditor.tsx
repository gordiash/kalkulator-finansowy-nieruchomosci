'use client';

import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 admin-content">
      <div className="p-0">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val ?? '')}
          height={800}
          preview="live"
          data-color-mode="light"
          className="w-full"
          visibleDragbar={false}
          textareaProps={{
            placeholder:
              placeholder || 'Wpisz treść w Markdown... (obsługa GFM: tabele, listy, linki, kod)',
            onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData('text');
              const ta = e.currentTarget;
              const start = ta.selectionStart ?? 0;
              const end = ta.selectionEnd ?? start;
              const current = value ?? '';
              const newValue = current.slice(0, start) + pasted + current.slice(end);
              onChange(newValue);
            },
          }}
          previewOptions={{
            remarkPlugins: [remarkGfm as any],
          }}
        />
      </div>
    </div>
  );
}


