import { z } from 'zod';
import { creditCapacitySchema, purchaseCostsSchema } from './schemas';

function toDecimalRate(rate: number): number {
  return rate > 1 ? rate / 100 : rate;
}

export async function calculateCreditCapacity(input: unknown) {
  const obj = typeof input === 'object' && input ? { ...(input as any) } : {};
  // Synonimy / mapowanie pól
  if (obj.salary && !obj.income) obj.income = obj.salary;
  if (obj.monthlyIncome && !obj.income) obj.income = obj.monthlyIncome;
  if (obj.zarobki && !obj.income) obj.income = obj.zarobki;
  if (obj.dochod && !obj.income) obj.income = obj.dochod;
  if (obj.wynagrodzenie && !obj.income) obj.income = obj.wynagrodzenie;
  if (obj.pensja && !obj.income) obj.income = obj.pensja;
  
  if (obj.debts && !obj.liabilities) obj.liabilities = obj.debts;
  if (obj.zobowiazania && !obj.liabilities) obj.liabilities = obj.zobowiazania;
  if (obj.expenses && !obj.liabilities) obj.liabilities = obj.expenses; // mapowanie expenses -> liabilities
  if (obj.koszty && !obj.liabilities) obj.liabilities = obj.koszty;
  if (obj.wydatki && !obj.liabilities) obj.liabilities = obj.wydatki;
  if (obj.raty && !obj.liabilities) obj.liabilities = obj.raty;
  
  if (obj.rate && !obj.interestRate) obj.interestRate = obj.rate;
  if (obj.percent && !obj.interestRate) obj.interestRate = obj.percent;
  if (obj.oprocentowanie && !obj.interestRate) obj.interestRate = obj.oprocentowanie;
  if (obj.stopa && !obj.interestRate) obj.interestRate = obj.stopa;
  
  if (obj.years && !obj.termYears) obj.termYears = obj.years;
  if (obj.lata && !obj.termYears) obj.termYears = obj.lata;
  if (obj.okres && !obj.termYears) obj.termYears = obj.okres;
  
  // Domyślne wartości jeśli nie podano
  if (!obj.interestRate) obj.interestRate = 7.5; // 7.5% rocznie - aktualna średnia
  if (!obj.termYears) obj.termYears = 25; // 25 lat - standardowy okres
  if (!obj.liabilities) obj.liabilities = 0; // brak zobowiązań
  
  // Koercja tekstów na liczby
  const toNum = (v: any) => typeof v === 'string' ? Number(v.replace(/[^0-9.,-]/g, '').replace(',', '.')) : v;
  obj.income = toNum(obj.income);
  obj.liabilities = toNum(obj.liabilities ?? 0);
  obj.interestRate = toNum(obj.interestRate);
  obj.termYears = Number(obj.termYears);
  const data = creditCapacitySchema.parse(obj);
  const r = toDecimalRate(data.interestRate) / 12;
  const n = data.termYears * 12;
  // Prosty model: maks. rata = 40% (income - liabilities)
  const disposable = Math.max(0, data.income - (data.liabilities ?? 0));
  const maxInstallment = 0.4 * disposable;
  // Odwrotność wzoru annuitetowego: P = A * (1 - (1+r)^-n) / r
  const principal = r > 0 ? maxInstallment * (1 - Math.pow(1 + r, -n)) / r : maxInstallment * n;
  return { maxMonthlyInstallment: Math.round(maxInstallment), maxLoanAmount: Math.round(principal) };
}

export async function calculatePurchaseCosts(input: unknown) {
  const obj = typeof input === 'object' && input ? { ...(input as any) } : {};
  // Synonimy / mapowanie pól
  if (obj.propertyValue && !obj.price) obj.price = obj.propertyValue;
  if (obj.amount && !obj.price) obj.price = obj.amount;
  if (obj.value && !obj.price) obj.price = obj.value;
  if (obj.kwota && !obj.price) obj.price = obj.kwota;
  if (obj.cena && !obj.price) obj.price = obj.cena;
  if (obj.wartosc && !obj.price) obj.price = obj.wartosc;
  if (obj.koszt && !obj.price) obj.price = obj.koszt;
  if (obj.priceValue && !obj.price) obj.price = obj.priceValue;
  if (obj.propertyPrice && !obj.price) obj.price = obj.propertyPrice;
  if (typeof obj.market === 'string') {
    const m = obj.market.toLowerCase();
    if (/(wtorny|wtórny)/.test(m)) obj.market = 'secondary';
    if (/(pierwotny)/.test(m)) obj.market = 'primary';
  }
  if (obj.rynek && !obj.market) {
    const m = String(obj.rynek).toLowerCase();
    obj.market = /(wtorny|wtórny)/.test(m) ? 'secondary' : 'primary';
  }
  if (obj.typ && !obj.market) {
    const m = String(obj.typ).toLowerCase();
    obj.market = /(wtorny|wtórny)/.test(m) ? 'secondary' : 'primary';
  }
  if (obj.rodzaj && !obj.market) {
    const m = String(obj.rodzaj).toLowerCase();
    obj.market = /(wtorny|wtórny)/.test(m) ? 'secondary' : 'primary';
  }
  if (obj.kredyt !== undefined && obj.mortgage === undefined) obj.mortgage = !!obj.kredyt;
  if (obj.hipoteka !== undefined && obj.mortgage === undefined) obj.mortgage = !!obj.hipoteka;
  
  // Domyślne wartości jeśli nie podano
  if (!obj.market) obj.market = 'secondary'; // domyślnie rynek wtórny
  if (obj.mortgage === undefined) obj.mortgage = false; // domyślnie bez hipoteki
  
  // Koercja tekstu na liczbę
  const toNum = (v: any) => typeof v === 'string' ? Number(v.replace(/[^0-9.,-]/g, '').replace(',', '.')) : v;
  obj.price = toNum(obj.price);
  const data = purchaseCostsSchema.parse(obj);
  const tax = data.market === 'secondary' ? 0.02 * data.price : 0; // PCC 2%
  const notary = Math.min(10000, Math.max(1000, 0.005 * data.price));
  const registry = 200;
  const mortgageFee = data.mortgage ? 200 : 0;
  const total = Math.round(tax + notary + registry + mortgageFee);
  return { tax, notary, registry, mortgageFee, total };
}

export async function toolDispatcher(name: string, payload: unknown) {
  switch (name) {
    case 'calculateCreditCapacity':
      return calculateCreditCapacity(payload);
    case 'calculatePurchaseCosts':
      return calculatePurchaseCosts(payload);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}


