import React from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { CalculationResults } from '../types';
import { TDocumentDefinitions, Style, Alignment } from 'pdfmake/interfaces';

// Inicjalizacja czcionek pdfmake - użycie rzutowania typu, aby ominąć problemy TypeScript
// @ts-ignore - ignorujemy błąd TypeScript, ponieważ struktura modułu może się różnić w środowisku webpack
pdfMake.vfs = (pdfFonts as any);

type SummaryPDFProps = {
  results: CalculationResults;
  propertyPrice: number;
  address?: string;
  inflation: number;
  onGenerate?: () => void;
  calculatorType?: 'roi' | 'investment' | 'rental-value';
};

// Dodajemy własny typ dla wierszy tabeli w PDF
type TableCellObject = {
  text: string; 
  alignment?: Alignment;
  style?: string;
  fillColor?: string;
};
type TableRow = (string | TableCellObject)[];
type TableBody = TableRow[];

const SummaryPDF: React.FC<SummaryPDFProps> = ({
  results,
  propertyPrice,
  address = 'Nie podano',
  inflation,
  onGenerate,
  calculatorType = 'roi'
}) => {
  const generatePDF = () => {
    // Formatowanie liczb jako waluta
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
    };
    
    // Formatowanie liczb jako procent
    const formatPercent = (value: number): string => {
      return new Intl.NumberFormat('pl-PL', { style: 'percent', minimumFractionDigits: 2 }).format(value / 100);
    };
    
    // Data generowania raportu
    const today = new Date().toLocaleDateString('pl-PL');
    
    // Znalezienie punktu rentowności
    let breakEvenYear = "Nie osiągnięto w okresie analizy";
    
    // Sprawdzamy, czy istnieje chartData
    if (results.comparison.chartData) {
      const { mortgageCostData, rentCostData, labels } = results.comparison.chartData;
      
      const breakEvenIndex = mortgageCostData.findIndex((value, index) => 
        value <= rentCostData[index] && (index === 0 || mortgageCostData[index - 1] > rentCostData[index - 1])
      );
      
      if (breakEvenIndex !== -1) {
        breakEvenYear = labels[breakEvenIndex];
      }
    }

    // Określenie tytułów i opisów na podstawie typu kalkulatora
    const titles = {
      reportTitle: calculatorType === 'investment' 
        ? 'Raport analizy finansowej inwestycji'
        : calculatorType === 'rental-value' 
          ? 'Raport analizy wartości nieruchomości na podstawie najmu'
          : 'Raport analizy finansowej nieruchomości',
      
      buyingSection: calculatorType === 'investment' 
        ? 'Parametry inwestycji'
        : calculatorType === 'rental-value' 
          ? 'Wartość nieruchomości'
          : 'Zakup nieruchomości',
          
      rentingSection: calculatorType === 'investment' 
        ? 'Przepływy pieniężne'
        : calculatorType === 'rental-value' 
          ? 'Parametry najmu'
          : 'Wynajem nieruchomości',
      
      comparisonSection: calculatorType === 'investment' 
        ? 'Analiza rentowności inwestycji'
        : calculatorType === 'rental-value' 
          ? 'Analiza opłacalności'
          : 'Porównanie opcji zakupu i wynajmu'
    };

    // Przygotowanie zawartości dokumentu
    const docContent: any[] = [
      // Nagłówek dokumentu
      {
        text: titles.reportTitle,
        style: 'header',
        alignment: 'center' as Alignment
      },
      {
        text: `Wygenerowano: ${today}`,
        style: 'subheader',
        alignment: 'center' as Alignment,
        margin: [0, 5, 0, 20]
      },
      
      // Podstawowe informacje
      {
        text: 'Podsumowanie analizy',
        style: 'sectionHeader'
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#DDDDDD' }]
      },
      {
        margin: [0, 10, 0, 0],
        columns: [
          {
            width: 'auto',
            text: [
              { text: `${calculatorType === 'investment' ? 'Kwota inwestycji: ' : 'Wartość nieruchomości: '}`, bold: true },
              { text: formatCurrency(propertyPrice) }
            ]
          }
        ]
      },
      {
        columns: [
          {
            width: 'auto',
            text: [
              { text: `${calculatorType === 'investment' ? 'Opis inwestycji: ' : 'Adres/lokalizacja: '}`, bold: true },
              { text: address }
            ]
          }
        ]
      },
      {
        columns: [
          {
            width: 'auto',
            text: [
              { text: `Założona inflacja: `, bold: true },
              { text: formatPercent(inflation) }
            ]
          }
        ]
      },
      {
        columns: [
          {
            width: 'auto',
            text: [
              { text: `Okres analizy: `, bold: true },
              { text: `${results.comparison.chartData?.labels.length || results.yearlyCosts?.buying?.length || 30} lat` }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Sekcja zakupu/inwestycji
      {
        text: titles.buyingSection,
        style: 'sectionHeader',
        color: '#0066CC'
      },
      {
        margin: [0, 5, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: getFirstSectionBody()
        }
      },
      
      // Sekcja wynajmu/przepływów
      {
        text: titles.rentingSection,
        style: 'sectionHeader',
        color: '#E67E22',
        margin: [0, 20, 0, 0]
      },
      {
        margin: [0, 5, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: getSecondSectionBody()
        }
      },
      
      // Podsumowanie porównania
      {
        text: titles.comparisonSection,
        style: 'sectionHeader',
        color: '#2E7D32',
        margin: [0, 20, 0, 0]
      },
      {
        margin: [0, 5, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: getComparisonSectionBody()
        }
      },
      
      // Informacje dodatkowe i zastrzeżenia
      {
        text: 'Informacje dodatkowe',
        style: 'sectionHeader',
        margin: [0, 20, 0, 0]
      },
      {
        text: [
          'Powyższa analiza opiera się na dostarczonych danych oraz przyjętych założeniach. ',
          'Rzeczywiste wyniki mogą się różnić w zależności od zmieniających się warunków rynkowych, ',
          'wahań stóp procentowych, inflacji oraz innych czynników ekonomicznych. ',
          'Niniejszy raport nie stanowi porady inwestycyjnej ani rekomendacji zakupu konkretnej nieruchomości ',
          'i powinien być traktowany wyłącznie jako narzędzie pomocnicze w procesie decyzyjnym.'
        ],
        margin: [0, 5, 0, 10],
        style: 'small'
      },
      {
        text: 'Kalkulator Finansowy Nieruchomości © ' + new Date().getFullYear(),
        alignment: 'center' as Alignment,
        style: 'small',
        margin: [0, 30, 0, 0]
      }
    ];

    // Funkcja generująca tabelę dla sekcji zakupu/inwestycji
    function getFirstSectionBody(): TableBody {
      let body: TableBody = [
        [
          { text: 'Parametr', style: 'tableHeader', fillColor: '#0066CC' },
          { text: 'Wartość', style: 'tableHeader', fillColor: '#0066CC' }
        ]
      ];

      if (calculatorType === 'roi') {
        body = body.concat([
          ['Wkład własny', { text: formatCurrency(results.buyingSummary.downPayment), alignment: 'right' }],
          ['Kwota kredytu', { text: formatCurrency(results.buyingSummary.loanAmount), alignment: 'right' }],
          ['Miesięczna rata', { text: formatCurrency(results.buyingSummary.monthlyMortgagePayment), alignment: 'right' }],
          ['Suma rat kredytu', { text: formatCurrency(results.buyingSummary.totalMortgagePayments), alignment: 'right' }],
          ['Pozostałe koszty', { text: formatCurrency(results.buyingSummary.totalOtherCosts), alignment: 'right' }],
          ['Całkowity koszt zakupu', { text: formatCurrency(results.buyingSummary.buyingTotal), alignment: 'right' }],
          ['Szacowana wartość końcowa', { text: formatCurrency(results.buyingSummary.propertyValue), alignment: 'right' }],
          ['ROE (Zwrot z kapitału)', { text: formatPercent(results.buyingSummary.roe), alignment: 'right' }],
          ['DTI (Stosunek kredytu do dochodu)', { text: formatPercent(results.buyingSummary.dti), alignment: 'right' }],
          ['Zysk/strata', { text: formatCurrency(results.buyingSummary.propertyValue - results.buyingSummary.buyingTotal), alignment: 'right' }]
        ] as TableRow[]);
      } else if (calculatorType === 'investment') {
        body = body.concat([
          ['Kwota inwestycji', { text: formatCurrency(results.buyingSummary.downPayment), alignment: 'right' }],
          ['Oczekiwana stopa zwrotu', { text: formatPercent(results.buyingSummary.roe), alignment: 'right' }],
          ['Całkowite koszty inwestycji', { text: formatCurrency(results.buyingSummary.buyingTotal), alignment: 'right' }],
          ['Wartość końcowa inwestycji', { text: formatCurrency(results.buyingSummary.propertyValue), alignment: 'right' }],
          ['Zysk/strata', { text: formatCurrency(results.buyingSummary.propertyValue - results.buyingSummary.buyingTotal), alignment: 'right' }]
        ] as TableRow[]);
      } else if (calculatorType === 'rental-value') {
        body = body.concat([
          ['Szacowana wartość nieruchomości', { text: formatCurrency(results.buyingSummary.buyingTotal), alignment: 'right' }],
          ['Oczekiwany ROI', { text: formatPercent(results.buyingSummary.roe), alignment: 'right' }],
          ['Potencjalny wkład własny (20%)', { text: formatCurrency(results.buyingSummary.downPayment), alignment: 'right' }],
          ['Prognozowana wartość po okresie', { text: formatCurrency(results.buyingSummary.propertyValue), alignment: 'right' }],
          ['Przewidywany wzrost wartości', { text: formatCurrency(results.buyingSummary.propertyValue - results.buyingSummary.buyingTotal), alignment: 'right' }]
        ] as TableRow[]);
      }

      return body;
    }

    // Funkcja generująca tabelę dla sekcji wynajmu/przepływów
    function getSecondSectionBody(): TableBody {
      let body: TableBody = [
        [
          { text: 'Parametr', style: 'tableHeader', fillColor: '#E67E22' },
          { text: 'Wartość', style: 'tableHeader', fillColor: '#E67E22' }
        ]
      ];

      if (calculatorType === 'roi') {
        body = body.concat([
          ['Miesięczny czynsz (początkowy)', { text: formatCurrency(results.rentingSummary.monthlyRent), alignment: 'right' }],
          ['Suma zapłaconych czynszów', { text: formatCurrency(results.rentingSummary.totalRent), alignment: 'right' }],
          ['Suma kosztów ubezpieczenia', { text: formatCurrency(results.rentingSummary.totalRentInsurance), alignment: 'right' }],
          ['Suma kosztów utrzymania', { text: formatCurrency(results.rentingSummary.totalRentMaintenance), alignment: 'right' }],
          ['Całkowity koszt wynajmu', { text: formatCurrency(results.rentingSummary.rentingTotal), alignment: 'right' }],
          ['Wartość końcowa inwestycji', { text: formatCurrency(results.rentingSummary.investmentValue), alignment: 'right' }],
          ['Zysk/strata', { text: formatCurrency(results.rentingSummary.investmentValue - results.rentingSummary.rentingTotal), alignment: 'right' }]
        ] as TableRow[]);
      } else if (calculatorType === 'investment') {
        body = body.concat([
          ['Pierwszy przepływ pieniężny', { text: formatCurrency(results.rentingSummary.monthlyRent), alignment: 'right' }],
          ['Suma przepływów pieniężnych', { text: formatCurrency(results.rentingSummary.totalRent), alignment: 'right' }],
          ['NPV (Wartość bieżąca netto)', { text: formatCurrency(results.rentingSummary.investmentValue), alignment: 'right' }],
          ['Różnica (NPV - Inwestycja)', { text: formatCurrency(results.rentingSummary.investmentValue - results.buyingSummary.downPayment), alignment: 'right' }]
        ] as TableRow[]);
      } else if (calculatorType === 'rental-value') {
        body = body.concat([
          ['Miesięczny czynsz najmu', { text: formatCurrency(results.rentingSummary.monthlyRent), alignment: 'right' }],
          ['Roczny przychód z najmu', { text: formatCurrency(results.rentingSummary.monthlyRent * 12), alignment: 'right' }],
          ['Całkowity przychód w okresie', { text: formatCurrency(results.rentingSummary.totalRent), alignment: 'right' }],
          ['Stosunek przychodu do wartości nieruchomości', { text: formatPercent((results.rentingSummary.totalRent / results.buyingSummary.buyingTotal) * 100), alignment: 'right' }]
        ] as TableRow[]);
      }

      return body;
    }

    // Funkcja generująca tabelę dla sekcji porównania
    function getComparisonSectionBody(): TableBody {
      let body: TableBody = [
        [
          { text: 'Parametr', style: 'tableHeader', fillColor: '#2E7D32' },
          { text: 'Wartość', style: 'tableHeader', fillColor: '#2E7D32' }
        ]
      ];

      if (calculatorType === 'roi') {
        body = body.concat([
          ['Różnica kosztów całkowitych', { text: formatCurrency(Math.abs(results.comparison.difference)), alignment: 'right' }],
          ['Opcja bardziej opłacalna wg kosztów', { text: results.comparison.difference > 0 ? 'Wynajem' : 'Zakup', alignment: 'right' }],
          ['Punkt rentowności (Break-Even Point)', { text: breakEvenYear, alignment: 'right' }],
          ['Różnica z uwzględnieniem wartości końcowych', { text: formatCurrency(Math.abs(results.comparison.finalDifference)), alignment: 'right' }],
          ['Ostateczna rekomendacja', { text: results.comparison.buyingIsBetter ? 'Zakup' : 'Wynajem', alignment: 'right' }]
        ] as TableRow[]);
      } else if (calculatorType === 'investment') {
        body = body.concat([
          ['NPV inwestycji', { text: formatCurrency(results.rentingSummary.investmentValue), alignment: 'right' }],
          ['Różnica (NPV - Inwestycja)', { text: formatCurrency(results.comparison.finalDifference), alignment: 'right' }],
          ['Opłacalność inwestycji', { text: results.comparison.buyingIsBetter ? 'Opłacalna' : 'Nieopłacalna', alignment: 'right' }],
          ['IRR (przybliżona)', { text: formatPercent(results.buyingSummary.roe), alignment: 'right' }]
        ] as TableRow[]);
      } else if (calculatorType === 'rental-value') {
        body = body.concat([
          ['Różnica (Wartość - Przychód)', { text: formatCurrency(Math.abs(results.comparison.finalDifference)), alignment: 'right' }],
          ['Przychody jako % wartości nieruchomości', { text: formatPercent((results.rentingSummary.totalRent / results.buyingSummary.buyingTotal) * 100), alignment: 'right' }],
          ['Szacowany czas zwrotu z inwestycji', { text: `${results.comparison.breakEvenYear || 'Nie osiągnięto'} lat`, alignment: 'right' }],
          ['Rentowność kapitału własnego (ROE)', { text: formatPercent(results.buyingSummary.roe), alignment: 'right' }]
        ] as TableRow[]);
      }

      return body;
    }

    // Definicja stylów
    const styles: Record<string, Style> = {
      header: {
        fontSize: 20,
        bold: true,
        color: '#2C3E50',
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 12,
        color: '#7F8C8D'
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: '#2C3E50',
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'white',
        fillColor: '#3498DB',
        alignment: 'center' as Alignment,
        margin: [0, 5, 0, 5]
      },
      small: {
        fontSize: 10,
        color: '#7F8C8D'
      }
    };

    // Definicja dokumentu
    const docDefinition: TDocumentDefinitions = {
      content: docContent,
      styles: styles,
      defaultStyle: {
        font: 'Roboto'
      },
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      footer: function(currentPage: number, pageCount: number) {
        return {
          text: `Strona ${currentPage} z ${pageCount}`,
          alignment: 'center',
          margin: [0, 10, 0, 0],
          fontSize: 8,
          color: '#7F8C8D'
        };
      }
    };

    // Generowanie i pobieranie pliku PDF
    pdfMake.createPdf(docDefinition).download(`Raport_${calculatorType}_${today.replace(/\./g, '_')}.pdf`);

    // Wywołanie callbacka jeśli został przekazany
    if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300 shadow-md flex items-center justify-center"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4v4a1 1 0 001 1h4" />
      </svg>
      Pobierz raport PDF
    </button>
  );
};

export default SummaryPDF;