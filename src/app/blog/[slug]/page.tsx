/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchPostBySlug, fetchPublishedPosts } from '@/lib/supabase/blog';
import type { BlogPostListing } from '@/lib/supabase/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useMDXComponents } from '@/components/mdx-components';

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
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-sm text-gray-500 mb-6">
            {new Date(post.published_at).toLocaleDateString('pl-PL')}
          </p>
          {post.image_display && (
            <img src={post.image_display} alt={post.title} className="w-full rounded mb-6" />
          )}
          {(() => {
            const raw = post.content ?? '';
            // Escape "<" które nie zaczynają poprawnego tagu HTML (nie-litera, / lub !)
            const sanitized = raw.replace(/<(?=[^a-zA-Z\/!])/g, '&lt;');
            return (
              <div className="prose max-w-none">
                {/* @ts-expect-error Async MDX */}
                <MDXRemote
                  source={sanitized}
                  options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeRaw] } }}
                  components={useMDXComponents()}
                />
              </div>
            );
          })()}
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