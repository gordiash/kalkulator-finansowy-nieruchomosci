'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import MarkdownEditor from '@/components/ui/MarkdownEditor';

export default function EditPostPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const slugify = (text: string) => text.toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/--+/g,'-');
  const [content, setContent] = useState('');
  const [shortContent, setShortContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoContent, setSeoContent] = useState('');
  const [imageDisplay, setImageDisplay] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('posts').select('title, slug, content, short_content, seo_title, seo_content, image_display, tags, status').eq('id', id).single();
      if (error) { setError(error.message); setLoading(false); return; }
      setTitle(data.title);
      setSlug(data.slug);
      setContent(data.content ?? '');
      setShortContent(data.short_content ?? '');
      setSeoTitle(data.seo_title ?? '');
      setSeoContent(data.seo_content ?? '');
      setImageDisplay(data.image_display ?? '');
      setTags(data.tags ?? '');
      setStatus((data.status as any) || 'draft');
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const format = (md: string) => {
      const lines = md.split(/\r?\n/).map(l => l.trimEnd());
      const withParas = lines.reduce<string[]>((acc, curr) => {
        if (curr === '') {
          if (acc[acc.length-1] !== '') acc.push('');
        } else {
          acc.push(curr);
        }
        return acc;
      }, []).join('\n');
      return withParas.trim();
    };
    const formattedContent = format(content);
    const fields: any = { title, slug, content: formattedContent, short_content: shortContent.trim(), seo_title: seoTitle.trim(), seo_content: seoContent.trim(), image_display: imageDisplay.trim(), tags: tags.trim(), status };
    if (status === 'published') fields.published_at = new Date().toISOString();
    const { error } = await supabase.from('posts').update(fields).eq('id', id);
    if (error) { setError(error.message); return; }
    router.push('/admin');
  };

  if (loading) return <p className="p-8">Ładowanie...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleSave} className="bg-white shadow rounded p-8 w-full max-w-4xl space-y-4">
        <h1 className="text-2xl font-bold mb-4">Edytuj wpis</h1>
        <div>
          <label className="block mb-1">Tytuł</label>
          <input value={title} onChange={(e)=>{
            const val=e.target.value; setTitle(val); if(!slugEdited){setSlug(slugify(val));}
          }} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1">Slug</label>
          <input value={slug} onChange={(e)=>{setSlug(e.target.value); setSlugEdited(true);}} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1">SEO Title</label>
          <input value={seoTitle} onChange={(e)=>setSeoTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">SEO Content</label>
          <textarea value={seoContent} onChange={(e)=>setSeoContent(e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Krótki opis</label>
          <textarea value={shortContent} onChange={(e)=>setShortContent(e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Adres URL obrazka</label>
          <input value={imageDisplay} onChange={(e)=>setImageDisplay(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Tagi (przecinki)</label>
          <input value={tags} onChange={(e)=>setTags(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value as any)} className="w-full border rounded px-3 py-2">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Treść (Markdown)</label>
          <MarkdownEditor value={content} onChange={setContent} rows={15} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Zapisz</button>
      </form>
    </div>
  );
} 