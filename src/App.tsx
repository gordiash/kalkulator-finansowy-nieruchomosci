import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ROICalculatorPage from './pages/ROICalculatorPage';
import InvestmentCalculatorPage from './pages/InvestmentCalculatorPage';
import RentalValueCalculatorPage from './pages/RentalValueCalculatorPage';
import PrivacyPolicy from './pages/PrivacyPolicy';

const App: React.FC = () => {
  return (
    <Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/roi" element={<ROICalculatorPage />} />
        <Route path="/investment" element={<InvestmentCalculatorPage />} />
        <Route path="/rental-value" element={<RentalValueCalculatorPage />} />
        <Route path="/polityka-prywatnosci" element={<PrivacyPolicy />} />
      </Routes>
    </Layout>
  );
};

export default App;