import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import InvestmentCalculator from '../components/InvestmentCalculator';
import ResultsDisplay from '../components/ResultsDisplay';
import { CalculationResults } from '../types';
import { Helmet } from 'react-helmet';
import { gusInflationFetcher } from '../utils/gusInflationFetcher';

const InvestmentCalculatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [inflation, setInflation] = useState<number>(2.5);
  const [isLoadingInflation, setIsLoadingInflation] = useState(false);
  const [inflationLoadError, setInflationLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInflationData = async () => {
      setIsLoadingInflation(true);
      setInflationLoadError(null);
      
      try {
        const inflationValue = await gusInflationFetcher.getCurrentInflation();
        
        setInflation(inflationValue);
        
        console.log('Pobrano aktualną wartość inflacji z GUS:', inflationValue);
      } catch (error) {
        if (error instanceof Error) {
          setInflationLoadError(error.message);
        } else {
          setInflationLoadError('Wystąpił błąd podczas pobierania danych o inflacji');
        }
        console.error('Błąd podczas pobierania danych o inflacji:', error);
      } finally {
        setIsLoadingInflation(false);
      }
    };
    
    fetchInflationData();
    
    const inflationCheckInterval = setInterval(fetchInflationData, 7 * 24 * 60 * 60 * 1000);
    
    return () => {
      clearInterval(inflationCheckInterval);
    };
  }, []);

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
        
        {isLoadingInflation && (
          <div className="bg-blue-50 text-blue-700 p-2 rounded-lg mb-4 text-sm">
            Pobieranie aktualnych danych o inflacji z GUS...
          </div>
        )}
        
        {inflationLoadError && (
          <div className="bg-red-50 text-red-700 p-2 rounded-lg mb-4 text-sm">
            Błąd pobierania danych o inflacji: {inflationLoadError}
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex justify-end mb-4">
            <span className="text-sm font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
              Aktualna inflacja: {inflation.toFixed(1)}% (źródło: GUS)
            </span>
          </div>
          
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