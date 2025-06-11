"use client";

import { useState } from "react";

const RentalProfitabilityCalculatorPage = () => {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [initialCosts, setInitialCosts] = useState("");
  const [monthlyCosts, setMonthlyCosts] = useState("");

  const [annualIncome, setAnnualIncome] = useState<number | null>(null);
  const [netAnnualIncome, setNetAnnualIncome] = useState<number | null>(null);
  const [roi, setRoi] = useState<number | null>(null);

  const calculateProfitability = () => {
    const price = parseFloat(purchasePrice);
    const rent = parseFloat(monthlyRent);
    const initCosts = parseFloat(initialCosts);
    const monthCosts = parseFloat(monthlyCosts);

    if (price > 0 && rent > 0) {
      const totalInvestment = price + initCosts;
      const annualRentIncome = rent * 12;
      const annualCosts = monthCosts * 12;
      const netIncome = annualRentIncome - annualCosts;
      const calculatedRoi = (netIncome / totalInvestment) * 100;

      setAnnualIncome(annualRentIncome);
      setNetAnnualIncome(netIncome);
      setRoi(calculatedRoi);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Kalkulator Opłacalności Wynajmu
      </h1>
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="purchasePrice">
              Cena zakupu (zł)
            </label>
            <input
              id="purchasePrice"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              placeholder="np. 450000"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="monthlyRent">
              Mies. przychód z najmu (zł)
            </label>
            <input
              id="monthlyRent"
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              placeholder="np. 2500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="initialCosts">
              Koszty początkowe (zł)
            </label>
            <input
              id="initialCosts"
              type="number"
              value={initialCosts}
              onChange={(e) => setInitialCosts(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              placeholder="np. 20000"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="monthlyCosts">
              Mies. koszty (zł)
            </label>
            <input
              id="monthlyCosts"
              type="number"
              value={monthlyCosts}
              onChange={(e) => setMonthlyCosts(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              placeholder="np. 600"
            />
          </div>
        </div>
        <div className="flex items-center justify-center mt-4">
          <button
            onClick={calculateProfitability}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Oblicz opłacalność
          </button>
        </div>
        {roi !== null && (
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Wyniki analizy:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold">Roczny przychód:</h4>
                    <p className="text-xl text-gray-800">{annualIncome?.toFixed(2)} zł</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold">Roczny dochód netto:</h4>
                    <p className="text-xl text-gray-800">{netAnnualIncome?.toFixed(2)} zł</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold">ROI (roczny zwrot):</h4>
                    <p className="text-2xl font-bold text-green-700">{roi?.toFixed(2)}%</p>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalProfitabilityCalculatorPage; 