import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {new Date().getFullYear()} Kalkulator Finansowy Nieruchomości. Wszystkie prawa zastrzeżone.</p>
          </div>
          <div className="flex flex-wrap justify-center space-x-4">
            <Link href="/o-nas" className="text-sm hover:text-white transition duration-200">O nas</Link>
            <Link href="/polityka-prywatnosci" className="text-sm hover:text-white transition duration-200">Polityka prywatności</Link>
            <Link href="/regulamin" className="text-sm hover:text-white transition duration-200">Regulamin</Link>
            {/* Przycisk "Wesprzyj projekt" jest teraz w MainNavigation */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 