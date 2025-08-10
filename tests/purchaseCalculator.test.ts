// Minimalny mock Next.js runtime do środowiska testowego
jest.mock('next/server', () => {
  return {
    NextRequest: class {},
    NextResponse: {
      json: (body: any, init?: { status?: number; headers?: Record<string, string> }) => {
        return {
          json: async () => body,
          status: init?.status ?? 200,
          headers: init?.headers ?? {},
        } as unknown as Response;
      },
    },
  };
});

import { handlePurchaseCalculation } from '../src/app/api/calculate/route';

describe('Purchase calculator', () => {
  it('scenario without overpayment', async () => {
    const response = (handlePurchaseCalculation as any)({
      propertyValue: 500000,
      loanAmount: 400000,
      loanTerm: 30,
      bankMargin: 2.1,
      referenceRate: 5.85,
      installmentType: 'equal',
      overpaymentAmount: 0,
    });

    // NextResponse dziedziczy po Response – mamy metodę json()
    const { calculationResults: result } = await (response as Response).json();

    // Pierwsza rata powinna wynosić ok. 2 921 zł
    expect(result.firstInstallment).toBeCloseTo(2921, 0);

    // Suma odsetek ~652 000 zł (zaokrąglamy do tysięcy)
    expect(Math.round(result.totalInterest / 1000)).toBeCloseTo(652, 0);
  });

  it('overpayment – shorten period', async () => {
    const response = (handlePurchaseCalculation as any)({
      propertyValue: 500000,
      loanAmount: 400000,
      loanTerm: 30,
      bankMargin: 2.1,
      referenceRate: 5.85,
      installmentType: 'equal',
      overpaymentAmount: 1000, // 1 000 zł nadpłaty co miesiąc
      overpaymentFrequency: 'monthly',
      overpaymentTarget: 'shorten-period',
    });

    const { calculationResults: result } = await (response as Response).json();

    expect(result.overpaymentResults).not.toBeNull();
    expect(result.overpaymentResults.monthsShortened).toBeGreaterThan(0);
    expect(result.overpaymentResults.savedInterest).toBeGreaterThan(0);
    expect(result.overpaymentResults.newLoanTerm).toBeLessThan(result.baseSchedule.length);
  });

  it('overpayment – reduce payment + rate simulation', async () => {
    const response = (handlePurchaseCalculation as any)({
      propertyValue: 500000,
      loanAmount: 400000,
      loanTerm: 30,
      bankMargin: 2.1,
      referenceRate: 5.85,
      installmentType: 'equal',
      overpaymentAmount: 1000,
      overpaymentFrequency: 'monthly',
      overpaymentTarget: 'reduce-payment',
      referenceRateChange: 1.0, // symulacja +1 p.p.
    });

    const { calculationResults: result } = await (response as Response).json();

    // Nadpłata obniżająca ratę nie powinna skracać okresu
    expect(result.overpaymentResults.monthsShortened).toBe(0);

    // Rata po nadpłacie powinna być niższa niż w bazowym harmonogramie
    const baseFirst = result.baseSchedule[0].totalPayment;
    expect(result.firstInstallment).toBeLessThan(baseFirst);

    // Symulacja wzrostu stóp procentowych
    expect(result.simulationResults).not.toBeNull();
    expect(result.simulationResults.newFirstInstallment).toBeGreaterThan(result.firstInstallment);
  });

  it('decreasing installments without overpayment', async () => {
    const response = (handlePurchaseCalculation as any)({
      propertyValue: 400000,
      loanAmount: 300000,
      loanTerm: 20,
      bankMargin: 2.0,
      referenceRate: 5.0,
      installmentType: 'decreasing',
      overpaymentAmount: 0,
    });

    const { calculationResults: result } = await (response as Response).json();

    // Harmonogram powinien mieć pełne 240 miesięcy
    expect(result.schedule.length).toBe(20 * 12);

    // Pierwsza rata większa niż ostatnia przy ratach malejących
    const first = result.schedule[0].totalPayment;
    const last = result.schedule[result.schedule.length - 1].totalPayment;
    expect(first).toBeGreaterThan(last);
  });

  it('one-time overpayment shorten period', async () => {
    const response = (handlePurchaseCalculation as any)({
      propertyValue: 600000,
      loanAmount: 450000,
      loanTerm: 25,
      bankMargin: 2.3,
      referenceRate: 5.3,
      installmentType: 'equal',
      overpaymentAmount: 20000,
      overpaymentFrequency: 'one-time',
      overpaymentStartMonth: 1,
      overpaymentTarget: 'shorten-period',
    });

    const { calculationResults: result } = await (response as Response).json();

    // Nadpłata skracająca okres – oczekujemy skrócenia harmonogramu
    expect(result.overpaymentResults.monthsShortened).toBeGreaterThan(0);

    // Pierwsza rata (z nadpłatą) powinna być wyższa od bazowej pierwszej raty
    const baseFirst = result.baseSchedule[0].totalPayment;
    expect(result.firstInstallment).toBeGreaterThan(baseFirst);
  });

  it('initial costs and commissions calculated correctly', async () => {
    const response = (handlePurchaseCalculation as any)({
      propertyValue: 500000,
      loanAmount: 400000,
      loanTerm: 25,
      bankMargin: 2.0,
      referenceRate: 5.0,
      installmentType: 'equal',
      // Koszty
      bankCommission: 2, // %
      agencyCommission: 1, // %
      notaryFeeType: 'custom',
      customNotaryFee: 1234,
      // pozostale pola
    });

    const { calculationResults: r } = await (response as Response).json();

    expect(r.notaryFee).toBe(1234);
    expect(r.bankCommissionAmount).toBeCloseTo(8000, 0); // 400k * 2%
    expect(r.agencyCommissionAmount).toBeCloseTo(5000, 0); // 500k *1%
    expect(r.pccTax).toBeCloseTo(10000, 0); // 500k*2%
    expect(r.courtFees).toBe(350);
  });

  it('bridge insurance increases initial installments', async () => {
    const baseResp = (handlePurchaseCalculation as any)({
      propertyValue: 400000,
      loanAmount: 300000,
      loanTerm: 25,
      bankMargin: 2.1,
      referenceRate: 5.0,
      installmentType: 'equal',
      overpaymentAmount: 0,
    });

    const bridgeResp = (handlePurchaseCalculation as any)({
      propertyValue: 400000,
      loanAmount: 300000,
      loanTerm: 25,
      bankMargin: 2.1,
      referenceRate: 5.0,
      installmentType: 'equal',
      bridgeInsuranceMonths: 12,
      bridgeInsuranceMarginIncrease: 1.5, // +1.5 p.p.
    });

    const { calculationResults: baseRes } = await (baseResp as Response).json();
    const { calculationResults: bridgeRes } = await (bridgeResp as Response).json();

    expect(bridgeRes.firstInstallment).toBeGreaterThan(baseRes.firstInstallment);
    // Po zakończeniu 12 miesięcy rata powinna spaść – 13. rata mniejsza od pierwszej
    const installment13 = bridgeRes.schedule[12].totalPayment;
    expect(installment13).toBeLessThan(bridgeRes.firstInstallment);
  });
}); 