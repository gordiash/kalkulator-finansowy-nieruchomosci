import { getBlogPosts } from "@/lib/strapi";
import { BlogPost } from "@/types/blog";
import BlogPostCard from "./BlogPostCard";

interface RelatedPostsProps {
    currentPost: BlogPost;
}

export default async function RelatedPosts({ currentPost }: RelatedPostsProps) {
    const categories = currentPost.attributes.categories?.data;
    const currentPostId = currentPost.id;

    if (!categories || categories.length === 0) {
        return null;
    }

    // Pobierz ID kategorii
    const categoryIds = categories.map(cat => cat.id);

    // Znajdź 3 inne posty, które mają co najmniej jedną z tych samych kategorii
    const relatedPostsResponse = await getBlogPosts({
        filters: {
            id: { $ne: currentPostId }, // Wyklucz bieżący post
            categories: { id: { $in: categoryIds } },
            status: 'published'
        },
        populate: ['categories', 'featured_image'],
        pageSize: 3,
        sort: 'published_at:desc'
    });

    const relatedPosts = relatedPostsResponse.data;

    if (!relatedPosts || relatedPosts.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Podobne artykuły
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((post: BlogPost) => (
                    <BlogPostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
} 