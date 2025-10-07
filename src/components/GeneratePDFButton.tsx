'use client';

import { useState } from 'react';

interface GeneratePDFButtonProps {
  calculationId: string;
  calculationTitle: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export default function GeneratePDFButton({
  calculationId,
  calculationTitle,
  className = '',
  variant = 'default',
}: GeneratePDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Brak autoryzacji. Zaloguj się ponownie.');
      }

      // Pobierz dane kalkulacji
      const response = await fetch(`/api/user/calculations/${calculationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas pobierania danych kalkulacji');
      }

      const calculation = await response.json();
      
      // Generuj PDF po stronie klienta
      await generateClientSidePDF(calculation);

    } catch (err) {
      console.error('Błąd podczas generowania PDF:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateClientSidePDF = async (calculation: any) => {
    try {
      // Pobierz token z localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Brak tokenu autoryzacji');
      }

      // Wywołaj API do generowania PDF
      const response = await fetch(`/api/user/calculations/${calculationId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      // Pobierz HTML content
      const htmlContent = await response.text();
      
      // Otwórz nowe okno z HTML
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        
        // Po załadowaniu strony, wywołaj print dialog
        newWindow.onload = () => {
          newWindow.print();
        };
      } else {
        throw new Error('Nie można otworzyć nowego okna');
      }

    } catch (error) {
      console.error('Błąd podczas generowania PDF:', error);
      throw error;
    }
  };

  const getCalculationTypeLabel = (type: string): string => {
    switch (type) {
      case 'valuation': return 'Wycena nieruchomości';
      case 'rental': return 'Opłacalność wynajmu';
      case 'purchase': return 'Kalkulacja zakupu nieruchomości';
      case 'flipper': return 'Kalkulator flipera';
      case 'creditScore': return 'Zdolność kredytowa';
      default: return 'Inna kalkulacja';
    }
  };

  // Funkcja do formatowania nazw parametrów
  const formatParameterName = (key: string): string => {
    // Mapowanie specjalnych przypadków
    const specialCases: { [key: string]: string } = {
      'cena_zakupu': 'Cena zakupu',
      'cena_sprzedazy': 'Cena sprzedaży',
      'materialy_wykonczeniowe': 'Materiały wykończeniowe',
      'materialy_instalacyjne': 'Materiały instalacyjne',
      'sprzet_AGD_RTV': 'Sprzęt AGD/RTV',
      'ekipa_remontowa': 'Ekipa remontowa',
      'inne_uslugi_remontowe': 'Inne usługi remontowe',
      'wywoz_gruzu': 'Wywóz gruzu',
      'transport_materialow': 'Transport materiałów',
      'czynsz_administracyjny': 'Czynsz administracyjny',
      'media_prad': 'Media - prąd',
      'media_gaz': 'Media - gaz',
      'media_woda': 'Media - woda',
      'ubezpieczenie_nieruchomosci': 'Ubezpieczenie nieruchomości',
      'podatek_od_nieruchomosci': 'Podatek od nieruchomości',
      'prowizja_bankowa': 'Prowizja bankowa',
      'oplata_za_wczesniejsza_splata': 'Opłata za wcześniejszą spłatę',
      'prowizja_posrednika_zakup': 'Prowizja pośrednika - zakup',
      'prowizja_posrednika_sprzedaz': 'Prowizja pośrednika - sprzedaż',
      'podatek_PCC': 'Podatek PCC',
      'taksa_notarialna': 'Taksa notarialna',
      'wpis_do_ksiegi_wieczystej': 'Wpis do księgi wieczystej',
      'oplata_za_wypisy_aktow_notarialnych': 'Opłata za wypisy aktów notarialnych',
      'oplata_sadowa': 'Opłata sądowa',
      'oplata_bankowa_za_pobranie': 'Opłata bankowa za pobranie',
      'koszty_operatu_szacunkowego': 'Koszty operatu szacunkowego',
      'koszty_doradcy_kredytowego': 'Koszty doradcy kredytowego',
      'projektant_wnetrza': 'Projektant wnętrza',
      'nadzor_budowlany': 'Nadzór budowlany',
      'koszt_trwania_flipa': 'Koszt trwania flipa',
      'wyposazenie_wnetrza': 'Wyposażenie wnętrza',
      'koszty_marketingu_fotograf': 'Koszty marketingu - fotograf',
      'koszty_marketingu_home_staging': 'Koszty marketingu - home staging',
      'koszty_marketingu_ogloszenia_online': 'Koszty marketingu - ogłoszenia online',
      'koszty_marketingu_inne_promocje': 'Koszty marketingu - inne promocje',
      'oplata_notarialna_przy_sprzedazy': 'Opłata notarialna przy sprzedaży',
      'sluzebnosc_przejscia_od_zysku': 'Służebność przejścia od zysku',
      'inne_podatki': 'Inne podatki',
      'propertyValue': 'Wartość nieruchomości',
      'loanAmount': 'Kwota kredytu',
      'downPayment': 'Wkład własny',
      'loanTerm': 'Okres kredytowania',
      'interestRate': 'Oprocentowanie',
      'monthlyIncome': 'Dochód miesięczny',
      'monthlyExpenses': 'Wydatki miesięczne',
      'purchasePrice': 'Cena zakupu',
      'monthlyRent': 'Czynsz miesięczny',
      'transactionCosts': 'Koszty transakcji',
      'renovationCosts': 'Koszty remontu',
      'adminFees': 'Opłaty administracyjne',
      'utilities': 'Media',
      'insurance': 'Ubezpieczenie',
      'otherCosts': 'Inne koszty',
      'propertyType': 'Typ nieruchomości',
      'area': 'Powierzchnia',
      'rooms': 'Liczba pokoi',
      'floor': 'Piętro',
      'condition': 'Stan techniczny',
      'location': 'Lokalizacja',
      'existingLoans': 'Istniejące kredyty',
      'creditCards': 'Karty kredytowe',
      'overdraft': 'Deklarowany debet'
    };

    if (specialCases[key]) {
      return specialCases[key];
    }

    // Automatyczne formatowanie dla innych przypadków
    return key
      .replace(/_/g, ' ') // Zamień podkreślniki na spacje
      .replace(/\b\w/g, l => l.toUpperCase()) // Pierwsza litera każdego słowa wielka
      .trim();
  };

  // Funkcja do formatowania wartości
  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    // Wartości pieniężne
    if (typeof value === 'number' && (
      key.toLowerCase().includes('cena') ||
      key.toLowerCase().includes('koszt') ||
      key.toLowerCase().includes('prowizja') ||
      key.toLowerCase().includes('oplata') ||
      key.toLowerCase().includes('price') ||
      key.toLowerCase().includes('cost') ||
      key.toLowerCase().includes('amount') ||
      key.toLowerCase().includes('income') ||
      key.toLowerCase().includes('expense') ||
      key.toLowerCase().includes('payment') ||
      key.toLowerCase().includes('rent') ||
      key.toLowerCase().includes('value') ||
      key.toLowerCase().includes('profit') ||
      key.toLowerCase().includes('repayment')
    )) {
      return formatCurrency(value);
    }

    // Wartości procentowe
    if (typeof value === 'number' && (
      key.toLowerCase().includes('rate') ||
      key.toLowerCase().includes('oprocentowanie') ||
      key.toLowerCase().includes('roi') ||
      key.toLowerCase().includes('yield') ||
      key.toLowerCase().includes('ltv') ||
      key.toLowerCase().includes('dti')
    )) {
      // Jeśli wartość jest już w procentach (0.06 = 6%)
      if (value <= 1) {
        return `${(value * 100).toFixed(2)}%`;
      }
      // Jeśli wartość jest już w procentach (6 = 6%)
      return `${value.toFixed(2)}%`;
    }

    // Wartości czasowe
    if (key.toLowerCase().includes('czas') || key.toLowerCase().includes('okres')) {
      return `${value} ${value === 1 ? 'rok' : value < 5 ? 'lata' : 'lat'}`;
    }

    // Wartości powierzchni
    if (key.toLowerCase().includes('area') || key.toLowerCase().includes('powierzchnia')) {
      return `${value} m²`;
    }

    // Domyślnie jako string
    return String(value);
  };

  const prepareInputTable = (inputData: any, calculationType: string): string[][] => {
    const table: string[][] = [];

    switch (calculationType) {
      case 'purchase':
        if (inputData.propertyValue) table.push(['Wartość nieruchomości', formatValue('propertyValue', inputData.propertyValue)]);
        if (inputData.loanAmount) table.push(['Kwota kredytu', formatValue('loanAmount', inputData.loanAmount)]);
        if (inputData.downPayment) table.push(['Wkład własny', formatValue('downPayment', inputData.downPayment)]);
        if (inputData.loanTerm) table.push(['Okres kredytowania', formatValue('loanTerm', inputData.loanTerm)]);
        if (inputData.interestRate) table.push(['Oprocentowanie', formatValue('interestRate', inputData.interestRate)]);
        if (inputData.monthlyIncome) table.push(['Dochód miesięczny', formatValue('monthlyIncome', inputData.monthlyIncome)]);
        if (inputData.monthlyExpenses) table.push(['Wydatki miesięczne', formatValue('monthlyExpenses', inputData.monthlyExpenses)]);
        break;
      default:
        // Dla nieznanych typów, dodaj wszystkie dostępne dane
        Object.entries(inputData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            const formattedName = formatParameterName(key);
            const formattedValue = formatValue(key, value);
            table.push([formattedName, formattedValue]);
          }
        });
    }

    return table;
  };

  const prepareResultTable = (resultData: any, calculationType: string): string[][] => {
    const table: string[][] = [];

    // Mapowanie polskich nazw wyników
    const resultNames: { [key: string]: string } = {
      // Flipper
      'koszt_zakupu_brutto': 'Koszt zakupu brutto',
      'koszt_remontu_calkowity': 'Koszt remontu całkowity',
      'koszty_utrzymania': 'Koszty utrzymania',
      'koszty_finansowania': 'Koszty finansowania',
      'koszty_calkowite': 'Koszty całkowite',
      'koszty_sprzedazy': 'Koszty sprzedaży',
      'zysk_brutto': 'Zysk brutto',
      'podatek': 'Podatek',
      'zysk_netto': 'Zysk netto',
      'ROI': 'ROI',
      'czas_trwania_flipa': 'Czas trwania flipa',
      'srednio_miesieczny_zysk_netto': 'Średnio miesięczny zysk netto',
      
      // Purchase
      'monthlyPayment': 'Rata miesięczna',
      'totalInterest': 'Całkowite odsetki',
      'totalCost': 'Całkowity koszt',
      'affordability': 'Zdolność kredytowa',
      'loanToValue': 'LTV',
      'debtToIncome': 'DTI',
      'firstInstallment': 'Pierwsza rata',
      'lastInstallment': 'Ostatnia rata',
      'totalRepayment': 'Całkowita spłata',
      
      // Rental
      'monthlyProfit': 'Zysk miesięczny',
      'annualProfit': 'Zysk roczny',
      'yield': 'Rentowność',
      'paybackPeriod': 'Okres zwrotu',
      'netRentalYield': 'Netto rentowność',
      
      // Valuation
      'estimatedValue': 'Szacowana wartość',
      'pricePerSqm': 'Cena za m²',
      'confidence': 'Poziom pewności',
      
      // Credit Score
      'creditScore': 'Punktacja kredytowa',
      'maxLoanAmount': 'Maksymalna kwota kredytu',
      'recommendation': 'Rekomendacja'
    };

    switch (calculationType) {
      case 'purchase':
        if (resultData.firstInstallment) table.push(['Pierwsza rata', formatValue('firstInstallment', resultData.firstInstallment)]);
        if (resultData.lastInstallment) table.push(['Ostatnia rata', formatValue('lastInstallment', resultData.lastInstallment)]);
        if (resultData.totalRepayment) table.push(['Całkowita spłata', formatValue('totalRepayment', resultData.totalRepayment)]);
        if (resultData.totalInterest) table.push(['Całkowite odsetki', formatValue('totalInterest', resultData.totalInterest)]);
        if (resultData.monthlyPayment) table.push(['Rata miesięczna', formatValue('monthlyPayment', resultData.monthlyPayment)]);
        if (resultData.loanToValue) table.push(['LTV', formatValue('loanToValue', resultData.loanToValue)]);
        if (resultData.debtToIncome) table.push(['DTI', formatValue('debtToIncome', resultData.debtToIncome)]);
        break;
      default:
        // Dla nieznanych typów, dodaj wszystkie dostępne dane
        Object.entries(resultData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            const polishName = resultNames[key] || formatParameterName(key);
            const formattedValue = formatValue(key, value);
            table.push([polishName, formattedValue]);
          }
        });
    }

    return table;
  };

  const formatCurrency = (amount: number): string => {
    // Formatowanie bez niepotrzebnych miejsc po przecinku
    if (amount % 1 === 0) {
      // Liczba całkowita - zawsze z symbolem zł
      return `${amount.toLocaleString('pl-PL')} zł`;
    } else {
      // Liczba z miejscami po przecinku
      return `${amount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={className}>
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className={`
            text-red-600 hover:text-red-900 transition-colors duration-200
            ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title="Pobierz kalkulację jako PDF"
        >
          {isGenerating ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </button>
        {error && (
          <div className="absolute mt-2 text-xs text-red-600 bg-white border rounded p-1 shadow-lg z-10">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        className={`
          inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200
          ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title="Pobierz kalkulację jako PDF"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generowanie...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Pobierz PDF
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
