/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChangePasswordForm from '@/components/ChangePasswordForm';

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

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render change password form', () => {
    render(<ChangePasswordForm />);
    
    expect(screen.getByLabelText('Obecne hasło')).toBeInTheDocument();
    expect(screen.getByLabelText('Nowe hasło')).toBeInTheDocument();
    expect(screen.getByLabelText('Potwierdź nowe hasło')).toBeInTheDocument();
    expect(screen.getByText('Zmień hasło')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<ChangePasswordForm />);

    const submitButton = screen.getByText('Zmień hasło');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Obecne hasło jest wymagane')).toBeInTheDocument();
      expect(screen.getByText('Nowe hasło jest wymagane')).toBeInTheDocument();
      expect(screen.getByText('Potwierdzenie hasła jest wymagane')).toBeInTheDocument();
    });
  });

  it('should validate minimum password length', async () => {
    render(<ChangePasswordForm />);

    const currentPasswordInput = screen.getByLabelText('Obecne hasło');
    const newPasswordInput = screen.getByLabelText('Nowe hasło');
    const confirmPasswordInput = screen.getByLabelText('Potwierdź nowe hasło');

    fireEvent.change(currentPasswordInput, { target: { value: 'old123' } });
    fireEvent.change(newPasswordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });

    const submitButton = screen.getByText('Zmień hasło');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nowe hasło musi mieć co najmniej 6 znaków')).toBeInTheDocument();
    });
  });

  it('should validate password confirmation match', async () => {
    render(<ChangePasswordForm />);

    const currentPasswordInput = screen.getByLabelText('Obecne hasło');
    const newPasswordInput = screen.getByLabelText('Nowe hasło');
    const confirmPasswordInput = screen.getByLabelText('Potwierdź nowe hasło');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword123' } });

    const submitButton = screen.getByText('Zmień hasło');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Hasła nie są identyczne')).toBeInTheDocument();
    });
  });

  it('should successfully change password', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Hasło zostało zmienione' }),
    });

    render(<ChangePasswordForm />);

    const currentPasswordInput = screen.getByLabelText('Obecne hasło');
    const newPasswordInput = screen.getByLabelText('Nowe hasło');
    const confirmPasswordInput = screen.getByLabelText('Potwierdź nowe hasło');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

    const submitButton = screen.getByText('Zmień hasło');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Hasło zostało pomyślnie zmienione')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/user/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify({
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      }),
    });

    // Form should be reset after successful change
    expect(currentPasswordInput).toHaveValue('');
    expect(newPasswordInput).toHaveValue('');
    expect(confirmPasswordInput).toHaveValue('');
  });

  it('should show error message when password change fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Obecne hasło jest nieprawidłowe' }),
    });

    render(<ChangePasswordForm />);

    const currentPasswordInput = screen.getByLabelText('Obecne hasło');
    const newPasswordInput = screen.getByLabelText('Nowe hasło');
    const confirmPasswordInput = screen.getByLabelText('Potwierdź nowe hasło');

    fireEvent.change(currentPasswordInput, { target: { value: 'wrongpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

    const submitButton = screen.getByText('Zmień hasło');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Obecne hasło jest nieprawidłowe')).toBeInTheDocument();
    });
  });

  it('should disable submit button while changing password', async () => {
    // Mock slow response
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      }), 100))
    );

    render(<ChangePasswordForm />);

    const currentPasswordInput = screen.getByLabelText('Obecne hasło');
    const newPasswordInput = screen.getByLabelText('Nowe hasło');
    const confirmPasswordInput = screen.getByLabelText('Potwierdź nowe hasło');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

    const submitButton = screen.getByText('Zmień hasło');
    fireEvent.click(submitButton);

    // Check if button is disabled and shows loading state
    await waitFor(() => {
      expect(screen.getByText('Zmienianie...')).toBeInTheDocument();
      expect(screen.getByText('Zmienianie...')).toBeDisabled();
    });
  });

  it('should toggle password visibility', () => {
    render(<ChangePasswordForm />);

    const currentPasswordInput = screen.getByLabelText('Obecne hasło');
    const newPasswordInput = screen.getByLabelText('Nowe hasło');
    const confirmPasswordInput = screen.getByLabelText('Potwierdź nowe hasło');

    // Initially passwords should be hidden
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Find and click visibility toggle buttons
    const toggleButtons = screen.getAllByRole('button', { name: /pokaż|ukryj/i });
    
    // Toggle first password field
    fireEvent.click(toggleButtons[0]);
    expect(currentPasswordInput).toHaveAttribute('type', 'text');

    // Toggle back
    fireEvent.click(toggleButtons[0]);
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should prevent same current and new password', async () => {
    render(<ChangePasswordForm />);

    const currentPasswordInput = screen.getByLabelText('Obecne hasło');
    const newPasswordInput = screen.getByLabelText('Nowe hasło');
    const confirmPasswordInput = screen.getByLabelText('Potwierdź nowe hasło');

    const samePassword = 'samepassword123';
    fireEvent.change(currentPasswordInput, { target: { value: samePassword } });
    fireEvent.change(newPasswordInput, { target: { value: samePassword } });
    fireEvent.change(confirmPasswordInput, { target: { value: samePassword } });

    const submitButton = screen.getByText('Zmień hasło');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nowe hasło musi się różnić od obecnego')).toBeInTheDocument();
    });
  });
}); 