import React from 'react';

interface DonationModalProps {
  onClose: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Zamknij"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-indigo-900 mb-2">
            Wesprzyj nasz projekt
          </h3>
          
          <p className="text-gray-600 mb-6">
            Twoje wsparcie pomaga nam rozwijać kalkulator i tworzyć nowe funkcje.
            Dzięki Tobie możemy dalej dostarczać wartościowe narzędzia dla inwestorów!
          </p>
          
          <div className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-6">
            <h4 className="font-medium text-lg text-indigo-800 mb-3">Jednorazowa darowizna</h4>
            <p className="text-gray-600 mb-4">
              Twoje wsparcie ma ogromne znaczenie i pozwala nam utrzymać projekt oraz rozwijać nowe funkcje.
              Każda darowizna, nawet najmniejsza, przybliża nas do celu!
            </p>
            <a 
              href="https://suppi.pl/smallcode" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md transition-colors font-bold text-lg"
            >
              Przekaż darowiznę
            </a>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Wszystkie darowizny są dobrowolne i nie są wymagane do korzystania z kalkulatora.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dziękujemy za Twoje wsparcie i zaangażowanie w rozwój naszego projektu!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationModal; 