'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';

// Inicjalizacja parsera markdown z pluginem attrs (np. {.class})
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
  breaks: true,
}).use(markdownItAttrs);

interface BlogPostContentProps {
  content: string | any[];
}

export default function BlogPostContent({ content }: BlogPostContentProps) {
  // Strapi blocks → plain string
  let source = '';
  if (Array.isArray(content)) {
    source = content
      .map((block) =>
        typeof block === 'string'
          ? block
          : Array.isArray((block as any).children)
              ? (block as any).children.map((child: any) => child.text || '').join('')
              : ''
      )
      .join('\n\n');
  } else {
    source = content ?? '';
  }

  // PREPROCESS: 
  // 1) Zamień trailing " ---" lub "---" po nagłówku/akapicie na osobną linię hr
  source = source.replace(/\s*-{3}\s*$/gm, '\n\n---\n');

  // 2) Upewnij się, że każdy punkt listy poprzedzony gwiazdką zaczyna się w nowej linii
  // 2a) Dodaj podwójną nową linię przed gwiazdką jeśli nie ma już pustej linii
  source = source.replace(/([^\n])\n\*/g, '$1\n\n*');
  // 2b) Usuń ewentualne spacje przed gwiazdką i zapewnij pojedynczą spację po niej
  source = source.replace(/\s*\*\s+/g, '* ');

  // Parsowanie i renderowanie treści markdown
  const htmlContent = md.render(source);

  return (
    <article 
      className="prose prose-lg max-w-none 
                 prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
                 prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
                 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                 prose-p:leading-relaxed prose-p:mb-4
                 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                 prose-strong:font-semibold
                 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
                 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                 prose-li:mb-2
                 prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-code:text-sm
                 prose-pre:bg-gray-800 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                 prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
} 