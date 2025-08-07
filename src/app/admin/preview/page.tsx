'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import Link from 'next/link';

interface PreviewData {
  title: string;
  content: string;
  excerpt: string;
  tags: string;
  status: string;
  slug: string;
}

export default function PreviewPage() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Odczytywanie danych z localStorage
    const storedData = localStorage.getItem('previewData');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setPreviewData(parsedData);
        // Wyczyść dane z localStorage po odczytaniu
        localStorage.removeItem('previewData');
      } catch (error) {
        console.error('Błąd podczas parsowania danych podglądu:', error);
      }
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie podglądu...</p>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Brak danych podglądu</h1>
          <p className="text-gray-600 mb-4">Nie otrzymano danych do wyświetlenia.</p>
          <Link href="/admin/new">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót do edytora
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/new">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Powrót do edytora
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Podgląd wpisu</h1>
                <p className="text-sm text-gray-600">Jak będzie wyglądał wpis na stronie</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                previewData.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {previewData.status === 'published' ? 'Opublikowany' : 'Szkic'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Treść wpisu */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8">
              {/* Nagłówek wpisu */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {previewData.title}
                </h1>
                
                {previewData.excerpt && (
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {previewData.excerpt}
                  </p>
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date().toLocaleDateString('pl-PL')}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Administrator
                  </div>
                  {previewData.tags && (
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      {previewData.tags}
                    </div>
                  )}
                </div>
              </div>

              {/* Treść wpisu */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: previewData.content }}
                  style={{
                    lineHeight: '1.7',
                  }}
                />
                <style jsx>{`
                  .prose ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                  }
                  .prose ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                  }
                  .prose li {
                    margin: 0.5rem 0 !important;
                    line-height: 1.6 !important;
                    display: list-item !important;
                    list-style-position: outside !important;
                  }
                  .prose li ul,
                  .prose li ol {
                    margin: 0.5rem 0 !important;
                  }
                `}</style>
              </div>

              {/* Tagi */}
              {previewData.tags && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tagi:</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewData.tags.split(',').map((tag, index) => (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 