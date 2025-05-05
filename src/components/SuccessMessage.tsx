import React from 'react';

interface SuccessMessageProps {
  message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
  // Animacja znikania - komponent usunie się po 4 sekundach (zgodnie z tailwind.config.js)
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-center py-3 px-6 rounded-md shadow-lg z-50 animate-fadeInOut">
      {message}
    </div>
  );
};

export default SuccessMessage; 