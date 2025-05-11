import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResults } from '../types';
import { Chart as ChartJS } from 'chart.js';

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
    // Inicjalizacja dokumentu PDF z obsługą Unicode (dla polskich znaków)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
    // Używamy domyślnej czcionki helvetica, która w jsPDF wspiera znaki diakrytyczne
    doc.setFont('helvetica', 'normal');
    
    // Funkcja pomocnicza do kodowania polskich znaków
    const encodePolishChars = (text: string): string => {
      return unescape(encodeURIComponent(text));
    };
    
    // Funkcja pomocnicza do wyświetlania tekstu z polskimi znakami
    const textWithPolishChars = (text: string, x: number, y: number, options?: any): void => {
      doc.text(encodePolishChars(text), x, y, options);
    };
    
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
    
    // Tytuł dokumentu
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    textWithPolishChars('Raport analizy finansowej nieruchomości', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    textWithPolishChars(`Wygenerowano: ${today}`, 105, 22, { align: 'center' });
    
    // Podstawowe informacje
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    textWithPolishChars('Podsumowanie analizy', 14, 30);
    
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 32, 196, 32);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    textWithPolishChars(`Wartość nieruchomości: ${formatCurrency(propertyPrice)}`, 14, 40);
    textWithPolishChars(`Adres/lokalizacja: ${address}`, 14, 45);
    textWithPolishChars(`Założona inflacja: ${formatPercent(inflation)}`, 14, 50);
    textWithPolishChars(`Okres analizy: ${results.comparison.chartData.labels.length} lat`, 14, 55);
    
    // Sekcja zakupu
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.setFont('helvetica', 'bold');
    textWithPolishChars('Zakup nieruchomości', 14, 65);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    // Przygotowanie danych zakupu z zakodowanymi polskimi znakami
    const buyingData = [
      [encodePolishChars('Wkład własny'), formatCurrency(results.buyingSummary.downPayment)],
      [encodePolishChars('Kwota kredytu'), formatCurrency(results.buyingSummary.loanAmount)],
      [encodePolishChars('Miesięczna rata'), formatCurrency(results.buyingSummary.monthlyMortgagePayment)],
      [encodePolishChars('Suma rat kredytu'), formatCurrency(results.buyingSummary.totalMortgagePayments)],
      [encodePolishChars('Pozostałe koszty'), formatCurrency(results.buyingSummary.totalOtherCosts)],
      [encodePolishChars('Całkowity koszt zakupu'), formatCurrency(results.buyingSummary.buyingTotal)],
      [encodePolishChars('Szacowana wartość końcowa'), formatCurrency(results.buyingSummary.propertyValue)],
      [encodePolishChars('Zysk/strata'), formatCurrency(results.buyingSummary.propertyValue - results.buyingSummary.buyingTotal)]
    ];
    
    // Używam zaimportowanej funkcji autoTable z obsługą polskich znaków
    autoTable(doc, {
      startY: 70,
      head: [[encodePolishChars('Parametr'), encodePolishChars('Wartość')]],
      body: buyingData,
      theme: 'grid',
      headStyles: { 
        fillColor: [0, 102, 204], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        font: 'helvetica'
      },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 60, halign: 'right' } },
    });
    
    // Sekcja wynajmu
    const finalY = (doc as any).lastAutoTable?.finalY || 130;
    const currentY = finalY + 10;

    doc.setFontSize(12);
    doc.setTextColor(230, 126, 34);
    doc.setFont('helvetica', 'bold');
    textWithPolishChars('Wynajem nieruchomości', 14, currentY);
    
    doc.setFont('helvetica', 'normal');
    
    // Przygotowanie danych wynajmu z zakodowanymi polskimi znakami
    const rentingData = [
      [encodePolishChars('Miesięczny czynsz (początkowy)'), formatCurrency(results.rentingSummary.monthlyRent)],
      [encodePolishChars('Suma zapłaconych czynszów'), formatCurrency(results.rentingSummary.totalRent)],
      [encodePolishChars('Suma kosztów ubezpieczenia'), formatCurrency(results.rentingSummary.totalRentInsurance)],
      [encodePolishChars('Suma kosztów utrzymania'), formatCurrency(results.rentingSummary.totalRentMaintenance)],
      [encodePolishChars('Całkowity koszt wynajmu'), formatCurrency(results.rentingSummary.rentingTotal)],
      [encodePolishChars('Wartość końcowa inwestycji'), formatCurrency(results.rentingSummary.investmentValue)],
      [encodePolishChars('Zysk/strata'), formatCurrency(results.rentingSummary.investmentValue - results.rentingSummary.rentingTotal)]
    ];
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [[encodePolishChars('Parametr'), encodePolishChars('Wartość')]],
      body: rentingData,
      theme: 'grid',
      headStyles: { 
        fillColor: [230, 126, 34], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        font: 'helvetica'
      },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 60, halign: 'right' } },
    });
    
    // Podsumowanie porównania
    const finalY2 = (doc as any).lastAutoTable?.finalY || (currentY + 80);
    const comparisionY = finalY2 + 10;

    doc.setFontSize(12);
    doc.setTextColor(46, 125, 50);
    doc.setFont('helvetica', 'bold');
    textWithPolishChars('Porównanie opcji zakupu i wynajmu', 14, comparisionY);
    
    doc.setFont('helvetica', 'normal');
    
    const breakEvenIndex = results.comparison.chartData.mortgageCostData.findIndex((value, index) => 
      value <= results.comparison.chartData.rentCostData[index] && (index === 0 || results.comparison.chartData.mortgageCostData[index - 1] > results.comparison.chartData.rentCostData[index - 1])
    );
    
    const breakEvenYear = breakEvenIndex !== -1 
      ? results.comparison.chartData.labels[breakEvenIndex] 
      : "Nie osiągnięto w okresie analizy";
    
    // Przygotowanie danych porównania z zakodowanymi polskimi znakami
    const comparisonData = [
      [encodePolishChars('Końcowa różnica finansowa'), formatCurrency(results.comparison.finalDifference)],
      [encodePolishChars('Korzystniejsza opcja'), encodePolishChars(results.comparison.buyingIsBetter ? 'ZAKUP' : 'WYNAJEM')],
      [encodePolishChars('Punkt rentowności (break-even)'), encodePolishChars(breakEvenYear)]
    ];
    
    autoTable(doc, {
      startY: comparisionY + 5,
      head: [[encodePolishChars('Parametr'), encodePolishChars('Wartość')]],
      body: comparisonData,
      theme: 'grid',
      headStyles: { 
        fillColor: [46, 125, 50], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        font: 'helvetica'
      },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 60, halign: 'right' } },
    });
    
    // Dodanie wizualizacji danych
    try {
      // Pobieranie elementów canvas z wykresami (jeśli istnieją)
      const charts = document.querySelectorAll<HTMLCanvasElement>('canvas');
      if (charts.length > 0) {
        const finalY3 = (doc as any).lastAutoTable?.finalY || (comparisionY + 50);
        const chartY = finalY3 + 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        textWithPolishChars('Wizualizacja porównania kosztów', 105, chartY, { align: 'center' });
        
        const mainChart = charts[0]; // Pierwszy znaleziony wykres
        const chartImage = mainChart.toDataURL('image/png', 1.0);
        
        // Dodanie obrazu wykresu
        doc.addImage(chartImage, 'PNG', 25, chartY + 5, 160, 80);
      }
    } catch (error) {
      console.error('Błąd podczas generowania wykresu w PDF:', error);
    }
    
    // Stopka
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      textWithPolishChars(`Strona ${i} z ${pageCount}`, 105, 285, { align: 'center' });
      textWithPolishChars('Kalkulator Finansowy Nieruchomości - Analiza porównawcza zakupu i wynajmu', 105, 290, { align: 'center' });
    }
    
    // Zapisanie i pobranie PDF
    doc.save('analiza-nieruchomosci.pdf');
    
    // Callback po wygenerowaniu
    if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-4 rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 flex items-center justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Generuj PDF z analizą
    </button>
  );
};

export default SummaryPDF;