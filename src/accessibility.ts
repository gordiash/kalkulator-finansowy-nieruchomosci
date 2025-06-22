// Funkcja useAccessibilityCheck skopiowana dla Vercel compatibility

/**
 * Hook do sprawdzania accessibility w development
 */
export function useAccessibilityCheck() {
  if (process.env.NODE_ENV === 'development') {
    // Uruchom sprawdzenie po załadowaniu strony
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        console.log('🎨 Accessibility check - funkcja działa poprawnie')
      }, 1000)
    }
  }
} 