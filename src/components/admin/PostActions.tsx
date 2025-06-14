'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function PostActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Na pewno usunąć wpis?')) return;
    await supabase.from('posts').delete().eq('id', id);
    router.refresh();
  };

  const toggleStatus = async () => {
    const newStatus = status === 'published' ? 'draft' : 'published';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = { status: newStatus };
    if (newStatus === 'published') {
      updates.published_at = new Date().toISOString();
    }
    await supabase.from('posts').update(updates).eq('id', id);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Link href={`/admin/edit/${id}`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">Edytuj</Link>
      <button onClick={toggleStatus} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
        {status === 'published' ? 'Cofnij' : 'Publikuj'}
      </button>
      <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Usuń</button>
    </div>
  );
} 