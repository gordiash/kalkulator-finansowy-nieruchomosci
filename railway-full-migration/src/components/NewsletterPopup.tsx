'use client';

import React, { useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNewsletterPopup } from '@/hooks/useNewsletterPopup';

const NewsletterPopup: React.FC = () => {
  const [email, setEmail] = useState('');
  const {
    isVisible,
    isSubmitting,
    isSubmitted,
    error,
    dismissPopup,
    submitEmail,
    resetError,
    savedEmail
  } = useNewsletterPopup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Podstawowa walidacja
    if (!email || !email.includes('@')) {
      return;
    }

    await submitEmail(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      resetError();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={dismissPopup}
      />
      
      {/* Popup */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 animate-popup-in">
        {/* Close button */}
        <button
          onClick={dismissPopup}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100"
          aria-label="Zamknij"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nie przegap najlepszych ofert!
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Zapisz się do naszego newslettera i otrzymuj ekskluzywne porady dotyczące nieruchomości, analizy rynku oraz najlepsze oferty kredytowe.
            </p>
          </div>

          {/* Success state */}
          {isSubmitted ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Dziękujemy!
              </h3>
              <p className="text-gray-600 text-sm">
                Twój adres <span className="font-semibold text-gray-800">{savedEmail}</span> został dodany do naszego newslettera. Wkrótce otrzymasz od nas pierwsze wiadomości z wartościowymi treściami.
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Wpisz swój adres email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Zapisuję...
                  </>
                ) : (
                  'Zapisz się do newslettera'
                )}
              </button>
            </form>
          )}

          {/* Benefits */}
          {!isSubmitted && (
            <div className="mt-6 space-y-2 text-center">
              <p className="text-xs text-gray-500 mb-3">Co zyskujesz zapisując się:</p>
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Ekskluzywne analizy rynku nieruchomości</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Porady ekspertów kredytowych</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Najlepsze oferty banków i deweloperów</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Możesz zrezygnować z subskrypcji w każdej chwili. Nie spamujemy!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup; 