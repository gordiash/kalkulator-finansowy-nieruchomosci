/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import SubscriptionDashboard from '@/components/dashboard/SubscriptionDashboard';
import { useAuthSubscription } from '@/contexts/AuthSubscriptionContext';
import '@testing-library/jest-dom';

// Mock the entire context module
jest.mock('@/contexts/AuthSubscriptionContext', () => ({
  useAuthSubscription: jest.fn(),
}));

const mockedUseAuthSubscription = useAuthSubscription as jest.Mock;

describe('SubscriptionDashboard', () => {
  it('renders status badge correctly when ACTIVE', async () => {
    mockedUseAuthSubscription.mockReturnValue({
      subscriptionStatus: 'ACTIVE',
      loading: false,
    });
    
    render(<SubscriptionDashboard />);
    
    expect(await screen.findByText('Aktywna')).toBeInTheDocument();
  });

  it('renders status badge correctly when not active', async () => {
    mockedUseAuthSubscription.mockReturnValue({
      subscriptionStatus: 'INACTIVE',
      loading: false,
    });
    
    render(<SubscriptionDashboard />);
    
    expect(await screen.findByText('Nieaktywna')).toBeInTheDocument();
  });
}); 