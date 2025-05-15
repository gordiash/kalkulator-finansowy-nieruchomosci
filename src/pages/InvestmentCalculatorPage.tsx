import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import InvestmentCalculator from '../components/InvestmentCalculator';
import ResultsDisplay from '../components/ResultsDisplay';
import { CalculationResults } from '../types';
import { Helmet } from 'react-helmet';

const InvestmentCalculatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [inflation] = useState<number>(2.5);

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

  const handleCalculate = (calculationResult: any) => {
    // Przekształcamy wyniki kalkulacji do formatu oczekiwanego przez ResultsDisplay
    const formattedResults: CalculationResults = {
      buyingSummary: {
        monthlyMortgagePayment: 0,
        downPayment: calculationResult.investment,
        loanAmount: 0,
        totalMortgagePayments: 0,
        totalOtherCosts: 0,
        buyingTotal: calculationResult.investment,
        propertyValue: calculationResult.investment + calculationResult.totalReturn,
        roe: calculationResult.roi,
        dti: 0
      },
      rentingSummary: {
        monthlyRent: calculationResult.cashFlows[0] || 0,
        totalRent: calculationResult.totalReturn,
        totalRentInsurance: 0,
        totalRentMaintenance: 0,
        rentingTotal: 0,
        investmentValue: calculationResult.npv
      },
      comparison: {
        difference: 0,
        finalDifference: calculationResult.npv - calculationResult.investment,
        buyingIsBetter: calculationResult.npv > calculationResult.investment,
        breakEvenYear: calculationResult.breakEvenYear || 0
      },
      yearlyCosts: {
        buying: calculationResult.yearlyInvestmentCosts || [],
        renting: calculationResult.yearlyCashFlows || []
      },
      cumulativeCosts: {
        buying: calculationResult.cumulativeInvestmentCosts || [],
        renting: calculationResult.cumulativeCashFlows || []
      }
    };

    setResults(formattedResults);
  };

  return (
    <>
      <Helmet>
        <title>Kalkulator Inwestycji Nieruchomości | Porównanie Zakupu i Wynajmu</title>
        <meta name="description" content="Kalkulator Inwestycji Nieruchomości pozwala porównać opłacalność zakupu i wynajmu mieszkania. Sprawdź co będzie bardziej korzystne w Twojej sytuacji." />
        <meta name="keywords" content="kalkulator inwestycji nieruchomości, porównanie zakupu i wynajmu, opłacalność mieszkania, analiza inwestycji mieszkaniowej" />
        <link rel="canonical" href="https://kalkulator-finansowy-nieruchomosci.pl/kalkulator-inwestycji" />
      </Helmet>
      
      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-900">Kalkulator Inwestycji</h2>
        <div className="mb-8">
          <InvestmentCalculator 
            investment={500000} 
            cashFlows={[20000, 25000, 30000, 35000, 40000]} 
            discountRate={5}
            onCalculate={handleCalculate}
          />
        </div>
        {results && (
          <>
            <ResultsDisplay 
              results={results} 
              inflation={inflation}
              calculatorType="investment"
            />
          </>
        )}
      </div>
    </>
  );
};

export default InvestmentCalculatorPage; 