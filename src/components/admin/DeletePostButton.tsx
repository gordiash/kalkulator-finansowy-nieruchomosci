'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export default function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Czy na pewno chcesz usunąć wpis "${postTitle}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas usuwania wpisu');
      }

      // Odśwież stronę po usunięciu
      router.refresh();
    } catch (error) {
      console.error('Błąd podczas usuwania wpisu:', error);
      alert(`Błąd podczas usuwania wpisu: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  );
} 