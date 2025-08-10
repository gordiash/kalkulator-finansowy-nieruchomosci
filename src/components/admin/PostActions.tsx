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
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        let errorMessage = 'Nie udało się zaktualizować statusu';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }
      router.refresh();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Błąd podczas zmiany statusu:', error);
      alert(`Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${id}`, { method: 'DELETE', cache: 'no-store' });
      if (!response.ok) {
        let errorMessage = 'Nie udało się usunąć wpisu';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }
      router.refresh();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Błąd podczas usuwania:', error);
      alert(`Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsLoading(false);
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