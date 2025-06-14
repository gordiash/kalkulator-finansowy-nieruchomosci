import { fetchPublishedPosts } from '@/lib/supabase/blog';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import PostActions from '@/components/admin/PostActions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const posts = await fetchPublishedPosts();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <AdminHeader />

      <Link href="/admin/new" className="inline-block bg-blue-600 text-white px-4 py-2 rounded mb-6">Nowy wpis</Link>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Tytuł</th>
            <th className="text-left p-3">Slug</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Data publikacji</th>
            <th className="text-left p-3">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-t">
              <td className="p-3 flex flex-col gap-1"><Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">{post.title}</Link>
              <Link href={`/admin/edit/${post.id}`} className="text-xs text-gray-500 hover:underline">Edytuj</Link></td>
              <td className="p-3">{post.slug}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${post.status==='published'?'bg-green-100 text-green-800':'bg-gray-200 text-gray-700'}`}>{post.status}</span>
              </td>
              <td className="p-3">{post.published_at ? new Date(post.published_at).toLocaleDateString('pl-PL'): '—'}</td>
              <td className="p-3"><PostActions id={post.id} status={post.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 