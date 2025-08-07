'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Copy,
  Archive,
  Share2
} from 'lucide-react';

interface PostActionsProps {
  id: string;
  status: string;
  slug?: string;
}

export default function PostActions({ id, status, slug }: PostActionsProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    router.push(`/admin/edit/${id}`);
  };

  const handleView = () => {
    if (slug) {
      window.open(`/blog/${slug}`, '_blank');
    }
  };

  const handleCopyLink = async () => {
    if (slug) {
      const url = `${window.location.origin}/blog/${slug}`;
      try {
        await navigator.clipboard.writeText(url);
        // Można dodać toast notification
      } catch (error) {
        console.error('Błąd podczas kopiowania linku:', error);
      }
    }
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      const newStatus = status === 'published' ? 'draft' : 'published';
      // Tutaj dodaj logikę aktualizacji statusu w bazie danych
      console.log(`Zmiana statusu wpisu ${id} na ${newStatus}`);
    } catch (error) {
      console.error('Błąd podczas zmiany statusu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Czy na pewno chcesz usunąć ten wpis?')) {
      setIsLoading(true);
      try {
        // Tutaj dodaj logikę usuwania wpisu
        console.log(`Usuwanie wpisu ${id}`);
      } catch (error) {
        console.error('Błąd podczas usuwania:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <button
            onClick={handleView}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-3" />
            Podgląd
          </button>
          
          <button
            onClick={handleEdit}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-3" />
            Edytuj
          </button>
          
          <button
            onClick={handleCopyLink}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Copy className="h-4 w-4 mr-3" />
            Kopiuj link
          </button>
          
          <button
            onClick={handleToggleStatus}
            disabled={isLoading}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Archive className="h-4 w-4 mr-3" />
            {status === 'published' ? 'Przenieś do szkiców' : 'Opublikuj'}
          </button>
          
          <button
            onClick={() => {
              // Tutaj dodaj logikę udostępniania
              console.log('Udostępnianie wpisu');
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4 mr-3" />
            Udostępnij
          </button>
          
          <hr className="my-2" />
          
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-3" />
            Usuń
          </button>
        </div>
      )}
    </div>
  );
} 