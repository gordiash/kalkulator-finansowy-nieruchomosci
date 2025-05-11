import React, { useState, useEffect } from 'react';
import { PropertyFormData, RentFormData, AnalysisOptions, CalculationResults } from './types';
import PropertyForm from './components/PropertyForm';
import RentForm from './components/RentForm';
import AnalysisForm from './components/AnalysisForm';
import ResultsDisplay from './components/ResultsDisplay';
import SubscriptionPopup from './components/SubscriptionPopup';
import SuccessMessage from './components/SuccessMessage';
import DonationModal from './components/DonationModal';
import { calculateResults } from './utils/calculations';
import { sendSubscriberToAirtable } from './utils/airtable';
import InvestmentCalculator from './components/InvestmentCalculator';
import { Routes, Route, Link, Navigate } from 'react-router-dom';


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
    inflation: 2.5
  });

  // Stany UI
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  
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

  const handleInflationUpdate = (value: number) => {
    setAnalysisOptions((prev) => ({ ...prev, inflation: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 text-gray-800 font-sans">
      <header className="bg-gradient-to-r from-indigo-800 to-blue-700 text-white py-5 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Kalkulator Finansowy Nieruchomości
          </h1>
          <p className="text-center mt-2 text-blue-100 max-w-2xl mx-auto text-sm md:text-base">
            Wybierz kalkulator, który chcesz użyć.
          </p>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Nawigacja do podstron */}
        <nav className="flex justify-center space-x-4 mb-6">
          <Link to="/roi" className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Kalkulator ROI</Link>
          <Link to="/investment" className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Kalkulator Inwestycji</Link>
        </nav>
        {/* Definicja tras */}
        <Routes>
          <Route path="/" element={<Navigate to="/roi" replace />} />
          <Route path="/roi" element={
            <div>
              <h2 className="text-lg font-bold text-center mb-4">Kalkulator ROI</h2>
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
                  />
                </div>
              </div>
              {/* Sekcja wyników ROI */}
              {showResults && results && (
                <div id="results-section">
                  <ResultsDisplay results={results} inflation={analysisOptions.inflation} />
                </div>
              )}
            </div>
          } />
          <Route path="/investment" element={
            <div className="mb-8">
              <InvestmentCalculator 
                investment={propertyData.propertyPrice} 
                cashFlows={[20000, 25000, 30000, 35000, 40000]} 
                discountRate={5} 
              />
            </div>
          } />
        </Routes>

        {/* Formularz i wyniki przeniesione do trasy ROI */}

      </main>
      
      {/* Stopka */}
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-center">
              <button 
                onClick={() => setShowDonationModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Wesprzyj projekt
              </button>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Kalkulator Finansowy Nieruchomości. Wszelkie prawa zastrzeżone.
            </p>
          </div>
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

      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </div>
  );
};

export default App;