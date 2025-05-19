import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyPricesPage from '../PropertyPricesPage';
import { fetchPropertyPrices, fetchAvailableYears } from '../../utils/bdlApi';

// Mockowanie modułu bdlApi
jest.mock('../../utils/bdlApi');

// Mockowanie react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

describe('PropertyPricesPage', () => {
  beforeEach(() => {
    // Czyszczenie wszystkich mocków przed każdym testem
    jest.clearAllMocks();
    
    // Domyślne mocki dla API
    (fetchAvailableYears as jest.Mock).mockResolvedValue([2023, 2022, 2021, 2020, 2019]);
    (fetchPropertyPrices as jest.Mock).mockResolvedValue([
      { city: 'Powiat Warszawski', price: 10000, year: 2023, quarter: 1 },
      { city: 'Powiat Warszawski', price: 9800, year: 2023, quarter: 2 },
    ]);
  });

  it('powinien wyrenderować się poprawnie', async () => {
    render(<PropertyPricesPage />);
    
    expect(screen.getByText('Ceny nieruchomości za m² według powiatów')).toBeInTheDocument();
    expect(screen.getByLabelText('Nazwa powiatu')).toBeInTheDocument();
    expect(screen.getByLabelText('Typ wykresu')).toBeInTheDocument();

    // Czekamy na załadowanie lat
    await waitFor(() => {
      expect(screen.getByLabelText('Rok początkowy')).toBeInTheDocument();
      expect(screen.getByLabelText('Rok końcowy')).toBeInTheDocument();
  });
  });

  it('powinien załadować dostępne lata przy montowaniu', async () => {
    render(<PropertyPricesPage />);
    
    await waitFor(() => {
      expect(fetchAvailableYears).toHaveBeenCalled();
  });

    const startYearSelect = screen.getByLabelText('Rok początkowy');
    const endYearSelect = screen.getByLabelText('Rok końcowy');

    expect(startYearSelect).toBeInTheDocument();
    expect(endYearSelect).toBeInTheDocument();
  });

  it('powinien wyświetlić błąd przy próbie wyszukania bez nazwy powiatu', async () => {
    const { toast } = require('react-toastify');
    render(<PropertyPricesPage />);
    
    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const searchButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(searchButton);
    });

    expect(toast.error).toHaveBeenCalledWith('Wprowadź nazwę powiatu');
  });

  it('powinien poprawnie pobrać i wyświetlić dane o cenach', async () => {
    render(<PropertyPricesPage />);
    
    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    
    // Wprowadzanie danych
    const cityInput = screen.getByLabelText('Nazwa powiatu');
    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'powiat warszawski' } });
    });
    
    // Kliknięcie przycisku wyszukiwania
    const searchButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(searchButton);
    });
    
    // Oczekiwanie na pobranie danych
    await waitFor(() => {
      expect(fetchPropertyPrices).toHaveBeenCalled();
    });
    
    // Sprawdzenie czy dane zostały wyświetlone
    await waitFor(() => {
      expect(screen.getByText('Szczegółowe dane')).toBeInTheDocument();
      expect(screen.getByText(/10[\s\u00A0]000,00 zł/)).toBeInTheDocument();
      expect(screen.getByText(/9[\s\u00A0]?800,00 zł/)).toBeInTheDocument();
    });
  });

  it('powinien obsłużyć błąd podczas pobierania danych', async () => {
    const { toast } = require('react-toastify');
    (fetchPropertyPrices as jest.Mock).mockRejectedValue(new Error('Błąd API'));
    
    render(<PropertyPricesPage />);

    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // Wprowadzanie danych
    const cityInput = screen.getByLabelText('Nazwa powiatu');
    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'powiat warszawski' } });
    });
    
    // Kliknięcie przycisku wyszukiwania
    const searchButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(searchButton);
    });
    
    // Oczekiwanie na obsługę błędu
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Nie udało się pobrać danych');
    });
  });

  it('powinien zmienić typ wykresu', async () => {
    render(<PropertyPricesPage />);

    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByLabelText('Typ wykresu')).toBeInTheDocument();
    });

    const chartTypeSelect = screen.getByLabelText('Typ wykresu');
    await act(async () => {
      fireEvent.change(chartTypeSelect, { target: { value: 'bar' } });
    });

    expect(chartTypeSelect).toHaveValue('bar');
  });

  it('powinien wyświetlić błąd, jeśli nazwa powiatu nie zawiera słowa "powiat"', async () => {
    const { toast } = require('react-toastify');
    render(<PropertyPricesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const cityInput = screen.getByLabelText('Nazwa powiatu');
    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'Warszawa' } });
    });

    const searchButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(searchButton);
    });

    expect(toast.error).toHaveBeenCalledWith('Wprowadź poprawną nazwę powiatu (np. "powiat warszawski")');
  });

  it('powinien zaakceptować poprawną nazwę powiatu', async () => {
    render(<PropertyPricesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const cityInput = screen.getByLabelText('Nazwa powiatu');
    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'powiat warszawski' } });
    });

    const searchButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(searchButton);
    });

    // Sprawdzamy, że nie pojawił się błąd walidacji
    const { toast } = require('react-toastify');
    expect(toast.error).not.toHaveBeenCalledWith('Wprowadź poprawną nazwę powiatu (np. "powiat warszawski")');
  });

  it('powinien wyświetlić błąd, jeśli nazwa powiatu zawiera niedozwolone znaki', async () => {
    const { toast } = require('react-toastify');
    render(<PropertyPricesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const cityInput = screen.getByLabelText('Nazwa powiatu');
    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'powiat warszawski123!' } });
    });

    const searchButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(searchButton);
    });

    expect(toast.error).toHaveBeenCalledWith('Nazwa powiatu zawiera niedozwolone znaki');
  });
}); 