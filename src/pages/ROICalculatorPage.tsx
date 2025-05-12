import React, { useState, useEffect } from 'react';
import { PropertyFormData, RentFormData, AnalysisOptions, CalculationResults } from '../types';
import PropertyForm from '../components/PropertyForm';
import RentForm from '../components/RentForm';
import AnalysisForm from '../components/AnalysisForm';
import ResultsDisplay from '../components/ResultsDisplay';
import SubscriptionPopup from '../components/SubscriptionPopup';
import SuccessMessage from '../components/SuccessMessage';
import { calculateResults } from '../utils/calculations';
import { sendSubscriberToAirtable } from '../utils/airtable';
import { gusInflationFetcher } from '../utils/gusInflationFetcher';

const ROICalculatorPage: React.FC = () => {
  // Stan formularzy
  const [propertyData, setPropertyData] = useState<PropertyFormData>({
    propertyPrice: 500000,
    downPaymentType: 'amount',
    downPaymentValue: 100000,
    baseRate: 5.6,
    bankMargin: 2.0,
    loanTerm: 25,
    propertyTax: 600,
    insurance: 800,
    maintenance: 2000,
    communityRent: 4800,
    appreciation: 3,
    transactionCosts: 10000,
    notaryFee: 500000 * 0.01, // 1% of property price
    pcc: 500000 * 0.02, // 2% of property price
    courtFee: 200, // Fixed value
    notarialActCopyCost: 100 // Fixed value
  });

  const [rentData, setRentData] = useState<RentFormData>({
    monthlyRent: 2500,
    rentIncrease: 4,
    securityDeposit: 5000,
    renterInsurance: 200,
    rentMaintenance: 500,
    investmentReturn: 5
  });

  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>({
    analysisPeriod: 30,
    inflation: 2.5 // Początkowo wartość domyślna, zostanie zaktualizowana danymi z GUS
  });

  // Stany UI
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Stan ładowania danych inflacji
  const [isLoadingInflation, setIsLoadingInflation] = useState(false);
  const [inflationLoadError, setInflationLoadError] = useState<string | null>(null);
  
  // Sprawdzenie czy to pierwsze kliknięcie przycisku "Oblicz"
  const [hasCalculatedBefore, setHasCalculatedBefore] = useState(false);
  
  // Resetowanie stanu hasCalculatedBefore przy każdym uruchomieniu aplikacji
  useEffect(() => {
    // Sprawdzamy, czy użytkownik już wcześniej kliknął przycisk "Oblicz"
    const hasClickedBefore = localStorage.getItem('userClickedCalculate') === 'true';
    setHasCalculatedBefore(hasClickedBefore);
    
    // Dodajemy obsługę zdarzenia beforeunload, które resetuje localStorage po zamknięciu strony
    const handleBeforeUnload = () => {
      localStorage.removeItem('userClickedCalculate');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Czyszczenie event listenera przy odmontowaniu komponentu
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Pobieranie aktualnej wartości inflacji z API GUS
  useEffect(() => {
    const fetchInflationData = async () => {
      setIsLoadingInflation(true);
      setInflationLoadError(null);
      
      try {
        const inflationValue = await gusInflationFetcher.getCurrentInflation();
        
        // Aktualizacja stanu tylko jeśli komponent jest wciąż zamontowany
        setAnalysisOptions(prev => ({
          ...prev,
          inflation: inflationValue
        }));
        
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
    
    // Wywołanie funkcji pobierającej dane
    fetchInflationData();
    
    // Ustawienie interwału sprawdzającego aktualizacje inflacji co tydzień
    const inflationCheckInterval = setInterval(fetchInflationData, 7 * 24 * 60 * 60 * 1000);
    
    // Oczyszczenie interwału przy odmontowaniu komponentu
    return () => {
      clearInterval(inflationCheckInterval);
    };
  }, []);

  useEffect(() => {
    setPropertyData((prev) => ({
      ...prev,
      notaryFee: prev.propertyPrice * 0.01, // 1% of property price
      pcc: prev.propertyPrice * 0.02, // 2% of property price
    }));
  }, [propertyData.propertyPrice]);

  const handlePropertyChange = (data: Partial<PropertyFormData>) => {
    setPropertyData(prev => ({ ...prev, ...data }));
  };

  const handleRentChange = (data: Partial<RentFormData>) => {
    setRentData(prev => ({ ...prev, ...data }));
  };

  const handleAnalysisOptionsChange = (data: Partial<AnalysisOptions>) => {
    setAnalysisOptions(prev => ({ ...prev, ...data }));
  };

  const handleCalculate = () => {
    try {
      const calculationResults = calculateResults(propertyData, rentData, analysisOptions);
      setResults(calculationResults);
      setShowResults(true);
      
      // Pokazanie popupu subskrypcji przy pierwszym kliknięciu
      if (!hasCalculatedBefore) {
        setShowSubscriptionPopup(true);
        setHasCalculatedBefore(true);
        localStorage.setItem('userClickedCalculate', 'true');
      }
      
      // Przewijanie do wyników
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Wystąpił błąd podczas obliczeń');
      }
    }
  };

  const handleSubscribe = async (email: string) => {
    try {
      // Wysyłanie danych do Airtable
      await sendSubscriberToAirtable(email);
      console.log('Subskrybowano: ', email);
      
      // Zamknięcie popupu i pokazanie komunikatu sukcesu
      setShowSubscriptionPopup(false);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
    } catch (error) {
      console.error('Błąd podczas wysyłania danych do Airtable:', error);
      alert('Wystąpił błąd podczas zapisywania subskrypcji. Spróbuj ponownie później.');
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-indigo-900">Kalkulator ROI Nieruchomości</h2>
      
      {/* Informacja o danych inflacji */}
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
      
      {/* Karta parametrów ROI */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-gray-100 transition-all duration-300 hover:shadow-lg">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Parametry kalkulacji</h3>
          <p className="text-gray-600 text-sm">Wprowadź dane dotyczące zakupu i wynajmu, aby otrzymać szczegółową analizę.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <PropertyForm data={propertyData} onChange={handlePropertyChange} />
          <RentForm data={rentData} onChange={handleRentChange} />
        </div>
        <div className="mt-8 mb-6">
          <AnalysisForm 
            options={analysisOptions} 
            onChange={handleAnalysisOptionsChange}
            onCalculate={handleCalculate}
            inflationSource="GUS (Główny Urząd Statystyczny)"
          />
        </div>
      </div>
      
      {/* Sekcja wyników ROI */}
      {showResults && results && (
        <div id="results-section">
          <ResultsDisplay results={results} inflation={analysisOptions.inflation} />
        </div>
      )}
      
      {/* Popup subskrypcji */}
      {showSubscriptionPopup && (
        <SubscriptionPopup onSubscribe={handleSubscribe} onClose={() => setShowSubscriptionPopup(false)} />
      )}
      
      {/* Komunikat sukcesu */}
      {showSuccessMessage && <SuccessMessage message="Dziękujemy za zapisanie się do newslettera!" />}
    </div>
  );
};

export default ROICalculatorPage; 