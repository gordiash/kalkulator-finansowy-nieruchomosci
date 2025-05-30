import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'O Nas | Kalkulator Finansowy Nieruchomości',
  description: 'Dowiedz się więcej o zespole Kalkulatora Finansowego Nieruchomości, naszej misji i wartościach. Pomagamy podejmować świadome decyzje inwestycyjne.',
  alternates: {
    canonical: 'https://kalkulator-finansowy-nieruchomosci.pl/o-nas',
  },
};

const AboutUsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-800">O Nas</h1>
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Kim jesteśmy?</h2>
          <p className="mb-4">
            Jesteśmy zespołem pasjonatów nieruchomości i finansów, którzy postanowili stworzyć narzędzie
            pomagające inwestorom w podejmowaniu świadomych decyzji inwestycyjnych na rynku nieruchomości w Polsce.
          </p>
          <p>
            Nasz projekt powstał z myślą o osobach, które chcą analitycznie podejść do inwestowania
            w nieruchomości i potrzebują narzędzi do precyzyjnego oszacowania opłacalności swoich inwestycji.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Nasza misja</h2>
          <p className="mb-4">
            Naszą misją jest demokratyzacja dostępu do zaawansowanych narzędzi finansowych,
            które do tej pory były dostępne głównie dla profesjonalnych inwestorów i firm z branży nieruchomości.
          </p>
          <p>
            Wierzymy, że dzięki odpowiednim narzędziom i wiedzy, każdy może podejmować mądrzejsze
            decyzje inwestycyjne i budować swoją niezależność finansową poprzez inwestycje w nieruchomości.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Nasze wartości</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Przejrzystość</span> - wszystkie nasze kalkulacje są transparentne i oparte o realne dane rynkowe</li>
            <li><span className="font-medium">Dokładność</span> - stale dopracowujemy nasze algorytmy, aby zapewnić jak najdokładniejsze wyniki</li>
            <li><span className="font-medium">Edukacja</span> - oprócz narzędzi, dostarczamy wiedzę potrzebną do mądrego inwestowania</li>
            <li><span className="font-medium">Dostępność</span> - nasze narzędzia są dostępne bezpłatnie dla wszystkich</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Skontaktuj się z nami</h2>
          <p className="mb-4">
            Masz pytania, sugestie lub chcesz podzielić się swoją opinią na temat naszych kalkulatorów?
            Napisz do nas na adres: <a href="mailto:jaroslaw.jakubczyk@gmail.com" className="text-indigo-600 hover:underline">jaroslaw.jakubczyk@gmail.com</a>
          </p>
          <p>
            Jesteśmy otwarci na wszelkie sugestie i propozycje dotyczące rozwoju naszych narzędzi!
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage; 