import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { getBlogPost, getBlogPosts } from '@/lib/strapi';
import type { BlogPost } from '@/types/blog';
import BlogPostHeader from '@/components/blog/BlogPostHeader';
import BlogPostContent from '@/components/blog/BlogPostContent';
import BlogPostNavigation from '@/components/blog/BlogPostNavigation';
import RelatedPosts from '@/components/blog/RelatedPosts';
import BlogLoadingSkeleton from '@/components/blog/BlogLoadingSkeleton';

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

// Generowanie statycznych ścieżek dla postów
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const postsResponse = await getBlogPosts({ pageSize: 100, filters: { status: 'published' } });
    const posts: BlogPost[] = postsResponse.data;
    
    if (!posts) {
      return [];
    }
    
    return posts.map((post: BlogPost): { slug: string } => ({
      slug: post.attributes.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static params for blog posts:", error);
    return [];
  }
}

// Generowanie metadanych SEO
export async function generateMetadata(
  { params }: BlogPostPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const post: BlogPost = await getBlogPost(params.slug);
    if (!post) {
      return {
        title: 'Nie znaleziono posta',
      };
    }
    const { attributes } = post;
    const parentTitle = (await parent).title?.absolute || '';

    return {
      title: `${attributes.seo_title || attributes.title} | ${parentTitle}`,
      description: attributes.seo_description || attributes.excerpt,
      openGraph: {
        title: attributes.seo_title || attributes.title,
        description: attributes.seo_description || attributes.excerpt || '',
        type: 'article',
        publishedTime: attributes.published_at || attributes.publishedAt,
        authors: attributes.author ? [attributes.author] : [],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for blog post:", error);
    return {
      title: 'Błąd ładowania posta',
    };
  }
}

// Komponent strony
async function PostPageContent({ slug }: { slug: string }) {
  try {
    const post = await getBlogPost(slug);

    if (!post || post.attributes.status !== 'published') {
      notFound();
    }

    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <BlogPostHeader post={post} />
            <main>
              <BlogPostContent content={post.attributes.content || ''} />
              <BlogPostNavigation currentPost={post} />
              <RelatedPosts currentPost={post} />
            </main>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    // Można tutaj zwrócić bardziej informacyjny komponent błędu
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Błąd ładowania posta
                </h3>
                <p className="text-gray-600">
                    Nie udało się załadować tego artykułu. Spróbuj ponownie później.
                </p>
            </div>
        </div>
    );
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <Suspense fallback={<BlogLoadingSkeleton />}>
      <PostPageContent slug={params.slug} />
    </Suspense>
  );
}

// Dodaj ISR: strona odświeża dane co 60 sekund
export const revalidate = 60; 