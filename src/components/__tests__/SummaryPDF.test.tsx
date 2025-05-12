import React from 'react';
import { render, screen } from '@testing-library/react';
import SummaryPDF from '../SummaryPDF';
import { CalculationResults } from '../../types';

// Mock jsPDF i autoTable
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      setLanguage: jest.fn(),
      setFontSize: jest.fn(),
      setTextColor: jest.fn(),
      setFont: jest.fn(),
      text: jest.fn(),
      setDrawColor: jest.fn(),
      line: jest.fn(),
      getNumberOfPages: jest.fn().mockReturnValue(1),
      setPage: jest.fn(),
      save: jest.fn(),
      addImage: jest.fn()
    }))
  };
});

jest.mock('jspdf-autotable', () => jest.fn());

describe('SummaryPDF Component', () => {
  const mockResults: CalculationResults = {
    buyingSummary: {
      downPayment: 100000,
      loanAmount: 400000,
      monthlyMortgagePayment: 1796.18,
      totalMortgagePayments: 646624.8,
      totalOtherCosts: 600000,
      buyingTotal: 1246624.8,
      propertyValue: 800000
    },
    rentingSummary: {
      monthlyRent: 2000,
      totalRent: 720000,
      totalRentInsurance: 36000,
      totalRentMaintenance: 14400,
      rentingTotal: 770400,
      investmentValue: 850000
    },
    comparison: {
      difference: 476624.8,
      finalDifference: 526224.8,
      buyingIsBetter: false,
      chartData: {
        labels: ['Rok 1', 'Rok 2', 'Rok 3', 'Rok 4', 'Rok 5', 'Rok 10', 'Rok 15', 'Rok 20', 'Rok 25', 'Rok 30'],
        mortgageCostData: [37200, 74400, 111600, 148800, 186000, 372000, 558000, 744000, 930000, 1116000],
        rentCostData: [25200, 51012, 77448.36, 104521.8, 132257.5, 287013.4, 470953.6, 690341.5, 952772, 1266388]
      }
    }
  };

  const propertyPrice = 500000;
  const address = 'ul. Testowa 123, 00-001 Warszawa';
  const inflation = 4.9;
  const onGenerate = jest.fn();

  test('renders generate PDF button', () => {
    render(
      <SummaryPDF
        results={mockResults}
        propertyPrice={propertyPrice}
        address={address}
        inflation={inflation}
        onGenerate={onGenerate}
      />
    );
    
    const button = screen.getByText(/Generuj PDF z analizą/i);
    expect(button).toBeInTheDocument();
  });
}); 