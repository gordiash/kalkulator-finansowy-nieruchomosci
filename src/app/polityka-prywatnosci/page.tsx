import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka Prywatności | Kalkulator Finansowy Nieruchomości',
  description: 'Polityka prywatności Kalkulatora Finansowego Nieruchomości - informacje o przetwarzaniu danych osobowych, wykorzystaniu plików cookies i prawach użytkowników.',
  alternates: {
    canonical: 'https://kalkulator-finansowy-nieruchomosci.pl/polityka-prywatnosci',
  },
};

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      {/* <Helmet> usunięty, metadane zarządzane przez export const metadata */}
      
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900"> {/* Zmieniono text-brand-blue na text-indigo-900 dla spójności */}
          Polityka Prywatności
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md prose max-w-none"> {/* Dodano klasę prose dla lepszego formatowania tekstu */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900">1. Informacje ogólne</h2> {/* Zmieniono text-brand-blue */}
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Niniejsza polityka dotyczy Serwisu www, funkcjonującego pod adresem url: kalkulatorynieruchomosci.pl</li>
              <li>Operatorem serwisu oraz Administratorem danych osobowych jest: Jarosław Jakubczyk ul. Wilczyńskiego 2f/13, 10-686 Olsztyn</li>
              <li>Adres kontaktowy poczty elektronicznej operatora: jaroslaw.jakubczyk@gmail.com</li>
              <li>Operator jest Administratorem Twoich danych osobowych w odniesieniu do danych podanych dobrowolnie w Serwisie.</li>
            </ul>
            
            <p className="mb-2">Serwis wykorzystuje dane osobowe w następujących celach:</p>
            <ul className="list-disc pl-10 mb-4">
              <li>Prowadzenie newslettera</li>
              <li>Prezentacja oferty lub informacji</li>
            </ul>
            
            <p className="mb-2">Serwis realizuje funkcje pozyskiwania informacji o użytkownikach i ich zachowaniu w następujący sposób:</p>
            <ul className="list-disc pl-10 mb-4">
              <li>Poprzez dobrowolnie wprowadzone w formularzach dane, które zostają wprowadzone do systemów Operatora.</li>
              <li>Poprzez zapisywanie w urządzeniach końcowych plików cookie (tzw. "ciasteczka").</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900">2. Wybrane metody ochrony danych stosowane przez Operatora</h2> {/* Zmieniono text-brand-blue */}
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Miejsca logowania i wprowadzania danych osobowych są chronione w warstwie transmisji (certyfikat SSL). Dzięki temu dane osobowe i dane logowania, wprowadzone na stronie, zostają zaszyfrowane w komputerze użytkownika i mogą być odczytane jedynie na docelowym serwerze.</li>
              <li>Dane osobowe przechowywane w bazie danych są zaszyfrowane w taki sposób, że jedynie posiadający Operator klucz może je odczytać. Dzięki temu dane są chronione na wypadek wykradzenia bazy danych z serwera.</li>
              <li>Hasła użytkowników są przechowywane w postaci hashowanej. Funkcja hashująca działa jednokierunkowo - nie jest możliwe odwrócenie jej działania, co stanowi obecnie współczesny standard w zakresie przechowywania haseł użytkowników.</li>
              <li>Operator okresowo zmienia swoje hasła administracyjne.</li>
              <li>W celu ochrony danych Operator regularnie wykonuje kopie bezpieczeństwa.</li>
              <li>Istotnym elementem ochrony danych jest regularna aktualizacja wszelkiego oprogramowania, wykorzystywanego przez Operatora do przetwarzania danych osobowych, co w szczególności oznacza regularne aktualizacje komponentów programistycznych.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900">3. Hosting</h2> {/* Zmieniono text-brand-blue */}
            <p className="mb-2">Serwis jest hostowany (technicznie utrzymywany) na serwerach operatora: cyberFolks.pl</p>
            <p className="mb-2">Firma hostingowa w celu zapewnienia niezawodności technicznej prowadzi logi na poziomie serwera. Zapisowi mogą podlegać:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>zasoby określone identyfikatorem URL (adresy żądanych zasobów – stron, plików),</li>
              <li>czas nadejścia zapytania,</li>
              <li>czas wysłania odpowiedzi,</li>
              <li>nazwę stacji klienta – identyfikacja realizowana przez protokół HTTP,</li>
              <li>informacje o błędach jakie nastąpiły przy realizacji transakcji HTTP,</li>
              <li>adres URL strony poprzednio odwiedzanej przez użytkownika (referer link) – w przypadku gdy przejście do Serwisu nastąpiło przez odnośnik,</li>
              <li>informacje o przeglądarce użytkownika,</li>
              <li>informacje o adresie IP,</li>
              <li>informacje diagnostyczne związane z procesem samodzielnego zamawiania usług poprzez rejestratory na stronie,</li>
              <li>informacje związane z obsługą poczty elektronicznej kierowanej do Operatora oraz wysyłanej przez Operatora.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900">4. Twoje prawa i dodatkowe informacje o sposobie wykorzystania danych</h2> {/* Zmieniono text-brand-blue */}
            <p className="mb-2">W niektórych sytuacjach Administrator ma prawo przekazywać Twoje dane osobowe innym odbiorcom, jeśli będzie to niezbędne do wykonania zawartej z Tobą umowy lub do zrealizowania obowiązków ciążących na Administratorze. Dotyczy to takich grup odbiorców:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>ubezpieczyciele</li>
              <li>banki</li>
              <li>operatorzy płatności</li>
              <li>upoważnieni pracownicy i współpracownicy, którzy korzystają z danych w celu realizacji celu działania strony</li>
            </ul>
            
            <p className="mb-4">Twoje dane osobowe przetwarzane przez Administratora nie dłużej, niż jest to konieczne do wykonania związanych z nimi czynności określonych osobnymi przepisami (np. o prowadzeniu rachunkowości). W odniesieniu do danych marketingowych dane nie będą przetwarzane dłużej niż przez 3 lata.</p>
            
            <p className="mb-2">Przysługuje Ci prawo żądania od Administratora:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>dostępu do danych osobowych Ciebie dotyczących,</li>
              <li>ich sprostowania,</li>
              <li>usunięcia,</li>
              <li>ograniczenia przetwarzania,</li>
              <li>oraz przenoszenia danych.</li>
            </ul>
            
            <p className="mb-4">Przysługuje Ci prawo do złożenia sprzeciwu w zakresie przetwarzania wskazanego w pkt 3.2 wobec przetwarzania danych osobowych w celu wykonania prawnie uzasadnionych interesów realizowanych przez Administratora, w tym profilowania, przy czym prawo sprzeciwu nie będzie mogło być wykonane w przypadku istnienia ważnych prawnie uzasadnionych podstaw do przetwarzania, nadrzędnych wobec Ciebie interesów, praw i wolności, w szczególności ustalenia, dochodzenia lub obrony roszczeń.</p>
            
            <p className="mb-4">Na działania Administratora przysługuje skarga do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.</p>
            
            <p className="mb-4">Podanie danych osobowych jest dobrowolne, lecz niezbędne do obsługi Serwisu.</p>
            
            <p className="mb-4">W stosunku do Ciebie mogą być podejmowane czynności polegające na zautomatyzowanym podejmowaniu decyzji, w tym profilowaniu w celu świadczenia usług w ramach zawartej umowy oraz w celu prowadzenia przez Administratora marketingu bezpośredniego.</p>
            
            <p className="mb-4">Dane osobowe nie są przekazywane od krajów trzecich w rozumieniu przepisów o ochronie danych osobowych. Oznacza to, że nie przesyłamy ich poza teren Unii Europejskiej.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900">5. Informacje w formularzach</h2> {/* Zmieniono text-brand-blue */}
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Serwis zbiera informacje podane dobrowolnie przez użytkownika, w tym dane osobowe, o ile zostaną one podane.</li>
              <li>Serwis może zapisać informacje o parametrach połączenia (oznaczenie czasu, adres IP).</li>
              <li>Serwis, w niektórych wypadkach, może zapisać informację ułatwiającą powiązanie danych w formularzu z adresem e-mail użytkownika wypełniającego formularz. W takim wypadku adres e-mail użytkownika pojawia się wewnątrz adresu url strony zawierającej formularz.</li>
              <li>Dane podane w formularzu są przetwarzane w celu wynikającym z funkcji konkretnego formularza, np. w celu dokonania procesu obsługi zgłoszenia serwisowego lub kontaktu handlowego, rejestracji usług itp. Każdorazowo kontekst i opis formularza w czytelny sposób informuje, do czego on służy.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900">6. Logi Administratora</h2> {/* Zmieniono text-brand-blue */}
            <p className="mb-4">Informacje zachowaniu użytkowników w serwisie mogą podlegać logowaniu. Dane te są wykorzystywane w celu administrowania serwisem.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900">7. Istotne techniki marketingowe</h2> {/* Zmieniono text-brand-blue */}
            <p className="mb-4">Operator stosuje analizę statystyczną ruchu na stronie, poprzez Google Analytics (Google Inc. z siedzibą w USA). Operator nie przekazuje do operatora tej usługi danych osobowych, a jedynie zanonimizowane informacje. Usługa bazuje na wykorzystaniu ciasteczek w urządzeniu końcowym użytkownika. W zakresie informacji o preferencjach użytkownika gromadzonych przez sieć reklamową Google użytkownik może przeglądać i edytować informacje wynikające z plików cookies przy pomocy narzędzia: https://www.google.com/ads/preferences/</p>
            
            <p className="mb-4">Operator stosuje korzysta z piksela Facebooka. Ta technologia powoduje, że serwis Facebook (Facebook Inc. z siedzibą w USA) wie, że dana osoba w nim zarejestrowana korzysta z Serwisu. Bazuje w tym wypadku na danych, wobec których sam jest administratorem, Operator nie przekazuje od siebie żadnych dodatkowych danych osobowych serwisowi Facebook. Usługa bazuje na wykorzystaniu ciasteczek w urządzeniu końcowym użytkownika.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900">8. Informacja o plikach cookies</h2> {/* Zmieniono text-brand-blue */}
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Serwis korzysta z plików cookies.</li>
              <li>Pliki cookies (tzw. "ciasteczka") stanowią dane informatyczne, w szczególności pliki tekstowe, które przechowywane są w urządzeniu końcowym Użytkownika Serwisu i przeznaczone są do korzystania ze stron internetowych Serwisu. Cookies zazwyczaj zawierają nazwę strony internetowej, z której pochodzą, czas przechowywania ich na urządzeniu końcowym oraz unikalny numer.</li>
              <li>Podmiotem zamieszczającym na urządzeniu końcowym Użytkownika Serwisu pliki cookies oraz uzyskującym do nich dostęp jest operator Serwisu.</li>
            </ul>
            
            <p className="mb-2">Pliki cookies wykorzystywane są w następujących celach:</p>
            <ul className="list-disc pl-10 mb-4">
              <li>utrzymanie sesji użytkownika Serwisu (po zalogowaniu), dzięki której użytkownik nie musi na każdej podstronie Serwisu ponownie wpisywać loginu i hasła;</li>
              <li>realizacji celów określonych powyżej w części "Istotne techniki marketingowe";</li>
            </ul>
            
            <p className="mb-4">W ramach Serwisu stosowane są dwa zasadnicze rodzaje plików cookies: "sesyjne" (session cookies) oraz "stałe" (persistent cookies). Cookies "sesyjne" są plikami tymczasowymi, które przechowywane są w urządzeniu końcowym Użytkownika do czasu wylogowania, opuszczenia strony internetowej lub wyłączenia oprogramowania (przeglądarki internetowej). "Stałe" pliki cookies przechowywane są w urządzeniu końcowym Użytkownika przez czas określony w parametrach plików cookies lub do czasu ich usunięcia przez Użytkownika.</p>
            
            <p className="mb-4">Oprogramowanie do przeglądania stron internetowych (przeglądarka internetowa) zazwyczaj domyślnie dopuszcza przechowywanie plików cookies w urządzeniu końcowym Użytkownika. Użytkownicy Serwisu mogą dokonać zmiany ustawień w tym zakresie. Przeglądarka internetowa umożliwia usunięcie plików cookies. Możliwe jest także automatyczne blokowanie plików cookies Szczegółowe informacje na ten temat zawiera pomoc lub dokumentacja przeglądarki internetowej.</p>
            
            <p className="mb-4">Ograniczenia stosowania plików cookies mogą wpłynąć na niektóre funkcjonalności dostępne na stronach internetowych Serwisu.</p>
            
            <p className="mb-4">Pliki cookies zamieszczane w urządzeniu końcowym Użytkownika Serwisu wykorzystywane mogą być również przez współpracujące z operatorem Serwisu podmioty, w szczególności dotyczy to firm: Google (Google Inc. z siedzibą w USA), Facebook (Facebook Inc. z siedzibą w USA), Twitter (Twitter Inc. z siedzibą w USA).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900">9. Zarządzanie plikami cookies – jak w praktyce wyrażać i cofać zgodę?</h2> {/* Zmieniono text-brand-blue */}
            <p className="mb-4">Jeśli użytkownik nie chce otrzymywać plików cookies, może zmienić ustawienia przeglądarki. Zastrzegamy, że wyłączenie obsługi plików cookies niezbędnych dla procesów uwierzytelniania, bezpieczeństwa, utrzymania preferencji użytkownika może utrudnić, a w skrajnych przypadkach może uniemożliwić korzystanie ze stron www</p>
            
            <p className="mb-2">W celu zarządzania ustawienia cookies wybierz z listy poniżej przeglądarkę internetową, której używasz i postępuj zgodnie z instrukcjami:</p>
            <ul className="list-disc pl-10 mb-4">
              <li>Edge</li>
              <li>Internet Explorer</li>
              <li>Chrome</li>
              <li>Safari</li>
              <li>Firefox</li>
              <li>Opera</li>
            </ul>
            
            <p className="mb-2">Urządzenia mobilne:</p>
            <ul className="list-disc pl-10 mb-4">
              <li>Android</li>
              <li>Safari (iOS)</li>
              <li>Windows Phone</li>
            </ul>
            
            <p className="mt-8 text-sm text-gray-500"> {/* Usunięto text-gray-500, prose powinno to obsłużyć */}
              Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage; 