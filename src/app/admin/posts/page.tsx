import { Metadata } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/admin/AdminHeader';
import DeletePostButton from '@/components/admin/DeletePostButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Zarządzanie Wpisami - Panel Administracyjny',
  description: 'Zarządzanie wpisami blogowymi w panelu administracyjnym.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PostsPage() {
  const supabase = await getSupabaseServerClient();
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false });

  const stats = {
    total: posts?.length || 0,
    published: posts?.filter(p => p.status === 'published').length || 0,
    drafts: posts?.filter(p => p.status === 'draft').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Zarządzanie Wpisami</h1>
            <p className="text-gray-600 mt-2">Zarządzaj treściami bloga i statusem publikacji</p>
          </div>
          <Link href="/admin/new" className="mt-4 sm:mt-0">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nowy Wpis
            </Button>
          </Link>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wszystkie Wpisy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Opublikowane</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Szkice</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtry i wyszukiwanie */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Szukaj wpisów..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtruj
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista wpisów */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Wszystkie Wpisy ({posts?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts?.map((post: any) => (
                <div key={post.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {/* Obrazek wpisu */}
                      {post.image_display && (
                        <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                          <NextImage
                            src={post.image_display}
                            alt={post.title || 'Obrazek wpisu'}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {post.published_at ? new Date(post.published_at).toLocaleDateString('pl-PL') : '—'}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            1.2k wyświetleń
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status === 'published' ? 'Opublikowany' : 'Szkic'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild aria-label="Podgląd wpisu">
                      <Link href={`/blog/${post.slug}`} target="_blank" aria-label="Podgląd wpisu">
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild aria-label="Edytuj wpis">
                      <Link href={`/admin/edit/${post.id}`} aria-label="Edytuj wpis">
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                    <DeletePostButton postId={post.id} postTitle={post.title} />
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {(!posts || posts.length === 0) && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Brak wpisów</h3>
                  <p className="text-gray-500 mb-4">Nie ma jeszcze żadnych wpisów blogowych.</p>
                  <Link href="/admin/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Utwórz pierwszy wpis
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 