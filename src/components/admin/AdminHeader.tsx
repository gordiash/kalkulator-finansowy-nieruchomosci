'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Search, 
  Settings, 
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo i nawigacja */}
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KN</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Panel Admin</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/admin/posts" className="text-gray-600 hover:text-blue-600">
                Wpisy
              </Link>
              <Link href="/admin/users" className="text-gray-600 hover:text-blue-600">
                Użytkownicy
              </Link>
              <Link href="/admin/analytics" className="text-gray-600 hover:text-blue-600">
                Statystyki
              </Link>
              <Link href="/admin/settings" className="text-gray-600 hover:text-blue-600">
                Ustawienia
              </Link>
            </nav>
          </div>

          {/* Prawa strona - akcje użytkownika */}
          <div className="flex items-center space-x-4">
            {/* Wyszukiwanie */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj..."
                className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-32"
              />
            </div>

            {/* Powiadomienia */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* Menu użytkownika */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
              </Button>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link href="/admin/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="h-4 w-4 mr-3" />
                    Profil
                  </Link>
                  <Link href="/admin/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings className="h-4 w-4 mr-3" />
                    Ustawienia
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Wyloguj
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              <Link href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Dashboard
              </Link>
              <Link href="/admin/posts" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Wpisy
              </Link>
              <Link href="/admin/users" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Użytkownicy
              </Link>
              <Link href="/admin/analytics" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Statystyki
              </Link>
              <Link href="/admin/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Ustawienia
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 