/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import AccountSettings from '@/components/dashboard/AccountSettings';
import { useAuthSubscription } from '@/contexts/AuthSubscriptionContext';
import '@testing-library/jest-dom';

jest.mock('@/contexts/AuthSubscriptionContext');

const mockedUseAuthSubscription = useAuthSubscription as jest.Mock;

function renderComponent() {
  return render(<AccountSettings />);
}

describe('AccountSettings', () => {
  it('renders email input with default value from context', async () => {
    mockedUseAuthSubscription.mockReturnValue({
      user: { id: 1, email: 'test@example.com' },
      loading: false,
      refresh: jest.fn(),
    });
    
    renderComponent();
    
    const emailInput = await screen.findByDisplayValue('test@example.com');
    expect(emailInput).toBeInTheDocument();
  });
}); 