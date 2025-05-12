import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';

// Mock dla komponentu DonationModal
jest.mock('../DonationModal', () => {
  return function MockDonationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return isOpen ? <div data-testid="mock-donation-modal">Modal Content</div> : null;
  };
});

describe('Layout Component', () => {
  test('renders children properly', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div data-testid="test-child">Test Child Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    // Sprawdzamy czy dzieci są renderowane
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  test('renders navigation', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    // Sprawdzamy czy nawigacja jest widoczna
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Sprawdzamy czy linki nawigacyjne są obecne
    expect(screen.getByRole('link', { name: /Strona główna/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kalkulator ROI/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kalkulator Inwestycji/i })).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    // Sprawdzamy czy stopka jest widoczna
    expect(screen.getByText(/© 2023 Kalkulator Finansowy Nieruchomości/i)).toBeInTheDocument();
    
    // Sprawdzamy przycisk wesprzyj projekt
    expect(screen.getByText(/Wesprzyj projekt/i)).toBeInTheDocument();
  });
}); 