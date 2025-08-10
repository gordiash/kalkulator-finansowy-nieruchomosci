import { handleRentalCalculation } from '../src/app/api/calculate/route';

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: any) => {
        return {
          json: async () => body,
        } as unknown as Response;
      },
    },
  };
});

describe('Rental calculator', () => {
  const baseInput = {
    purchasePrice: 500000,
    monthlyRent: 3000,
    downPayment: 100000,
    adminFees: 400,
    utilities: 300,
    insurance: 600,
    otherCosts: 200,
    vacancyRate: 0,
    interestRate: 5,
    loanYears: 20,
    taxationType: 'ryczalt',
    taxScale: '12',
    propertyAppreciation: 3,
    rentGrowth: 2,
    renovationCosts: 0,
    otherInitialCosts: 0,
    managementFee: 0,
  };

  it('returns projection for 10 years', async () => {
    const { projection } = await (handleRentalCalculation as any)(baseInput).json();
    expect(projection.length).toBe(10);
  });

  it('calculates loan payment when loan exists', async () => {
    const { monthlyLoanPayment } = await (handleRentalCalculation as any)(baseInput).json();
    expect(monthlyLoanPayment).toBeGreaterThan(0);
  });

  it('cash purchase omits loan fields', async () => {
    const cashInput = { ...baseInput, downPayment: 500000 };
    const res = await (handleRentalCalculation as any)(cashInput).json();
    expect(res.loanAmount).toBeUndefined();
    expect(res.monthlyLoanPayment).toBeUndefined();
  });

  it('vacancy reduces net income', async () => {
    const noVac = await (handleRentalCalculation as any)(baseInput).json();
    const vac20Input = { ...baseInput, vacancyRate: 20 };
    const vac = await (handleRentalCalculation as any)(vac20Input).json();
    expect(vac.netAnnualIncome).toBeLessThan(noVac.netAnnualIncome);
  });

  it('management fee decreases cash flow', async () => {
    const noFee = await (handleRentalCalculation as any)(baseInput).json();
    const feeInput = { ...baseInput, managementFee: 500 };
    const withFee = await (handleRentalCalculation as any)(feeInput).json();
    expect(withFee.netCashFlow).toBeLessThan(noFee.netCashFlow);
  });

  it('tax amount is positive', async () => {
    const res = await (handleRentalCalculation as any)(baseInput).json();
    expect(res.taxAmount).toBeGreaterThan(0);
  });

  it('ROI positive when rent profitable', async () => {
    const res = await (handleRentalCalculation as any)(baseInput).json();
    expect(res.roi).toBeGreaterThan(0);
  });

  it('negative cash flow when rent too low', async () => {
    const lowRentInput = { ...baseInput, monthlyRent: 500 };
    const res = await (handleRentalCalculation as any)(lowRentInput).json();
    expect(res.netCashFlow).toBeLessThan(0);
  });

  it('cost breakdown includes loan payment when loan exists', async () => {
    const res = await (handleRentalCalculation as any)(baseInput).json();
    const loanItem = res.costBreakdown.find((i: any) => i.name === 'Rata kredytu');
    expect(loanItem).toBeDefined();
  });

  it('cost breakdown omits loan payment for cash purchase', async () => {
    const cashInput = { ...baseInput, downPayment: 500000 };
    const res = await (handleRentalCalculation as any)(cashInput).json();
    const loanItem = res.costBreakdown.find((i: any) => i.name === 'Rata kredytu');
    expect(loanItem).toBeUndefined();
  });
}); 