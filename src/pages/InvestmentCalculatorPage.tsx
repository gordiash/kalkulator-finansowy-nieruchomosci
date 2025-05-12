import React from 'react';
import InvestmentCalculator from '../components/InvestmentCalculator';

const InvestmentCalculatorPage: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-indigo-900">Kalkulator Inwestycji</h2>
      <div className="mb-8">
        <InvestmentCalculator 
          investment={500000} 
          cashFlows={[20000, 25000, 30000, 35000, 40000]} 
          discountRate={5} 
        />
      </div>
    </div>
  );
};

export default InvestmentCalculatorPage; 