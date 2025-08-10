/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileForm from '@/components/panel/ProfileForm';

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

describe('ProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render profile form with loading state initially', () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        phone: '123456789'
      }),
    });

    render(<ProfileForm />);
    
    expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
  });

  it('should load and display user profile data', async () => {
    const mockUserData = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789'
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jan Kowalski')).toBeInTheDocument();
      expect(screen.getByDisplayValue('jan@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/user/profile', {
      headers: {
        'Authorization': 'Bearer mock-token',
      },
    });
  });

  it('should show error message when profile loading fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByText('Błąd podczas ładowania profilu')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    const mockUserData = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789'
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jan Kowalski')).toBeInTheDocument();
    });

    // Clear name field
    const nameInput = screen.getByDisplayValue('Jan Kowalski');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Try to submit
    const submitButton = screen.getByText('Zapisz zmiany');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Imię i nazwisko jest wymagane')).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const mockUserData = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789'
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('jan@example.com')).toBeInTheDocument();
    });

    // Set invalid email
    const emailInput = screen.getByDisplayValue('jan@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    // Try to submit
    const submitButton = screen.getByText('Zapisz zmiany');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Podaj prawidłowy adres email')).toBeInTheDocument();
    });
  });

  it('should successfully update profile', async () => {
    const mockUserData = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789'
    };

    // Mock initial load
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jan Kowalski')).toBeInTheDocument();
    });

    // Mock successful update
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Profil został zaktualizowany' }),
    });

    // Update name
    const nameInput = screen.getByDisplayValue('Jan Kowalski');
    fireEvent.change(nameInput, { target: { value: 'Jan Nowak' } });

    // Submit form
    const submitButton = screen.getByText('Zapisz zmiany');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Profil został pomyślnie zaktualizowany')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify({
        name: 'Jan Nowak',
        email: 'jan@example.com',
        phone: '123456789'
      }),
    });
  });

  it('should show error message when update fails', async () => {
    const mockUserData = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789'
    };

    // Mock initial load
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jan Kowalski')).toBeInTheDocument();
    });

    // Mock failed update
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Email już istnieje' }),
    });

    // Submit form
    const submitButton = screen.getByText('Zapisz zmiany');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email już istnieje')).toBeInTheDocument();
    });
  });

  it('should disable submit button while saving', async () => {
    const mockUserData = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789'
    };

    // Mock initial load
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jan Kowalski')).toBeInTheDocument();
    });

    // Mock slow update
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      }), 100))
    );

    // Submit form
    const submitButton = screen.getByText('Zapisz zmiany');
    fireEvent.click(submitButton);

    // Check if button is disabled and shows loading state
    await waitFor(() => {
      expect(screen.getByText('Zapisywanie...')).toBeInTheDocument();
      expect(screen.getByText('Zapisywanie...')).toBeDisabled();
    });
  });
}); 