import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeneratePDFButton from '@/components/GeneratePDFButton';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

// Mock jsPDF
jest.mock('jspdf', () => {
  const mockDoc = {
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    setFillColor: jest.fn(),
    rect: jest.fn(),
    setTextColor: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    splitTextToSize: jest.fn().mockReturnValue(['Test text']),
    text: jest.fn(),
    addPage: jest.fn(),
    output: jest.fn().mockReturnValue(new Blob(['test'], { type: 'application/pdf' })),
  };
  return {
    __esModule: true,
    default: jest.fn(() => mockDoc),
  };
});

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('PDF Generation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  it('should show error for unauthorized access', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <GeneratePDFButton 
        calculationId="1" 
        calculationTitle="Test Calculation" 
      />
    );

    const button = screen.getByText('Pobierz PDF');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Brak autoryzacji. Zaloguj się ponownie.')).toBeInTheDocument();
    });
  });

  it('should generate PDF for valid calculation', async () => {
    const mockCalculation = {
      id: '1',
      title: 'Test Calculation',
      calculation_type: 'purchase',
      input_json: JSON.stringify({
        propertyValue: 500000,
        loanAmount: 400000,
        interestRate: 5.5,
      }),
      result_json: JSON.stringify({
        monthlyPayment: 2500,
        totalRepayment: 600000,
      }),
      created_at: new Date().toISOString(),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCalculation,
    } as Response);

    // Mock URL.createObjectURL i document.createElement
    const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
    const mockRevokeObjectURL = jest.fn();
    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    Object.defineProperty(window.URL, 'createObjectURL', {
      value: mockCreateObjectURL,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      value: mockRevokeObjectURL,
    });

    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
    };

    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

    render(
      <GeneratePDFButton 
        calculationId="1" 
        calculationTitle="Test Calculation" 
      />
    );

    const button = screen.getByText('Pobierz PDF');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/calculations/1', {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });
    });

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });

  it('should handle fetch error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Calculation not found' }),
    } as Response);

    render(
      <GeneratePDFButton 
        calculationId="999" 
        calculationTitle="Test Calculation" 
      />
    );

    const button = screen.getByText('Pobierz PDF');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Calculation not found')).toBeInTheDocument();
    });
  });

  it('should show loading state during generation', async () => {
    const mockCalculation = {
      id: '1',
      title: 'Test Calculation',
      calculation_type: 'purchase',
      input_json: '{}',
      result_json: '{}',
      created_at: new Date().toISOString(),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCalculation,
    } as Response);

    render(
      <GeneratePDFButton 
        calculationId="1" 
        calculationTitle="Test Calculation" 
      />
    );

    const button = screen.getByText('Pobierz PDF');
    fireEvent.click(button);

    expect(screen.getByText('Generowanie...')).toBeInTheDocument();
  });
});
