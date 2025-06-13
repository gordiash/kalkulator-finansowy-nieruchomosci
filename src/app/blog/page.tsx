import { Metadata } from 'next';
import { getBlogPosts, getBlogCategories } from '../../lib/strapi';
import type { BlogPost, BlogCategory } from '../../types/blog';
import BlogPostCard from '../../components/blog/BlogPostCard';
import BlogPagination from '../../components/blog/BlogPagination';
import BlogFilter from '../../components/blog/BlogFilter';

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
  
  // Przygotowanie filtrów (bez status, korzystamy z domyślnego stanu publikacji Strapi)
  const filters: Record<string, unknown> = {};
  
  if (searchParams.category) {
    filters['categories.slug'] = searchParams.category;
  }
  
  if (searchParams.search) {
    filters['$or'] = [
      { title: { $containsi: searchParams.search } },
      { excerpt: { $containsi: searchParams.search } },
      { content: { $containsi: searchParams.search } }
    ];
  }

  try {
    // Równoległe pobieranie danych
    const [postsResponse, categoriesResponse] = await Promise.all([
      getBlogPosts({
        page,
        pageSize,
        sort: 'publishedAt:desc',
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        populate: ['categories', 'featured_image']
      }),
      getBlogCategories()
    ]);

    const posts = postsResponse.data as BlogPost[];
    const categories = categoriesResponse.data as BlogCategory[];
    const pagination = postsResponse.meta.pagination;

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
              categories={categories}
              selectedCategory={searchParams.category}
              searchQuery={searchParams.search}
            />
          </div>

          {/* Lista postów */}
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Paginacja */}
              {pagination.pageCount > 1 && (
                <BlogPagination
                  currentPage={pagination.page}
                  totalPages={pagination.pageCount}
                  totalItems={pagination.total}
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