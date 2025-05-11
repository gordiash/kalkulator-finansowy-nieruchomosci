import { 
  calculateROI, 
  calculateIRR, 
  calculateNPV, 
  calculateCumulativeCashFlows,
  calculateScenarios 
} from './investmentCalculations';

describe('calculateROI function', () => {
  test('should calculate correct ROI for standard inputs', () => {
    const investment = 1000;
    const cashFlows = [300, 400, 500];
    
    const result = calculateROI(investment, cashFlows);
    
    // Total return is 1200, ROI should be (1200 - 1000) / 1000 * 100 = 20%
    expect(result).toBe(20);
  });
  
  test('should throw error when investment is zero or negative', () => {
    expect(() => {
      calculateROI(0, [100, 200]);
    }).toThrow("Kwota inwestycji musi być większa od zera");
    
    expect(() => {
      calculateROI(-100, [100, 200]);
    }).toThrow("Kwota inwestycji musi być większa od zera");
  });
  
  test('should throw error when cash flows array is empty', () => {
    expect(() => {
      calculateROI(1000, []);
    }).toThrow("Przepływy pieniężne nie mogą być puste");
  });
  
  test('should handle negative cash flows correctly', () => {
    const investment = 1000;
    const cashFlows = [300, -100, 500];
    
    const result = calculateROI(investment, cashFlows);
    
    // Total return is 700, ROI should be (700 - 1000) / 1000 * 100 = -30%
    expect(result).toBe(-30);
  });
});

describe('calculateNPV function', () => {
  test('should calculate correct NPV for standard inputs', () => {
    const investment = 1000;
    const cashFlows = [400, 400, 400];
    const discountRate = 10;
    
    const result = calculateNPV(investment, cashFlows, discountRate);
    
    // NPV = -1000 + 400/(1.1) + 400/(1.1)^2 + 400/(1.1)^3 ≈ 49.21
    expect(result).toBeCloseTo(49.21, 1);
  });
  
  test('should throw error when investment is zero or negative', () => {
    expect(() => {
      calculateNPV(0, [100, 200], 10);
    }).toThrow("Kwota inwestycji musi być większa od zera");
  });
  
  test('should throw error when cash flows array is empty', () => {
    expect(() => {
      calculateNPV(1000, [], 10);
    }).toThrow("Przepływy pieniężne nie mogą być puste");
  });
  
  test('should throw error when discount rate is negative', () => {
    expect(() => {
      calculateNPV(1000, [100, 200], -5);
    }).toThrow("Stopa dyskontowa nie może być ujemna");
  });
  
  test('should handle zero discount rate correctly', () => {
    const investment = 1000;
    const cashFlows = [400, 400, 400];
    const discountRate = 0;
    
    const result = calculateNPV(investment, cashFlows, discountRate);
    
    // Without discounting, NPV = -1000 + 400 + 400 + 400 = 200
    expect(result).toBe(200);
  });
});

describe('calculateIRR function', () => {
  test('should calculate correct IRR for standard inputs', () => {
    const investment = 1000;
    const cashFlows = [500, 500, 500];
    
    const result = calculateIRR(investment, cashFlows);
    
    // Expected IRR around 23.38%
    expect(result).toBeCloseTo(23.38, 1);
  });
  
  test('should return null for impossible IRR', () => {
    const investment = 1000;
    const cashFlows = [100, 100]; // Not enough return to have a positive IRR
    
    const result = calculateIRR(investment, cashFlows);
    
    expect(result).toBeNull();
  });
  
  test('should throw error when investment is zero or negative', () => {
    expect(() => {
      calculateIRR(0, [100, 200]);
    }).toThrow("Kwota inwestycji musi być większa od zera");
  });
  
  test('should throw error when cash flows array is empty', () => {
    expect(() => {
      calculateIRR(1000, []);
    }).toThrow("Przepływy pieniężne nie mogą być puste");
  });
});

describe('calculateCumulativeCashFlows function', () => {
  test('should calculate correct cumulative cash flows for standard inputs', () => {
    const cashFlows = [100, 200, 300];
    
    const result = calculateCumulativeCashFlows(cashFlows);
    
    expect(result).toEqual([100, 300, 600]);
  });
  
  test('should return empty array for empty input', () => {
    const result = calculateCumulativeCashFlows([]);
    
    expect(result).toEqual([]);
  });
  
  test('should handle negative values correctly', () => {
    const cashFlows = [100, -50, 200];
    
    const result = calculateCumulativeCashFlows(cashFlows);
    
    expect(result).toEqual([100, 50, 250]);
  });
});

describe('calculateScenarios function', () => {
  test('should calculate correct scenarios for standard inputs', () => {
    const investment = 1000;
    const cashFlows = [400, 400, 400];
    const discountRate = 10;
    
    const result = calculateScenarios(investment, cashFlows, discountRate);
    
    // Neutral scenario NPV ≈ 49.21
    expect(result.neutral).toBeCloseTo(49.21, 1);
    
    // Pessimistic scenario (80%) NPV
    const pessimisticNPV = calculateNPV(investment, cashFlows.map(flow => flow * 0.8), discountRate);
    expect(result.pessimistic).toBeCloseTo(pessimisticNPV, 1);
    
    // Optimistic scenario (120%) NPV
    const optimisticNPV = calculateNPV(investment, cashFlows.map(flow => flow * 1.2), discountRate);
    expect(result.optimistic).toBeCloseTo(optimisticNPV, 1);
  });
  
  test('should throw error when investment is zero or negative', () => {
    expect(() => {
      calculateScenarios(0, [100, 200], 10);
    }).toThrow("Kwota inwestycji musi być większa od zera");
  });
  
  test('should throw error when cash flows array is empty', () => {
    expect(() => {
      calculateScenarios(1000, [], 10);
    }).toThrow("Przepływy pieniężne nie mogą być puste");
  });
  
  test('should throw error when discount rate is negative', () => {
    expect(() => {
      calculateScenarios(1000, [100, 200], -5);
    }).toThrow("Stopa dyskontowa nie może być ujemna");
  });
}); 