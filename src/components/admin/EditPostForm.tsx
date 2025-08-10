'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AdminHeader from '@/components/admin/AdminHeader';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  Eye, 
  ArrowLeft,
  Settings,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  History
} from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  short_content?: string;
  tags?: string;
  status: string;
  image_display?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  seo_title?: string;
  seo_content?: string;
  author_id?: string;
}

interface EditPostFormProps {
  post: Post;
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: post.title,
    slug: post.slug,
    content: post.content,
    short_content: post.short_content || '',
    tags: post.tags || '',
    status: post.status,
    image_display: post.image_display || '',
    seo_title: post.seo_title || post.title,
    seo_content: post.seo_content || post.short_content || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUploaded = async (imageUrl: string) => {
    console.log('Obrazek został uploadowany:', imageUrl);
    // Zaktualizuj lokalny stan i dopnij obraz do treści jako Markdown
    setFormData(prev => ({
      ...prev,
      image_display: imageUrl,
      content: `${prev.content ? prev.content + '\n\n' : ''}![${prev.title || 'obrazek'}](${imageUrl})\n`
    }));

    // Natychmiastowy zapis do bazy (aktualny wpis)
    try {
      const { error } = await supabase
        .from('posts')
        .update({ image_display: imageUrl })
        .eq('id', post.id);
      if (error) {
        console.error('Błąd aktualizacji image_display:', error);
      }
    } catch (e) {
      console.error('Wyjątek przy zapisie image_display:', e);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    handleInputChange('title', title);
    // Automatycznie generuj slug tylko jeśli jest pusty
    if (!formData.slug) {
      handleInputChange('slug', generateSlug(title));
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert('Wprowadź tytuł i treść wpisu');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content,
        short_content: formData.short_content,
        tags: formData.tags,
        status: 'draft',
        image_display: formData.image_display,
        seo_title: formData.seo_title,
        seo_content: formData.seo_content
      };

      console.log('Zapisywanie zmian:', updateData);

      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id)
        .select();

      if (error) {
        console.error('Błąd podczas zapisywania:', error);
        alert(`Błąd podczas zapisywania: ${error.message}`);
        return;
      }

      console.log('Zmiany zapisane:', data);
      alert('Zmiany zostały zapisane!');
      router.push('/admin/posts');
    } catch (error) {
      console.error('Błąd podczas zapisywania:', error);
      alert(`Błąd podczas zapisywania: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.content) {
      alert('Wprowadź tytuł i treść wpisu');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content,
        short_content: formData.short_content,
        tags: formData.tags,
        status: 'published',
        image_display: formData.image_display,
        seo_title: formData.seo_title,
        seo_content: formData.seo_content,
        published_at: new Date().toISOString()
      };

      console.log('Publikowanie wpisu:', updateData);

      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id)
        .select();

      if (error) {
        console.error('Błąd podczas publikowania:', error);
        alert(`Błąd podczas publikowania: ${error.message}`);
        return;
      }

      console.log('Wpis opublikowany:', data);
      alert('Wpis został opublikowany!');
      router.push('/admin/posts');
    } catch (error) {
      console.error('Błąd podczas publikowania:', error);
      alert(`Błąd podczas publikowania: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Czy na pewno chcesz usunąć ten wpis?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts/${post.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Błąd podczas usuwania wpisu');
        }

        alert('Wpis został usunięty!');
        router.push('/admin/posts');
      } catch (error) {
        console.error('Błąd podczas usuwania:', error);
        alert(`Błąd podczas usuwania wpisu: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 admin-content">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/posts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Powrót
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edytuj Wpis</h1>
              <p className="text-gray-600 mt-1">Edytuj wpis blogowy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" disabled={isLoading} asChild>
              <Link href={`/blog/${post.slug}`} target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Podgląd
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Zapisz zmiany
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Opublikuj
            </Button>
            <Button 
              variant="outline"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Usuń
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Główny edytor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tytuł */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                  Tytuł wpisu
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Wprowadź tytuł wpisu..."
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-lg font-medium"
                />
              </CardContent>
            </Card>

            {/* Treść */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Treść wpisu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={formData.content}
                  onChange={(html) => handleInputChange('content', html)}
                  placeholder="Rozpocznij pisanie..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ustawienia publikacji */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Ustawienia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="slug" className="text-sm font-medium text-gray-700 mb-2 block">
                    Slug (URL)
                  </Label>
                  <Input
                    id="slug"
                    type="text"
                    placeholder="slug-wpisu"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-sm font-medium text-gray-700 mb-2 block">
                    Krótki opis
                  </Label>
                  <textarea
                    id="excerpt"
                    placeholder="Krótki opis wpisu..."
                    value={formData.short_content}
                    onChange={(e) => handleInputChange('short_content', e.target.value)}
                    className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="tags" className="text-sm font-medium text-gray-700 mb-2 block">
                    Tagi
                  </Label>
                  <Input
                    id="tags"
                    type="text"
                    placeholder="nieruchomości, kredyt, inwestycje"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Szkic</option>
                    <option value="published">Opublikowany</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Informacje o wpisie */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Informacje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">{post.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utworzony:</span>
                  <span className="font-medium">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString('pl-PL') : '—'}
                  </span>
                </div>
                {post.updated_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ostatnia edycja:</span>
                    <span className="font-medium">
                      {post.updated_at ? new Date(post.updated_at).toLocaleDateString('pl-PL') : '—'}
                    </span>
                  </div>
                )}
                {post.published_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Opublikowany:</span>
                    <span className="font-medium">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('pl-PL') : '—'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Obrazek główny */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Obrazek główny
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload 
                  onImageUploaded={handleImageUploaded}
                  currentImageUrl={formData.image_display}
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2" />
                  SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta-title" className="text-sm font-medium text-gray-700 mb-2 block">
                    Meta tytuł
                  </Label>
                  <Input
                    id="meta-title"
                    type="text"
                    placeholder="Tytuł dla wyszukiwarek..."
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="meta-description" className="text-sm font-medium text-gray-700 mb-2 block">
                    Meta opis
                  </Label>
                  <textarea
                    id="meta-description"
                    placeholder="Opis dla wyszukiwarek..."
                    value={formData.seo_content}
                    onChange={(e) => handleInputChange('seo_content', e.target.value)}
                    className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 