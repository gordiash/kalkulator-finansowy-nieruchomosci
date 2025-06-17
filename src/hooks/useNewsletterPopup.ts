import { useState, useEffect } from 'react';

interface NewsletterPopupState {
  isVisible: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  savedEmail: string | null;
}

export const useNewsletterPopup = () => {
  const [state, setState] = useState<NewsletterPopupState>({
    isVisible: false,
    isSubmitting: false,
    isSubmitted: false,
    error: null,
    savedEmail: null
  });

  // Key dla localStorage
  const STORAGE_KEY = 'newsletter_popup_dismissed';
  const STORAGE_SUBMITTED_KEY = 'newsletter_submitted';

  useEffect(() => {
    // Sprawdź czy użytkownik już odrzucił popup lub się zapisał
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    const isSubmitted = localStorage.getItem(STORAGE_SUBMITTED_KEY);
    
    if (isDismissed || isSubmitted) {
      return;
    }

    // Pokaż popup po 15 sekundach lub po scroll down 50%
    let hasScrolledEnough = false;

    const showPopup = () => {
      setState(prev => ({ ...prev, isVisible: true }));
    };

    const handleScroll = () => {
      if (hasScrolledEnough) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      
      if (scrollPercentage > 50) {
        hasScrolledEnough = true;
        showPopup();
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timeoutId);
      }
    };

    // Pokaż po 15 sekundach jeśli użytkownik nie przewinął
    const timeoutId = setTimeout(() => {
      if (!hasScrolledEnough) {
        showPopup();
        window.removeEventListener('scroll', handleScroll);
      }
    }, 30000);

    // Dodaj listener scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const hidePopup = () => {
    setState(prev => ({ ...prev, isVisible: false }));
  };

  const dismissPopup = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    hidePopup();
  };

  const submitEmail = async (email: string) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          source: 'popup' 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sukces
        localStorage.setItem(STORAGE_SUBMITTED_KEY, 'true');
        setState(prev => ({ 
          ...prev, 
          isSubmitting: false, 
          isSubmitted: true,
          error: null,
          savedEmail: email 
        }));

        // Ukryj popup po 3 sekundach
        setTimeout(() => {
          hidePopup();
        }, 3000);
        return;
      }

      // Jeśli email już istnieje (409) – traktuj jako sukces, ale pokaż informację
      if (response.status === 409) {
        // Duplikat – pokaż błąd, nie traktuj jako sukces
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          isSubmitted: false,
          error: 'Ten adres email jest już zapisany w naszym newsletterze',
          savedEmail: null
        }));
        return;
      }

      // Inne błędy
      throw new Error(data.error || 'Wystąpił błąd podczas zapisu');

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        error: error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd' 
      }));
    }
  };

  const resetError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    isVisible: state.isVisible,
    isSubmitting: state.isSubmitting,
    isSubmitted: state.isSubmitted,
    error: state.error,
    savedEmail: state.savedEmail,
    hidePopup,
    dismissPopup,
    submitEmail,
    resetError
  };
}; 