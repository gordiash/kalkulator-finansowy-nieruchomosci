import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';

describe('HomePage Component', () => {
  test('renders hero section with title', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    
    // Sprawdzamy czy tytuł strony głównej jest widoczny
    expect(screen.getByText(/Kalkulator Finansowy Nieruchomości/i)).toBeInTheDocument();
    
    // Sprawdzamy czy jest sekcja z przyciskami
    expect(screen.getByRole('link', { name: /Rozpocznij analizę/i })).toBeInTheDocument();
  });

  test('renders features section', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    
    // Sprawdzamy czy sekcja funkcji jest widoczna
    expect(screen.getByText(/Główne funkcje:/i)).toBeInTheDocument();
  });

  test('renders FAQ section', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    
    // Sprawdzamy czy sekcja FAQ jest widoczna
    expect(screen.getByText(/Najczęściej zadawane pytania/i)).toBeInTheDocument();
  });
}); 