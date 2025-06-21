import { Metadata } from 'next';
import Image from 'next/image';
import BlogPagination from '../../components/blog/BlogPagination';
import BlogFilter from '../../components/blog/BlogFilter';
import { fetchPublishedPosts } from '@/lib/supabase/blog';
import type { BlogPostListing } from '@/lib/supabase/blog';

export const metadata: Metadata = {
  title: 'Blog - Kalkulatory Finansowe',
  description: 'Najnowsze artykuły o nieruchomościach, kredytach i inwestycjach. Praktyczne porady i analizy rynku finansowego.',
  openGraph: {
    title: 'Blog - Kalkulatory Finansowe',
    description: 'Najnowsze artykuły o nieruchomościach, kredytach i inwestycjach.',
    type: 'website',
  },
};

interface BlogPageProps {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
  };
}

async function BlogContent({ searchParams }: BlogPageProps) {
  const page = parseInt(searchParams.page || '1');
  const pageSize = 12;
  
  try {
    const postsAll = await fetchPublishedPosts();
    const total = postsAll.length;
    const pageCount = Math.ceil(total / pageSize);
    const posts: BlogPostListing[] = postsAll.slice((page - 1) * pageSize, page * pageSize);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog Finansowy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Praktyczne porady, analizy rynku i najnowsze trendy w świecie nieruchomości i finansów
            </p>
          </div>

          {/* Filtry */}
          <div className="mb-8">
            <BlogFilter 
              categories={[]}
              selectedCategory={searchParams.category}
              searchQuery={searchParams.search}
            />
          </div>

          {/* Lista postów */}
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <article key={post.id} className="border rounded-lg p-6 bg-white shadow">
                    {post.image_display && (
                      <div className="w-full h-40 relative mb-3 rounded overflow-hidden">
                        <Image
                          src={post.image_display}
                          alt={post.title}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized={!post.image_display.startsWith('https://')}
                        />
                      </div>
                    )}
                    <a href={`/blog/${post.slug}`}> 
                      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    </a>
                    {post.short_content && <p className="text-gray-700 mb-2 line-clamp-3">{post.short_content}</p>}
                    {post.tags && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.tags.split(',').map((t, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-gray-500">{new Date(post.published_at).toLocaleDateString('pl-PL')}</p>
                  </article>
                ))}
              </div>

              {/* Paginacja */}
              {pageCount > 1 && (
                <BlogPagination
                  currentPage={page}
                  totalPages={pageCount}
                  totalItems={total}
                  searchParams={searchParams}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Brak postów
              </h3>
              <p className="text-gray-600">
                {searchParams.search || searchParams.category 
                  ? 'Nie znaleziono postów spełniających kryteria wyszukiwania.'
                  : 'Nie ma jeszcze żadnych opublikowanych postów.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading blog data:', error);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Błąd ładowania danych
          </h3>
          <p className="text-gray-600">
            Nie udało się załadować postów bloga. Spróbuj ponownie później.
          </p>
        </div>
      </div>
    );
  }
}

// Strona bloga jako async server component w Next.js 15 (searchParams jako Promise)
export default async function BlogPage({ searchParams }: { searchParams: Promise<BlogPageProps['searchParams']> }) {
  const resolvedParams = await searchParams;
  return <BlogContent searchParams={resolvedParams} />;
}

// Dodaj ISR: strona odświeża dane co 60 sekund
export const revalidate = 60; 