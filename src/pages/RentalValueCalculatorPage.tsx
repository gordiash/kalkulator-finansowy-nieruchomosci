import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ResultsDisplay from '../components/ResultsDisplay';
import { CalculationResults } from '../types';
import { sanitizeNumber } from '../utils/sanitizeUtils';
import { Helmet } from 'react-helmet';
import { gusInflationFetcher } from '../utils/gusInflationFetcher';

const RentalValueCalculatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [monthlyRent, setMonthlyRent] = useState<number>(0);
  const [roi, setRoi] = useState<number>(0);
  const [rentalPeriod, setRentalPeriod] = useState<number>(10);
  const [propertyValue, setPropertyValue] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
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
        setIsCalculated(true);
        toast.success('Wyniki zostały załadowane pomyślnie!');
      } catch (error) {
        console.error('Błąd podczas dekodowania udostępnionych danych:', error);
        toast.error('Nie udało się załadować udostępnionych wyników');
      }
    }
  }, [searchParams]);

  // Bezpieczne metody aktualizacji stanu z walidacją
  const updateMonthlyRent = (value: string | number) => {
    setMonthlyRent(sanitizeNumber(value, 0, 0, null));
  };

  const updateRoi = (value: string | number) => {
    setRoi(sanitizeNumber(value, 0, 0, 100));
  };

  const updateRentalPeriod = (value: string | number) => {
    setRentalPeriod(sanitizeNumber(value, 0, 1, 100));
  };

  const calculatePropertyValue = () => {
    if (monthlyRent <= 0 || roi <= 0 || rentalPeriod <= 0) {
      alert('Wprowadź poprawne wartości dla wszystkich pól');
      return;
    }

    // Ponowna sanityzacja wartości przed obliczeniami
    const sanitizedMonthlyRent = sanitizeNumber(monthlyRent, 0, 0, null);
    const sanitizedRoi = sanitizeNumber(roi, 0, 0.1, 100);
    const sanitizedRentalPeriod = sanitizeNumber(rentalPeriod, 0, 1, 100);

    // Obliczanie rocznego zysku z najmu
    const yearlyRent = sanitizedMonthlyRent * 12;
    
    // Obliczanie wartości nieruchomości na podstawie ROI
    // ROI = (Roczny zysk / Wartość nieruchomości) * 100
    // Wartość nieruchomości = (Roczny zysk / ROI) * 100
    const calculatedValue = (yearlyRent / sanitizedRoi) * 100;
    
    setPropertyValue(calculatedValue);
    setIsCalculated(true);
    
    // Generowanie danych dla ResultsDisplay
    const calculationResults: CalculationResults = {
      buyingSummary: {
        monthlyMortgagePayment: 0,
        downPayment: calculatedValue * 0.2, // Zakładamy 20% wkładu własnego
        loanAmount: calculatedValue * 0.8, // Zakładamy 80% kredytu
        totalMortgagePayments: 0,
        totalOtherCosts: 0,
        buyingTotal: calculatedValue,
        propertyValue: calculatedValue * (1 + (inflation / 100) * sanitizedRentalPeriod), // Wartość końcowa z uwzględnieniem inflacji
        roe: sanitizedRoi,
        dti: 0
      },
      rentingSummary: {
        monthlyRent: sanitizedMonthlyRent,
        totalRent: sanitizedMonthlyRent * 12 * sanitizedRentalPeriod,
        totalRentInsurance: 0,
        totalRentMaintenance: 0,
        rentingTotal: sanitizedMonthlyRent * 12 * sanitizedRentalPeriod,
        investmentValue: 0
      },
      comparison: {
        difference: 0,
        finalDifference: calculatedValue - (sanitizedMonthlyRent * 12 * sanitizedRentalPeriod),
        buyingIsBetter: true,
        breakEvenYear: Math.ceil(calculatedValue / (sanitizedMonthlyRent * 12))
      },
      yearlyCosts: {
        buying: Array(sanitizedRentalPeriod).fill(calculatedValue / sanitizedRentalPeriod),
        renting: Array(sanitizedRentalPeriod).fill(sanitizedMonthlyRent * 12)
      },
      cumulativeCosts: {
        buying: Array(sanitizedRentalPeriod).fill(0).map((_, i) => calculatedValue * (i + 1) / sanitizedRentalPeriod),
        renting: Array(sanitizedRentalPeriod).fill(0).map((_, i) => sanitizedMonthlyRent * 12 * (i + 1))
      }
    };
    
    setResults(calculationResults);
  };

  return (
    <>
      <Helmet>
        <title>Kalkulator Wartości Najmu | Oblicz wartość nieruchomości na podstawie ROI</title>
        <meta name="description" content="Kalkulator Wartości Najmu pomoże Ci określić wartość nieruchomości na podstawie zysku z najmu i oczekiwanego zwrotu z inwestycji. Sprawdź realną wartość inwestycji." />
        <meta name="keywords" content="kalkulator wartości najmu, analiza wartości nieruchomości, ROI nieruchomości, wartość inwestycji mieszkaniowej" />
        <link rel="canonical" href="https://kalkulator-finansowy-nieruchomosci.pl/kalkulator-wartosci-najmu" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto py-12 px-4 max-w-7xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">
            Kalkulator wartości nieruchomości na podstawie ROI
          </h1>
          
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
          
          <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <p className="text-gray-600 mb-6">
              Ten kalkulator pomoże Ci określić wartość nieruchomości na podstawie zysku z najmu, oczekiwanego zwrotu z inwestycji (ROI) oraz planowanego okresu wynajmu.
            </p>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Aktualna inflacja:</span>
              <span className="text-sm font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                {inflation.toFixed(1)}% (źródło: GUS)
              </span>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miesięczny czynsz najmu (PLN)
                </label>
                <input
                  type="number"
                  value={monthlyRent || ''}
                  onChange={(e) => updateMonthlyRent(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Np. 2500"
                  min="0"
                  aria-labelledby="monthly-rent-label"
                  aria-describedby="monthly-rent-description"
                />
                <p id="monthly-rent-description" className="mt-1 text-sm text-gray-500">
                  Wprowadź miesięczny przychód z najmu, po odjęciu kosztów
                </p>
              </div>

              <div>
                <label id="roi-label" className="block text-sm font-medium text-gray-700 mb-1">
                  Oczekiwany ROI (%)
                </label>
                <input
                  type="number"
                  value={roi || ''}
                  onChange={(e) => updateRoi(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Np. 5"
                  min="0"
                  max="100"
                  step="0.1"
                  aria-labelledby="roi-label"
                  aria-describedby="roi-description"
                />
                <p id="roi-description" className="mt-1 text-sm text-gray-500">
                  Return on Investment - roczny zwrot z inwestycji wyrażony jako procent
                </p>
              </div>

              <div>
                <label id="rental-period-label" className="block text-sm font-medium text-gray-700 mb-1">
                  Okres wynajmu (lata)
                </label>
                <input
                  type="number"
                  value={rentalPeriod || ''}
                  onChange={(e) => updateRentalPeriod(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Np. 10"
                  min="1"
                  aria-labelledby="rental-period-label"
                  aria-describedby="rental-period-description"
                />
                <p id="rental-period-description" className="mt-1 text-sm text-gray-500">
                  Planowany okres wynajmu nieruchomości w latach
                </p>
              </div>

              <button
                onClick={calculatePropertyValue}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                aria-label="Oblicz wartość nieruchomości na podstawie wprowadzonych danych"
              >
                Oblicz wartość nieruchomości
              </button>
            </div>

            {isCalculated && !results && (
              <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-lg">
                <h2 className="text-xl font-semibold text-indigo-900 mb-2">Wynik kalkulacji</h2>
                <div className="flex flex-col space-y-4">
                  <div>
                    <p className="text-gray-600">Szacowana wartość nieruchomości:</p>
                    <p className="text-3xl font-bold text-indigo-700">
                      {propertyValue.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Roczny zysk z najmu:</p>
                    <p className="text-xl font-semibold text-indigo-700">
                      {(monthlyRent * 12).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Całkowity zysk w okresie {rentalPeriod} lat:</p>
                    <p className="text-xl font-semibold text-indigo-700">
                      {(monthlyRent * 12 * rentalPeriod).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {results && (
          <ResultsDisplay 
            results={results} 
            inflation={inflation}
            calculatorType="rental-value"
            propertyPrice={propertyValue}
          />
        )}
      </div>
    </>
  );
};

export default RentalValueCalculatorPage; 