import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { getStrapiMediaUrl } from '@/lib/strapi';

interface BlogPostHeaderProps {
  post: BlogPost;
}

export default function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const { attributes } = post;
  const featuredImageUrl = getStrapiMediaUrl(attributes.featured_image?.data);
  
  const publishedDate = new Date(attributes.published_at || attributes.publishedAt).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="mb-8">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-4 text-gray-500">
        <Link href="/" className="hover:text-blue-600">Strona główna</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
      </nav>

      {/* Tytuł i meta */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
        {attributes.title}
      </h1>
      <div className="flex flex-wrap items-center text-gray-500 text-sm">
        <span>Opublikowano: <time dateTime={attributes.published_at || attributes.publishedAt}>{publishedDate}</time></span>
        {attributes.author && <span className="mx-2">•</span>}
        {attributes.author && <span>Autor: {attributes.author}</span>}
        {attributes.ai_generated && <span className="mx-2">•</span>}
        {attributes.ai_generated && (
          <span className="flex items-center text-blue-600 font-medium">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Treść AI
          </span>
        )}
      </div>

      {/* Kategorie */}
      {attributes.categories?.data && attributes.categories.data.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {attributes.categories.data.map(category => (
            <Link 
              key={category.id}
              href={`/blog?category=${category.attributes.slug}`}
              className="px-3 py-1 rounded-full text-xs font-medium text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: category.attributes.color }}
            >
              {category.attributes.name}
            </Link>
          ))}
        </div>
      )}

      {/* Zdjęcie główne */}
      {featuredImageUrl && (
        <div className="mt-8 relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={featuredImageUrl}
            alt={attributes.title}
            fill
            className="object-cover"
            priority // Load this image first
            sizes="100vw"
          />
        </div>
      )}
    </header>
  );
} 