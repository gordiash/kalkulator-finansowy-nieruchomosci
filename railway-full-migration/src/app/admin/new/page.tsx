/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
// @ts-nocheck

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MarkdownEditor from '@/components/ui/MarkdownEditor';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoContent, setSeoContent] = useState('');
  const [imageDisplay, setImageDisplay] = useState('');
  const [tags, setTags] = useState('');
  const [shortContent, setShortContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Funkcja do generowania slug'a z tytułu
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (match) => {
        const map: { [key: string]: string } = {
          'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
          'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
        };
        return map[match] || match;
      })
      .replace(/[^a-z0-9\s-]/g, '') // Usuń znaki specjalne
      .replace(/\s+/g, '-') // Zamień spacje na myślniki
      .replace(/-+/g, '-') // Usuń podwójne myślniki
      .replace(/^-|-$/g, ''); // Usuń myślniki na początku i końcu
  };

  // Automatyczne generowanie slug'a przy zmianie tytułu
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (newTitle.trim()) {
      setSlug(generateSlug(newTitle));
      // Automatycznie ustaw SEO title jeśli jest pusty
      if (!seoTitle) {
        setSeoTitle(newTitle);
      }
    } else {
      setSlug('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Walidacja długości pól
    const validationErrors = [];
    
    if (title.length > 255) {
      validationErrors.push('Tytuł nie może być dłuższy niż 255 znaków');
    }
    
    if (slug.length > 255) {
      validationErrors.push('Slug nie może być dłuższy niż 255 znaków');
    }
    
    if (seoTitle.length > 255) {
      validationErrors.push('Tytuł SEO nie może być dłuższy niż 255 znaków');
    }
    
    if (tags.length > 255) {
      validationErrors.push('Tagi nie mogą być dłuższe niż 255 znaków');
    }
    
    if (validationErrors.length > 0) {
      alert('Błędy walidacji:\n' + validationErrors.join('\n'));
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title: title.trim(),
            slug: slug.trim(),
            content,
            seo_title: (seoTitle.trim() || title.trim()).substring(0, 255),
            seo_content: seoContent.trim() || null,
            image_display: imageDisplay.trim() || null,
            tags: tags.trim() || null,
            short_content: shortContent.trim() || null,
            status: status,
            published_at: status === 'published' ? new Date().toISOString() : null,
          },
        ])
        .select();

      if (error) throw error;

      console.log('Post created:', data);
      router.push('/admin');
    } catch (error) {
      console.error('Error creating post:', error);
      
      // Lepsze komunikaty błędów
      const dbError = error as any;
      if (dbError.code === '22001') {
        alert('Błąd: Jedna z wartości jest za długa. Sprawdź długość pól i spróbuj ponownie.');
      } else if (dbError.code === '23505') {
        alert('Błąd: Post z tym slug\'iem już istnieje. Zmień slug i spróbuj ponownie.');
      } else {
        alert('Błąd podczas tworzenia posta: ' + (dbError.message || 'Nieznany błąd'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nowy post</h1>
          <p className="text-gray-600 mt-2">Wypełnij pola poniżej aby utworzyć nowy post na blogu</p>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Podstawowe informacje */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Podstawowe informacje</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tytuł *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={255}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/255 znaków
              </p>
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={255}
                required
                placeholder="automatycznie-generowany-slug"
              />
              <p className="text-xs text-gray-500 mt-1">
                Generuje się automatycznie z tytułu ({slug.length}/255 znaków)
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Szkic</option>
              <option value="published">Opublikowany</option>
            </select>
          </div>
        </div>

        {/* Treść */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Treść</h2>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Treść główna (Markdown) *
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Wklej tutaj tekst z Gemini AI lub napisz własny w Markdown..."
              rows={15}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="shortContent" className="block text-sm font-medium text-gray-700 mb-2">
              Krótki opis (excerpt)
            </label>
            <textarea
              id="shortContent"
              value={shortContent}
              onChange={(e) => setShortContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Krótki opis posta wyświetlany na liście..."
            />
          </div>
        </div>

        {/* Media */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Media</h2>
          
          <div>
            <label htmlFor="imageDisplay" className="block text-sm font-medium text-gray-700 mb-2">
              URL obrazka głównego
            </label>
            <input
              type="url"
              id="imageDisplay"
              value={imageDisplay}
              onChange={(e) => setImageDisplay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL obrazka wyświetlanego w poście
            </p>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">SEO</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Tytuł SEO
              </label>
              <input
                type="text"
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={255}
                placeholder="Automatycznie kopiuje się z tytułu głównego"
              />
              <p className="text-xs text-gray-500 mt-1">
                Jeśli puste, użyje tytułu głównego ({seoTitle.length}/255 znaków)
              </p>
            </div>

            <div>
              <label htmlFor="seoContent" className="block text-sm font-medium text-gray-700 mb-2">
                Opis SEO (meta description)
              </label>
              <textarea
                id="seoContent"
                value={seoContent}
                onChange={(e) => setSeoContent(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Opis dla wyszukiwarek (150-160 znaków)..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Optymalna długość: 150-160 znaków ({seoContent.length}/500 znaków)
              </p>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tagi
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={255}
                placeholder="tag1, tag2, tag3..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Oddziel tagi przecinkami ({tags.length}/255 znaków)
              </p>
            </div>
          </div>
        </div>

        {/* Przyciski */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Anuluj
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !slug.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Zapisywanie...' : status === 'published' ? 'Opublikuj post' : 'Zapisz szkic'}
            </button>
          </div>
          
          {(!title.trim() || !slug.trim()) && (
            <p className="text-sm text-red-600 mt-2">
              Tytuł i slug są wymagane
            </p>
          )}
        </div>
      </form>
      </div>
    </div>
  );
} 