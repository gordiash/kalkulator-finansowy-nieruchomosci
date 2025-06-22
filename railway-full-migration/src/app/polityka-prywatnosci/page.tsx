import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-center font-bold">
            Polityka Prywatności
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
          
          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">1. Informacje ogólne</h2>
            <ul className="list-disc list-inside space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              <li>Niniejsza polityka dotyczy Serwisu www, funkcjonującego pod adresem url: kalkulatorynieruchomosci.pl</li>
              <li>Operatorem serwisu oraz Administratorem danych osobowych jest: Jarosław Jakubczyk ul. Wilczyńskiego 2f/13, 10-686 Olsztyn</li>
              <li>Adres kontaktowy poczty elektronicznej operatora: 
                <a href="mailto:kontakt@kalkulatorynieruchomosci.pl" className="text-blue-600 hover:text-blue-800 ml-1">
                  kontakt@kalkulatorynieruchomosci.pl
                </a>
              </li>
              <li>Operator jest Administratorem Twoich danych osobowych w odniesieniu do danych podanych dobrowolnie w Serwisie.</li>
            </ul>
            
            <p className="text-gray-700 leading-relaxed mt-4 font-medium">
              Serwis wykorzystuje dane osobowe w następujących celach:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700 leading-relaxed ml-4">
              <li>Prowadzenie newslettera</li>
              <li>Prezentacja oferty lub informacji</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-4 font-medium">
              Serwis realizuje funkcje pozyskiwania informacji o użytkownikach i ich zachowaniu w następujący sposób:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700 leading-relaxed ml-4">
              <li>Poprzez dobrowolnie wprowadzone w formularzach dane, które zostają wprowadzone do systemów Operatora.</li>
              <li>Poprzez zapisywanie w urządzeniach końcowych plików cookie (tzw. &ldquo;ciasteczka&rdquo;).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">2. Wybrane metody ochrony danych stosowane przez Operatora</h2>
            <ul className="list-disc list-inside space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              <li>Miejsca logowania i wprowadzania danych osobowych są chronione w warstwie transmisji (certyfikat SSL). Dzięki temu dane osobowe i dane logowania, wprowadzone na stronie, zostają zaszyfrowane w komputerze użytkownika i mogą być odczytane jedynie na docelowym serwerze.</li>
              <li>Dane osobowe przechowywane w bazie danych są zaszyfrowane w taki sposób, że jedynie posiadający Operator klucz może je odczytać. Dzięki temu dane są chronione na wypadek wykradzenia bazy danych z serwera.</li>
              <li>Hasła użytkowników są przechowywane w postaci hashowanej. Funkcja hashująca działa jednokierunkowo - nie jest możliwe odwrócenie jej działania, co stanowi obecnie współczesny standard w zakresie przechowywania haseł użytkowników.</li>
              <li>Operator okresowo zmienia swoje hasła administracyjne.</li>
              <li>W celu ochrony danych Operator regularnie wykonuje kopie bezpieczeństwa.</li>
              <li>Istotnym elementem ochrony danych jest regularna aktualizacja wszelkiego oprogramowania, wykorzystywanego przez Operatora do przetwarzania danych osobowych, co w szczególności oznacza regularne aktualizacje komponentów programistycznych.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">3. Hosting</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Serwis jest hostowany (technicznie utrzymywany) na serwerach operatora: cyberFolks.pl
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Firma hostingowa w celu zapewnienia niezawodności technicznej prowadzi logi na poziomie serwera. Zapisowi mogą podlegać:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700 leading-relaxed">
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
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">4. Twoje prawa i dodatkowe informacje o sposobie wykorzystania danych</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              W niektórych sytuacjach Administrator ma prawo przekazywać Twoje dane osobowe innym odbiorcom, jeśli będzie to niezbędne do wykonania zawartej z Tobą umowy lub do zrealizowania obowiązków ciążących na Administratorze. Dotyczy to takich grup odbiorców:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700 leading-relaxed ml-4">
              <li>ubezpieczyciele</li>
              <li>banki</li>
              <li>operatorzy płatności</li>
              <li>upoważnieni pracownicy i współpracownicy, którzy korzystają z danych w celu realizacji celu działania strony</li>
            </ul>
            
            <p className="text-gray-700 leading-relaxed mt-6 mb-4">
              Twoje dane osobowe przetwarzane przez Administratora nie dłużej, niż jest to konieczne do wykonania związanych z nimi czynności określonych osobnymi przepisami (np. o prowadzeniu rachunkowości). W odniesieniu do danych marketingowych dane nie będą przetwarzane dłużej niż przez 3 lata.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4 font-medium">
              Przysługuje Ci prawo żądania od Administratora:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700 leading-relaxed ml-4">
              <li>dostępu do danych osobowych Ciebie dotyczących,</li>
              <li>ich sprostowania,</li>
              <li>usunięcia,</li>
              <li>ograniczenia przetwarzania,</li>
              <li>oraz przenoszenia danych.</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-6 mb-4">
              Przysługuje Ci prawo do złożenia sprzeciwu w zakresie przetwarzania wskazanego w pkt 3.2 wobec przetwarzania danych osobowych w celu wykonania prawnie uzasadnionych interesów realizowanych przez Administratora, w tym profilowania, przy czym prawo sprzeciwu nie będzie mogło być wykonane w przypadku istnienia ważnych prawnie uzasadnionych podstaw do przetwarzania, nadrzędnych wobec Ciebie interesów, praw i wolności, w szczególności ustalenia, dochodzenia lub obrony roszczeń.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              Na działania Administratora przysługuje skarga do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              Podanie danych osobowych jest dobrowolne, lecz niezbędne do obsługi Serwisu.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              W stosunku do Ciebie mogą być podejmowane czynności polegające na zautomatyzowanym podejmowaniu decyzji, w tym profilowaniu w celu świadczenia usług w ramach zawartej umowy oraz w celu prowadzenia przez Administratora marketingu bezpośredniego.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Dane osobowe nie są przekazywane od krajów trzecich w rozumieniu przepisów o ochronie danych osobowych. Oznacza to, że nie przesyłamy ich poza teren Unii Europejskiej.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">5. Informacje w formularzach</h2>
            <ul className="list-disc list-inside space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              <li>Serwis zbiera informacje podane dobrowolnie przez użytkownika, w tym dane osobowe, o ile zostaną one podane.</li>
              <li>Serwis może zapisać informacje o parametrach połączenia (oznaczenie czasu, adres IP).</li>
              <li>Serwis, w niektórych wypadkach, może zapisać informację ułatwiającą powiązanie danych w formularzu z adresem e-mail użytkownika wypełniającego formularz. W takim wypadku adres e-mail użytkownika pojawia się wewnątrz adresu url strony zawierającej formularz.</li>
              <li>Dane podane w formularzu są przetwarzane w celu wynikającym z funkcji konkretnego formularza, np. w celu dokonania procesu obsługi zgłoszenia serwisowego lub kontaktu handlowego, rejestracji usług itp. Każdorazowo kontekst i opis formularza w czytelny sposób informuje, do czego on służy.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">6. Logi Administratora</h2>
            <p className="text-gray-700 leading-relaxed">
              Informacje zachowaniu użytkowników w serwisie mogą podlegać logowaniu. Dane te są wykorzystywane w celu administrowania serwisem.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">7. Istotne techniki marketingowe</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Operator stosuje analizę statystyczną ruchu na stronie, poprzez Google Analytics (Google Inc. z siedzibą w USA). Operator nie przekazuje do operatora tej usługi danych osobowych, a jedynie zanonimizowane informacje. Usługa bazuje na wykorzystaniu ciasteczek w urządzeniu końcowym użytkownika. W zakresie informacji o preferencjach użytkownika gromadzonych przez sieć reklamową Google użytkownik może przeglądać i edytować informacje wynikające z plików cookies przy pomocy narzędzia: 
              <a href="https://www.google.com/ads/preferences/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
                https://www.google.com/ads/preferences/
              </a>
            </p>
            <p className="text-gray-700 leading-relaxed">
              Operator stosuje korzysta z piksela Facebooka. Ta technologia powoduje, że serwis Facebook (Facebook Inc. z siedzibą w USA) wie, że dana osoba w nim zarejestrowana korzysta z Serwisu. Bazuje w tym wypadku na danych, wobec których sam jest administratorem, Operator nie przekazuje od siebie żadnych dodatkowych danych osobowych serwisowi Facebook. Usługa bazuje na wykorzystaniu ciasteczek w urządzeniu końcowym użytkownika.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">8. Informacja o plikach cookies</h2>
            <ul className="list-disc list-inside space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              <li>Serwis korzysta z plików cookies.</li>
              <li>Pliki cookies (tzw. &ldquo;ciasteczka&rdquo;) stanowią dane informatyczne, w szczególności pliki tekstowe, które przechowywane są w urządzeniu końcowym Użytkownika Serwisu i przeznaczone są do korzystania ze stron internetowych Serwisu. Cookies zazwyczaj zawierają nazwę strony internetowej, z której pochodzą, czas przechowywania ich na urządzeniu końcowym oraz unikalny numer.</li>
              <li>Podmiotem zamieszczającym na urządzeniu końcowym Użytkownika Serwisu pliki cookies oraz uzyskującym do nich dostęp jest operator Serwisu.</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-6 mb-4 font-medium">
              Pliki cookies wykorzystywane są w następujących celach:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700 leading-relaxed ml-4">
              <li>utrzymanie sesji użytkownika Serwisu (po zalogowaniu), dzięki której użytkownik nie musi na każdej podstronie Serwisu ponownie wpisywać loginu i hasła;</li>
              <li>realizacji celów określonych powyżej w części &ldquo;Istotne techniki marketingowe&rdquo;;</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-6 mb-4">
              W ramach Serwisu stosowane są dwa zasadnicze rodzaje plików cookies: &ldquo;sesyjne&rdquo; (session cookies) oraz &ldquo;stałe&rdquo; (persistent cookies). Cookies &ldquo;sesyjne&rdquo; są plikami tymczasowymi, które przechowywane są w urządzeniu końcowym Użytkownika do czasu wylogowania, opuszczenia strony internetowej lub wyłączenia oprogramowania (przeglądarki internetowej). &ldquo;Stałe&rdquo; pliki cookies przechowywane są w urządzeniu końcowym Użytkownika przez czas określony w parametrach plików cookies lub do czasu ich usunięcia przez Użytkownika.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              Oprogramowanie do przeglądania stron internetowych (przeglądarka internetowa) zazwyczaj domyślnie dopuszcza przechowywanie plików cookies w urządzeniu końcowym Użytkownika. Użytkownicy Serwisu mogą dokonać zmiany ustawień w tym zakresie. Przeglądarka internetowa umożliwia usunięcie plików cookies. Możliwe jest także automatyczne blokowanie plików cookies Szczegółowe informacje na ten temat zawiera pomoc lub dokumentacja przeglądarki internetowej.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              Ograniczenia stosowania plików cookies mogą wpłynąć na niektóre funkcjonalności dostępne na stronach internetowych Serwisu.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Pliki cookies zamieszczane w urządzeniu końcowym Użytkownika Serwisu wykorzystywane mogą być również przez współpracujące z operatorem Serwisu podmioty, w szczególności dotyczy to firm: Google (Google Inc. z siedzibą w USA), Facebook (Facebook Inc. z siedzibą w USA), Twitter (Twitter Inc. z siedzibą w USA).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">9. Zarządzanie plikami cookies – jak w praktyce wyrażać i cofać zgodę?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Jeśli użytkownik nie chce otrzymywać plików cookies, może zmienić ustawienia przeglądarki. Zastrzegamy, że wyłączenie obsługi plików cookies niezbędnych dla procesów uwierzytelniania, bezpieczeństwa, utrzymania preferencji użytkownika może utrudnić, a w skrajnych przypadkach może uniemożliwić korzystanie ze stron www
            </p>

            <p className="text-gray-700 leading-relaxed mb-4 font-medium">
              W celu zarządzania ustawienia cookies wybierz z listy poniżej przeglądarkę internetową, której używasz i postępuj zgodnie z instrukcjami:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="text-center">
                <a href="https://support.microsoft.com/pl-pl/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Edge</a>
              </div>
              <div className="text-center">
                <a href="https://support.microsoft.com/pl-pl/topic/usuwanie-plik%C3%B3w-cookie-i-zarz%C4%85dzanie-nimi-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Internet Explorer</a>
              </div>
              <div className="text-center">
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Chrome</a>
              </div>
              <div className="text-center">
                <a href="https://support.apple.com/pl-pl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Safari</a>
              </div>
              <div className="text-center">
                <a href="https://support.mozilla.org/pl/kb/wlaczanie-i-wylaczanie-obslugi-ciasteczek" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Firefox</a>
              </div>
              <div className="text-center">
                <a href="https://help.opera.com/pl/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Opera</a>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4 font-medium">
              Urządzenia mobilne:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="text-center">
                <a href="https://support.google.com/chrome/answer/2392971" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Android</a>
              </div>
              <div className="text-center">
                <a href="https://support.apple.com/pl-pl/HT201265" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Safari (iOS)</a>
              </div>
              <div className="text-center">
                <a href="https://support.microsoft.com/pl-pl/windows" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Windows Phone</a>
              </div>
            </div>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <p className="text-sm text-blue-800 font-medium text-center">
              Data ostatniej aktualizacji: {new Date().toLocaleDateString('pl-PL')}
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
} 