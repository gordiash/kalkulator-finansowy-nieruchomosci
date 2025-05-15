import React, { useState } from 'react';
import { CalculationResults } from '../types';
import SummaryPDF from './SummaryPDF';
import CostComparisonChart from './CostComparisonChart';
import BreakEvenCalculator from './BreakEvenCalculator';
import ShareResults from './ShareResults';

interface ResultsDisplayProps {
  results: CalculationResults;
  inflation: number;
  propertyPrice?: number;
  calculatorType: 'roi' | 'investment' | 'rental-value';
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  inflation, 
  propertyPrice = 500000, // domyślna wartość
  calculatorType,
}) => {
  const [chartView, setChartView] = useState<'cumulative' | 'yearly'>('cumulative');
  const [showPdfSuccessMessage, setShowPdfSuccessMessage] = useState(false);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const { buyingSummary, rentingSummary, comparison } = results;
  
  const handlePdfGenerated = () => {
    setShowPdfSuccessMessage(true);
    setTimeout(() => {
      setShowPdfSuccessMessage(false);
    }, 3000);
  };

  // Funkcja, która określa kolor dla wskaźnika ROE
  const getRoeColor = (roe: number) => {
    if (roe < 0) return 'text-red-700';
    if (roe < 5) return 'text-orange-700';
    if (roe < 10) return 'text-yellow-700';
    return 'text-green-700';
  };

  // Funkcja, która określa kolor dla wskaźnika DTI
  const getDtiColor = (dti: number) => {
    if (dti > 40) return 'text-red-700';
    if (dti > 30) return 'text-orange-700';
    if (dti > 20) return 'text-yellow-700';
    return 'text-green-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-10 animate-fadeIn">
      <h2 className="text-2xl font-bold text-center text-indigo-900 mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-amber-500 after:rounded-md">
        <svg className="w-6 h-6 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
        </svg>
        Wyniki analizy
      </h2>

      {/* Analiza punktu rentowności */}
      <BreakEvenCalculator results={results} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Podsumowanie zakupu */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-300">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 text-center relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-amber-500 after:rounded-md">
            Podsumowanie zakupu
          </h3>
          <ul className="space-y-2">
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Miesięczna rata kredytu:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.monthlyMortgagePayment)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Wkład własny:</span>
              <span className="font-semibold text-indigo-900">
                {formatCurrency(buyingSummary.downPayment)} ({((buyingSummary.downPayment / (buyingSummary.downPayment + buyingSummary.loanAmount)) * 100).toFixed(2)}%)
              </span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Kwota kredytu:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.loanAmount)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma rat kredytu:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.totalMortgagePayments)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma innych kosztów:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.totalOtherCosts)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Całkowite koszty:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(buyingSummary.buyingTotal)}</span>
            </li>
            {/* Nowe wskaźniki: ROE i DTI */}
            <li className="flex justify-between p-3 bg-indigo-50 rounded-md shadow-sm">
              <span title="Return on Equity - zwrot z zainwestowanego kapitału własnego">
                ROE (Zwrot z kapitału):
                <svg className="w-4 h-4 inline-block ml-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
              <span className={`font-semibold ${getRoeColor(buyingSummary.roe)}`}>
                {formatPercentage(buyingSummary.roe)}
              </span>
            </li>
            <li className="flex justify-between p-3 bg-indigo-50 rounded-md shadow-sm">
              <span title="Debt-to-Income - stosunek miesięcznej raty kredytu do dochodu">
                DTI (Stosunek kredytu do dochodu):
                <svg className="w-4 h-4 inline-block ml-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
              <span className={`font-semibold ${getDtiColor(buyingSummary.dti)}`}>
                {formatPercentage(buyingSummary.dti)}
              </span>
            </li>
            <li className="flex justify-between p-3 bg-amber-50 rounded-md shadow-sm font-semibold">
              <span>Wartość nieruchomości na koniec okresu:</span>
              <span className="text-amber-700">{formatCurrency(buyingSummary.propertyValue)}</span>
            </li>
          </ul>
        </div>

        {/* Podsumowanie wynajmu */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-300">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 text-center relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-amber-500 after:rounded-md">
            Podsumowanie wynajmu
          </h3>
          <ul className="space-y-2">
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Miesięczny czynsz:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.monthlyRent)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma czynszu:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.totalRent)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma ubezpieczenia:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.totalRentInsurance)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Suma kosztów bieżących:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.totalRentMaintenance)}</span>
            </li>
            <li className="flex justify-between p-3 bg-white rounded-md shadow-sm">
              <span>Całkowite koszty:</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(rentingSummary.rentingTotal)}</span>
            </li>
            <li className="flex justify-between p-3 bg-amber-50 rounded-md shadow-sm font-semibold">
              <span>Wartość inwestycji na koniec okresu:</span>
              <span className="text-amber-700">{formatCurrency(rentingSummary.investmentValue)}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Porównanie opcji */}
      <div className="bg-white p-6 border-2 border-gray-100 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-indigo-900 mb-4 text-center inline-block relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-500 after:rounded-md">
          Porównanie opcji
        </h3>
        
        <p className="mb-2 text-center">Uwzględniona inflacja: {inflation}% rocznie</p>
        <p className="mb-2 text-center">
          Różnica w kosztach całkowitych: {formatCurrency(Math.abs(comparison.difference))}
        </p>
        <p className="mb-2 text-center">
          {comparison.difference > 0 
            ? 'Wynajem jest tańszy o ' 
            : 'Zakup jest tańszy o '} 
          {formatCurrency(Math.abs(comparison.difference))}
        </p>
        <p className="mb-2 text-center">Uwzględniając wartość końcową nieruchomości i inwestycji:</p>
        <p className="mt-4 p-4 bg-amber-50 rounded-lg text-center font-bold text-lg text-amber-700 relative overflow-hidden shadow-sm before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-amber-500">
          {comparison.buyingIsBetter 
            ? 'Zakup jest korzystniejszy o ' 
            : 'Wynajem jest korzystniejszy o '} 
          {formatCurrency(Math.abs(comparison.finalDifference))}
        </p>
      </div>

      {/* Wykres porównawczy */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-indigo-900">Wizualizacja porównania kosztów</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setChartView('cumulative')}
              className={`px-3 py-1 text-sm rounded ${chartView === 'cumulative' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Koszty kumulowane
            </button>
            <button 
              onClick={() => setChartView('yearly')}
              className={`px-3 py-1 text-sm rounded ${chartView === 'yearly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Koszty roczne
            </button>
          </div>
        </div>
        
        <CostComparisonChart 
          results={results} 
          showCumulative={chartView === 'cumulative'}
          showBreakEvenPoint={true}
          title={chartView === 'cumulative' ? 'Porównanie skumulowanych kosztów w czasie' : 'Porównanie rocznych kosztów'}
        />
      </div>

      {/* Przycisk pobierania PDF */}
      <div className="mt-6 text-center relative">
        <SummaryPDF 
          results={results} 
          inflation={inflation} 
          propertyPrice={propertyPrice}
          onGenerate={handlePdfGenerated}
        />
        
        {showPdfSuccessMessage && (
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-700 px-4 py-2 rounded-md shadow-md text-sm">
            Raport PDF został pomyślnie wygenerowany!
          </div>
        )}
      </div>

      {/* Komponent udostępniania */}
      <ShareResults 
        results={results} 
        calculatorType={calculatorType}
      />
    </div>
  );
};

export default ResultsDisplay;