import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Kalkulator Finansowy Nieruchomości | Porównaj zakup i wynajem</title>
        <meta name="description" content="Kalkulator Finansowy Nieruchomości pomoże Ci porównać opłacalność zakupu i wynajmu mieszkania. Oblicz ROI, koszty kredytu, wartość nieruchomości i punkt rentowności." />
        <meta name="keywords" content="kalkulator nieruchomości, porównanie zakupu i wynajmu, kalkulator kredytu hipotecznego, inwestycje w nieruchomości, ROI nieruchomości, opłacalność zakupu mieszkania" />
        <link rel="canonical" href="https://kalkulator-finansowy-nieruchomosci.pl" />
      </Helmet>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-indigo-800 to-blue-700 text-white py-16 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Kalkulator Finansowy Nieruchomości
          </h1>
          <p className="text-center mt-4 text-blue-100 max-w-3xl mx-auto text-lg md:text-xl">
            Profesjonalne narzędzie do analizy finansowej zakupu i wynajmu nieruchomości w Polsce.
            Porównaj koszty, oszacuj zyski i podejmij świadomą decyzję inwestycyjną.
          </p>
          <div className="flex flex-wrap justify-center mt-8 space-x-0 space-y-4 md:space-x-4 md:space-y-0">
            <Link 
              to="/kalkulator-roi" 
              className="px-6 py-3 rounded-lg bg-white text-indigo-800 font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-md w-full md:w-auto flex justify-center"
            >
              Kalkulator ROI Nieruchomości
            </Link>
            <Link 
              to="/kalkulator-inwestycji" 
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors duration-300 shadow-md w-full md:w-auto flex justify-center"
            >
              Porównanie Zakupu i Wynajmu
            </Link>
            <Link 
              to="/kalkulator-wartosci-najmu" 
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors duration-300 shadow-md w-full md:w-auto flex justify-center"
            >
              Analiza Wartości Najmu
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4 max-w-7xl">
        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-indigo-900">Kompleksowa analiza inwestycji w nieruchomości</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-indigo-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Analiza Zwrotu z Inwestycji (ROI)</h3>
              <p className="text-gray-600">Precyzyjnie oblicz zwrot z inwestycji w nieruchomość uwzględniając wszystkie koszty zakupu, kredytu, podatków i utrzymania.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-indigo-600 text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Symulacja Kredytu Hipotecznego</h3>
              <p className="text-gray-600">Szczegółowa analiza rat kredytu, całkowitego kosztu finansowania oraz wpływu różnych parametrów na opłacalność zakupu.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-indigo-600 text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Prognozy Wzrostu Wartości</h3>
              <p className="text-gray-600">Modelowanie wzrostu wartości nieruchomości i przychodów z najmu w czasie z uwzględnieniem inflacji i trendów rynkowych.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-indigo-600 text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">Break-Even Point Zakupu vs. Najmu</h3>
              <p className="text-gray-600">Dokładne obliczenie punktu rentowności, w którym zakup nieruchomości staje się bardziej opłacalny niż długoterminowy wynajem.</p>
            </div>
          </div>
        </section>

        {/* Comparison Section (new) */}
        <section className="mb-16 bg-gray-50 p-8 rounded-xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Zakup czy wynajem? Podejmij świadomą decyzję</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">Zalety zakupu nieruchomości</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Budowanie majątku i wzrost kapitału w czasie</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Możliwość dostosowania nieruchomości do własnych potrzeb</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Ochrona przed inflacją i wzrostem cen najmu</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Poczucie stabilizacji i bezpieczeństwa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Potencjalne korzyści podatkowe</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-amber-600 border-b pb-2">Zalety wynajmu nieruchomości</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Większa elastyczność i mobilność</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Brak kosztów utrzymania i napraw</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Niższe koszty początkowe (brak wkładu własnego)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Możliwość inwestowania środków w inne aktywa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Brak ryzyka związanego z wahaniami cen nieruchomości</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link 
              to="/kalkulator-roi" 
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors duration-300 shadow-md inline-block"
            >
              Porównaj opłacalność zakupu i wynajmu
            </Link>
          </div>
        </section>

        {/* Why Use Calculator Section */}
        <section className="mb-16 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Dlaczego warto korzystać z naszego kalkulatora?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="text-indigo-600 text-2xl">✓</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Kompleksowa analiza finansowa</h3>
                <p className="text-gray-600">Uwzględniamy wszystkie istotne czynniki: koszty transakcyjne, podatki, utrzymanie nieruchomości, inflację, wzrost wartości i warunki kredytu.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-indigo-600 text-2xl">✓</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Wizualizacja wyników</h3>
                <p className="text-gray-600">Przejrzyste wykresy i tabele pokazujące porównanie kosztów w czasie, punkt rentowności i prognozy finansowe.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-indigo-600 text-2xl">✓</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Raporty PDF do pobrania</h3>
                <p className="text-gray-600">Możliwość wygenerowania szczegółowego raportu PDF z pełną analizą finansową, idealnego do konsultacji z doradcą.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-indigo-600 text-2xl">✓</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Aktualny na polskim rynku</h3>
                <p className="text-gray-600">Narzędzie dostosowane do realiów polskiego rynku nieruchomości, uwzględniające lokalne podatki i opłaty.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Najczęściej zadawane pytania</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Jak dokładne są obliczenia kalkulatora?</h3>
              <p className="text-gray-600">Kalkulator finansowy nieruchomości uwzględnia wszystkie istotne czynniki wpływające na opłacalność zakupu lub wynajmu, takie jak koszty kredytu, podatki, inflacja i wzrost wartości. Wyniki są oparte na aktualnych danych rynkowych, jednak ostateczne decyzje powinny uwzględniać również indywidualną sytuację finansową i preferencje.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Jakie dane powinienem przygotować przed użyciem kalkulatora?</h3>
              <p className="text-gray-600">Aby uzyskać najbardziej precyzyjne wyniki, warto przygotować: cenę nieruchomości, wysokość wkładu własnego, oprocentowanie kredytu, okres kredytowania, koszt wynajmu podobnej nieruchomości, szacowane koszty utrzymania oraz prognozy wzrostu wartości nieruchomości i wysokości czynszów.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Czy kalkulator uwzględnia inflację i zmiany stóp procentowych?</h3>
              <p className="text-gray-600">Tak, nasz kalkulator pozwala na uwzględnienie inflacji oraz symulację różnych scenariuszy stóp procentowych. Możesz dostosować te parametry, aby sprawdzić ich wpływ na opłacalność inwestycji w dłuższym okresie.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Czy mogę zapisać swoje obliczenia do późniejszego wykorzystania?</h3>
              <p className="text-gray-600">Tak, dla każdej analizy możesz wygenerować szczegółowy raport PDF z pełnymi wynikami, wykresami i rekomendacjami. Dodatkowo planujemy wprowadzenie funkcji kont użytkowników, która umożliwi zapisywanie historii obliczeń.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-8 rounded-xl shadow-lg mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Rozpocznij analizę finansową swojej nieruchomości już teraz</h2>
            <p className="mb-6 max-w-3xl mx-auto">Wybierz jeden z naszych specjalistycznych kalkulatorów i dowiedz się, która opcja będzie dla Ciebie najkorzystniejsza finansowo w perspektywie długoterminowej.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/kalkulator-roi" 
                className="px-6 py-3 rounded-lg bg-white text-indigo-800 font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-md"
              >
                Porównaj zakup i wynajem
              </Link>
              <Link 
                to="/kalkulator-inwestycji" 
                className="px-6 py-3 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-400 border border-white transition-colors duration-300 shadow-md"
              >
                Sprawdź zwrot z inwestycji
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage; 