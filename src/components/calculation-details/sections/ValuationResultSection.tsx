import { DataRow } from '../DataRow';

interface ValuationResultSectionProps {
  data: any;
}

export function ValuationResultSection({ data }: ValuationResultSectionProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 }).format(value);
  
  const confidenceLevel = parseFloat(data.confidence?.replace('±', '').replace('%', ''));
  let confidenceColor = 'bg-gray-200 text-gray-700';
  if (confidenceLevel <= 2) {
    confidenceColor = 'bg-green-100 text-green-800';
  } else if (confidenceLevel <= 5) {
    confidenceColor = 'bg-yellow-100 text-yellow-800';
  } else {
    confidenceColor = 'bg-red-100 text-red-800';
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Wynik wyceny</h2>
      
      {/* Główna cena */}
      <div className="text-center bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
        <p className="text-lg text-gray-700">Szacowana wartość nieruchomości</p>
        <p className="text-5xl font-extrabold text-gray-800 py-2">
          {formatCurrency(data.price)}
        </p>
        <p className="text-md text-gray-600 mt-2">
          Przewidywany przedział cenowy: <strong>{formatCurrency(data.minPrice)} - {formatCurrency(data.maxPrice)}</strong>
        </p>
      </div>

      <div className="space-y-3">
        <DataRow label="Poziom ufności" value={
          <span className={`px-2 py-1 text-sm font-semibold rounded-full ${confidenceColor}`}>
            {data.confidence}
          </span>
        } />
        <DataRow label="Metoda wyceny" value="Zaawansowany model AI (Ensemble)" />
        <DataRow label="Data wyceny" value={new Date(data.timestamp).toLocaleString('pl-PL')} />
      </div>
       <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p>Wycena jest estymacją opartą na zaawansowanych modelach statystycznych i nie stanowi oficjalnego operatu szacunkowego.</p>
      </div>
    </div>
  );
} 