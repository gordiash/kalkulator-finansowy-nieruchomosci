
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import PostActions from '@/components/admin/PostActions';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { defaultMeta } from '@/lib/seo/defaultMeta';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  ...defaultMeta,
  title: 'Panel Administratora - Zarządzanie Blogiem | Analityka Nieruchomości',
  description: 'Panel administratora kalkulatorów nieruchomości. Zarządzaj wpisami bloga, statusem publikacji i treściami.',
  keywords: [
    'panel administratora',
    'zarządzanie blogiem',
    'wpisy bloga',
    'status publikacji',
    'administracja',
    'zarządzanie treściami'
  ],
  alternates: {
    canonical: `${baseUrl}/admin`,
  },
  openGraph: {
    ...defaultMeta.openGraph,
    title: 'Panel Administratora - Zarządzanie Blogiem',
    description: 'Panel administratora kalkulatorów nieruchomości. Zarządzaj wpisami bloga.',
    url: `${baseUrl}/admin`,
  },
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await getSupabaseServerClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
  }

  const safePosts = posts ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-20 sm:pt-24">
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
          {safePosts.map((post) => (
            <tr key={post.id} className="border-t">
              <td className="p-3 flex flex-col gap-1"><Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">{post.title}</Link>
              </td>
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