/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValuationsTable from '@/components/panel/ValuationsTable';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.confirm
global.confirm = jest.fn();

const mockValuationsData = {
  valuations: [
    {
      id: '1',
      input_params: {
        address: 'ul. Testowa 123, Warszawa',
        property_type: 'apartment',
        area: 65,
        rooms: 3,
        floor: 2,
        building_year: 2010,
        condition: 'good'
      },
      result: {
        estimated_value: 450000,
        confidence: 0.85,
        price_per_m2: 6923
      },
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      input_params: {
        address: 'ul. Przykładowa 456, Kraków',
        property_type: 'house',
        area: 120,
        rooms: 4,
        floor: 0,
        building_year: 2005,
        condition: 'very_good'
      },
      result: {
        estimated_value: 680000,
        confidence: 0.92,
        price_per_m2: 5667
      },
      created_at: '2024-01-14T14:20:00Z'
    }
  ],
  total: 2,
  page: 1,
  totalPages: 1
};

describe('ValuationsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    (global.confirm as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render loading skeleton initially', () => {
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve(mockValuationsData),
      }), 100))
    );

    render(<ValuationsTable />);
    
    expect(screen.getByTestId('loading-skeleton') || screen.getByText(/ładowanie/i)).toBeInTheDocument();
  });

  it('should load and display valuations data', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockValuationsData),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('Historia wycen (2)')).toBeInTheDocument();
      expect(screen.getByText('ul. Testowa 123, Warszawa')).toBeInTheDocument();
      expect(screen.getByText('ul. Przykładowa 456, Kraków')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/user/valuations?page=1&limit=10', {
      headers: {
        'Authorization': 'Bearer mock-token',
      },
    });
  });

  it('should show error message when loading fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('Błąd')).toBeInTheDocument();
      expect(screen.getByText('Błąd podczas pobierania historii wycen')).toBeInTheDocument();
    });
  });

  it('should show empty state when no valuations exist', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        valuations: [],
        total: 0,
        page: 1,
        totalPages: 0
      }),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('Brak historii wycen')).toBeInTheDocument();
      expect(screen.getByText('Wykonaj pierwszą wycenę, aby zobaczyć tutaj wyniki.')).toBeInTheDocument();
    });
  });

  it('should display formatted property details correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockValuationsData),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      // Check property type translation
      expect(screen.getByText('Mieszkanie')).toBeInTheDocument();
      expect(screen.getByText('Dom')).toBeInTheDocument();
      
      // Check condition translation
      expect(screen.getByText('Dobry')).toBeInTheDocument();
      expect(screen.getByText('Bardzo dobry')).toBeInTheDocument();
      
      // Check area display
      expect(screen.getByText('65 m²')).toBeInTheDocument();
      expect(screen.getByText('120 m²')).toBeInTheDocument();
      
      // Check rooms
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  it('should display formatted currency values correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockValuationsData),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      // Check formatted currency (Polish format) - może być różne formatowanie
      expect(screen.getByText(/450.*000.*zł/)).toBeInTheDocument();
      expect(screen.getByText(/680.*000.*zł/)).toBeInTheDocument();
      expect(screen.getByText(/6.*923.*zł/)).toBeInTheDocument();
      expect(screen.getByText(/5.*667.*zł/)).toBeInTheDocument();
    });
  });

  it('should display confidence percentage correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockValuationsData),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });

  it('should successfully delete valuation with confirmation', async () => {
    // Mock initial load
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockValuationsData),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('Historia wycen (2)')).toBeInTheDocument();
    });

    // Mock successful delete
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Wycena została usunięta' }),
    });

    // Mock refresh after delete
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ...mockValuationsData,
        valuations: [mockValuationsData.valuations[1]], // Remove first item
        total: 1
      }),
    });

    const deleteButtons = screen.getAllByText('Usuń');
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith('Czy na pewno chcesz usunąć tę wycenę?');

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user/valuations/1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      });
    });
  });

  it('should not delete valuation when user cancels confirmation', async () => {
    (global.confirm as jest.Mock).mockReturnValue(false);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockValuationsData),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('Historia wycen (2)')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Usuń');
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith('Czy na pewno chcesz usunąć tę wycenę?');
    
    // Should not make delete API call
    expect(fetch).toHaveBeenCalledTimes(1); // Only the initial load
  });

  it('should show error when delete fails', async () => {
    // Mock initial load
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockValuationsData),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('Historia wycen (2)')).toBeInTheDocument();
    });

    // Mock failed delete
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const deleteButtons = screen.getAllByText('Usuń');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Błąd podczas usuwania wyceny')).toBeInTheDocument();
    });
  });

  it('should show loading state on delete button while deleting', async () => {
    // Mock initial load
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockValuationsData),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('Historia wycen (2)')).toBeInTheDocument();
    });

    // Mock slow delete
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      }), 100))
    );

    const deleteButtons = screen.getAllByText('Usuń');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Usuwanie...')).toBeInTheDocument();
    });
  });

  it('should handle pagination correctly', async () => {
    const paginatedData = {
      ...mockValuationsData,
      page: 1,
      totalPages: 3,
      total: 25
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(paginatedData),
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('Historia wycen (25)')).toBeInTheDocument();
      expect(screen.getByText('Następna')).toBeInTheDocument();
      expect(screen.getByText('Poprzednia')).toBeInTheDocument();
    });

    // Mock next page load
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ...paginatedData,
        page: 2
      }),
    });

    const nextButton = screen.getByText('Następna');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user/valuations?page=2&limit=10', {
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      });
    });
  });

  it('should retry loading on error button click', async () => {
    // Mock initial failed load
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ValuationsTable />);

    await waitFor(() => {
      expect(screen.getByText('Błąd podczas pobierania historii wycen')).toBeInTheDocument();
    });

    // Mock successful retry
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockValuationsData),
    });

    const retryButton = screen.getByText('Spróbuj ponownie');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Historia wycen (2)')).toBeInTheDocument();
    });
  });
}); 