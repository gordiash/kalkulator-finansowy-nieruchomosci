'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { BlogCategory } from '@/types/blog';

interface BlogFilterProps {
  categories: BlogCategory[];
  selectedCategory?: string;
  searchQuery?: string;
}

export default function BlogFilter({ 
  categories, 
  selectedCategory, 
  searchQuery = '' 
}: BlogFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Funkcja do aktualizacji URL z nowymi parametrami
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    // Usuń stronę przy filtrowaniu
    params.delete('page');
    
    const queryString = params.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
    router.push(newUrl);
  };

  // Obsługa wyszukiwania
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ search: searchInput.trim() || null });
  };

  // Obsługa wyboru kategorii
  const handleCategoryChange = (categorySlug: string) => {
    updateSearchParams({ 
      category: categorySlug === selectedCategory ? null : categorySlug 
    });
  };

  // Czyszczenie filtrów
  const clearFilters = () => {
    setSearchInput('');
    router.push(pathname);
  };

  const hasActiveFilters = selectedCategory || searchQuery;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Wyszukiwarka */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Szukaj w artykułach..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>
        </div>

        {/* Kategorie */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center mr-2">
            Kategorie:
          </span>
          
          {/* Przycisk "Wszystkie" */}
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Wszystkie
          </button>

          {/* Przyciski kategorii */}
          {categories.map((category) => {
            const isSelected = selectedCategory === category.attributes.slug;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.attributes.slug)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isSelected
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isSelected ? { backgroundColor: category.attributes.color } : {}}
              >
                {category.attributes.name}
              </button>
            );
          })}
        </div>

        {/* Przycisk czyszczenia filtrów */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Wyczyść filtry
          </button>
        )}
      </div>

      {/* Aktywne filtry */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Aktywne filtry:</span>
            
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                "{searchQuery}"
                <button
                  onClick={() => updateSearchParams({ search: null })}
                  className="ml-1 hover:text-blue-600"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            
            {selectedCategory && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {categories.find(cat => cat.attributes.slug === selectedCategory)?.attributes.name}
                <button
                  onClick={() => updateSearchParams({ category: null })}
                  className="ml-1 hover:text-green-600"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 