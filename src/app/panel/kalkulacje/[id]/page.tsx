'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Słownik tłumaczeń i formaterów dla różnych typów kalkulacji
const FIELD_DEFINITIONS: { [key: string]: { label: string; format?: (value: any) => string; order: number } } = {
  // Dane wejściowe wyceny
  city: { label: 'Miasto', order: 1 },
  district: { label: 'Dzielnica', order: 2 },
  street: { label: 'Ulica', order: 3 },
  area: { label: 'Powierzchnia', format: (v) => `${v} m²`, order: 4 },
  rooms: { label: 'Liczba pokoi', order: 5 },
  floor: { label: 'Piętro', order: 6 },
  totalFloors: { label: 'Liczba pięter w budynku', order: 7 },
  year: { label: 'Rok budowy', order: 8 },
  lastRenovation: { label: 'Rok ostatniego remontu', order: 9 },
  locationTier: { label: 'Klasa lokalizacji', format: (v: string) => ({ premium: 'Premium', standard: 'Standard', budget: 'Budżetowa' }[v] || v), order: 10 },
  condition: { label: 'Stan mieszkania', format: (v: string) => ({ new: 'Nowe', good: 'Dobry', 'to_renovate': 'Do remontu' }[v] || v), order: 11 },
  buildingType: { label: 'Typ budynku', format: (v: string) => ({ blok: 'Blok', kamienica: 'Kamienica', apartamentowiec: 'Apartamentowiec' }[v] || v), order: 12 },
  buildingMaterial: { label: 'Materiał budynku', format: (v: string) => ({ brick: 'Cegła', 'brick_concrete': 'Cegła/Beton', 'wielka_plyta': 'Wielka płyta', other: 'Inny' }[v] || v), order: 13 },
  parking: { label: 'Miejsce parkingowe', format: (v: string) => ({ garage: 'Garaż', dedicated: 'Dedykowane', street: 'Przy ulicy', none: 'Brak' }[v] || v), order: 14 },
  finishing: { label: 'Standard wykończenia', format: (v: string) => ({ high: 'Wysoki', standard: 'Standard', basic: 'Podstawowy' }[v] || v), order: 15 },
  elevator: { label: 'Winda', format: (v) => v === 'yes' ? 'Tak' : 'Nie', order: 16 },
  balcony: { label: 'Balkon/Taras', format: (v) => v === 'yes' ? 'Tak' : 'Nie', order: 17 },
  balconyArea: { label: 'Powierzchnia balkonu', format: (v) => `${v} m²`, order: 18 },
  orientation: { label: 'Ekspozycja okien', format: (v: string) => ({ north: 'Północ', south: 'Południe', east: 'Wschód', west: 'Zachód' }[v] || v), order: 19 },
  transport: { label: 'Dostęp do transportu', format: (v: string) => ({ excellent: 'Doskonały', good: 'Dobry', medium: 'Średni', poor: 'Słaby' }[v] || v), order: 20 },
  heating: { label: 'Ogrzewanie', format: (v: string) => ({ central: 'Miejskie', gas: 'Gazowe', electric: 'Elektryczne' }[v] || v), order: 21 },
  bathrooms: { label: 'Liczba łazienek', order: 22 },
  kitchenType: { label: 'Typ kuchni', format: (v: string) => ({ separate: 'Oddzielna', kitchenette: 'Aneks', open: 'Otwarta' }[v] || v), order: 23 },
  basement: { label: 'Piwnica/Komórka', format: (v: string) => v === 'basement' ? 'Tak' : 'Nie', order: 24 },
  ownership: { label: 'Forma własności', format: (v: string) => ({ full: 'Pełna własność', cooperative: 'Spółdzielcze' }[v] || v), order: 25 },
  
  // Dane wejściowe zakupu nieruchomości
  propertyValue: { label: 'Wartość nieruchomości', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v), order: 1 },
  loanAmount: { label: 'Kwota kredytu', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v), order: 2 },
  loanTerm: { label: 'Okres kredytowania', format: (v) => `${v} lat`, order: 3 },
  bankMargin: { label: 'Marża banku', format: (v) => `${v}%`, order: 4 },
  referenceRate: { label: 'Stopa referencyjna', format: (v) => `${v}%`, order: 5 },
  installmentType: { label: 'Typ rat', format: (v: string) => ({ equal: 'Równe', decreasing: 'Malejące' }[v] || v), order: 6 },
  bankCommission: { label: 'Prowizja banku', format: (v) => `${v}%`, order: 7 },
  agencyCommission: { label: 'Prowizja agencji', format: (v) => `${v}%`, order: 8 },
  pcctaxRate: { label: 'Stawka PCC', format: (v) => `${v}%`, order: 9 },
  notaryFeeType: { label: 'Typ taksy notarialnej', format: (v: string) => ({ max: 'Maksymalna', custom: 'Własna' }[v] || v), order: 10 },
  customNotaryFee: { label: 'Własna taksa notarialna', format: (v) => v ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v) : 'Brak', order: 11 },
  referenceRateChange: { label: 'Zmiana stopy referencyjnej', format: (v) => `${v}%`, order: 12 },
  bridgeInsuranceMonths: { label: 'Okres ubezpieczenia pomostowego', format: (v) => `${v} miesięcy`, order: 13 },
  bridgeInsuranceMarginIncrease: { label: 'Zwiększenie marży pomostowej', format: (v) => `${v}%`, order: 14 },
  overpaymentAmount: { label: 'Kwota nadpłaty', format: (v) => v > 0 ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v) : 'Brak', order: 15 },
  overpaymentFrequency: { label: 'Częstotliwość nadpłat', format: (v: string) => ({ 'one-time': 'Jednorazowa', monthly: 'Miesięczna', yearly: 'Roczna' }[v] || v), order: 16 },
  overpaymentStartMonth: { label: 'Miesiąc rozpoczęcia nadpłat', format: (v) => `${v}`, order: 17 },
  overpaymentTarget: { label: 'Cel nadpłat', format: (v: string) => ({ 'shorten-period': 'Skrócenie okresu', 'reduce-payment': 'Obniżenie rat' }[v] || v), order: 18 },
  overpaymentInterval: { label: 'Interwał nadpłat', format: (v) => `${v}`, order: 19 },
  
  // Wyniki wyceny
  price: { label: 'Szacowana wartość', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 }).format(v), order: 1 },
  minPrice: { label: 'Cena minimalna', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 }).format(v), order: 2 },
  maxPrice: { label: 'Cena maksymalna', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 }).format(v), order: 3 },
  currency: { label: 'Waluta', order: 4 },
  method: { label: 'Metoda wyceny', order: 5 },
  confidence: { label: 'Poziom ufności', format: (v) => `${v}`, order: 6 },
  note: { label: 'Uwagi', order: 7 },
  timestamp: { label: 'Data wyceny', format: (v) => new Date(v).toLocaleString('pl-PL'), order: 8 },
  
  // Wyniki zakupu nieruchomości
  pcctax: { label: 'Podatek PCC', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v), order: 1 },
  notaryFee: { label: 'Taksa notarialna', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v), order: 2 },
  bankCommissionAmount: { label: 'Prowizja banku', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v), order: 3 },
  courtFees: { label: 'Opłaty sądowe', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v), order: 4 },
  agencyCommissionAmount: { label: 'Prowizja agencji', format: (v) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v), order: 5 },
  schedule: { label: 'Harmonogram spłat', order: 6 },
};


const DataRow = ({ label, value }: { label: string, value: any }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-3 px-4 odd:bg-gray-50/50 rounded-md">
    <span className="text-sm text-gray-500 mb-1 sm:mb-0 sm:mr-4">{label}</span>
    <span className="font-semibold text-gray-800 text-right break-words">{value}</span>
  </div>
);

// Komponent do renderowania sekcji danych
const DataSection = ({ title, data, calculationType }: { title: string, data: any, calculationType?: string }) => {
  const sortedKeys = Object.keys(data)
    .filter(key => FIELD_DEFINITIONS[key] && data[key] && data[key] !== 'Brak' && data[key] !== '')
    .sort((a, b) => (FIELD_DEFINITIONS[a]?.order || 99) - (FIELD_DEFINITIONS[b]?.order || 99));

  // Wybierz odpowiedni komponent na podstawie typu kalkulacji
  if (calculationType === 'valuation' && title === 'Wynik wyceny') {
    return <ValuationResultSection data={data} />;
  }
  
  if (calculationType === 'purchase' && title === 'Wynik kalkulacji') {
    return <PurchaseResultSection data={data} />;
  }

  if (calculationType === 'purchase' && title === 'Dane wejściowe') {
    return <PurchaseInputSection data={data} />;
  }

  if (calculationType === 'rentability' && title === 'Dane wejściowe') {
    return <RentalInputSection data={data} />;
  }

  if (calculationType === 'rentability' && title === 'Wynik kalkulacji') {
    return <RentalResultSection data={data} />;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">{title}</h2>
      <div className="space-y-2">
        {sortedKeys.map((key) => {
          const definition = FIELD_DEFINITIONS[key];
          const rawValue = data[key];
          const formattedValue = definition.format ? definition.format(rawValue) : rawValue;
          return <DataRow key={key} label={definition.label} value={formattedValue} />;
        })}
      </div>
    </div>
  );
};

// Komponent dla danych wejściowych kalkulacji wynajmu
const RentalInputSection = ({ data }: { data: any }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Brak danych';
    }
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Dane podstawowe */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Dane Podstawowe</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Cena zakupu</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.purchasePrice ? formatCurrency(data.purchasePrice) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Miesięczny czynsz</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.monthlyRent ? formatCurrency(data.monthlyRent) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Koszty transakcyjne</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.transactionCosts ? formatCurrency(data.transactionCosts) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Koszt remontu</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.renovationCosts ? formatCurrency(data.renovationCosts) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Czynsz administracyjny</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.adminFees ? formatCurrency(data.adminFees) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Opłaty za media</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.utilities ? formatCurrency(data.utilities) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Ubezpieczenie (rocznie)</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.insurance ? formatCurrency(data.insurance) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Inne koszty</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.otherCosts ? formatCurrency(data.otherCosts) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Okres pustostanów</p>
            <p className="text-lg font-bold text-gray-800">{data.vacancyPeriod ? `${data.vacancyPeriod} miesięcy/rok` : 'Brak danych'}</p>
          </div>
        </div>
      </div>

      {/* Finansowanie kredytem */}
      {data.downPayment && data.downPayment > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Finansowanie Kredytem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Wkład własny</p>
              <p className="text-lg font-bold text-gray-800 break-words">{formatCurrency(data.downPayment)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Oprocentowanie</p>
              <p className="text-lg font-bold text-gray-800">{data.interestRate ? formatPercentage(data.interestRate) : 'Brak danych'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Okres kredytowania</p>
              <p className="text-lg font-bold text-gray-800">{data.loanYears ? `${data.loanYears} lat` : 'Brak danych'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Podatki */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Podatki</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Forma opodatkowania</p>
            <p className="text-lg font-bold text-gray-800">{data.taxationType === 'ryczalt' ? 'Ryczałt od przychodu' : 'Skala podatkowa'}</p>
          </div>
          {data.taxationType === 'skala' && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Próg podatkowy</p>
              <p className="text-lg font-bold text-gray-800">{data.taxScale === '12' ? '12% (do 120 000 zł)' : '32% (powyżej 120 000 zł)'}</p>
            </div>
          )}
          {data.taxationType === 'ryczalt' && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Stawka ryczałtu</p>
              <p className="text-lg font-bold text-gray-800">8,5% - do 100 000 zł przychodu rocznie<br/>12,5% - powyżej 100 000 zł przychodu rocznie</p>
            </div>
          )}
        </div>
      </div>

      {/* Projekcja wieloletnia */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Projekcja Wieloletnia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wzrost wartości nieruchomości</p>
            <p className="text-lg font-bold text-gray-800">{data.propertyAppreciation ? formatPercentage(data.propertyAppreciation) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wzrost czynszu</p>
            <p className="text-lg font-bold text-gray-800">{data.rentGrowth ? formatPercentage(data.rentGrowth) : 'Brak danych'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponent dla danych wejściowych zakupu nieruchomości
const PurchaseInputSection = ({ data }: { data: any }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Brak danych';
    }
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Główne parametry kredytu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Parametry Kredytu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wartość nieruchomości</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.propertyValue ? formatCurrency(data.propertyValue) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Kwota kredytu</p>
            <p className="text-lg font-bold text-gray-800 break-words">{data.loanAmount ? formatCurrency(data.loanAmount) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Okres kredytowania</p>
            <p className="text-lg font-bold text-gray-800">{data.loanTerm ? `${data.loanTerm} lat` : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Typ rat</p>
            <p className="text-lg font-bold text-gray-800">{data.installmentType ? (data.installmentType === 'equal' ? 'Równe' : 'Malejące') : 'Brak danych'}</p>
          </div>

        </div>
      </div>

      {/* Stopy procentowe */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Stopy Procentowe</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Marża banku</p>
            <p className="text-lg font-bold text-gray-800">{data.bankMargin ? formatPercentage(data.bankMargin) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Stopa referencyjna</p>
            <p className="text-lg font-bold text-gray-800">{data.referenceRate ? formatPercentage(data.referenceRate) : 'Brak danych'}</p>
          </div>
        </div>
      </div>

      {/* Koszty i prowizje */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Koszty i Prowizje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Prowizja banku</p>
            <p className="text-lg font-bold text-gray-800">{data.bankCommission ? formatPercentage(data.bankCommission) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Prowizja agencji</p>
            <p className="text-lg font-bold text-gray-800">{data.agencyCommission ? formatPercentage(data.agencyCommission) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Stawka PCC</p>
            <p className="text-lg font-bold text-gray-800">{data.pccTaxRate ? formatPercentage(data.pccTaxRate) : 'Brak danych'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Typ taksy notarialnej</p>
            <p className="text-lg font-bold text-gray-800">{data.notaryFeeType ? (data.notaryFeeType === 'max' ? 'Maksymalna' : 'Własna') : 'Brak danych'}</p>
          </div>
          {data.customNotaryFee && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Własna taksa notarialna</p>
              <p className="text-lg font-bold text-gray-800 break-words">{formatCurrency(data.customNotaryFee)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Ubezpieczenie pomostowe */}
      {data.bridgeInsuranceMonths && parseFloat(data.bridgeInsuranceMonths) > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Ubezpieczenie Pomostowe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Okres ubezpieczenia</p>
              <p className="text-lg font-bold text-gray-800">{data.bridgeInsuranceMonths} miesięcy</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Zwiększenie marży</p>
              <p className="text-lg font-bold text-gray-800">{formatPercentage(data.bridgeInsuranceMarginIncrease)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nadpłaty */}
      {data.overpaymentAmount && parseFloat(data.overpaymentAmount) > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Parametry Nadpłat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Kwota nadpłaty</p>
              <p className="text-lg font-bold text-gray-800 break-words">{formatCurrency(data.overpaymentAmount)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Częstotliwość</p>
              <p className="text-lg font-bold text-gray-800">{
                data.overpaymentFrequency === 'one-time' ? 'Jednorazowa' :
                data.overpaymentFrequency === 'monthly' ? 'Miesięczna' : 'Roczna'
              }</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Miesiąc rozpoczęcia</p>
              <p className="text-lg font-bold text-gray-800">{data.overpaymentStartMonth}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Cel nadpłat</p>
              <p className="text-lg font-bold text-gray-800">{
                data.overpaymentTarget === 'shorten-period' ? 'Skrócenie okresu' : 'Obniżenie rat'
              }</p>
            </div>
            {data.overpaymentFrequency !== 'one-time' && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Interwał nadpłat</p>
                <p className="text-lg font-bold text-gray-800">Co {data.overpaymentInterval} {data.overpaymentFrequency === 'monthly' ? 'miesiąc' : 'rok'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zmiana stopy referencyjnej */}
      {data.referenceRateChange && parseFloat(data.referenceRateChange) !== 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Symulacja Zmiany Stóp</h2>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Zmiana stopy referencyjnej</p>
            <p className="text-lg font-bold text-gray-800">{data.referenceRateChange > 0 ? '+' : ''}{formatPercentage(data.referenceRateChange)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Komponent dla wyników wyceny nieruchomości
const ValuationResultSection = ({ data }: { data: any }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 }).format(value);
  
  const confidenceLevel = parseFloat(data.confidence?.replace('±', '').replace('%', ''));
  let confidenceColor = 'bg-gray-200 text-gray-700';
  if (confidenceLevel <= 2) {
    confidenceColor = 'bg-green-100 text-green-800';
  } else if (confidenceLevel <= 5) {
    confidenceColor = 'bg-yellow-100 text-yellow-800';
  } else {
    confidenceColor = 'bg-red-100 text-red-800';
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Wynik wyceny</h2>
      
      {/* Główna cena */}
      <div className="text-center bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
        <p className="text-lg text-gray-700">Szacowana wartość nieruchomości</p>
        <p className="text-5xl font-extrabold text-gray-800 py-2">
          {formatCurrency(data.price)}
        </p>
        <p className="text-md text-gray-600 mt-2">
          Przewidywany przedział cenowy: <strong>{formatCurrency(data.minPrice)} - {formatCurrency(data.maxPrice)}</strong>
        </p>
      </div>

      <div className="space-y-3">
        <DataRow label="Poziom ufności" value={
          <span className={`px-2 py-1 text-sm font-semibold rounded-full ${confidenceColor}`}>
            {data.confidence}
          </span>
        } />
        <DataRow label="Metoda wyceny" value="Zaawansowany model AI (Ensemble)" />
        <DataRow label="Data wyceny" value={new Date(data.timestamp).toLocaleString('pl-PL')} />
      </div>
       <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p>Wycena jest estymacją opartą na zaawansowanych modelach statystycznych i nie stanowi oficjalnego operatu szacunkowego.</p>
      </div>
    </div>
  );
};

// Komponent dla wyników kalkulacji wynajmu
const RentalResultSection = ({ data }: { data: any }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Brak danych';
    }
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Podstawowe wyniki */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Podstawowe Wyniki</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Roczny przychód</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(data.annualIncome)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Roczny dochód netto</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(data.netAnnualIncome)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">ROI (roczny zwrot)</p>
            <p className="text-2xl font-bold text-gray-800">{formatPercentage(data.roi)}</p>
          </div>
        </div>
      </div>

      {/* Wyniki kredytowe */}
      {data.loanAmount && data.loanAmount > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wyniki Kredytowe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Kwota kredytu</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.loanAmount)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Miesięczna rata</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.monthlyLoanPayment)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Cash Flow (roczny)</p>
              <p className={`text-xl font-bold ${data.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(data.cashFlow)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center md:col-span-2 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Cash-on-Cash Return (brutto)</p>
              <p className={`text-2xl font-bold ${data.cocReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatPercentage(data.cocReturn)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analiza podatkowa */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Analiza Podatkowa (Netto)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Podatek roczny</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(data.taxAmount)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Cash Flow netto</p>
            <p className={`text-xl font-bold ${data.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(data.netCashFlow)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Cash-on-Cash Return netto</p>
            <p className={`text-2xl font-bold ${data.netCocReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatPercentage(data.netCocReturn)}
            </p>
          </div>
        </div>
      </div>

      {/* Wykresy */}
      {data.costBreakdown && data.costBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Struktura Kosztów Miesięcznych</h2>
          <div className="h-80">
            <Doughnut 
              data={{
                labels: data.costBreakdown.map((item: any) => item.name),
                datasets: [{
                  data: data.costBreakdown.map((item: any) => item.value),
                  backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'
                  ],
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Wykres przychody vs koszty */}
      {data.incomeVsCosts && data.incomeVsCosts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Przychody vs Koszty (Roczne)</h2>
          <div className="h-80">
            <Bar 
              data={{
                labels: data.incomeVsCosts.map((item: any) => item.name),
                datasets: [{
                  label: 'Kwota',
                  data: data.incomeVsCosts.map((item: any) => item.Kwota),
                  backgroundColor: data.incomeVsCosts.map((item: any) => item.fill),
                  borderColor: data.incomeVsCosts.map((item: any) => item.fill),
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${formatCurrency(context.parsed.y)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value as number);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Projekcja 10-letnia */}
      {data.projection && data.projection.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Projekcja 10-letnia</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Rok</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Przychód</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Koszty</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Dochód netto</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">ROI</th>
                </tr>
              </thead>
              <tbody>
                {data.projection.map((year: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-800">{year.rok}</td>
                    <td className="py-2 px-3 text-right text-gray-800">{formatCurrency(year.przychod)}</td>
                    <td className="py-2 px-3 text-right text-gray-800">{formatCurrency(year.koszty)}</td>
                    <td className="py-2 px-3 text-right text-gray-800">{formatCurrency(year.dochodNetto)}</td>
                    <td className="py-2 px-3 text-right text-gray-800">{formatPercentage(year.roi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Komponent dla wyników zakupu nieruchomości
const PurchaseResultSection = ({ data }: { data: any }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
  const formatLoanTerm = (months: number | null) => {
    if (!months) return '0';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} miesięcy`;
    if (remainingMonths === 0) return `${years} lat`;
    return `${years} lat ${remainingMonths} miesięcy`;
  };
  
  // Oblicz koszty jak w normalnej kalkulacji
  const ancillaryCosts = (data.notaryFee || 0) + (data.pcctax || 0) + (data.bankCommissionAmount || 0) + (data.courtFees || 0) + (data.agencyCommissionAmount || 0);
  const totalCreditCost = (data.totalInterest || 0) + (data.bankCommissionAmount || 0);
  
  // Pobierz dane wejściowe z kalkulacji (jeśli dostępne)
  const inputData = data.inputData || {};
  const propertyValue = parseFloat(inputData.propertyValue) || 0;
  const loanAmount = parseFloat(inputData.loanAmount) || 0;
  const downPayment = propertyValue - loanAmount;
  const totalInitialOutlay = downPayment + ancillaryCosts;

  // Dane dla wykresu struktury kosztów
  const costStructureData = {
    labels: ['Wkład własny', 'Podatek PCC', 'Taksa notarialna', 'Prowizja bankowa', 'Opłaty sądowe', 'Prowizja agencji'],
    datasets: [
      {
        data: [
          downPayment,
          data.pcctax || 0,
          data.notaryFee || 0,
          data.bankCommissionAmount || 0,
          data.courtFees || 0,
          data.agencyCommissionAmount || 0
        ],
        backgroundColor: [
          '#3B82F6', // blue
          '#EF4444', // red
          '#F59E0B', // amber
          '#10B981', // emerald
          '#8B5CF6', // violet
          '#F97316'  // orange
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Dane dla wykresu harmonogramu spłat (cały okres)
  const scheduleData = data.schedule && data.schedule.length > 0 ? {
    labels: data.schedule.map((payment: any) => `Miesiąc ${payment.month}`),
    datasets: [
      {
        label: 'Kapitał',
        data: data.schedule.map((payment: any) => payment.principalPart),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Odsetki',
        data: data.schedule.map((payment: any) => payment.interestPart),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }
    ]
  } : null;

  // Dane dla wykresu porównania rat
  const installmentComparisonData = {
    labels: ['Pierwsza rata', 'Ostatnia rata'],
    datasets: [
      {
        label: 'Wysokość raty',
        data: [data.firstInstallment || 0, data.lastInstallment || 0],
        backgroundColor: ['#3B82F6', '#EF4444'],
        borderColor: ['#2563EB', '#DC2626'],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Koszty Początkowe */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Koszty Początkowe</h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 md:p-6 bg-gray-100 rounded-lg">
            <p className="text-sm md:text-base text-gray-600 mb-2 sm:mb-0">Wkład własny</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{formatCurrency(downPayment)}</p>
          </div>
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg">
            <p className="text-sm md:text-base text-gray-600 mb-4 font-semibold">Koszty okołozakupowe</p>
            <div className="space-y-3 text-sm md:text-base">
              {(data.pcctax || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Podatek PCC:</span> 
                  <span className="font-semibold">{formatCurrency(data.pcctax)}</span>
                </div>
              )}
              {(data.notaryFee || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Taksa notarialna:</span> 
                  <span className="font-semibold">{formatCurrency(data.notaryFee)}</span>
                </div>
              )}
              {(data.bankCommissionAmount || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Prowizja bankowa:</span> 
                  <span className="font-semibold">{formatCurrency(data.bankCommissionAmount)}</span>
                </div>
              )}
              {(data.courtFees || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Opłaty sądowe:</span> 
                  <span className="font-semibold">{formatCurrency(data.courtFees)}</span>
                </div>
              )}
              {(data.agencyCommissionAmount || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Prowizja agencji:</span> 
                  <span className="font-semibold">{formatCurrency(data.agencyCommissionAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold border-t pt-3 mt-3 text-base md:text-lg">
                <span>Suma kosztów okołozakupowych:</span> 
                <span>{formatCurrency(ancillaryCosts)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 md:p-6 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm md:text-base font-semibold text-gray-700 mb-2 sm:mb-0">RAZEM (gotówka na start)</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{formatCurrency(totalInitialOutlay)}</p>
          </div>
        </div>
      </div>

      {/* Wykres struktury kosztów */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Struktura Kosztów Początkowych</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <Doughnut 
              data={costStructureData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Wkład własny</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(downPayment)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Podatek PCC</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.pcctax || 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Taksa notarialna</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.notaryFee || 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Prowizja bankowa</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.bankCommissionAmount || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Podsumowanie Płatności Kredytu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Podsumowanie Płatności Kredytu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
            <p className="text-sm md:text-base text-gray-600 mb-2">Pierwsza Rata</p>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 break-words">{formatCurrency(data.firstInstallment)}</p>
          </div>
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
            <p className="text-sm md:text-base text-gray-600 mb-2">Ostatnia Rata</p>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 break-words">{formatCurrency(data.lastInstallment)}</p>
          </div>
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
            <p className="text-sm md:text-base text-gray-600 mb-2">Suma Odsetek</p>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 break-words">{formatCurrency(data.totalInterest)}</p>
          </div>
          <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
            <p className="text-sm md:text-base text-gray-600 mb-2">Całkowity Koszt Kredytu</p>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 break-words">{formatCurrency(totalCreditCost)}</p>
          </div>
        </div>
      </div>

      {/* Wykres porównania rat */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Porównanie Rat</h2>
        <div className="h-80">
          <Bar 
            data={installmentComparisonData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.label}: ${formatCurrency(context.parsed.y)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return formatCurrency(value as number);
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Wykres harmonogramu spłat */}
      {scheduleData && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Harmonogram Spłat (Cały okres)</h2>
          <div className="h-80">
            <Line 
              data={scheduleData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value as number);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Wyniki Nadpłaty */}
      {data.overpaymentResults && data.overpaymentResults.savedInterest > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wyniki Nadpłaty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
              <p className="text-sm md:text-base text-gray-700 mb-2">Zaoszczędzone odsetki</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{formatCurrency(data.overpaymentResults.savedInterest)}</p>
            </div>
            <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
              <p className="text-sm md:text-base text-gray-700 mb-2">Kredyt spłacisz szybciej o</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                {data.overpaymentResults.monthsShortened > 0 ? formatLoanTerm(data.overpaymentResults.monthsShortened) : '0'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Harmonogram spłat */}
      {data.schedule && data.schedule.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Harmonogram Spłat</h2>
           <div className="space-y-2 max-h-96 overflow-y-auto">
             {data.schedule.map((payment: any, index: number) => (
               <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                 <div>
                   <p className="text-md font-semibold text-gray-800">Miesiąc {payment.month}: {formatCurrency(payment.totalPayment)}</p>
                   <div className="text-sm text-gray-600 mt-1">
                     <span>Kapitał: {formatCurrency(payment.principalPart)}</span>
                     <span className="mx-2">•</span>
                     <span>Odsetki: {formatCurrency(payment.interestPart)}</span>
                     {payment.overpayment > 0 && (
                       <>
                         <span className="mx-2">•</span>
                         <span>Nadpłata: {formatCurrency(payment.overpayment)}</span>
                       </>
                     )}
                   </div>
                 </div>
                 <div className="text-right text-sm text-gray-500">
                   Pozostałe saldo: {formatCurrency(payment.remainingPrincipal)}
                 </div>
               </div>
             ))}
           </div>
           
           {/* Break-even point */}
           {(() => {
             const breakEvenMonth = data.schedule.findIndex((payment: any) => 
               payment.principalPart >= payment.interestPart
             );
             if (breakEvenMonth !== -1) {
               return (
                 <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                   <p className="text-lg font-semibold text-gray-800 mb-2">Punkt Break-even</p>
                   <p className="text-gray-600">
                     W miesiącu {breakEvenMonth + 1} część kapitałowa raty ({formatCurrency(data.schedule[breakEvenMonth].principalPart)}) 
                     będzie większa lub równa części odsetkowej ({formatCurrency(data.schedule[breakEvenMonth].interestPart)}).
                   </p>
                 </div>
               );
             }
             return null;
           })()}
        </div>
      )}

      {/* Wynik Symulacji Zmiany Stóp Procentowych */}
      {data.referenceRateChange && data.referenceRateChange !== 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wynik Symulacji Zmiany Stóp Procentowych</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
              <p className="text-sm md:text-base text-gray-600 mb-2">Nowa pierwsza rata</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{formatCurrency(data.newFirstInstallment)}</p>
            </div>
            <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center border border-gray-200">
              <p className="text-sm md:text-base text-gray-600 mb-2">Różnica w racie</p>
              <p className={`text-lg md:text-xl lg:text-2xl font-bold ${data.installmentDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {data.installmentDifference >= 0 ? '+' : ''}{formatCurrency(data.installmentDifference)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default function CalculationDetailPage() {
  const [calculation, setCalculation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    
    const fetchCalculation = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error("Brak autoryzacji");

        const response = await fetch(`/api/user/calculations/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Nie udało się pobrać danych kalkulacji');
        }

        const data = await response.json();
        console.log('Pobrane dane kalkulacji:', data);
        
        // Sprawdź czy dane są poprawne
        if (!data.input_json || Object.keys(data.input_json).length === 0) {
          console.warn('Brak danych wejściowych w kalkulacji');
        }
        
        if (!data.result_json || Object.keys(data.result_json).length === 0) {
          console.warn('Brak danych wynikowych w kalkulacji');
        }
        
        setCalculation(data);

      } catch (err) {
        console.error('Błąd podczas pobierania kalkulacji:', err);
        setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalculation();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-6 text-gray-600 text-lg">Ładowanie szczegółów kalkulacji...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6" role="alert">
        <p className="font-bold text-lg">Błąd</p>
        <p>{error}</p>
        <Link href="/panel/kalkulacje" className="text-blue-600 hover:underline mt-4 inline-block">
          &larr; Wróć do listy kalkulacji
        </Link>
      </div>
    );
  }
  
  if (!calculation) {
      return <div>Nie znaleziono kalkulacji.</div>
  }

  // Sprawdź czy dane są dostępne
  const hasInputData = calculation.input_json && Object.keys(calculation.input_json).length > 0;
  const hasResultData = calculation.result_json && Object.keys(calculation.result_json).length > 0;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/panel/kalkulacje" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Wróć do listy
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{calculation.title}</h1>
        <p className="text-gray-500 mt-2">
          Szczegóły zapisanej kalkulacji z dnia {new Date(calculation.created_at).toLocaleDateString('pl-PL')}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Typ kalkulacji: {calculation.calculation_type}
        </p>
      </div>

      <div className="space-y-8">
        {hasInputData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <DataSection 
                title={calculation.calculation_type === 'purchase' ? 'Dane wejściowe' : 'Dane wejściowe'} 
                data={calculation.input_json} 
                calculationType={calculation.calculation_type}
              />
            </div>
          </div>
        )}
        
        {hasResultData && (
          <div className="w-full">
            <DataSection 
              title={
                calculation.calculation_type === 'purchase' ? 'Wynik kalkulacji' : 
                calculation.calculation_type === 'rentability' ? 'Wynik kalkulacji' : 
                'Wynik wyceny'
              } 
              data={{
                ...calculation.result_json,
                inputData: calculation.input_json // Przekaż dane wejściowe do wyników
              }} 
              calculationType={calculation.calculation_type}
            />
          </div>
        )}

        {!hasInputData && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Dane wejściowe</h2>
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Brak zapisanych danych wejściowych</p>
              <p className="text-sm mt-1">Dane mogły zostać uszkodzone lub nie zostały zapisane</p>
            </div>
          </div>
        )}

        {!hasResultData && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {calculation.calculation_type === 'purchase' ? 'Wynik kalkulacji' : 'Wynik wyceny'}
            </h2>
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Brak zapisanych wyników</p>
              <p className="text-sm mt-1">Wyniki mogły zostać uszkodzone lub nie zostały zapisane</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 