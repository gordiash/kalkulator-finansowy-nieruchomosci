import { Metadata } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditPostForm from '@/components/admin/EditPostForm';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Edytuj Wpis - Panel Administracyjny',
  description: 'Edytuj wpis blogowy w panelu administracyjnym.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await getSupabaseServerClient();
  
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <EditPostForm post={post} />
    </div>
  );
} 