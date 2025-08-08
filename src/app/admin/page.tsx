
import { Metadata } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/admin/AdminHeader';
import PostActions from '@/components/admin/PostActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  Plus,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import DeletePostButton from '@/components/admin/DeletePostButton';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Panel Administracyjny - Kalkulatory Nieruchomości',
  description: 'Zarządzanie treściami, użytkownikami i statystykami serwisu kalkulatorów nieruchomości.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Panel Administracyjny - Kalkulatory Nieruchomości',
    description: 'Zarządzanie treściami, użytkownikami i statystykami serwisu.',
    url: `${baseUrl}/admin`,
    siteName: 'Kalkulatory Nieruchomości',
    type: 'website',
  },
};

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();
  
  // Pobierz dane statystyczne
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false });

  const { data: users } = await supabase
    .from('profiles')
    .select('*');

  // Symulacja statystyk (w rzeczywistej aplikacji pobierałbyś z Google Analytics)
  const stats = {
    totalPosts: posts?.length || 0,
    totalUsers: users?.length || 0,
    monthlyViews: 15420,
    monthlyGrowth: 12.5,
  };

  const recentPosts = posts?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Wszystkie Wpisy
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div>
              <p className="text-xs text-gray-500">
                +2 w tym miesiącu
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Zarejestrowani Użytkownicy
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500">
                +5 w tym tygodniu
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Wyświetlenia (miesiąc)
              </CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.monthlyViews.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                +{stats.monthlyGrowth}% vs poprzedni miesiąc
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Wzrost Ruchu
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">+{stats.monthlyGrowth}%</div>
              <p className="text-xs text-gray-500">
                vs poprzedni miesiąc
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Główna sekcja */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista wpisów */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Najnowsze Wpisy
                </CardTitle>
                <Link href="/admin/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nowy Wpis
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPosts.map((post: any) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(post.published_at).toLocaleDateString('pl-PL')}
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
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/edit/${post.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <DeletePostButton postId={post.id} postTitle={post.title} />
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Szybkie akcje */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Szybkie Akcje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/new">
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nowy Wpis Blogowy
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Zarządzaj Użytkownikami
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Zobacz Statystyki
                  </Button>
                </Link>
                <Link href="/admin/posts">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Edytuj Strony
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Ostatnia aktywność */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Ostatnia Aktywność
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Nowy wpis opublikowany</p>
                      <p className="text-xs text-gray-500">2 godziny temu</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Użytkownik się zarejestrował</p>
                      <p className="text-xs text-gray-500">4 godziny temu</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Wpis został edytowany</p>
                      <p className="text-xs text-gray-500">1 dzień temu</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 