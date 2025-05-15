import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import InvestmentCalculator from '../components/InvestmentCalculator';
import ResultsDisplay from '../components/ResultsDisplay';
import ShareResults from '../components/ShareResults';
import { CalculationResults } from '../types';

const InvestmentCalculatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [inflation, setInflation] = useState<number>(0);

  useEffect(() => {
    const sharedData = searchParams.get('data');
    if (sharedData) {
      try {
        const decodedData = JSON.parse(atob(sharedData));
        setResults(decodedData);
        toast.success('Wyniki zostały załadowane pomyślnie!');
      } catch (error) {
        console.error('Błąd podczas dekodowania udostępnionych danych:', error);
        toast.error('Nie udało się załadować udostępnionych wyników');
      }
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-indigo-900">Kalkulator Inwestycji</h2>
      <div className="mb-8">
        <InvestmentCalculator 
          investment={500000} 
          cashFlows={[20000, 25000, 30000, 35000, 40000]} 
          discountRate={5} 
        />
      </div>
      {results && (
        <>
          <ResultsDisplay 
            results={results} 
            inflation={inflation}
            calculatorType="investment"
          />
          <div className="mt-6">
            <ShareResults results={results} calculatorType="investment" />
          </div>
        </>
      )}
    </div>
  );
};

export default InvestmentCalculatorPage; 