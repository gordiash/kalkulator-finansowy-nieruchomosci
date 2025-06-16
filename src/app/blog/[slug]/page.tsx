/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchPostBySlug, fetchPublishedPosts } from '@/lib/supabase/blog';
import type { BlogPostListing } from '@/lib/supabase/blog';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
// @ts-ignore
import markdownItAnchor from 'markdown-it-anchor';
// @ts-ignore
import markdownItContainer from 'markdown-it-container';
// @ts-ignore
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import '../blog-styles.css';

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true, // Włączenie obsługi pojedynczych nowych linii
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="code-block"><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch {}
    }
    return `<pre class="code-block"><code class="hljs">${mdParser.utils.escapeHtml(str)}</code></pre>`;
  },
})
  .use(markdownItAttrs)
  .use(markdownItAnchor, {
    permalink: false,
    slugify: (s: string) => s.toLowerCase().replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  })
  .use(markdownItContainer, 'info')
  .use(markdownItContainer, 'warning');

// Dodatkowe reguły dla lepszego parsowania polskiego tekstu i nowych linii
mdParser.renderer.rules.paragraph_open = () => '<p>';
mdParser.renderer.rules.paragraph_close = () => '</p>\n';

// Obsługa podwójnych nowych linii jako separatorów akapitów
mdParser.renderer.rules.hardbreak = () => '<br>\n';
mdParser.renderer.rules.softbreak = () => '<br>\n';

// Precyzyjne renderowanie nagłówków
mdParser.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx];
  const level = token.tag;
  return `<${level}>`;
};

mdParser.renderer.rules.heading_close = (tokens, idx) => {
  const token = tokens[idx];
  const level = token.tag;
  return `</${level}>\n`;
};

// Lepsze renderowanie linków
mdParser.renderer.rules.link_open = (tokens, idx, options, env, renderer) => {
  const token = tokens[idx];
  const href = token.attrGet('href');
  
  // Dodaj target="_blank" dla zewnętrznych linków
  if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer');
  }
  
  return renderer.renderToken(tokens, idx, options);
};

// Konfiguracja linkify dla lepszego rozpoznawania URL-i
mdParser.linkify.set({ fuzzyLink: false });

// Lepsze renderowanie tabel z formatowaniem numerów
mdParser.renderer.rules.table_open = () => '<div class="table-wrapper"><table>';
mdParser.renderer.rules.table_close = () => '</table></div>';

// Dodatkowe formatowanie dla komórek z numerami
mdParser.renderer.rules.td_open = () => {
  return '<td>';
};

mdParser.renderer.rules.td_close = () => '</td>';

// Generowanie statycznych ścieżek dla postów
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts: BlogPostListing[] = await fetchPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

// Generowanie metadanych SEO
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const awaitedParams = await params;
  const post = await fetchPostBySlug(awaitedParams.slug);
  if (!post) {
    return { title: 'Nie znaleziono posta' };
  }
  return {
    title: post.title,
    description: post.seo_content ?? post.short_content ?? '',
    openGraph: {
      title: post.title,
      description: post.excerpt ?? '',
      type: 'article',
      publishedTime: post.published_at,
    },
  };
}

// Komponent strony
async function PostPageContent({ slug }: { slug: string }) {
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto" style={{ maxWidth: '1200px' }}>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              {post.tags && (
                <div className="flex gap-2">
                  {post.tags.split(',').map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Kluczowe informacje na początku */}
          {post.short_content && post.short_content.length > 100 && (
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-blue-900">Kluczowe informacje</h3>
              <p className="text-blue-800 leading-relaxed">{post.short_content}</p>
            </div>
          )}

          {/* Featured Image */}
          {post.image_display && (
            <div className="mb-8">
              <img 
                src={post.image_display} 
                alt={post.title} 
                className="w-full h-auto rounded-lg shadow-lg object-cover"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}

                    {/* Content */}
          <article className="max-w-none">
            {(() => {
              const raw = post.content ?? '';
              const html = mdParser.render(raw);
              return (
                <div 
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: html }} 
                />
              );
            })()}
          </article>


        </div>
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostPageContent slug={slug} />;
}

// Dodaj ISR: strona odświeża dane co 60 sekund
export const revalidate = 60; 