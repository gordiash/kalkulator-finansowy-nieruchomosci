/**
 * Calculates the Return on Investment (ROI).
 * @param investment Initial investment amount.
 * @param cashFlows Array of cash flows.
 * @returns ROI as a percentage.
 */
export const calculateROI = (investment: number, cashFlows: number[]): number => {
  const totalReturn = cashFlows.reduce((acc, flow) => acc + flow, 0);
  return ((totalReturn - investment) / investment) * 100;
};

/**
 * Calculates the Net Present Value (NPV).
 * @param investment Initial investment amount.
 * @param cashFlows Array of cash flows.
 * @param discountRate Discount rate as a percentage.
 * @returns NPV value.
 */
export const calculateNPV = (
  investment: number,
  cashFlows: number[],
  discountRate: number
): number => {
  return cashFlows.reduce(
    (acc, flow, t) => acc + flow / Math.pow(1 + discountRate / 100, t + 1),
    -investment
  );
};

/**
 * Calculates the Internal Rate of Return (IRR).
 * @param investment Initial investment amount.
 * @param cashFlows Array of cash flows.
 * @returns IRR as a percentage or null if calculation fails.
 */
export const calculateIRR = (
  investment: number,
  cashFlows: number[]
): number | null => {
  let rate = 0.1; // Initial guess
  const maxIterations = 1000;
  const precision = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    const npv = cashFlows.reduce(
      (acc, flow, t) => acc + flow / Math.pow(1 + rate, t + 1),
      -investment
    );
    const derivative = cashFlows.reduce(
      (acc, flow, t) => acc - (t + 1) * flow / Math.pow(1 + rate, t + 2),
      0
    );

    const newRate = rate - npv / derivative;
    if (Math.abs(newRate - rate) < precision) {
      return newRate * 100;
    }
    rate = newRate;
  }

  return null; // IRR calculation failed
};