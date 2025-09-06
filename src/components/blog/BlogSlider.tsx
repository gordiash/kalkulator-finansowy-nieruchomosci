'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BlogPostListing } from '@/lib/supabase/blog';

interface BlogSliderProps {
  posts: BlogPostListing[];
}

export default function BlogSlider({ posts }: BlogSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Responsywność - liczba postów na widok
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-scroll co 5 sekund
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, posts.length - itemsPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [posts.length, itemsPerView]);

  const nextSlide = () => {
    const maxIndex = Math.max(0, posts.length - itemsPerView);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxIndex = Math.max(0, posts.length - itemsPerView);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Touch/swipe handlers dla mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Sprawdź czy domena jest skonfigurowana w Next.js
  const isKnownDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      const knownDomains = [
        'lhihjbltatugcnbcpzzt.supabase.co',
        'static.vecteezy.com',
        'images.unsplash.com',
        'unsplash.com',
        'www.pexels.com',
        'images.pexels.com',
        'pixabay.com',
        'cdn.pixabay.com'
      ];
      return knownDomains.includes(domain);
    } catch {
      return false;
    }
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="relative py-20 md:py-32 bg-slate-800/20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300 font-medium text-sm">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
            Najświeższe treści
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Najnowsze wpisy na 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"> blogu</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Poznaj najświeższe analizy rynku nieruchomości, trendy i porady ekspertów 
            od profesjonalistów z branży
          </p>
        </div>

        <div className="relative">
          {/* Slider container */}
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out touch-pan-y"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex-shrink-0 px-2 sm:px-4"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="group relative block bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-400/10 before:to-indigo-400/10 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 h-full"
                  >
                    {/* Obrazek */}
                    {post.image_display ? (
                      <div className="aspect-video overflow-hidden relative">
                        {isKnownDomain(post.image_display) ? (
                          <Image
                            src={post.image_display}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Image
                            src={post.image_display}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <div className="text-white text-4xl font-bold">📈</div>
                      </div>
                    )}

                    {/* Treść */}
                    <div className="relative p-4 sm:p-6 z-10 flex-1 flex flex-col">
                      {/* Tagi */}
                      {post.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.split(',').slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full font-medium border border-slate-600/50"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tytuł */}
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300 line-clamp-2 leading-snug">
                        {truncateText(post.title, itemsPerView === 1 ? 60 : 80)}
                      </h3>

                      {/* Opis */}
                      {post.short_content && (
                        <p className="text-slate-300 text-sm mb-4 sm:mb-6 line-clamp-3 leading-relaxed flex-1">
                          {truncateText(post.short_content, itemsPerView === 1 ? 100 : 120)}
                        </p>
                      )}

                      {/* Data i Read More */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-xs text-slate-400 font-medium">
                          {formatDate(post.published_at)}
                        </div>
                        <div className="text-blue-400 text-sm font-semibold group-hover:text-blue-300 transition-colors duration-300">
                          Czytaj więcej →
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Nawigacja */}
          {posts.length > itemsPerView && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-full p-2 sm:p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 group hover:scale-110"
                aria-label="Poprzedni post"
              >
                <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 group-hover:text-white transition-colors duration-300" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-full p-2 sm:p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 group hover:scale-110"
                aria-label="Następny post"
              >
                <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 group-hover:text-white transition-colors duration-300" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {posts.length > itemsPerView && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.max(1, posts.length - itemsPerView + 1) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={
                    'relative inline-flex items-center justify-center p-3 sm:p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                  }
                  aria-label={`Przejdź do slajdu ${index + 1}`}
                  aria-current={currentIndex === index ? 'true' : 'false'}
                >
                  <span
                    className={`h-2 rounded-full transition-all duration-200 ${
                      currentIndex === index
                        ? 'bg-blue-500 w-8'
                        : 'bg-slate-600 hover:bg-slate-500 w-2'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Link do wszystkich postów */}
        <div className="text-center mt-16">
          <Link
            href="/blog"
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border border-blue-500/20"
          >
            <span>Zobacz wszystkie artykuły</span>
            <FiChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
} 