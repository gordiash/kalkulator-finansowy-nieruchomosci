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
import Terms from './pages/Terms';
import AboutUs from './pages/AboutUs';
import PropertyPricesPage from './pages/PropertyPricesPage';
import GoogleAnalytics from './components/GoogleAnalytics';
import NoCSPAdsLoader from './components/NoCSPAdsLoader';

const App: React.FC = () => {
  return (
    <Layout>
      <GoogleAnalytics />
      <NoCSPAdsLoader />
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
        <Route path="/kalkulator-nieruchomosci" element={<ROICalculatorPage />} />
        <Route path="/kalkulator-roi" element={<ROICalculatorPage />} />
        <Route path="/kalkulator-inwestycji" element={<InvestmentCalculatorPage />} />
        <Route path="/kalkulator-wartosci-nieruchomosci" element={<RentalValueCalculatorPage />} />
        <Route path="/kalkulator-wartosci-najmu" element={<RentalValueCalculatorPage />} />
        <Route path="/polityka-prywatnosci" element={<PrivacyPolicy />} />
        <Route path="/regulamin" element={<Terms />} />
        <Route path="/o-nas" element={<AboutUs />} />
        <Route path="/ceny-nieruchomosci" element={<PropertyPricesPage />} />
      </Routes>
    </Layout>
  );
};

export default App;