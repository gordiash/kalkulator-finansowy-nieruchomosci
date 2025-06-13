'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchParams: { [key: string]: string | undefined };
}

export default function BlogPagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  searchParams 
}: BlogPaginationProps) {
  const pathname = usePathname();

  // Funkcja do tworzenia URL z nowymi parametrami
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // Dodaj wszystkie istniejące parametry oprócz 'page'
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        params.set(key, value);
      }
    });
    
    // Dodaj nowy numer strony (tylko jeśli to nie pierwsza strona)
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    const queryString = params.toString();
    return `${pathname}${queryString ? `?${queryString}` : ''}`;
  };

  // Obliczanie zakresów widocznych stron
  const getVisiblePages = () => {
    const delta = 2; // Liczba stron po każdej stronie aktualnej
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
      {/* Informacja o wynikach */}
      <div className="text-sm text-gray-700">
        Wyświetlanie <span className="font-medium">{startItem}</span> do{' '}
        <span className="font-medium">{endItem}</span> z{' '}
        <span className="font-medium">{totalItems}</span> wyników
      </div>

      {/* Nawigacja */}
      <nav className="flex items-center space-x-1">
        {/* Przycisk "Poprzednia" */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Poprzednia
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-l-md cursor-not-allowed">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Poprzednia
          </span>
        )}

        {/* Numery stron */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Link
              key={pageNumber}
              href={createPageUrl(pageNumber)}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium border transition-colors ${
                isCurrentPage
                  ? 'z-10 bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {pageNumber}
            </Link>
          );
        })}

        {/* Przycisk "Następna" */}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            Następna
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-r-md cursor-not-allowed">
            Następna
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </nav>
    </div>
  );
} 