import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ROICalculatorPage from './pages/ROICalculatorPage';
import InvestmentCalculatorPage from './pages/InvestmentCalculatorPage';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/roi" element={<ROICalculatorPage />} />
        <Route path="/investment" element={<InvestmentCalculatorPage />} />
      </Routes>
    </Layout>
  );
};

export default App;