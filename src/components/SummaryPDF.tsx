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
};

const SummaryPDF: React.FC<SummaryPDFProps> = ({
  results,
  propertyPrice,
  address = 'Nie podano',
  inflation,
  onGenerate
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

    // Przygotowanie zawartości dokumentu
    const docContent: any[] = [
      // Nagłówek dokumentu
      {
        text: 'Raport analizy finansowej nieruchomości',
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
              { text: `Wartość nieruchomości: `, bold: true },
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
              { text: `Adres/lokalizacja: `, bold: true },
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
      
      // Sekcja zakupu
      {
        text: 'Zakup nieruchomości',
        style: 'sectionHeader',
        color: '#0066CC'
      },
      {
        margin: [0, 5, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Parametr', style: 'tableHeader', fillColor: '#0066CC' },
              { text: 'Wartość', style: 'tableHeader', fillColor: '#0066CC' }
            ],
            ['Wkład własny', { text: formatCurrency(results.buyingSummary.downPayment), alignment: 'right' as Alignment }],
            ['Kwota kredytu', { text: formatCurrency(results.buyingSummary.loanAmount), alignment: 'right' as Alignment }],
            ['Miesięczna rata', { text: formatCurrency(results.buyingSummary.monthlyMortgagePayment), alignment: 'right' as Alignment }],
            ['Suma rat kredytu', { text: formatCurrency(results.buyingSummary.totalMortgagePayments), alignment: 'right' as Alignment }],
            ['Pozostałe koszty', { text: formatCurrency(results.buyingSummary.totalOtherCosts), alignment: 'right' as Alignment }],
            ['Całkowity koszt zakupu', { text: formatCurrency(results.buyingSummary.buyingTotal), alignment: 'right' as Alignment }],
            ['Szacowana wartość końcowa', { text: formatCurrency(results.buyingSummary.propertyValue), alignment: 'right' as Alignment }],
            ['ROE (Zwrot z kapitału)', { text: formatPercent(results.buyingSummary.roe), alignment: 'right' as Alignment }],
            ['DTI (Stosunek kredytu do dochodu)', { text: formatPercent(results.buyingSummary.dti), alignment: 'right' as Alignment }],
            ['Zysk/strata', { text: formatCurrency(results.buyingSummary.propertyValue - results.buyingSummary.buyingTotal), alignment: 'right' as Alignment }]
          ]
        }
      },
      
      // Sekcja wynajmu
      {
        text: 'Wynajem nieruchomości',
        style: 'sectionHeader',
        color: '#E67E22',
        margin: [0, 20, 0, 0]
      },
      {
        margin: [0, 5, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Parametr', style: 'tableHeader', fillColor: '#E67E22' },
              { text: 'Wartość', style: 'tableHeader', fillColor: '#E67E22' }
            ],
            ['Miesięczny czynsz (początkowy)', { text: formatCurrency(results.rentingSummary.monthlyRent), alignment: 'right' as Alignment }],
            ['Suma zapłaconych czynszów', { text: formatCurrency(results.rentingSummary.totalRent), alignment: 'right' as Alignment }],
            ['Suma kosztów ubezpieczenia', { text: formatCurrency(results.rentingSummary.totalRentInsurance), alignment: 'right' as Alignment }],
            ['Suma kosztów utrzymania', { text: formatCurrency(results.rentingSummary.totalRentMaintenance), alignment: 'right' as Alignment }],
            ['Całkowity koszt wynajmu', { text: formatCurrency(results.rentingSummary.rentingTotal), alignment: 'right' as Alignment }],
            ['Wartość końcowa inwestycji', { text: formatCurrency(results.rentingSummary.investmentValue), alignment: 'right' as Alignment }],
            ['Zysk/strata', { text: formatCurrency(results.rentingSummary.investmentValue - results.rentingSummary.rentingTotal), alignment: 'right' as Alignment }]
          ]
        }
      },
      
      // Podsumowanie porównania
      {
        text: 'Porównanie opcji zakupu i wynajmu',
        style: 'sectionHeader',
        color: '#2E7D32',
        margin: [0, 20, 0, 0]
      },
      {
        margin: [0, 5, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Parametr', style: 'tableHeader', fillColor: '#2E7D32' },
              { text: 'Wartość', style: 'tableHeader', fillColor: '#2E7D32' }
            ],
            ['Końcowa różnica finansowa', { text: formatCurrency(results.comparison.finalDifference), alignment: 'right' as Alignment }],
            ['Korzystniejsza opcja', { text: results.comparison.buyingIsBetter ? 'ZAKUP' : 'WYNAJEM', alignment: 'right' as Alignment }],
            ['Punkt rentowności (break-even)', { text: breakEvenYear, alignment: 'right' as Alignment }]
          ]
        }
      }
    ];
    
    // Dodawanie wykresów do PDF
    try {
      // Nagłówek sekcji wykresów
      docContent.push(
        {
          text: 'Wizualizacja porównania kosztów',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10],
          alignment: 'center' as Alignment
        }
      );
      
      // Pobieranie wszystkich elementów canvas z wykresami
      const charts = document.querySelectorAll<HTMLCanvasElement>('canvas');
      
      if (charts.length > 0) {
        // Dodaj pierwszy wykres (główny wykres porównawczy)
        const mainChart = charts[0];
        const chartImage = mainChart.toDataURL('image/png', 1.0);
        
        docContent.push({
          image: chartImage,
          width: 500,
          alignment: 'center' as Alignment,
          margin: [0, 10, 0, 10]
        });
        
        // Dodaj opcjonalnie inne wykresy, jeśli istnieją
        for (let i = 1; i < charts.length; i++) {
          const chartImage = charts[i].toDataURL('image/png', 1.0);
          docContent.push({
            image: chartImage,
            width: 450,
            alignment: 'center' as Alignment,
            margin: [0, 20, 0, 10]
          });
        }
      }
    } catch (error) {
      console.error('Błąd podczas dodawania wykresów do PDF:', error);
    }
    
    // Dodanie stopki raportu
    docContent.push(
      {
        text: 'Zastrzeżenia prawne',
        style: 'sectionHeader',
        margin: [0, 20, 0, 5],
      },
      {
        text: 'Niniejszy raport stanowi wyłącznie symulację finansową opartą na przyjętych założeniach i danych wprowadzonych przez Użytkownika. Nie stanowi on porady finansowej ani rekomendacji inwestycyjnej. Rzeczywiste koszty i przychody mogą różnić się od prezentowanych w raporcie w zależności od zmian na rynku nieruchomości, stóp procentowych, inflacji oraz innych czynników ekonomicznych i indywidualnych uwarunkowań.',
        style: 'small',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'Wygenerowano przez Kalkulator Finansowy Nieruchomości',
        style: 'footer',
        alignment: 'center' as Alignment,
        margin: [0, 20, 0, 0]
      },
      {
        text: 'kalkulatorynieruchomosci.pl',
        style: 'footer',
        alignment: 'center' as Alignment,
        color: '#3366CC',
      }
    );
    
    // Definicja stylów dokumentu
    const styles = {
      header: {
        fontSize: 22,
        bold: true,
        color: '#333333',
        margin: [0, 0, 0, 10] as [number, number, number, number]
      },
      subheader: {
        fontSize: 14,
        color: '#666666',
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: '#444444',
        margin: [0, 10, 0, 8] as [number, number, number, number]
      },
      tableHeader: {
        fontSize: 12,
        bold: true,
        color: 'white',
        fillColor: '#4472C4',
        margin: [0, 5, 0, 5] as [number, number, number, number]
      },
      small: {
        fontSize: 10,
        color: '#666666',
        alignment: 'justify' as Alignment
      },
      footer: {
        fontSize: 10,
        color: '#999999'
      }
    };
    
    // Konfiguracja dokumentu PDF
    const docDefinition: TDocumentDefinitions = {
      content: docContent,
      styles: styles,
      defaultStyle: {
        fontSize: 12,
        color: '#333333'
      },
      pageMargins: [40, 40, 40, 60],
      footer: function(currentPage, pageCount) {
        return {
          text: `Strona ${currentPage.toString()} z ${pageCount}`,
          alignment: 'center' as Alignment,
          style: 'footer',
          margin: [0, 20, 0, 0] as [number, number, number, number]
        };
      }
    };
    
    // Generowanie PDF
    pdfMake.createPdf(docDefinition).download('Analiza_finansowa_nieruchomosci.pdf');
    
    // Wywołanie callback-a po wygenerowaniu PDF
    if (onGenerate) {
      onGenerate();
    }
  };
  
  return (
    <button 
      onClick={generatePDF}
      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      Generuj raport PDF
    </button>
  );
};

export default SummaryPDF;