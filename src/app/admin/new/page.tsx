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
import NextImage from 'next/image';

export default function NewPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tags: '',
    status: 'draft',
    image_display: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Obrazek został uploadowany:', imageUrl);
    setFormData(prev => ({
      ...prev,
      image_display: imageUrl,
      content: `${prev.content ? prev.content + '\n\n' : ''}![${prev.title || 'obrazek'}](${imageUrl})\n`
    }));
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
    if (!formData.slug) {
      handleInputChange('slug', generateSlug(title));
    }
  };

  const handlePreview = () => {
    if (!formData.title || !formData.content) {
      alert('Wprowadź tytuł i treść, aby zobaczyć podgląd');
      return;
    }
    
    setShowPreview(true);
  };

  const handleBackToEditor = () => {
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert('Wprowadź tytuł i treść wpisu');
      return;
    }

    setIsLoading(true);
    try {
      const postData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content,
        short_content: formData.excerpt,
        tags: formData.tags,
        status: 'draft',
        image_display: formData.image_display,
        published_at: new Date().toISOString(),
        seo_title: formData.title,
        seo_content: formData.excerpt
      };

      console.log('Zapisywanie wpisu:', postData);
      console.log('Obrazek do zapisu:', formData.image_display);

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select();

      if (error) {
        console.error('Błąd podczas zapisywania:', error);
        alert(`Błąd podczas zapisywania: ${error.message}`);
        return;
      }

      console.log('Wpis zapisany:', data);
      console.log('Zapisany obrazek:', data?.[0]?.image_display);
      alert('Wpis został zapisany jako szkic!');
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
      const postData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content,
        short_content: formData.excerpt,
        tags: formData.tags,
        status: 'published',
        image_display: formData.image_display,
        published_at: new Date().toISOString(),
        seo_title: formData.title,
        seo_content: formData.excerpt
      };

      console.log('Publikowanie wpisu:', postData);

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
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
              <h1 className="text-3xl font-bold text-gray-900">Nowy Wpis</h1>
              <p className="text-gray-600 mt-1">Utwórz nowy wpis blogowy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={showPreview ? handleBackToEditor : handlePreview}
              disabled={isLoading || (!formData.title || !formData.content)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Powrót do edytora' : 'Podgląd'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Zapisz szkic
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Opublikuj
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
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
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

            {/* Obrazek główny */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Obrazek główny
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload onImageUploaded={handleImageUploaded} />
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
                  />
                </div>

                <div>
                  <Label htmlFor="meta-description" className="text-sm font-medium text-gray-700 mb-2 block">
                    Meta opis
                  </Label>
                  <textarea
                    id="meta-description"
                    placeholder="Opis dla wyszukiwarek..."
                    className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Podgląd wpisu */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Podgląd wpisu</h2>
                <Button variant="outline" onClick={handleBackToEditor}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Powrót do edytora
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Obrazek główny */}
              {formData.image_display && (
                <div className="mb-8">
                  <div className="relative w-full h-64">
                    <NextImage
                      src={formData.image_display}
                      alt={formData.title || 'Obrazek wpisu'}
                      fill
                      sizes="100vw"
                      className="object-cover rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Nagłówek wpisu */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {formData.title}
                </h1>
                
                {formData.excerpt && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {formData.excerpt}
                  </p>
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    {/* <Calendar className="h-4 w-4 mr-2" /> */}
                    {/* {new Date().toLocaleDateString('pl-PL')} */}
                  </div>
                  <div className="flex items-center">
                    {/* <User className="h-4 w-4 mr-2" /> */}
                    {/* Administrator */}
                  </div>
                  {formData.tags && (
                    <div className="flex items-center">
                      {/* <Tag className="h-4 w-4 mr-2" /> */}
                      {formData.tags}
                    </div>
                  )}
                </div>
              </div>

              {/* Treść wpisu */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>

              {/* Tagi */}
              {formData.tags && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tagi:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 