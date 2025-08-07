import { Metadata } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Mail,
  Calendar,
  Shield,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Zarządzanie Użytkownikami - Panel Administracyjny',
  description: 'Zarządzanie użytkownikami w panelu administracyjnym.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UsersPage() {
  const supabase = await getSupabaseServerClient();
  
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => u.status === 'active').length || 0,
    inactive: users?.filter(u => u.status === 'inactive').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Zarządzanie Użytkownikami</h1>
            <p className="text-gray-600 mt-2">Zarządzaj użytkownikami i ich uprawnieniami</p>
          </div>
          <Link href="/admin/users/new" className="mt-4 sm:mt-0">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Dodaj Użytkownika
            </Button>
          </Link>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wszyscy Użytkownicy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktywni</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nieaktywni</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
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
                    placeholder="Szukaj użytkowników..."
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

        {/* Lista użytkowników */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Wszyscy Użytkownicy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users?.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {user.full_name || 'Użytkownik'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.created_at).toLocaleDateString('pl-PL')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {(!users || users.length === 0) && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Brak użytkowników</h3>
                  <p className="text-gray-500 mb-4">Nie ma jeszcze żadnych zarejestrowanych użytkowników.</p>
                  <Link href="/admin/users/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Dodaj pierwszego użytkownika
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