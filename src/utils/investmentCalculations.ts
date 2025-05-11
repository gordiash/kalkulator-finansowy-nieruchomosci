/**
 * Oblicza zwrot z inwestycji (ROI - Return on Investment)
 * @param investment - kwota inwestycji początkowej
 * @param cashFlows - tablica przepływów pieniężnych
 * @returns wartość ROI wyrażona w procentach
 */
export const calculateROI = (investment: number, cashFlows: number[]): number => {
  if (investment <= 0) throw new Error("Kwota inwestycji musi być większa od zera");
  if (cashFlows.length === 0) throw new Error("Przepływy pieniężne nie mogą być puste");
  
  const totalReturn = cashFlows.reduce((acc, flow) => acc + flow, 0);
  return ((totalReturn - investment) / investment) * 100;
};

/**
 * Oblicza wewnętrzną stopę zwrotu (IRR - Internal Rate of Return)
 * @param investment - kwota inwestycji początkowej
 * @param cashFlows - tablica przepływów pieniężnych
 * @returns wartość IRR wyrażona w procentach lub null jeśli nie można obliczyć
 */
export const calculateIRR = (investment: number, cashFlows: number[]): number | null => {
  if (investment <= 0) throw new Error("Kwota inwestycji musi być większa od zera");
  if (cashFlows.length === 0) throw new Error("Przepływy pieniężne nie mogą być puste");
  
  // Implementacja metody Newtona-Raphsona do obliczania IRR
  const maxIterations = 1000;
  const precision = 1e-6;
  
  // Funkcja do obliczania NPV dla danej stopy
  const calculateNPVForRate = (rate: number): number => {
    return cashFlows.reduce(
      (acc, flow, t) => acc + flow / Math.pow(1 + rate, t + 1),
      -investment
    );
  };
  
  // Funkcja do obliczania pochodnej NPV dla danej stopy
  const calculateDerivative = (rate: number): number => {
    return cashFlows.reduce(
      (acc, flow, t) => acc - (t + 1) * flow / Math.pow(1 + rate, t + 2),
      0
    );
  };
  
  let currentRate = 0.1; // Początkowe przybliżenie
  
  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPVForRate(currentRate);
    const derivative = calculateDerivative(currentRate);
    
    // Zabezpieczenie przed dzieleniem przez zero
    if (Math.abs(derivative) < precision) {
      return null;
    }
    
    const newRate = currentRate - npv / derivative;
    
    if (Math.abs(newRate - currentRate) < precision) {
      return newRate * 100;
    }
    
    currentRate = newRate;
  }
  
  return null; // Nie udało się osiągnąć zbieżności
};

/**
 * Oblicza wartość bieżącą netto (NPV - Net Present Value)
 * @param investment - kwota inwestycji początkowej
 * @param cashFlows - tablica przepływów pieniężnych
 * @param discountRate - stopa dyskontowa wyrażona w procentach
 * @returns wartość NPV
 */
export const calculateNPV = (investment: number, cashFlows: number[], discountRate: number): number => {
  if (investment <= 0) throw new Error("Kwota inwestycji musi być większa od zera");
  if (cashFlows.length === 0) throw new Error("Przepływy pieniężne nie mogą być puste");
  if (discountRate < 0) throw new Error("Stopa dyskontowa nie może być ujemna");
  
  return cashFlows.reduce(
    (acc, flow, t) => acc + flow / Math.pow(1 + discountRate / 100, t + 1),
    -investment
  );
};

/**
 * Oblicza skumulowane przepływy pieniężne
 * @param cashFlows - tablica przepływów pieniężnych
 * @returns tablica ze skumulowanymi przepływami
 */
export const calculateCumulativeCashFlows = (cashFlows: number[]): number[] => {
  if (cashFlows.length === 0) return [];
  
  return cashFlows.reduce<number[]>((acc, flow, index) => {
    acc.push((acc[index - 1] || 0) + flow);
    return acc;
  }, []);
};

/**
 * Oblicza scenariusze NPV (pesymistyczny, neutralny, optymistyczny)
 * @param investment - kwota inwestycji początkowej
 * @param cashFlows - tablica przepływów pieniężnych
 * @param discountRate - stopa dyskontowa wyrażona w procentach
 * @returns obiekt zawierający trzy scenariusze NPV
 */
export const calculateScenarios = (investment: number, cashFlows: number[], discountRate: number) => {
  if (investment <= 0) throw new Error("Kwota inwestycji musi być większa od zera");
  if (cashFlows.length === 0) throw new Error("Przepływy pieniężne nie mogą być puste");
  if (discountRate < 0) throw new Error("Stopa dyskontowa nie może być ujemna");
  
  const pessimisticCashFlows = cashFlows.map(flow => flow * 0.8);
  const neutralCashFlows = cashFlows;
  const optimisticCashFlows = cashFlows.map(flow => flow * 1.2);

  const pessimisticNPV = calculateNPV(investment, pessimisticCashFlows, discountRate);
  const neutralNPV = calculateNPV(investment, neutralCashFlows, discountRate);
  const optimisticNPV = calculateNPV(investment, optimisticCashFlows, discountRate);

  return {
    pessimistic: pessimisticNPV,
    neutral: neutralNPV,
    optimistic: optimisticNPV
  };
}; 