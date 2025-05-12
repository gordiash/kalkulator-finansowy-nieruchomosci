import React from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { CalculationResults } from '../types';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

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
    const breakEvenIndex = results.comparison.chartData.mortgageCostData.findIndex((value, index) => 
      value <= results.comparison.chartData.rentCostData[index] && (index === 0 || results.comparison.chartData.mortgageCostData[index - 1] > results.comparison.chartData.rentCostData[index - 1])
    );
    
    const breakEvenYear = breakEvenIndex !== -1 
      ? results.comparison.chartData.labels[breakEvenIndex] 
      : "Nie osiągnięto w okresie analizy";

    // Przygotowanie zawartości dokumentu
    const docContent: any[] = [
      // Nagłówek dokumentu
      {
        text: 'Raport analizy finansowej nieruchomości',
        style: 'header',
        alignment: 'center'
      },
      {
        text: `Wygenerowano: ${today}`,
        style: 'subheader',
        alignment: 'center',
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
              { text: `${results.comparison.chartData.labels.length} lat` }
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
            ['Wkład własny', { text: formatCurrency(results.buyingSummary.downPayment), alignment: 'right' }],
            ['Kwota kredytu', { text: formatCurrency(results.buyingSummary.loanAmount), alignment: 'right' }],
            ['Miesięczna rata', { text: formatCurrency(results.buyingSummary.monthlyMortgagePayment), alignment: 'right' }],
            ['Suma rat kredytu', { text: formatCurrency(results.buyingSummary.totalMortgagePayments), alignment: 'right' }],
            ['Pozostałe koszty', { text: formatCurrency(results.buyingSummary.totalOtherCosts), alignment: 'right' }],
            ['Całkowity koszt zakupu', { text: formatCurrency(results.buyingSummary.buyingTotal), alignment: 'right' }],
            ['Szacowana wartość końcowa', { text: formatCurrency(results.buyingSummary.propertyValue), alignment: 'right' }],
            ['Zysk/strata', { text: formatCurrency(results.buyingSummary.propertyValue - results.buyingSummary.buyingTotal), alignment: 'right' }]
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
            ['Miesięczny czynsz (początkowy)', { text: formatCurrency(results.rentingSummary.monthlyRent), alignment: 'right' }],
            ['Suma zapłaconych czynszów', { text: formatCurrency(results.rentingSummary.totalRent), alignment: 'right' }],
            ['Suma kosztów ubezpieczenia', { text: formatCurrency(results.rentingSummary.totalRentInsurance), alignment: 'right' }],
            ['Suma kosztów utrzymania', { text: formatCurrency(results.rentingSummary.totalRentMaintenance), alignment: 'right' }],
            ['Całkowity koszt wynajmu', { text: formatCurrency(results.rentingSummary.rentingTotal), alignment: 'right' }],
            ['Wartość końcowa inwestycji', { text: formatCurrency(results.rentingSummary.investmentValue), alignment: 'right' }],
            ['Zysk/strata', { text: formatCurrency(results.rentingSummary.investmentValue - results.rentingSummary.rentingTotal), alignment: 'right' }]
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
            ['Końcowa różnica finansowa', { text: formatCurrency(results.comparison.finalDifference), alignment: 'right' }],
            ['Korzystniejsza opcja', { text: results.comparison.buyingIsBetter ? 'ZAKUP' : 'WYNAJEM', alignment: 'right' }],
            ['Punkt rentowności (break-even)', { text: breakEvenYear, alignment: 'right' }]
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
          alignment: 'center'
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
          alignment: 'center',
          margin: [0, 10, 0, 10]
        });
        
        // Dodaj opcjonalnie inne wykresy, jeśli istnieją
        for (let i = 1; i < charts.length; i++) {
          const chartImage = charts[i].toDataURL('image/png', 1.0);
          docContent.push({
            image: chartImage,
            width: 450,
            alignment: 'center',
            margin: [0, 20, 0, 10]
          });
        }
      }
    } catch (error) {
      console.error('Błąd podczas dodawania wykresów do PDF:', error);
    }

    // Definicja dokumentu PDF
    const docDefinition: TDocumentDefinitions = {
      content: docContent,
      
      // Definicje stylów
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: '#003366',
          margin: [0, 0, 0, 5]
        },
        subheader: {
          fontSize: 10,
          color: '#666666'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableHeader: {
          color: 'white',
          bold: true
        }
      },
      
      // Definicja stopki
      footer: function(currentPage, pageCount) {
        return {
          text: `Strona ${currentPage} z ${pageCount}`,
          alignment: 'center',
          fontSize: 8,
          color: '#999999',
          margin: [0, 10, 0, 0]
        };
      },
      
      // Konfiguracja dokumentu
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10
      },
      
      // Ustawienie marginesów strony
      pageMargins: [40, 40, 40, 40],
      
      // Ustawienie języka dokumentu
      info: {
        title: 'Raport analizy finansowej nieruchomości',
        author: 'Kalkulator Finansowy Nieruchomości',
        subject: 'Analiza porównawcza zakupu i wynajmu nieruchomości',
        keywords: 'nieruchomości, analiza finansowa, zakup, wynajem'
      }
    };

    // Generowanie i zapisywanie pliku PDF
    try {
      // Generuj PDF
      const pdfDoc = pdfMake.createPdf(docDefinition);
      
      // Pobierz jako blob i zapisz
      pdfDoc.download('Analiza_finansowa_nieruchomosci.pdf');
      
      // Opcjonalnie wywołaj funkcję po wygenerowaniu
      if (onGenerate) {
        onGenerate();
      }
    } catch (error) {
      console.error('Błąd podczas generowania PDF:', error);
    }
  };

  return (
    <div className="mt-4 text-center">
      <button
        onClick={generatePDF}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition duration-300"
      >
        Generuj PDF z analizą
      </button>
    </div>
  );
};

export default SummaryPDF;