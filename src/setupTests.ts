// setupTests.ts
import '@testing-library/jest-dom';

// Konfiguracja matcherów i rozszerzeń dla testów
import '@testing-library/jest-dom/extend-expect';

// Konfiguracja timeoutów
jest.setTimeout(10000); // Ustawienie dłuższego timeoutu, aby dać testom więcej czasu

// Opcjonalnie: Mockowanie globalnych obiektów, które mogą być problematyczne w testach
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
}; 