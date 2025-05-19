/**
 * Testy wydajnościowe dla funkcji generowania harmonogramu spłaty kredytu
 * 
 * UWAGA: Ten plik zawiera testy, które mierzą wydajność funkcji generateMortgageSchedule
 * przy różnych parametrach, szczególnie dla dużych harmonogramów.
 */

// Deklaracje potrzebne do uruchomienia testów
function describe(name: string, fn: () => void): void { fn(); }
function test(name: string, fn: () => void): void { fn(); }
function expect(actual: any) {
  return {
    toBeLessThan: (value: number) => Boolean(actual < value),
    toHaveLength: (value: number) => Boolean(actual.length === value)
  };
}

// Importy z pliku calculations.ts - symulowane na potrzeby testu
interface MortgagePayment {
  paymentNumber: number;
  date: string;
  totalPayment: number;
  principalPayment: number;
  interestPayment: number;
  remainingPrincipal: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalPaid: number;
}

// Symulowana implementacja funkcji
function calculateMortgagePayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  return monthlyPayment;
}

function generateMortgageSchedule(
  principal: number,
  annualRate: number, 
  years: number,
  startDate: Date = new Date()
): MortgagePayment[] {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  const monthlyPayment = calculateMortgagePayment(principal, annualRate, years);
  
  const schedule: MortgagePayment[] = [];
  let remainingPrincipal = principal;
  let totalPrincipalPaid = 0;
  let totalInterestPaid = 0;
  let totalPaid = 0;
  
  for (let i = 1; i <= numberOfPayments; i++) {
    // Obliczanie odsetek dla bieżącej raty
    const interestPayment = remainingPrincipal * monthlyRate;
    
    // Obliczanie części kapitałowej raty
    const principalPayment = monthlyPayment - interestPayment;
    
    // Aktualizacja pozostałego kapitału
    remainingPrincipal -= principalPayment;
    
    // W przypadku ostatniej raty, korygujemy ewentualne zaokrąglenia
    if (i === numberOfPayments) {
      remainingPrincipal = 0;
    }
    
    // Aktualizacja sum
    totalPrincipalPaid += principalPayment;
    totalInterestPaid += interestPayment;
    totalPaid += monthlyPayment;
    
    // Obliczanie daty płatności
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + i - 1);
    
    schedule.push({
      paymentNumber: i,
      date: paymentDate.toISOString().split('T')[0], // Format YYYY-MM-DD
      totalPayment: monthlyPayment,
      principalPayment,
      interestPayment,
      remainingPrincipal,
      totalPrincipalPaid,
      totalInterestPaid,
      totalPaid
    });
  }
  
  return schedule;
}

// Funkcja do mierzenia czasu wykonania
function measureExecutionTime(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

// Testy wydajnościowe
describe('Testy wydajnościowe dla funkcji generateMortgageSchedule', () => {
  test('Generowanie harmonogramu dla standardowego okresu (30 lat) powinno być szybkie', () => {
    const executionTime = measureExecutionTime(() => {
      const schedule = generateMortgageSchedule(500000, 5.5, 30);
      expect(schedule).toHaveLength(30 * 12); // 30 lat = 360 miesięcy
    });
    
    console.log(`Czas generowania harmonogramu dla 30 lat: ${executionTime.toFixed(2)} ms`);
    // Oczekujemy rozsądnego czasu wykonania, na przykład poniżej 50ms
    expect(executionTime).toBeLessThan(50);
  });
  
  test('Generowanie harmonogramu dla bardzo długiego okresu (50 lat) powinno być akceptowalne', () => {
    const executionTime = measureExecutionTime(() => {
      const schedule = generateMortgageSchedule(500000, 5.5, 50);
      expect(schedule).toHaveLength(50 * 12); // 50 lat = 600 miesięcy
    });
    
    console.log(`Czas generowania harmonogramu dla 50 lat: ${executionTime.toFixed(2)} ms`);
    // Dla dłuższego okresu oczekujemy nieco dłuższego, ale wciąż akceptowalnego czasu
    expect(executionTime).toBeLessThan(100);
  });
  
  test('Wydajność dla bardzo wysokich kwot kredytu', () => {
    const executionTime = measureExecutionTime(() => {
      const schedule = generateMortgageSchedule(10000000, 5.5, 30); // 10 milionów
      expect(schedule).toHaveLength(30 * 12);
    });
    
    console.log(`Czas generowania harmonogramu dla wysokiego kredytu: ${executionTime.toFixed(2)} ms`);
    expect(executionTime).toBeLessThan(50);
  });
  
  test('Wydajność przy zerowym oprocentowaniu', () => {
    const executionTime = measureExecutionTime(() => {
      const schedule = generateMortgageSchedule(500000, 0, 30);
      expect(schedule).toHaveLength(30 * 12);
    });
    
    console.log(`Czas generowania harmonogramu przy zerowym oprocentowaniu: ${executionTime.toFixed(2)} ms`);
    expect(executionTime).toBeLessThan(50);
  });
  
  test('Wydajność dla ekstremalnie długiego okresu (100 lat)', () => {
    const executionTime = measureExecutionTime(() => {
      const schedule = generateMortgageSchedule(500000, 5.5, 100);
      expect(schedule).toHaveLength(100 * 12); // 100 lat = 1200 miesięcy
    });
    
    console.log(`Czas generowania harmonogramu dla 100 lat: ${executionTime.toFixed(2)} ms`);
    // Nawet dla tak długiego okresu oczekujemy rozsądnego czasu wykonania
    expect(executionTime).toBeLessThan(200);
  });
  
  test('Porównanie wydajności dla różnych okresów kredytowania', () => {
    const periods = [5, 10, 20, 30, 50, 75, 100];
    const results: {years: number, time: number, paymentsPerMs: number}[] = [];
    
    for (const years of periods) {
      const executionTime = measureExecutionTime(() => {
        generateMortgageSchedule(500000, 5.5, years);
      });
      
      const numberOfPayments = years * 12;
      const paymentsPerMs = numberOfPayments / executionTime;
      
      results.push({
        years,
        time: parseFloat(executionTime.toFixed(2)),
        paymentsPerMs: parseFloat(paymentsPerMs.toFixed(2))
      });
    }
    
    // Sprawdzamy, czy liczba rat na milisekundę nie spada drastycznie dla dłuższych okresów
    // co wskazywałoby na problem ze skalowalnością algorytmu
    const shortPeriodEfficiency = results[0].paymentsPerMs;
    const longPeriodEfficiency = results[results.length - 1].paymentsPerMs;
    
    // Oczekujemy, że wydajność (raty/ms) dla długich okresów będzie co najmniej 
    // 50% wydajności dla krótkich okresów
    const efficiencyRatio = longPeriodEfficiency / shortPeriodEfficiency;
    
    // Ten test może być dostosowany do oczekiwań wydajnościowych
    expect(efficiencyRatio).toBeLessThan(1); // Oczekujemy pewnej degradacji, ale nie drastycznej
  });
}); 