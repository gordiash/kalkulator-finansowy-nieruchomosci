import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import PropertyPricesPage from '../PropertyPricesPage';
import { toast } from 'react-toastify';
import * as bdlApi from '../../utils/bdlApi';
import '@testing-library/jest-dom';

// Mock dla toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock dla API
jest.mock('../../utils/bdlApi', () => ({
  fetchPropertyPrices: jest.fn(),
  fetchAvailableYears: jest.fn(),
}));

// Mock dla Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
  Bar: () => <div data-testid="bar-chart" />,
}));

describe('PropertyPricesPage Component', () => {
  beforeEach(() => {
    // Czyszczenie mocków przed każdym testem
    jest.clearAllMocks();
    
    // Mockujemy domyślne lata do wyboru
    const mockYears = [2023, 2022, 2021, 2020, 2019];
    jest.spyOn(Array, 'from').mockImplementation(() => mockYears as any);
  });

  test('renders page title and form elements', () => {
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Sprawdzamy czy tytuł strony jest widoczny
    expect(screen.getByText(/Ceny nieruchomości za m² według miast/i)).toBeInTheDocument();
    
    // Sprawdzamy czy pola formularza są obecne
    expect(screen.getByLabelText(/Nazwa miasta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rok początkowy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rok końcowy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rodzaj rynku/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Typ wykresu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sprawdź ceny/i })).toBeInTheDocument();
  });

  test('button is disabled when city name is empty', () => {
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Przycisk powinien być wyłączony na początku (brak nazwy miasta)
    const button = screen.getByRole('button', { name: /Sprawdź ceny/i });
    expect(button).toBeDisabled();
    
    // Po wprowadzeniu nazwy miasta przycisk powinien być aktywny
    const cityInput = screen.getByLabelText(/Nazwa miasta/i);
    fireEvent.change(cityInput, { target: { value: 'Warszawa' } });
    expect(button).not.toBeDisabled();
  });

  test('shows error toast when search is attempted with empty city name', () => {
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Wprowadzamy nazwę miasta, a następnie ją usuwamy
    const cityInput = screen.getByLabelText(/Nazwa miasta/i);
    fireEvent.change(cityInput, { target: { value: 'Warszawa' } });
    fireEvent.change(cityInput, { target: { value: '' } });
    
    // Próbujemy wyszukać z pustą nazwą miasta
    const button = screen.getByRole('button', { name: /Sprawdź ceny/i });
    fireEvent.click(button);
    
    // Powinien zostać wyświetlony komunikat błędu
    expect(toast.error).toHaveBeenCalledWith('Wprowadź nazwę miasta');
  });

  test('shows error toast when start year is greater than end year', () => {
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Wprowadzamy nazwę miasta
    const cityInput = screen.getByLabelText(/Nazwa miasta/i);
    fireEvent.change(cityInput, { target: { value: 'Warszawa' } });
    
    // Ustawiamy nieprawidłowy zakres lat (początek > koniec)
    const startYearSelect = screen.getByLabelText(/Rok początkowy/i);
    const endYearSelect = screen.getByLabelText(/Rok końcowy/i);
    
    fireEvent.change(startYearSelect, { target: { value: '2023' } });
    fireEvent.change(endYearSelect, { target: { value: '2019' } });
    
    // Próbujemy wyszukać z nieprawidłowym zakresem
    const button = screen.getByRole('button', { name: /Sprawdź ceny/i });
    fireEvent.click(button);
    
    // Powinien zostać wyświetlony komunikat błędu
    expect(toast.error).toHaveBeenCalledWith('Rok początkowy nie może być późniejszy niż rok końcowy');
  });

  test('allows changing market type between primary and secondary', () => {
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Sprawdzamy czy domyślnie wybrano rynek pierwotny
    const marketTypeSelect = screen.getByLabelText(/Rodzaj rynku/i);
    expect(marketTypeSelect).toHaveValue('primary');
    
    // Zmieniamy na rynek wtórny
    fireEvent.change(marketTypeSelect, { target: { value: 'secondary' } });
    expect(marketTypeSelect).toHaveValue('secondary');
  });

  test('allows changing chart type between line and bar', () => {
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Sprawdzamy czy domyślnie wybrano wykres liniowy
    const chartTypeSelect = screen.getByLabelText(/Typ wykresu/i);
    expect(chartTypeSelect).toHaveValue('line');
    
    // Zmieniamy na wykres słupkowy
    fireEvent.change(chartTypeSelect, { target: { value: 'bar' } });
    expect(chartTypeSelect).toHaveValue('bar');
  });

  test('displays loading state when fetching data', async () => {
    // Nadpisujemy implementację setTimeout, aby test nie musiał czekać
    jest.useFakeTimers();
    
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Wprowadzamy nazwę miasta
    const cityInput = screen.getByLabelText(/Nazwa miasta/i);
    fireEvent.change(cityInput, { target: { value: 'Warszawa' } });
    
    // Klikamy przycisk wyszukiwania
    const button = screen.getByRole('button', { name: /Sprawdź ceny/i });
    fireEvent.click(button);
    
    // Sprawdzamy, czy przycisk pokazuje stan ładowania
    expect(screen.getByText(/Pobieranie danych/i)).toBeInTheDocument();
    
    // Przywracamy prawdziwe timery
    jest.useRealTimers();
  });

  test('fetches and displays property price data with line chart by default', async () => {
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Wprowadzamy nazwę miasta
    const cityInput = screen.getByLabelText(/Nazwa miasta/i);
    fireEvent.change(cityInput, { target: { value: 'Warszawa' } });
    
    // Klikamy przycisk wyszukiwania
    const button = screen.getByRole('button', { name: /Sprawdź ceny/i });
    fireEvent.click(button);
    
    // Czekamy na wyświetlenie wyników
    await waitFor(() => {
      expect(screen.getByText(/Wykres cen nieruchomości w mieście Warszawa/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Sprawdzamy, czy tabela z wynikami jest widoczna
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1); // co najmniej nagłówek i jeden wiersz danych
    
    // Sprawdzamy, czy wykres liniowy jest wyświetlany
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    
    // Sprawdzamy, czy wyświetlono toast sukcesu
    expect(toast.success).toHaveBeenCalledWith('Pobrano dane dla miasta Warszawa');
  });

  test('changes to bar chart when bar chart type is selected', async () => {
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Wprowadzamy nazwę miasta
    const cityInput = screen.getByLabelText(/Nazwa miasta/i);
    fireEvent.change(cityInput, { target: { value: 'Warszawa' } });
    
    // Zmieniamy typ wykresu na słupkowy
    const chartTypeSelect = screen.getByLabelText(/Typ wykresu/i);
    fireEvent.change(chartTypeSelect, { target: { value: 'bar' } });
    
    // Klikamy przycisk wyszukiwania
    const button = screen.getByRole('button', { name: /Sprawdź ceny/i });
    fireEvent.click(button);
    
    // Czekamy na wyświetlenie wyników
    await waitFor(() => {
      expect(screen.getByText(/Wykres cen nieruchomości w mieście Warszawa/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Sprawdzamy, czy wykres słupkowy jest wyświetlany
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  test('renders help section with instructions', () => {
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Sprawdzamy, czy sekcja pomocy jest widoczna
    expect(screen.getByText(/Jak korzystać z kalkulatora cen nieruchomości/i)).toBeInTheDocument();
    
    // Sprawdzamy, czy instrukcje są widoczne
    const instructionItems = screen.getAllByRole('listitem');
    expect(instructionItems.length).toBeGreaterThan(3); // teraz mamy więcej kroków instrukcji
    
    // Sprawdzamy, czy opis typów rynku jest obecny
    expect(screen.getByText(/Rodzaje rynków:/i)).toBeInTheDocument();
    expect(screen.getByText(/Rynek pierwotny/i)).toBeInTheDocument();
    expect(screen.getByText(/Rynek wtórny/i)).toBeInTheDocument();
  });
  
  test('displays error when API returns an error', async () => {
    // Nadpisujemy implementację Promise, aby symulować błąd
    global.Promise = jest.fn().mockImplementationOnce((executor) => {
      return {
        then: jest.fn().mockImplementationOnce(() => {
          throw new Error('Nie znaleziono miasta o podanej nazwie');
        })
      };
    }) as any;
    
    render(
      <MemoryRouter>
        <PropertyPricesPage />
      </MemoryRouter>
    );
    
    // Wprowadzamy nazwę miasta
    const cityInput = screen.getByLabelText(/Nazwa miasta/i);
    fireEvent.change(cityInput, { target: { value: 'NieistniejąceMiasto' } });
    
    // Klikamy przycisk wyszukiwania
    const button = screen.getByRole('button', { name: /Sprawdź ceny/i });
    fireEvent.click(button);
    
    // Czekamy na wyświetlenie błędu
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Nie udało się pobrać danych');
    });
  });
}); 