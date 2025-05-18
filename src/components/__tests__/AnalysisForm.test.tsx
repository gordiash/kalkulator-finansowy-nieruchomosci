import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import AnalysisForm from '../AnalysisForm';
import { AnalysisOptions } from '../../types';
import '@testing-library/jest-dom';

describe('AnalysisForm Component', () => {
  const mockOptions: AnalysisOptions = {
    analysisPeriod: 30,
    inflation: 4.9
  };

  const mockOnChange = jest.fn();
  const mockOnCalculate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields with initial values', () => {
    render(
      <AnalysisForm 
        options={mockOptions} 
        onChange={mockOnChange} 
        onCalculate={mockOnCalculate}
      />
    );

    // Sprawdzenie czy tytuł sekcji jest widoczny
    expect(screen.getByText(/Opcje analizy/i)).toBeInTheDocument();
    
    // Sprawdzenie pól formularza
    const periodInput = screen.getByLabelText(/Okres analizy/i) as HTMLInputElement;
    expect(periodInput.value).toBe('30');
    
    const inflationInput = screen.getByLabelText(/Średnioroczna inflacja/i) as HTMLInputElement;
    expect(inflationInput.value).toBe('4.9');
  });

  test('calls onChange when input values change', () => {
    render(
      <AnalysisForm 
        options={mockOptions} 
        onChange={mockOnChange} 
        onCalculate={mockOnCalculate}
      />
    );

    // Zmiana wartości okresu analizy
    const periodInput = screen.getByLabelText(/Okres analizy/i) as HTMLInputElement;
    fireEvent.change(periodInput, { target: { value: '25' } });
    expect(mockOnChange).toHaveBeenCalledWith({ analysisPeriod: 25 });
    
    // Zmiana wartości inflacji
    const inflationInput = screen.getByLabelText(/Średnioroczna inflacja/i) as HTMLInputElement;
    fireEvent.change(inflationInput, { target: { value: '3.5' } });
    expect(mockOnChange).toHaveBeenCalledWith({ inflation: 3.5 });
  });

  test('calls onCalculate when button is clicked', () => {
    render(
      <AnalysisForm 
        options={mockOptions} 
        onChange={mockOnChange} 
        onCalculate={mockOnCalculate}
      />
    );

    // Kliknięcie przycisku Oblicz
    const calculateButton = screen.getByRole('button', { name: /Oblicz/i });
    fireEvent.click(calculateButton);
    expect(mockOnCalculate).toHaveBeenCalled();
  });

  test('renders with inflationSource', () => {
    render(
      <AnalysisForm 
        options={mockOptions} 
        onChange={mockOnChange} 
        onCalculate={mockOnCalculate}
        inflationSource="GUS"
      />
    );

    // Sprawdzenie czy źródło inflacji jest widoczne
    expect(screen.getByText(/GUS/i)).toBeInTheDocument();
  });
}); 