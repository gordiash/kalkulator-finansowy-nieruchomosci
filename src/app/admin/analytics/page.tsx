import { Metadata } from 'next';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  FileText,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Target,
  Globe
} from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Statystyki i Analityka - Panel Administracyjny',
  description: 'Statystyki i analityka serwisu kalkulatorów nieruchomości.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AnalyticsPage() {
  // Symulacja danych statystycznych
  const stats = {
    totalViews: 15420,
    monthlyGrowth: 12.5,
    uniqueVisitors: 8234,
    bounceRate: 34.2,
    avgSessionDuration: '2:45',
    topPages: [
      { name: 'Kalkulator Wyceny', views: 5432, growth: 15.2 },
      { name: 'Kalkulator Zakupu', views: 4321, growth: 8.7 },
      { name: 'Kalkulator Wynajmu', views: 3456, growth: 12.3 },
      { name: 'Blog', views: 2345, growth: 5.4 },
    ],
    recentActivity: [
      { type: 'page_view', page: 'Kalkulator Wyceny', time: '2 min temu' },
      { type: 'user_registration', user: 'jan.kowalski@email.com', time: '5 min temu' },
      { type: 'calculation', calculator: 'Kalkulator Zakupu', time: '8 min temu' },
      { type: 'blog_view', post: 'Jawne Ceny Mieszkań 2025', time: '12 min temu' },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statystyki i Analityka</h1>
            <p className="text-gray-600 mt-2">Monitoruj wydajność i ruch na stronie</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Eksportuj
            </Button>
            <Button variant="outline" className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Odśwież
            </Button>
          </div>
        </div>

        {/* Główne statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Wyświetlenia (miesiąc)
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">
                +{stats.monthlyGrowth}% vs poprzedni miesiąc
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unikalni Użytkownicy
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.uniqueVisitors.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">
                +8.2% vs poprzedni miesiąc
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Współczynnik Odrzuceń
              </CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.bounceRate}%
              </div>
              <p className="text-xs text-red-600">
                +2.1% vs poprzedni miesiąc
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Średni Czas Sesji
              </CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.avgSessionDuration}
              </div>
              <p className="text-xs text-green-600">
                +0:15 vs poprzedni miesiąc
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Najpopularniejsze strony */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Najpopularniejsze Strony
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{page.name}</h3>
                      <p className="text-sm text-gray-500">{page.views.toLocaleString()} wyświetleń</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">
                        +{page.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ostatnia aktywność */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Ostatnia Aktywność
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'page_view' && `Wyświetlenie: ${activity.page}`}
                        {activity.type === 'user_registration' && `Nowy użytkownik: ${activity.user}`}
                        {activity.type === 'calculation' && `Obliczenie: ${activity.calculator}`}
                        {activity.type === 'blog_view' && `Wpis blogowy: ${activity.post}`}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wykresy i dodatkowe statystyki */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Wykres ruchu */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Ruch w Czasie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Wykres ruchu w czasie</p>
                  <p className="text-sm text-gray-400">Integracja z Google Analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Źródła ruchu */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Źródła Ruchu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Google</span>
                  <span className="text-sm font-bold text-gray-900">45.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45.2%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Bezpośredni</span>
                  <span className="text-sm font-bold text-gray-900">28.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '28.7%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Social Media</span>
                  <span className="text-sm font-bold text-gray-900">15.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15.3%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Inne</span>
                  <span className="text-sm font-bold text-gray-900">10.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '10.8%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 