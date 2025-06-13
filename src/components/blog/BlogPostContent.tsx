'use client';

import MarkdownIt from 'markdown-it';

// Inicjalizacja parsera markdown
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
}).use(require('markdown-it-attrs')); // Dodaj obsługę atrybutów np. {.class}

interface BlogPostContentProps {
  content: string;
}

export default function BlogPostContent({ content }: BlogPostContentProps) {
  // Parsowanie i renderowanie treści markdown
  const htmlContent = md.render(content);

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