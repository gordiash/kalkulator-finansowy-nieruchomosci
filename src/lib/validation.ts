import { z } from 'zod';

// Schematy walidacji
export const LoginSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
  timestamp: z.string().optional(),
  userAgent: z.string().min(10, 'Nieprawidłowy User-Agent'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  name: z.string().min(1, 'Imię jest wymagane').max(100, 'Imię jest za długie'),
  timestamp: z.string().optional(),
  userAgent: z.string().min(10, 'Nieprawidłowy User-Agent'),
  screenResolution: z.string().optional(),
  timezone: z.string().optional(),
});

export const ValuationSchema = z.object({
  city: z.string().min(1, 'Miasto jest wymagane'),
  district: z.string().optional(),
  area: z.number().positive('Powierzchnia musi być większa od 0'),
  rooms: z.number().positive('Liczba pokoi musi być większa od 0'),
  floor: z.number().optional(),
  year: z.number().optional(),
  locationTier: z.string().optional(),
  condition: z.string().optional(),
  buildingType: z.string().optional(),
  parking: z.string().optional(),
  finishing: z.string().optional(),
  elevator: z.string().optional(),
  balcony: z.string().optional(),
  orientation: z.string().optional(),
  transport: z.string().optional(),
  totalFloors: z.number().optional(),
});

// Funkcje walidacji
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Hasło musi mieć co najmniej 6 znaków');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną wielką literę');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną małą literę');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną cyfrę');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Usuń potencjalne tagi HTML
    .substring(0, 1000); // Limit długości
}

export function validateNumericInput(value: any, min: number, max: number): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
}

// Walidacja dla kalkulatorów
export const PurchaseInputSchema = z.object({
  propertyPrice: z.number().positive('Cena nieruchomości musi być większa od 0'),
  downPayment: z.number().min(0, 'Wkład własny nie może być ujemny'),
  loanTerm: z.number().min(1, 'Okres kredytowania musi być większy od 0').max(30, 'Okres kredytowania nie może przekraczać 30 lat'),
  interestRate: z.number().min(0, 'Oprocentowanie nie może być ujemne').max(20, 'Oprocentowanie nie może przekraczać 20%'),
  additionalCosts: z.number().min(0, 'Dodatkowe koszty nie mogą być ujemne'),
  monthlyRent: z.number().min(0, 'Czynsz nie może być ujemny'),
  monthlyExpenses: z.number().min(0, 'Miesięczne wydatki nie mogą być ujemne'),
});

export const RentalInputSchema = z.object({
  propertyPrice: z.number().positive('Cena nieruchomości musi być większa od 0'),
  monthlyRent: z.number().positive('Czynsz miesięczny musi być większy od 0'),
  monthlyExpenses: z.number().min(0, 'Miesięczne wydatki nie mogą być ujemne'),
  downPayment: z.number().min(0, 'Wkład własny nie może być ujemny'),
  loanTerm: z.number().min(1, 'Okres kredytowania musi być większy od 0').max(30, 'Okres kredytowania nie może przekraczać 30 lat'),
  interestRate: z.number().min(0, 'Oprocentowanie nie może być ujemne').max(20, 'Oprocentowanie nie może przekraczać 20%'),
  propertyTax: z.number().min(0, 'Podatek od nieruchomości nie może być ujemny'),
  insurance: z.number().min(0, 'Ubezpieczenie nie może być ujemne'),
  maintenance: z.number().min(0, 'Koszty utrzymania nie mogą być ujemne'),
  vacancyRate: z.number().min(0, 'Stopa pustostanów nie może być ujemna').max(100, 'Stopa pustostanów nie może przekraczać 100%'),
});

export const CreditScoreInputSchema = z.object({
  monthlyIncome: z.number().positive('Dochód miesięczny musi być większy od 0'),
  monthlyExpenses: z.number().min(0, 'Wydatki miesięczne nie mogą być ujemne'),
  existingLoans: z.number().min(0, 'Istniejące kredyty nie mogą być ujemne'),
  loanAmount: z.number().positive('Kwota kredytu musi być większa od 0'),
  loanTerm: z.number().min(1, 'Okres kredytowania musi być większy od 0').max(30, 'Okres kredytowania nie może przekraczać 30 lat'),
  interestRate: z.number().min(0, 'Oprocentowanie nie może być ujemne').max(20, 'Oprocentowanie nie może przekraczać 20%'),
}); 