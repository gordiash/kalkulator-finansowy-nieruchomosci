'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/ui/MarkdownEditor';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [content, setContent] = useState('');
  const [shortContent, setShortContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoContent, setSeoContent] = useState('');
  const [imageDisplay, setImageDisplay] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const format = (md: string) => {
      const lines = md.split(/\r?\n/).map(l => l.trimEnd());
      const withParas = lines.reduce<string[]>((acc, curr) => {
        if (curr === '') {
          if (acc[acc.length - 1] !== '') acc.push('');
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
    const { error } = await supabase.from('posts').insert(fields);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-8 w-full max-w-4xl space-y-4">
        <h1 className="text-2xl font-bold mb-4">Nowy wpis</h1>
        <div>
          <label className="block mb-1">Tytuł</label>
          <input value={title} onChange={(e) => {
            const val = e.target.value;
            setTitle(val);
            if (!slugEdited) {
              setSlug(slugify(val));
            }
          }} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1">SEO Title</label>
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">SEO Content</label>
          <textarea value={seoContent} onChange={(e) => setSeoContent(e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Slug</label>
          <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1">Krótki opis</label>
          <textarea value={shortContent} onChange={(e) => setShortContent(e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Adres URL obrazka</label>
          <input value={imageDisplay} onChange={(e) => setImageDisplay(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value as any)} className="w-full border rounded px-3 py-2">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Tagi (przecinki)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border rounded px-3 py-2" />
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