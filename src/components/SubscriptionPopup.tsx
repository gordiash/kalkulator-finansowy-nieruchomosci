import React, { useState } from 'react';

interface SubscriptionPopupProps {
  onSubscribe: (email: string) => void;
  onClose: () => void;
}

const SubscriptionPopup: React.FC<SubscriptionPopupProps> = ({ onSubscribe, onClose }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubscribe(email);
    }
  };

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
        
        <h3 className="text-xl font-semibold text-indigo-900 mb-2">
          Zapisz się na newsletter
        </h3>
        
        <p className="text-gray-600 mb-4">
          Otrzymuj najnowsze informacje o kalkulatorze i porady dotyczące nieruchomości.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="popupEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Adres email
            </label>
            <input
              type="email"
              id="popupEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Subskrybuj
          </button>
        </form>
        
        {/* Sekcja wsparcia - zawsze pod formularzem subskrypcji */}
        <div className="mt-6 text-center">
          <p className="mb-4 text-gray-700">
            Wesprzyj działanie naszej witryny! Twoje wsparcie pozwoli nam dalej rozwijać projekt
            i dostarczać wartościowe narzędzia.
          </p>
          <a href="https://suppi.pl/smallcode" target="_blank" rel="noopener noreferrer">
            <img width="165" src="https://suppi.pl/api/widget/button.svg?fill=6457FD&textColor=ffffff" alt="Wesprzyj naszą stronę"/>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPopup; 