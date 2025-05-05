import React, { useState, useEffect } from 'react';
import { PropertyFormData, RentFormData, AnalysisOptions, CalculationResults } from './types';
import PropertyForm from './components/PropertyForm';
import RentForm from './components/RentForm';
import AnalysisForm from './components/AnalysisForm';
import ResultsDisplay from './components/ResultsDisplay';
import SubscriptionPopup from './components/SubscriptionPopup';
import SuccessMessage from './components/SuccessMessage';
import { calculateResults } from './utils/calculations';
import { sendSubscriberToAirtable } from './utils/airtable';

const App: React.FC = () => {
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
    transactionCosts: 10000
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
    inflation: 2.5
  });

  // Stany UI
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 text-gray-800 font-sans">
      <header className="bg-gradient-to-r from-indigo-800 to-blue-700 text-white py-5 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Kalkulator Finansowy Nieruchomości
          </h1>
          <p className="text-center mt-2 text-blue-100 max-w-2xl mx-auto text-sm md:text-base">
            Porównaj koszty zakupu i wynajmu nieruchomości oraz sprawdź, która opcja jest bardziej opłacalna w Twojej sytuacji
          </p>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Karta parametrów */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-indigo-900 mb-2">
              Parametry kalkulacji
            </h2>
            <p className="text-gray-600 text-sm">Wprowadź dane dotyczące zakupu i wynajmu, aby otrzymać szczegółową analizę.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <PropertyForm data={propertyData} onChange={handlePropertyChange} />
            <RentForm data={rentData} onChange={handleRentChange} />
          </div>
          
          {/* Opcje analizy - przeniesione niżej */}
          <div className="mt-8 mb-6">
            <AnalysisForm 
              options={analysisOptions} 
              onChange={handleAnalysisOptionsChange}
              onCalculate={handleCalculate}
            />
          </div>
        </div>
        
        {/* Sekcja wyników */}
        {showResults && results && (
          <div id="results-section">
            <ResultsDisplay results={results} inflation={analysisOptions.inflation} />
          </div>
        )}
      </main>
      
      {/* Stopka */}
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Kalkulator Finansowy Nieruchomości. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
      
      {showSubscriptionPopup && (
        <SubscriptionPopup 
          onSubscribe={handleSubscribe} 
          onClose={() => setShowSubscriptionPopup(false)} 
        />
      )}
      
      {showSuccessMessage && (
        <SuccessMessage message="Dziękujemy za zapisanie się do newslettera!" />
      )}
    </div>
  );
};

export default App; 