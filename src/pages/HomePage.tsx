import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-indigo-800 to-blue-700 text-white py-16 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Kalkulator Finansowy Nieruchomości
          </h1>
          <p className="text-center mt-4 text-blue-100 max-w-3xl mx-auto text-lg md:text-xl">
            Profesjonalne narzędzie do analizy opłacalności inwestycji w nieruchomości. 
            Podejmuj świadome decyzje finansowe dzięki szczegółowym kalkulacjom i analizom.
          </p>
          <div className="flex flex-wrap justify-center mt-8 space-x-0 space-y-4 md:space-x-4 md:space-y-0">
            <Link 
              to="/roi" 
              className="px-6 py-3 rounded-lg bg-white text-indigo-800 font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-md w-full md:w-auto flex justify-center"
            >
              Kalkulator ROI
            </Link>
            <Link 
              to="/investment" 
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors duration-300 shadow-md w-full md:w-auto flex justify-center"
            >
              Kalkulator Inwestycji
            </Link>
            <Link 
              to="/rental-value" 
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors duration-300 shadow-md w-full md:w-auto flex justify-center"
            >
              Wartość z Najmu
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4 max-w-7xl">
        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-indigo-900">Główne funkcje kalkulatora</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-indigo-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Analiza ROI</h3>
              <p className="text-gray-600">Oblicz zwrot z inwestycji uwzględniając wszystkie koszty i przychody.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-indigo-600 text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Kalkulacja kredytu</h3>
              <p className="text-gray-600">Szczegółowa analiza rat kredytu hipotecznego i kosztów finansowania.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-indigo-600 text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Prognozy wzrostu</h3>
              <p className="text-gray-600">Przewidywanie wartości nieruchomości i przychodów z wynajmu w czasie.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-indigo-600 text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">Wartość z najmu</h3>
              <p className="text-gray-600">Określ wartość nieruchomości na podstawie zysku z najmu i oczekiwanego ROI.</p>
            </div>
          </div>
        </section>

        {/* Why Use Calculator Section */}
        <section className="mb-16 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Dlaczego warto używać naszego kalkulatora?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="text-indigo-600 text-2xl">✓</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Profesjonalne obliczenia</h3>
                <p className="text-gray-600">Uwzględniamy wszystkie istotne koszty i przychody związane z inwestycją w nieruchomości.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-indigo-600 text-2xl">✓</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Łatwa obsługa</h3>
                <p className="text-gray-600">Intuicyjny interfejs pozwala na szybkie wprowadzenie danych i otrzymanie wyników.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-indigo-600 text-2xl">✓</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Szczegółowe raporty</h3>
                <p className="text-gray-600">Otrzymuj kompleksowe analizy finansowe z wizualizacją wyników.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-indigo-600 text-2xl">✓</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Bezpłatne narzędzie</h3>
                <p className="text-gray-600">Korzystaj z profesjonalnego kalkulatora całkowicie za darmo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Często zadawane pytania</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Jak dokładne są obliczenia kalkulatora?</h3>
              <p className="text-gray-600">Kalkulator uwzględnia wszystkie istotne koszty i przychody, jednak wyniki są szacunkowe i mogą różnić się od rzeczywistych wartości.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Czy mogę zapisać wyniki kalkulacji?</h3>
              <p className="text-gray-600">Tak, możesz zapisać wyniki w formie PDF lub udostępnić je przez link.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Jak często aktualizowane są dane?</h3>
              <p className="text-gray-600">Kalkulator jest regularnie aktualizowany o najnowsze stopy procentowe i wskaźniki rynkowe.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage; 