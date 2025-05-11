import React, { useMemo } from 'react';
import { CalculationResults } from '../types';

type BreakEvenCalculatorProps = {
  results: CalculationResults;
};

const BreakEvenCalculator: React.FC<BreakEvenCalculatorProps> = ({ results }) => {
  // Obliczenie punktu break-even (moment, w którym linia zakupu przecina linię wynajmu)
  const { breakEvenYear, breakEvenMonth, hasCrossover, approxTime, timeSeries } = useMemo(() => {
    const { mortgageCostData, rentCostData, labels } = results.comparison.chartData;
    
    // Znalezienie przecięcia linii na wykresie kumulacyjnym
    let breakEvenIndex = -1;
    let hasCrossover = false;
    
    for (let i = 0; i < mortgageCostData.length; i++) {
      if (i > 0 && 
          mortgageCostData[i - 1] > rentCostData[i - 1] && 
          mortgageCostData[i] <= rentCostData[i]) {
        breakEvenIndex = i;
        hasCrossover = true;
        break;
      }
    }
    
    // Jeśli znaleziono przecięcie, to obliczamy dokładniejszą datę (również w miesiącach)
    let breakEvenMonth = 0;
    let approxTime = "";
    
    if (hasCrossover && breakEvenIndex > 0) {
      // Linearna interpolacja między punktami, aby oszacować, w którym miesiącu nastąpi przecięcie
      const prevMortgage = mortgageCostData[breakEvenIndex - 1];
      const prevRent = rentCostData[breakEvenIndex - 1];
      const currMortgage = mortgageCostData[breakEvenIndex];
      const currRent = rentCostData[breakEvenIndex];
      
      // Różnica wartości w poprzednim punkcie
      const prevDiff = prevMortgage - prevRent;
      // Różnica między przyrostami obu linii
      const mortgageDelta = currMortgage - prevMortgage;
      const rentDelta = currRent - prevRent;
      // Przybliżony ułamek roku, w którym nastąpi przecięcie
      const fraction = prevDiff / (rentDelta - mortgageDelta);
      
      // Miesiąc, w którym nastąpi przecięcie (zaokrąglony)
      breakEvenMonth = Math.round(fraction * 12);
      
      // Formatowanie tekstu wyniku
      const years = breakEvenIndex - (breakEvenMonth === 12 ? 0 : 1);
      const months = breakEvenMonth === 12 ? 0 : breakEvenMonth;
      
      if (years === 0) {
        approxTime = `${months} ${getPluralForm(months, 'miesiąc', 'miesiące', 'miesięcy')}`;
      } else if (months === 0) {
        approxTime = `${years} ${getPluralForm(years, 'rok', 'lata', 'lat')}`;
      } else {
        approxTime = `${years} ${getPluralForm(years, 'rok', 'lata', 'lat')} i ${months} ${getPluralForm(months, 'miesiąc', 'miesiące', 'miesięcy')}`;
      }
    }
    
    // Przygotowanie danych dla wykresu szczegółowego - miesięczne dane dla lat przed i po break-even
    const detailedStartYear = Math.max(0, breakEvenIndex - 2);
    const detailedEndYear = Math.min(mortgageCostData.length - 1, breakEvenIndex + 2);
    
    const timeSeries = labels.slice(detailedStartYear, detailedEndYear + 1);
    
    return { 
      breakEvenYear: hasCrossover ? labels[breakEvenIndex] : null,
      breakEvenMonth,
      hasCrossover,
      approxTime,
      timeSeries
    };
  }, [results]);
  
  // Pomocnicza funkcja do poprawnej formy gramatycznej liczebników
  function getPluralForm(count: number, one: string, few: string, many: string): string {
    if (count === 1) return one;
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return few;
    return many;
  }
  
  // Obliczenie dodatkowych parametrów finansowych
  const { 
    totalSavings, 
    monthlyDifference,
    buyingROI,
    returnTimeYears,
  } = useMemo(() => {
    const { propertyValue, buyingTotal, downPayment } = results.buyingSummary;
    const { investmentValue, rentingTotal } = results.rentingSummary;
    const { finalDifference } = results.comparison;
    
    // Całkowita kwota zaoszczędzona / zysk
    const totalSavings = finalDifference;
    
    // Średnia miesięczna różnica w kosztach
    const totalMonths = results.comparison.chartData.labels.length * 12;
    const monthlyDifference = totalSavings / totalMonths;
    
    // ROI (Return on Investment) dla zakupu nieruchomości
    const investmentReturn = propertyValue - buyingTotal;
    const buyingROI = (investmentReturn / downPayment) * 100;
    
    // Przybliżony czas zwrotu z inwestycji (w latach)
    const returnTimeYears = downPayment / (monthlyDifference * 12) || 0;
    
    return {
      totalSavings,
      monthlyDifference,
      buyingROI,
      returnTimeYears: returnTimeYears > 0 ? returnTimeYears : Infinity,
    };
  }, [results]);
  
  return (
    <div className="bg-white rounded-lg shadow p-5 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Analiza punktu rentowności</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`rounded-lg p-4 flex flex-col ${hasCrossover ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <h3 className="font-semibold text-gray-700 mb-2">Punkt rentowności (Break-Even Point)</h3>
          {hasCrossover ? (
            <>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {breakEvenYear}
              </div>
              <p className="text-sm text-gray-600">
                Zakup nieruchomości zacznie być opłacalny po około <span className="font-medium">{approxTime}</span>.
              </p>
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-amber-600 mb-1">
                Nie osiągnięto
              </div>
              <p className="text-sm text-gray-600">
                W analizowanym okresie zakup nie osiąga punktu rentowności względem wynajmu.
              </p>
            </>
          )}
        </div>
        
        <div className="rounded-lg p-4 bg-blue-50 border border-blue-200 flex flex-col">
          <h3 className="font-semibold text-gray-700 mb-2">Całkowita korzyść finansowa</h3>
          <div className={`text-2xl font-bold mb-1 ${totalSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Math.abs(totalSavings))}
          </div>
          <p className="text-sm text-gray-600">
            {totalSavings >= 0 
              ? 'Kwota zaoszczędzona wybierając opcję zakupu zamiast wynajmu.' 
              : 'Kwota zaoszczędzona wybierając opcję wynajmu zamiast zakupu.'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg p-4 bg-gray-50 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Miesięczna oszczędność</h3>
          <div className={`text-xl font-bold ${monthlyDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Math.abs(monthlyDifference))}
            <span className="text-xs font-normal text-gray-500 ml-1">/mies.</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Średnia miesięczna różnica w kosztach między zakupem a wynajmem.
          </p>
        </div>
        
        <div className="rounded-lg p-4 bg-gray-50 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">ROI z zakupu</h3>
          <div className="text-xl font-bold text-blue-600">
            {new Intl.NumberFormat('pl-PL', { style: 'percent', minimumFractionDigits: 2 }).format(buyingROI / 100)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Zwrot z zainwestowanego kapitału własnego (wkładu własnego).
          </p>
        </div>
        
        <div className="rounded-lg p-4 bg-gray-50 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Czas zwrotu inwestycji</h3>
          <div className="text-xl font-bold text-purple-600">
            {Number.isFinite(returnTimeYears) && returnTimeYears > 0 
              ? `${returnTimeYears.toFixed(1)} ${getPluralForm(Math.round(returnTimeYears), 'rok', 'lata', 'lat')}`
              : 'Nieosiągalny'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Przybliżony czas zwrotu z inwestycji w wkład własny.
          </p>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>* Powyższe obliczenia bazują na danych wprowadzonych do kalkulatora i założeniach dotyczących wzrostu wartości nieruchomości, inflacji oraz kosztów.</p>
        <p>* Rzeczywiste wyniki mogą się różnić w zależności od zmian warunków rynkowych, stóp procentowych, podatków i innych czynników.</p>
      </div>
    </div>
  );
};

export default BreakEvenCalculator; 