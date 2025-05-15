import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { 
  calculateROI, 
  calculateIRR, 
  calculateNPV, 
  calculateCumulativeCashFlows,
  calculateScenarios 
} from '../utils/investmentCalculations';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type InvestmentCalculatorProps = {
  investment: number;
  cashFlows: number[];
  discountRate: number;
  onCalculate?: (results: any) => void;
};

const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ 
  investment, 
  cashFlows, 
  discountRate,
  onCalculate 
}) => {
  const [roi, setRoi] = useState<number | null>(null);
  const [irr, setIrr] = useState<number | null>(null);
  const [npv, setNpv] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  const [inputInvestment, setInputInvestment] = useState(investment);
  const [inputCashFlows, setInputCashFlows] = useState(cashFlows.join(","));
  const [inputDiscountRate, setInputDiscountRate] = useState(discountRate);
  const [inputYears, setInputYears] = useState(10); // Domyślna wartość 10 lat
  const [useFixedCashFlow, setUseFixedCashFlow] = useState(false);
  const [inputFixedCashFlow, setInputFixedCashFlow] = useState(
    cashFlows.length > 0 ? cashFlows[0] : 0
  );

  // Aktualizacja pola przepływów pieniężnych na podstawie okresu lat i stałej wartości
  useEffect(() => {
    if (useFixedCashFlow) {
      const generatedCashFlows = Array(inputYears).fill(inputFixedCashFlow);
      setInputCashFlows(generatedCashFlows.join(','));
    }
  }, [useFixedCashFlow, inputYears, inputFixedCashFlow]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "investment") setInputInvestment(Number(value));
    if (name === "cashFlows") setInputCashFlows(value);
    if (name === "discountRate") setInputDiscountRate(Number(value));
    if (name === "years") setInputYears(Number(value));
    if (name === "fixedCashFlow") setInputFixedCashFlow(Number(value));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseFixedCashFlow(e.target.checked);
  };

  const generateChartData = (parsedCashFlows: number[]) => {
    const pessimisticCashFlows = parsedCashFlows.map(flow => flow * 0.8);
    const neutralCashFlows = parsedCashFlows;
    const optimisticCashFlows = parsedCashFlows.map(flow => flow * 1.2);

    const cumulativePessimistic = calculateCumulativeCashFlows(pessimisticCashFlows);
    const cumulativeNeutral = calculateCumulativeCashFlows(neutralCashFlows);
    const cumulativeOptimistic = calculateCumulativeCashFlows(optimisticCashFlows);

    setChartData({
      labels: parsedCashFlows.map((_, index) => `Rok ${index + 1}`),
      datasets: [
        {
          label: 'Pesymistyczny',
          data: cumulativePessimistic,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Neutralny',
          data: cumulativeNeutral,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Optymistyczny',
          data: cumulativeOptimistic,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    });
  };

  const handleCalculate = () => {
    try {
      const parsedCashFlows = inputCashFlows.split(",").map(Number);
      
      // Sprawdzenie poprawności danych wejściowych
      if (parsedCashFlows.some(isNaN)) {
        throw new Error("Nieprawidłowy format przepływów pieniężnych. Użyj wartości oddzielonych przecinkami.");
      }
      
      if (isNaN(inputInvestment) || inputInvestment <= 0) {
        throw new Error("Kwota inwestycji musi być liczbą większą od zera.");
      }
      
      if (isNaN(inputDiscountRate) || inputDiscountRate < 0) {
        throw new Error("Stopa dyskontowa musi być liczbą nieujemną.");
      }

      if (isNaN(inputYears) || inputYears <= 0 || inputYears > 50) {
        throw new Error("Okres lat musi być liczbą dodatnią nie większą niż 50.");
      }
      
      // Obliczenia z wykorzystaniem funkcji pomocniczych
      const roiValue = calculateROI(inputInvestment, parsedCashFlows);
      const irrValue = calculateIRR(inputInvestment, parsedCashFlows);
      const npvValue = calculateNPV(inputInvestment, parsedCashFlows, inputDiscountRate);
      
      setRoi(roiValue);
      setIrr(irrValue);
      setNpv(npvValue);
      
      // Generowanie danych wykresu
      generateChartData(parsedCashFlows);
      
      // Obliczanie scenariuszy
      const scenarios = calculateScenarios(inputInvestment, parsedCashFlows, inputDiscountRate);
      console.log("Scenarios:", scenarios);

      // Przygotowanie danych wynikowych
      if (onCalculate) {
        // Obliczanie sumy przepływów pieniężnych
        const totalReturn = parsedCashFlows.reduce((sum, flow) => sum + flow, 0);
        
        // Znajdowanie roku, w którym inwestycja się zwraca
        const cumulativeCashFlows = calculateCumulativeCashFlows(parsedCashFlows);
        const breakEvenYear = cumulativeCashFlows.findIndex(value => value >= inputInvestment);
        
        // Dane do wykresu
        const yearlyCashFlows = parsedCashFlows.map(flow => flow);
        
        // Zwracanie wyników
        onCalculate({
          investment: inputInvestment,
          cashFlows: parsedCashFlows,
          discountRate: inputDiscountRate,
          roi: roiValue,
          irr: irrValue,
          npv: npvValue,
          totalReturn,
          breakEvenYear: breakEvenYear >= 0 ? breakEvenYear + 1 : null,
          yearlyCashFlows,
          cumulativeCashFlows,
          scenarios
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Wystąpił błąd podczas obliczeń.");
      }
    }
  };

  // Komponent dla tooltip
  const Tooltip = ({ text }: { text: string }) => (
    <span className="ml-1 flex-shrink-0 inline-block relative group cursor-help text-indigo-600">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 inline" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
          clipRule="evenodd" 
        />
      </svg>
      <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-900 text-white text-xs rounded py-1 px-2 absolute left-0 top-full mt-1 -ml-1 w-64 z-10">
        {text}
      </span>
    </span>
  );

  // Komponent dla wyjaśnienia wskaźników
  const Explanation = ({ term, description }: { term: string; description: string }) => (
    <div className="flex items-start mt-1 text-sm">
      <span className="font-medium mr-1">{term}:</span>
      <span className="text-gray-600">{description}</span>
    </div>
  );

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <div className="mb-4">
        <h2 className="text-lg font-bold">Kalkulator Inwestycji</h2>
        <p className="text-sm text-gray-600 mt-1">
          Narzędzie do analizy opłacalności inwestycji na podstawie przepływów pieniężnych.
        </p>
      </div>

      <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
        <div className="flex items-center mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Jak korzystać z kalkulatora:</span>
        </div>
        <ol className="list-decimal list-inside pl-2">
          <li>Wprowadź kwotę początkowej inwestycji</li>
          <li>Ustaw okres inwestycji w latach</li>
          <li>Wpisz roczne przepływy pieniężne oddzielone przecinkami lub użyj stałej wartości</li>
          <li>Ustaw stopę dyskontową (koszt kapitału)</li>
          <li>Kliknij "Oblicz" aby zobaczyć wyniki analizy</li>
        </ol>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          Inwestycja początkowa:
          <Tooltip text="Wartość początkowego wkładu finansowego w inwestycję (np. cena zakupu nieruchomości). Podaj kwotę dodatnią w PLN." />
        </label>
        <input
          type="number"
          name="investment"
          value={inputInvestment}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          Okres inwestycji (lata):
          <Tooltip text="Określa czas trwania inwestycji w latach. Wpływa na obliczenia wskaźników i długość analizy." />
        </label>
        <input
          type="number"
          name="years"
          min="1"
          max="50"
          value={inputYears}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-2">
        <div className="flex items-center">
          <input
            id="useFixedCashFlow"
            type="checkbox"
            checked={useFixedCashFlow}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="useFixedCashFlow" className="ml-2 block text-sm text-gray-700">
            Użyj stałej wartości przepływu pieniężnego
            <Tooltip text="Zamiast wpisywać wartości dla każdego roku, możesz podać jedną wartość, która będzie powtarzana przez wybrany okres lat." />
          </label>
        </div>
      </div>

      {useFixedCashFlow ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            Stały roczny przepływ pieniężny:
            <Tooltip text="Ta wartość będzie automatycznie powtórzona dla każdego roku w okresie inwestycji." />
          </label>
          <input
            type="number"
            name="fixedCashFlow"
            value={inputFixedCashFlow}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ta wartość zostanie zastosowana dla {inputYears} {inputYears === 1 ? 'roku' : 'lat'}
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            Przepływy pieniężne (oddzielone przecinkami):
            <Tooltip text="Przewidywane roczne przychody z inwestycji po odjęciu kosztów. Podaj wartości oddzielone przecinkami, np. '5000,6000,7000' dla trzech lat. Wartości mogą być dodatnie (zysk) lub ujemne (strata)." />
          </label>
          <input
            type="text"
            name="cashFlows"
            value={inputCashFlows}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Przykład: 5000,6000,7000,8000,9000 (zalecana liczba wartości: {inputYears})
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          Stopa dyskontowa (%):
          <Tooltip text="Oczekiwana minimalna stopa zwrotu z inwestycji, uwzględniająca koszt kapitału, inflację i ryzyko. Zazwyczaj między 5% a 15% dla inwestycji w nieruchomości." />
        </label>
        <input
          type="number"
          name="discountRate"
          value={inputDiscountRate}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <button
        onClick={handleCalculate}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
      >
        Oblicz wskaźniki
      </button>

      {(roi !== null || irr !== null || npv !== null) && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="font-bold text-md mb-2">Wyniki analizy:</h3>
          
          {roi !== null && (
            <div className="mb-2">
              <div className="flex items-center">
                <span className="font-medium">ROI:</span>
                <span className={`ml-2 ${roi >= 0 ? 'text-green-600' : 'text-red-600'} font-bold`}>
                  {roi.toFixed(2)}%
                </span>
                <Tooltip text="Return On Investment - procentowy zwrot z inwestycji. Wartość powyżej 0% wskazuje na zysk." />
              </div>
              <Explanation 
                term="ROI" 
                description="Procentowy stosunek całkowitego zysku do początkowej inwestycji. Im wyższy, tym lepsza inwestycja." 
              />
            </div>
          )}
          
          {irr !== null && (
            <div className="mb-2">
              <div className="flex items-center">
                <span className="font-medium">IRR:</span>
                <span className={`ml-2 ${irr >= inputDiscountRate ? 'text-green-600' : 'text-yellow-600'} font-bold`}>
                  {irr.toFixed(2)}%
                </span>
                <Tooltip text="Internal Rate of Return - wewnętrzna stopa zwrotu. Powinna być wyższa niż stopa dyskontowa, aby inwestycja była opłacalna." />
              </div>
              <Explanation 
                term="IRR" 
                description="Stopa dyskontowa, przy której NPV = 0. Określa rzeczywistą stopę zwrotu z inwestycji." 
              />
            </div>
          )}
          
          {npv !== null && (
            <div className="mb-2">
              <div className="flex items-center">
                <span className="font-medium">NPV:</span>
                <span className={`ml-2 ${npv >= 0 ? 'text-green-600' : 'text-red-600'} font-bold`}>
                  {npv.toFixed(2)} zł
                </span>
                <Tooltip text="Net Present Value - wartość bieżąca netto. Dodatnia wartość oznacza, że inwestycja jest opłacalna przy danej stopie dyskontowej." />
              </div>
              <Explanation 
                term="NPV" 
                description="Suma zdyskontowanych przepływów pieniężnych pomniejszona o wartość inwestycji początkowej." 
              />
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Interpretacja wyników:</span>
            </div>
            <ul className="list-disc list-inside pl-5 mt-1">
              <li>Inwestycja jest opłacalna, gdy NPV {`>`} 0 i IRR {`>`} stopa dyskontowa</li>
              <li>Wyższe wartości ROI i IRR wskazują na lepszą opłacalność inwestycji</li>
              <li>Uwzględnij czynniki ryzyka i niepewność przyszłych przepływów pieniężnych</li>
            </ul>
          </div>
        </div>
      )}

      {chartData && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2 flex items-center">
            Wykres skumulowanych przepływów pieniężnych (okres: {inputYears} {inputYears === 1 ? 'rok' : 'lat'})
            <Tooltip text="Wykres pokazuje jak zmieniają się skumulowane przepływy pieniężne w czasie w trzech scenariuszach: pesymistycznym (-20%), neutralnym i optymistycznym (+20%)." />
          </h3>
          <div className="h-64">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>Scenariusze:</p>
            <ul className="list-disc list-inside pl-5">
              <li><span className="text-red-500 font-medium">Pesymistyczny</span>: przepływy pieniężne 20% niższe od zakładanych</li>
              <li><span className="text-blue-500 font-medium">Neutralny</span>: zgodnie z wprowadzonymi wartościami</li>
              <li><span className="text-green-500 font-medium">Optymistyczny</span>: przepływy pieniężne 20% wyższe od zakładanych</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentCalculator;