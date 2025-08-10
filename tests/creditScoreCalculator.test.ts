import { handleCreditScoreCalculation } from '../src/app/api/calculate/route';

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

describe('Credit score calculator', () => {
  const baseInput = {
    calculationType: 'credit-score',
    monthlyIncome: 6000,
    monthlyExpenses: 1000,
    otherLoans: 0,
    householdSize: 1,
    loanTerm: 30,
    interestRate: 7,
    installmentType: 'equal',
    secondBorrowerIncome: 4000,
    employmentType: 'employment',
    creditCardLimits: 10000,
    accountOverdrafts: 0,
    dstiRatio: 50,
  };

  it('returns positive max loan amount for typical input', async () => {
    const { maxLoanAmount } = await (handleCreditScoreCalculation as any)(baseInput).json();
    expect(maxLoanAmount).toBeGreaterThan(0);
  });

  it('lower DSTI ratio reduces loan amount', async () => {
    const base = await (handleCreditScoreCalculation as any)(baseInput).json();
    const lowDst = await (handleCreditScoreCalculation as any)({ ...baseInput, dstiRatio: 30 }).json();
    expect(lowDst.maxLoanAmount).toBeLessThan(base.maxLoanAmount);
  });

  it('larger household size increases reported cost of living', async () => {
    const base = await (handleCreditScoreCalculation as any)(baseInput).json();
    const family = await (handleCreditScoreCalculation as any)({ ...baseInput, householdSize: 4 }).json();
    expect(family.details.costOfLiving).toBeGreaterThan(base.details.costOfLiving);
  });

  it('employment type "contract" gives lower loan amount than "employment"', async () => {
    const base = await (handleCreditScoreCalculation as any)(baseInput).json();
    const contract = await (handleCreditScoreCalculation as any)({ ...baseInput, employmentType: 'contract' }).json();
    expect(contract.maxLoanAmount).toBeLessThan(base.maxLoanAmount);
  });

  it('other loans reduce credit capacity', async () => {
    const base = await (handleCreditScoreCalculation as any)(baseInput).json();
    const loans = await (handleCreditScoreCalculation as any)({ ...baseInput, otherLoans: 2000 }).json();
    expect(loans.maxLoanAmount).toBeLessThan(base.maxLoanAmount);
  });

  it('high credit card limits reduce loan amount', async () => {
    const base = await (handleCreditScoreCalculation as any)(baseInput).json();
    const highCards = await (handleCreditScoreCalculation as any)({ ...baseInput, creditCardLimits: 100000 }).json();
    expect(highCards.maxLoanAmount).toBeLessThan(base.maxLoanAmount);
  });

  it('higher interest rate reduces loan amount', async () => {
    const base = await (handleCreditScoreCalculation as any)(baseInput).json();
    const highRate = await (handleCreditScoreCalculation as any)({ ...baseInput, interestRate: 10 }).json();
    expect(highRate.maxLoanAmount).toBeLessThan(base.maxLoanAmount);
  });

  it('expenses higher than income result in zero credit capacity', async () => {
    const res = await (handleCreditScoreCalculation as any)({
      ...baseInput,
      monthlyIncome: 5000,
      secondBorrowerIncome: 0,
      monthlyExpenses: 6000,
      otherLoans: 0,
    }).json();
    expect(res.creditCapacity).toBe(0);
    expect(res.maxLoanAmount).toBe(0);
  });

  it('decreasing installments give lower loan amount than equal installments', async () => {
    const equal = await (handleCreditScoreCalculation as any)(baseInput).json();
    const decreasing = await (handleCreditScoreCalculation as any)({ ...baseInput, installmentType: 'decreasing' }).json();
    expect(decreasing.maxLoanAmount).toBeLessThan(equal.maxLoanAmount);
  });

  it('stressed interest rate equals input rate plus buffer', async () => {
    const res = await (handleCreditScoreCalculation as any)(baseInput).json();
    expect(res.details.stressedInterestRate).toBeCloseTo(baseInput.interestRate + 2.5, 5);
  });
}); 