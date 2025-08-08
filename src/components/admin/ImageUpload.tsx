'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import NextImage from 'next/image';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
}

export default function ImageUpload({ onImageUploaded, currentImageUrl }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Sprawdź typ pliku
      if (!file.type.startsWith('image/')) {
        alert('Proszę wybrać plik obrazka (JPG, PNG, GIF, WebP)');
        return;
      }

      // Sprawdź rozmiar pliku (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Plik jest za duży. Maksymalny rozmiar to 5MB.');
        return;
      }

      // Utwórz podgląd
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload do Supabase
      uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Sprawdź czy użytkownik jest zalogowany
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('Użytkownik nie jest zalogowany:', authError);
        // Tymczasowo kontynuuj bez autoryzacji dla testów
      }

      // Generuj unikalną nazwę pliku
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `private/${fileName}`; // Upload do folderu 'private'

      console.log('Próba uploadu pliku:', { fileName, filePath, user: user?.email });

      // Upload do Supabase Storage
      const { data, error } = await supabase.storage
        .from('posts-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Błąd uploadu:', error);
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          throw new Error('Bucket "posts-images" nie istnieje. Utwórz go w panelu Supabase Storage.');
        }
        if (error.message.includes('policy') || error.message.includes('permission')) {
          throw new Error('Brak uprawnień do uploadu. Zmień politykę INSERT w Supabase Storage na "true" dla roli "anon" lub dodaj politykę dla anonimowych użytkowników.');
        }
        throw error;
      }

      console.log('Upload udany:', data);

      // Pobierz publiczny URL
      const { data: urlData } = supabase.storage
        .from('posts-images')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        onImageUploaded(urlData.publicUrl);
        setUploadProgress(100);
      }

    } catch (error) {
      console.error('Błąd podczas uploadu obrazka:', error);
      alert(`Błąd podczas uploadu obrazka: ${error instanceof Error ? error.message : 'Nieznany błąd'}\n\nAby rozwiązać problem:\n1. Sprawdź polityki RLS dla bucketa posts-images\n2. Upewnij się, że folder 'private' istnieje\n3. Sprawdź uprawnienia dla roli 'authenticated'`);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      uploadImage(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          previewUrl 
            ? 'border-gray-300 bg-gray-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative w-full h-48">
              <NextImage
                src={previewUrl}
                alt="Podgląd obrazka"
                fill
                sizes="100vw"
                className="object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">Obrazek został wybrany</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Przeciągnij obrazek lub kliknij aby wybrać
              </p>
              <p className="text-xs text-gray-500 mb-2">
                JPG, PNG, GIF, WebP (max 5MB)
              </p>
              <p className="text-xs text-blue-600">
                💡 Wymagana konfiguracja: Utwórz bucket &quot;posts-images&quot; w Supabase Storage
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploadowanie...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Wybierz obrazek
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
} 