import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { getBlogPosts } from '@/lib/strapi';

interface BlogPostNavigationProps {
  currentPost: BlogPost;
}

export default async function BlogPostNavigation({ currentPost }: BlogPostNavigationProps) {
  const publishedAt = new Date(currentPost.attributes.published_at || currentPost.attributes.publishedAt);

  // Pobierz poprzedni post (opublikowany wcześniej)
  const prevPostResponse = await getBlogPosts({
    filters: { publishedAt: { $lt: publishedAt.toISOString() }, post_status: 'published' },
    sort: 'publishedAt:desc',
    pageSize: 1,
    populate: ['categories','featured_image']
  });
  const prevPost = prevPostResponse.data?.[0];

  // Pobierz następny post (opublikowany później)
  const nextPostResponse = await getBlogPosts({
    filters: { publishedAt: { $gt: publishedAt.toISOString() }, post_status: 'published' },
    sort: 'publishedAt:asc',
    pageSize: 1,
    populate: ['categories','featured_image']
  });
  const nextPost = nextPostResponse.data?.[0];
  
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex justify-between items-start gap-4">
        {/* Poprzedni post */}
        <div className="flex-1">
          {prevPost ? (
            <Link 
              href={`/blog/${prevPost.attributes.slug}`} 
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Poprzedni post
              </div>
              <p className="font-semibold text-gray-800 line-clamp-2">
                {prevPost.attributes.title}
              </p>
            </Link>
          ) : (
            <div className="p-4 text-center text-gray-400">Brak starszych postów</div>
          )}
        </div>

        {/* Następny post */}
        <div className="flex-1">
          {nextPost ? (
            <Link 
              href={`/blog/${nextPost.attributes.slug}`} 
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-right"
            >
              <div className="flex items-center justify-end text-sm text-gray-500 mb-2">
                Następny post
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
              <p className="font-semibold text-gray-800 line-clamp-2">
                {nextPost.attributes.title}
              </p>
            </Link>
          ) : (
            <div className="p-4 text-center text-gray-400">Brak nowszych postów</div>
          )}
        </div>
      </div>
    </div>
  );
} 