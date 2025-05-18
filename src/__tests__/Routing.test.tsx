import React from 'react';
import { render, screen } from '../test-utils';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import '@testing-library/jest-dom';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock dla komponentów, które nie są bezpośrednio testowane
jest.mock('../components/DonationModal', () => () => <div data-testid="donation-modal" />);
jest.mock('../components/CookieConsent', () => () => <div data-testid="cookie-consent" />);

// Mocks dla stron
jest.mock('../pages/HomePage', () => () => <div data-testid="home-page">HomePage</div>);
jest.mock('../pages/ROICalculatorPage', () => () => <div data-testid="roi-calculator-page">ROICalculatorPage</div>);
jest.mock('../pages/InvestmentCalculatorPage', () => () => <div data-testid="investment-calculator-page">InvestmentCalculatorPage</div>);
jest.mock('../pages/RentalValueCalculatorPage', () => () => <div data-testid="rental-value-calculator-page">RentalValueCalculatorPage</div>);
jest.mock('../pages/PrivacyPolicy', () => () => <div data-testid="privacy-policy-page">PrivacyPolicy</div>);
jest.mock('../pages/Terms', () => () => <div data-testid="terms-page">Terms</div>);
jest.mock('../pages/AboutUs', () => () => <div data-testid="about-us-page">AboutUs</div>);
jest.mock('../pages/PropertyPricesPage', () => () => <div data-testid="property-prices-page">PropertyPricesPage</div>);

describe('App Routing', () => {
  test('renders HomePage on default route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('renders ROICalculatorPage on /kalkulator-roi route', () => {
    render(
      <MemoryRouter initialEntries={['/kalkulator-roi']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('roi-calculator-page')).toBeInTheDocument();
  });

  test('renders InvestmentCalculatorPage on /kalkulator-inwestycji route', () => {
    render(
      <MemoryRouter initialEntries={['/kalkulator-inwestycji']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('investment-calculator-page')).toBeInTheDocument();
  });

  test('renders RentalValueCalculatorPage on /kalkulator-wartosci-najmu route', () => {
    render(
      <MemoryRouter initialEntries={['/kalkulator-wartosci-najmu']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('rental-value-calculator-page')).toBeInTheDocument();
  });

  test('renders PropertyPricesPage on /ceny-nieruchomosci route', () => {
    render(
      <MemoryRouter initialEntries={['/ceny-nieruchomosci']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('property-prices-page')).toBeInTheDocument();
  });

  test('renders AboutUs on /o-nas route', () => {
    render(
      <MemoryRouter initialEntries={['/o-nas']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('about-us-page')).toBeInTheDocument();
  });

  test('renders PrivacyPolicy on /polityka-prywatnosci route', () => {
    render(
      <MemoryRouter initialEntries={['/polityka-prywatnosci']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('privacy-policy-page')).toBeInTheDocument();
  });

  test('renders Terms on /regulamin route', () => {
    render(
      <MemoryRouter initialEntries={['/regulamin']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('terms-page')).toBeInTheDocument();
  });
}); 