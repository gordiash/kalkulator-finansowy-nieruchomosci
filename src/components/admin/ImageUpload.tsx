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
      // Wymuszamy upload wyłącznie przez endpoint serwerowy
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: form, credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(async () => ({ error: await res.text() }));
        throw new Error(err.error || 'Upload nie powiódł się');
      }
      const json = await res.json();
      const url = json.url as string;
      if (!url) throw new Error('Brak URL w odpowiedzi serwera');
      onImageUploaded(url);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadProgress(100);
      return;
    } catch (error) {
      console.error('Błąd podczas uploadu obrazka:', error);
      alert(`Błąd podczas uploadu obrazka: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
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