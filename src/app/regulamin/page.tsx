import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Regulamin | Kalkulator Finansowy Nieruchomości',
  description: 'Regulamin serwisu Kalkulator Finansowy Nieruchomości. Zasady korzystania z naszych kalkulatorów ROI, porównania zakupu i wynajmu oraz analizy wartości nieruchomości.',
  keywords: ['regulamin', 'zasady korzystania', 'kalkulator nieruchomości', 'RODO', 'ochrona danych osobowych', 'pliki cookies'],
  alternates: {
    canonical: 'https://kalkulatorynieruchomosci.pl/regulamin',
  },
  openGraph: {
    title: 'Regulamin | Kalkulator Finansowy Nieruchomości',
    description: 'Poznaj zasady korzystania z kalkulatorów i narzędzi finansowych do analizy inwestycji w nieruchomości.',
    type: 'website',
    url: 'https://kalkulatorynieruchomosci.pl/regulamin',
  }
};

const TermsPage: React.FC = () => {
  return (
    <>
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">Regulamin Serwisu Kalkulator Finansowy Nieruchomości</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">§1. Postanowienia ogólne</h2>
            
            <ol className="list-decimal pl-6 space-y-3">
              <li>Niniejszy regulamin (dalej "Regulamin") określa zasady korzystania z serwisu internetowego Kalkulator Finansowy Nieruchomości dostępnego pod adresem <span className="text-indigo-600">kalkulatorynieruchomosci.pl</span> (dalej "Serwis").</li>
              <li>Administratorem Serwisu jest Kalkulator Finansowy Nieruchomości z siedzibą w Warszawie (dalej "Administrator").</li>
              <li>Regulamin określa prawa i obowiązki Użytkowników Serwisu oraz prawa, obowiązki i zakres odpowiedzialności Administratora.</li>
              <li>Korzystanie z Serwisu jest równoznaczne z akceptacją Regulaminu oraz Polityki Prywatności.</li>
              <li>Serwis służy do przeprowadzania kalkulacji finansowych związanych z inwestycjami w nieruchomości, porównywania opłacalności zakupu i wynajmu nieruchomości oraz analizy wartości nieruchomości na podstawie parametrów finansowych.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">§2. Definicje</h2>
            
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Serwis</strong> – strona internetowa dostępna pod adresem kalkulator-finansowy-nieruchomosci.pl wraz z jej funkcjonalnościami.</li>
              <li><strong>Użytkownik</strong> – osoba fizyczna, prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, korzystająca z zasobów i funkcjonalności Serwisu.</li>
              <li><strong>Kalkulacja</strong> – proces obliczeniowy wykonywany przez Serwis na podstawie danych wprowadzonych przez Użytkownika.</li>
              <li><strong>Dane osobowe</strong> – informacje o zidentyfikowanej lub możliwej do zidentyfikowania osobie fizycznej, przetwarzane przez Administratora w związku z korzystaniem z Serwisu.</li>
              <li><strong>RODO</strong> – Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">§3. Warunki korzystania z Serwisu</h2>
            
            <ol className="list-decimal pl-6 space-y-3">
              <li>Korzystanie z Serwisu jest dobrowolne i bezpłatne.</li>
              <li>Do korzystania z podstawowych funkcji Serwisu nie jest wymagane założenie konta lub rejestracja.</li>
              <li>Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z obowiązującymi przepisami prawa, postanowieniami Regulaminu oraz dobrymi obyczajami.</li>
              <li>Użytkownik zobowiązuje się do niepodejmowania działań, które mogłyby zakłócić prawidłowe funkcjonowanie Serwisu, w szczególności do nieumieszczania treści o charakterze bezprawnym.</li>
              <li>Administrator zastrzega sobie prawo do czasowego wyłączenia Serwisu w celu jego konserwacji, aktualizacji lub naprawy.</li>
              <li>Dla prawidłowego korzystania z Serwisu wymagane jest:
                <ul className="list-disc pl-6 mt-2">
                  <li>Urządzenie z dostępem do Internetu,</li>
                  <li>Przeglądarka internetowa obsługująca pliki cookies,</li>
                  <li>Aktywne konto poczty elektronicznej (dla niektórych funkcjonalności).</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">§4. Funkcjonalności Serwisu</h2>
            
            <ol className="list-decimal pl-6 space-y-3">
              <li>Serwis umożliwia obliczanie i analizę finansową związaną z inwestycjami w nieruchomości, w tym:
                <ul className="list-disc pl-6 mt-2">
                  <li>Kalkulację zwrotu z inwestycji (ROI) dla nieruchomości,</li>
                  <li>Porównanie opłacalności zakupu i wynajmu nieruchomości,</li>
                  <li>Analizę wartości nieruchomości na podstawie przychodu z najmu,</li>
                  <li>Generowanie raportów PDF z przeprowadzonych kalkulacji.</li>
                </ul>
              </li>
              <li>Wyniki kalkulacji mają charakter poglądowy i orientacyjny. Administrator nie gwarantuje ich dokładności ani przydatności dla konkretnych celów Użytkownika.</li>
              <li>Administrator zastrzega sobie prawo do modyfikacji, rozszerzania lub ograniczania funkcjonalności Serwisu bez wcześniejszego informowania Użytkowników.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">§5. Ochrona danych osobowych</h2>
            
            <ol className="list-decimal pl-6 space-y-3">
              <li>Administratorem danych osobowych Użytkowników jest Administrator Serwisu.</li>
              <li>Administrator przetwarza dane osobowe Użytkowników zgodnie z przepisami RODO oraz ustawy o ochronie danych osobowych.</li>
              <li>Szczegółowe informacje dotyczące przetwarzania danych osobowych zawarte są w Polityce Prywatności dostępnej pod adresem: <Link href="/polityka-prywatnosci" className="text-indigo-600 hover:underline">Polityka Prywatności</Link>.</li>
              <li>Podstawą prawną przetwarzania danych osobowych Użytkowników jest:
                <ul className="list-disc pl-6 mt-2">
                  <li>Zgoda Użytkownika (art. 6 ust. 1 lit. a RODO),</li>
                  <li>Prawnie uzasadniony interes realizowany przez Administratora (art. 6 ust. 1 lit. f RODO).</li>
                </ul>
              </li>
              <li>Użytkownikowi przysługują następujące prawa związane z przetwarzaniem danych osobowych:
                <ul className="list-disc pl-6 mt-2">
                  <li>Prawo dostępu do danych,</li>
                  <li>Prawo do sprostowania danych,</li>
                  <li>Prawo do usunięcia danych,</li>
                  <li>Prawo do ograniczenia przetwarzania danych,</li>
                  <li>Prawo do przenoszenia danych,</li>
                  <li>Prawo do wniesienia sprzeciwu wobec przetwarzania,</li>
                  <li>Prawo do wniesienia skargi do organu nadzorczego (Prezes Urzędu Ochrony Danych Osobowych).</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">§6. Pliki cookies i inne technologie</h2>
            
            <ol className="list-decimal pl-6 space-y-3">
              <li>Serwis wykorzystuje pliki cookies (ciasteczka) oraz podobne technologie do zapewnienia prawidłowego działania, personalizacji treści oraz analizy ruchu.</li>
              <li>Szczegółowe informacje dotyczące wykorzystania plików cookies znajdują się w Polityce Prywatności.</li>
              <li>Użytkownik może w każdej chwili zmienić ustawienia dotyczące plików cookies lub wyłączyć ich obsługę w ustawieniach przeglądarki internetowej.</li>
              <li>Wyłączenie obsługi plików cookies może spowodować ograniczenie funkcjonalności Serwisu.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">§7. Własność intelektualna</h2>
            
            <ol className="list-decimal pl-6 space-y-3">
              <li>Wszelkie prawa własności intelektualnej do Serwisu, w tym do jego nazwy, domeny internetowej, szaty graficznej, logotypów, treści, układu oraz oprogramowania należą do Administratora.</li>
              <li>Korzystanie z Serwisu nie oznacza nabycia jakichkolwiek praw do całości lub części Serwisu.</li>
              <li>Użytkownik może korzystać z Serwisu wyłącznie w zakresie dozwolonego użytku osobistego.</li>
              <li>Zabronione jest kopiowanie, modyfikowanie, rozpowszechnianie, transmitowanie lub wykorzystywanie w inny sposób jakichkolwiek treści, danych lub elementów Serwisu bez zgody Administratora, chyba że możliwość taka wynika z obowiązujących przepisów prawa.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">§8. Odpowiedzialność</h2>
            
            <ol className="list-decimal pl-6 space-y-3">
              <li>Administrator dokłada wszelkich starań, aby Serwis funkcjonował prawidłowo, jednak nie gwarantuje ciągłej dostępności wszystkich funkcjonalności Serwisu.</li>
              <li>Administrator nie ponosi odpowiedzialności za:
                <ul className="list-disc pl-6 mt-2">
                  <li>Szkody wynikające z nieprawidłowego korzystania z Serwisu przez Użytkownika,</li>
                  <li>Decyzje finansowe podjęte przez Użytkownika na podstawie kalkulacji i analiz wykonanych za pomocą Serwisu,</li>
                  <li>Przerwy w funkcjonowaniu Serwisu wynikające z przyczyn technicznych,</li>
                  <li>Jakiekolwiek szkody poniesione przez Użytkownika w wyniku korzystania z Serwisu niezgodnie z Regulaminem lub przepisami prawa.</li>
                </ul>
              </li>
              <li>Kalkulacje przeprowadzane w Serwisie mają charakter szacunkowy i nie stanowią porady finansowej ani inwestycyjnej.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">§9. Postanowienia końcowe</h2>
            
            <ol className="list-decimal pl-6 space-y-3">
              <li>Regulamin wchodzi w życie z dniem opublikowania na stronie Serwisu.</li>
              <li>Administrator zastrzega sobie prawo do zmiany Regulaminu w dowolnym czasie. Zmiany Regulaminu wchodzą w życie z chwilą ich opublikowania na stronie Serwisu.</li>
              <li>Korzystanie z Serwisu po wprowadzeniu zmian w Regulaminie oznacza ich akceptację.</li>
              <li>W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy prawa polskiego.</li>
              <li>Wszelkie spory wynikające z korzystania z Serwisu będą rozstrzygane w pierwszej kolejności na drodze polubownej, a w przypadku braku porozumienia, przez sąd właściwy dla siedziby Administratora.</li>
              <li>Jeżeli jakiekolwiek postanowienie Regulaminu okaże się nieważne lub nieskuteczne, nie wpływa to na ważność lub skuteczność pozostałych postanowień Regulaminu.</li>
              <li>W razie jakichkolwiek pytań lub wątpliwości dotyczących Regulaminu, prosimy o kontakt na adres email: kontakt@kalkulator-finansowy-nieruchomosci.pl</li>
            </ol>
          </section>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <p>Data ostatniej aktualizacji Regulaminu: {new Date().toLocaleDateString('pl-PL')}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage; 