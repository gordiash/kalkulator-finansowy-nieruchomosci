// System walidacji dla kalkulatorów nieruchomości

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  type?: 'number' | 'integer' | 'percentage';
  allowZero?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  value?: number;
}

// Limity dla różnych typów pól
export const VALIDATION_LIMITS = {
  // Kwoty w złotych
  PROPERTY_VALUE: { min: 50000, max: 50000000 }, // 50k - 50M zł
  LOAN_AMOUNT: { min: 10000, max: 45000000 }, // 10k - 45M zł
  MONTHLY_INCOME: { min: 1000, max: 500000 }, // 1k - 500k zł
  MONTHLY_EXPENSES: { min: 0, max: 100000 }, // 0 - 100k zł
  MONTHLY_RENT: { min: 200, max: 50000 }, // 200 - 50k zł
  CREDIT_LIMITS: { min: 0, max: 1000000 }, // 0 - 1M zł
  
  // Procenty
  INTEREST_RATE: { min: 0.1, max: 30 }, // 0.1% - 30%
  DSTI_RATIO: { min: 10, max: 60 }, // 10% - 60%
  COMMISSION: { min: 0, max: 10 }, // 0% - 10%
  
  // Okresy
  LOAN_TERM: { min: 1, max: 40 }, // 1 - 40 lat
  HOUSEHOLD_SIZE: { min: 1, max: 20 }, // 1 - 20 osób
  VACANCY_PERIOD: { min: 0, max: 12 }, // 0 - 12 miesięcy
};

// Definicje pól dla każdego kalkulatora
export const FIELD_DEFINITIONS = {
  // Kalkulator zdolności kredytowej
  CREDIT_SCORE: {
    monthlyIncome: { 
      ...VALIDATION_LIMITS.MONTHLY_INCOME, 
      required: true, 
      type: 'number' as const,
      label: 'Miesięczny dochód głównego kredytobiorcy'
    },
    secondBorrowerIncome: { 
      ...VALIDATION_LIMITS.MONTHLY_INCOME, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Miesięczny dochód drugiego kredytobiorcy'
    },
    monthlyExpenses: { 
      ...VALIDATION_LIMITS.MONTHLY_EXPENSES, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Miesięczne stałe opłaty'
    },
    otherLoans: { 
      ...VALIDATION_LIMITS.MONTHLY_EXPENSES, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Raty innych kredytów'
    },
    creditCardLimits: { 
      ...VALIDATION_LIMITS.CREDIT_LIMITS, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Suma limitów kart kredytowych'
    },
    accountOverdrafts: { 
      ...VALIDATION_LIMITS.CREDIT_LIMITS, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Suma limitów debetowych'
    },
    householdSize: { 
      ...VALIDATION_LIMITS.HOUSEHOLD_SIZE, 
      required: true, 
      type: 'integer' as const,
      label: 'Liczba osób w gospodarstwie'
    },
    loanTerm: { 
      ...VALIDATION_LIMITS.LOAN_TERM, 
      required: true, 
      type: 'integer' as const,
      label: 'Okres kredytowania (lata)'
    },
    interestRate: { 
      ...VALIDATION_LIMITS.INTEREST_RATE, 
      required: true, 
      type: 'number' as const, 
      step: 0.1,
      label: 'Oprocentowanie kredytu (%)'
    },
    dstiRatio: { 
      ...VALIDATION_LIMITS.DSTI_RATIO, 
      required: true, 
      type: 'integer' as const,
      label: 'Wskaźnik DSTI (%)'
    }
  },
  
  // Kalkulator wynajmu
  RENTAL: {
    purchasePrice: { 
      ...VALIDATION_LIMITS.PROPERTY_VALUE, 
      required: true, 
      type: 'number' as const,
      label: 'Cena zakupu'
    },
    monthlyRent: { 
      ...VALIDATION_LIMITS.MONTHLY_RENT, 
      required: true, 
      type: 'number' as const,
      label: 'Miesięczny przychód z najmu'
    },
    transactionCosts: { 
      min: 0, max: 1000000, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Koszty transakcyjne'
    },
    renovationCosts: { 
      min: 0, max: 1000000, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Koszt remontu'
    },
    adminFees: { 
      min: 0, max: 10000, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Czynsz administracyjny'
    },
    utilities: { 
      min: 0, max: 5000, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Media'
    },
    insurance: { 
      min: 0, max: 2000, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Ubezpieczenie'
    },
    otherCosts: { 
      min: 0, max: 5000, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Inne koszty'
    },
    vacancyPeriod: { 
      ...VALIDATION_LIMITS.VACANCY_PERIOD, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Okres pustostanów (miesięcy)'
    },
    downPayment: { 
      min: 0, max: 50000000, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Wkład własny'
    },
    interestRate: { 
      ...VALIDATION_LIMITS.INTEREST_RATE, 
      required: false, 
      type: 'number' as const, 
      step: 0.1, 
      allowZero: true,
      label: 'Oprocentowanie kredytu (%)'
    },
    loanYears: { 
      ...VALIDATION_LIMITS.LOAN_TERM, 
      required: false, 
      type: 'integer' as const, 
      allowZero: true,
      label: 'Okres kredytowania (lata)'
    },
    propertyAppreciation: { 
      min: -10, max: 20, 
      required: false, 
      type: 'number' as const, 
      step: 0.1,
      label: 'Wzrost wartości nieruchomości (%)'
    },
    rentGrowth: { 
      min: -10, max: 20, 
      required: false, 
      type: 'number' as const, 
      step: 0.1,
      label: 'Wzrost czynszu (%)'
    }
  },
  
  // Kalkulator zakupu
  PURCHASE: {
    propertyValue: { 
      ...VALIDATION_LIMITS.PROPERTY_VALUE, 
      required: true, 
      type: 'number' as const,
      label: 'Wartość nieruchomości'
    },
    loanAmount: { 
      ...VALIDATION_LIMITS.LOAN_AMOUNT, 
      required: true, 
      type: 'number' as const,
      label: 'Kwota kredytu'
    },
    loanTerm: { 
      ...VALIDATION_LIMITS.LOAN_TERM, 
      required: true, 
      type: 'integer' as const,
      label: 'Okres kredytowania (lata)'
    },
    bankMargin: { 
      min: 0.1, max: 10, 
      required: true, 
      type: 'number' as const, 
      step: 0.1,
      label: 'Marża banku (%)'
    },
    referenceRate: { 
      min: 0, max: 20, 
      required: true, 
      type: 'number' as const, 
      step: 0.01,
      label: 'Stopa referencyjna (%)'
    },
    bankCommission: { 
      ...VALIDATION_LIMITS.COMMISSION, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Prowizja banku (%)'
    },
    agencyCommission: { 
      ...VALIDATION_LIMITS.COMMISSION, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Prowizja agencji (%)'
    },
    pccTaxRate: { 
      min: 0, max: 5, 
      required: false, 
      type: 'number' as const, 
      allowZero: true,
      label: 'Stawka podatku PCC (%)'
    }
  }
};

/**
 * Waliduje pojedynczą wartość zgodnie z regułami
 */
export function validateField(
  value: string | number, 
  fieldName: string, 
  rules: ValidationRule & { label?: string }
): ValidationResult {
  const errors: ValidationError[] = [];
  const label = rules.label || fieldName;

  // Sprawdź czy pole jest wymagane
  if (rules.required && (!value || value === '')) {
    return {
      isValid: false,
      errors: [{ field: fieldName, message: `${label} jest wymagane` }]
    };
  }

  // Jeśli pole nie jest wymagane i jest puste, jest OK
  if (!rules.required && (!value || value === '')) {
    return { isValid: true, errors: [], value: 0 };
  }

  // Konwertuj do liczby
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Sprawdź czy to poprawna liczba
  if (isNaN(numValue)) {
    return {
      isValid: false,
      errors: [{ field: fieldName, message: `${label} musi być liczbą` }]
    };
  }

  // Sprawdź czy to liczba całkowita (jeśli wymagane)
  if (rules.type === 'integer' && !Number.isInteger(numValue)) {
    errors.push({ field: fieldName, message: `${label} musi być liczbą całkowitą` });
  }

  // Sprawdź wartość minimalną
  if (rules.min !== undefined && numValue < rules.min) {
    if (!rules.allowZero || numValue !== 0) {
      errors.push({ 
        field: fieldName, 
        message: `${label} nie może być mniejsze niż ${rules.min}${rules.type === 'percentage' ? '%' : ''}` 
      });
    }
  }

  // Sprawdź wartość maksymalną
  if (rules.max !== undefined && numValue > rules.max) {
    errors.push({ 
      field: fieldName, 
      message: `${label} nie może być większe niż ${rules.max.toLocaleString('pl-PL')}${rules.type === 'percentage' ? '%' : ''}` 
    });
  }

  // Sprawdź czy zero jest dozwolone
  if (!rules.allowZero && numValue === 0 && rules.required) {
    errors.push({ field: fieldName, message: `${label} musi być większe od zera` });
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: numValue
  };
}

/**
 * Waliduje cały formularz zgodnie z definicjami pól
 */
export function validateForm(
  formData: Record<string, string | number>, 
  fieldDefinitions: Record<string, ValidationRule & { label?: string }>
): { isValid: boolean; errors: Record<string, string>; validatedData: Record<string, number> } {
  const errors: Record<string, string> = {};
  const validatedData: Record<string, number> = {};

  for (const [fieldName, rules] of Object.entries(fieldDefinitions)) {
    const value = formData[fieldName];
    const result = validateField(value, fieldName, rules);
    
    if (!result.isValid) {
      errors[fieldName] = result.errors[0].message;
    } else if (result.value !== undefined) {
      validatedData[fieldName] = result.value;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    validatedData
  };
}

/**
 * Sprawdza logiczne relacje między polami (np. kwota kredytu vs wartość nieruchomości)
 */
export function validateBusinessLogic(
  validatedData: Record<string, number>, 
  calculatorType: 'CREDIT_SCORE' | 'RENTAL' | 'PURCHASE'
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (calculatorType) {
    case 'CREDIT_SCORE':
      // Sprawdź czy DSTI nie jest zbyt wysokie dla niskich dochodów
      if (validatedData.monthlyIncome < 3000 && validatedData.dstiRatio > 40) {
        errors.push({
          field: 'dstiRatio',
          message: 'Dla niskich dochodów zaleca się DSTI maksymalnie 40%'
        });
      }
      break;

    case 'RENTAL':
      // Sprawdź czy czynsz nie jest zbyt niski w stosunku do ceny
      if (validatedData.purchasePrice && validatedData.monthlyRent) {
        const yearlyRent = validatedData.monthlyRent * 12;
        const rentToPrice = (yearlyRent / validatedData.purchasePrice) * 100;
        
        if (rentToPrice < 2) {
          errors.push({
            field: 'monthlyRent',
            message: 'Czynsz wydaje się zbyt niski w stosunku do ceny (poniżej 2% rocznie)'
          });
        }
        if (rentToPrice > 15) {
          errors.push({
            field: 'monthlyRent',
            message: 'Czynsz wydaje się zbyt wysoki w stosunku do ceny (powyżej 15% rocznie)'
          });
        }
      }
      break;

    case 'PURCHASE':
      // Sprawdź czy kwota kredytu nie przekracza wartości nieruchomości
      if (validatedData.loanAmount > validatedData.propertyValue) {
        errors.push({
          field: 'loanAmount',
          message: 'Kwota kredytu nie może być wyższa niż wartość nieruchomości'
        });
      }
      
      // Sprawdź czy wkład własny nie jest zbyt mały
      const downPaymentPercent = ((validatedData.propertyValue - validatedData.loanAmount) / validatedData.propertyValue) * 100;
      if (downPaymentPercent < 10) {
        errors.push({
          field: 'loanAmount',
          message: 'Zalecany wkład własny to minimum 10% wartości nieruchomości'
        });
      }
      break;
  }

  return errors;
}

/**
 * Formatuje liczbę do wyświetlenia w input (usuwa niepotrzebne zera)
 */
export function formatInputValue(value: number | string): string {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  
  // Usuń niepotrzebne zera po przecinku
  return num % 1 === 0 ? num.toString() : num.toString();
}

/**
 * Sanityzuje input - usuwa niedozwolone znaki
 */
export function sanitizeInput(value: string, allowDecimals: boolean = true): string {
  if (!value) return '';
  
  // Usuń wszystko oprócz cyfr, kropki i minus (na początku)
  let sanitized = value.replace(/[^\d.-]/g, '');
  
  // Jeśli nie pozwalamy na miejsca dziesiętne, usuń kropki
  if (!allowDecimals) {
    sanitized = sanitized.replace(/\./g, '');
  }
  
  // Pozwól na tylko jedną kropkę dziesiętną
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Pozwól na minus tylko na początku
  if (sanitized.includes('-')) {
    const hasMinusAtStart = sanitized.startsWith('-');
    sanitized = sanitized.replace(/-/g, '');
    if (hasMinusAtStart) {
      sanitized = '-' + sanitized;
    }
  }
  
  return sanitized;
} 