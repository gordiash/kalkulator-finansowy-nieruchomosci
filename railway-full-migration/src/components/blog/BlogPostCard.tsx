import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/blog';
import { getStrapiMediaUrl } from '@/lib/strapi';

interface BlogPostCardProps {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const { attributes } = post;
  // Bezpieczne pobranie URL obrazka – przekazujemy cały obiekt featured_image
  const featuredImageUrl = getStrapiMediaUrl(attributes?.featured_image);
  
  let publishedDate = '';
  const rawDate = attributes.published_at || attributes.publishedAt;
  if (rawDate) {
    const dateObj = new Date(rawDate);
    if (!isNaN(dateObj.getTime())) {
      publishedDate = dateObj.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // Pobieranie pierwszej kategorii dla wyświetlenia
  const primaryCategory = attributes.categories?.data?.[0];

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Zdjęcie główne */}
      {attributes.slug ? (
        <Link href={`/blog/${attributes.slug}`}>
          <div className="relative h-48 bg-gray-200">
            {featuredImageUrl ? (
              <Image
                src={featuredImageUrl}
                alt={attributes.title}
                fill
                loading="lazy"
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Badge dla AI-generated */}
            {attributes.ai_generated && (
              <div className="absolute top-3 left-3">
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  AI
                </span>
              </div>
            )}
            
            {/* Kategoria */}
            {primaryCategory && (
              <div className="absolute top-3 right-3">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: primaryCategory.attributes.color }}
                >
                  {primaryCategory.attributes.name}
                </span>
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="relative h-48 bg-gray-200">
          {/* as above but no link, simple image or placeholder */}
          {featuredImageUrl ? (
            <Image
              src={featuredImageUrl}
              alt={attributes.title}
              fill
              loading="lazy"
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Treść karty */}
      <div className="p-6">
        {/* Meta informacje */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <time dateTime={rawDate || undefined}>
            {publishedDate || '—'}
          </time>
          {attributes.author && (
            <>
              <span className="mx-2">•</span>
              <span>{attributes.author}</span>
            </>
          )}
        </div>

        {/* Tytuł */}
        {attributes.slug ? (
          <Link href={`/blog/${attributes.slug}`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
              {attributes.title || 'Bez tytułu'}
            </h2>
          </Link>
        ) : (
          <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{attributes.title || 'Bez tytułu'}</h2>
        )}

        {/* Excerpt */}
        {attributes.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {attributes.excerpt}
          </p>
        )}

        {/* Tagi */}
        {attributes.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {attributes.tags.split(',').slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Przycisk "Czytaj więcej" */}
        {attributes.slug && (
          <Link
            href={`/blog/${attributes.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            Czytaj więcej
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>
    </article>
  );
} 