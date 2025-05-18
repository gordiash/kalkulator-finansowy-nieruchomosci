import React from 'react';
import { AnalysisOptions } from '../types';
import FormInput from './FormInput';

interface AnalysisFormProps {
  options: AnalysisOptions;
  onChange: (options: Partial<AnalysisOptions>) => void;
  onCalculate: () => void;
  inflationSource?: string; // Opcjonalne źródło danych o inflacji
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ 
  options, 
  onChange, 
  onCalculate,
  inflationSource 
}) => {
  const handleAnalysisPeriodChange = (value: any) => {
    // Jawna konwersja do liczby całkowitej
    const periodAsNumber = parseInt(value, 10);
    onChange({ analysisPeriod: periodAsNumber });
  };

  const handleInflationChange = (value: any) => {
    // Jawna konwersja do liczby zmiennoprzecinkowej
    const inflationAsNumber = parseFloat(value);
    onChange({ inflation: inflationAsNumber });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <h2 className="text-base font-semibold text-indigo-900 mb-3 border-b border-gray-200 pb-2">
        Opcje analizy
      </h2>

      <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg mb-4">
        <h3 className="font-medium text-teal-800 mb-2 text-sm">
          Horyzont czasowy i inflacja
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormInput
            id="analysisPeriod"
            label="Okres analizy (lata)"
            type="select"
            value={options.analysisPeriod}
            onChange={handleAnalysisPeriodChange}
            tooltip="Okres, dla którego przeprowadzana jest analiza"
            options={[
              { value: 5, label: '5 lat' },
              { value: 10, label: '10 lat' },
              { value: 20, label: '20 lat' },
              { value: 25, label: '25 lat' },
              { value: 30, label: '30 lat' }
            ]}
          />

          <div className="flex flex-col">
            <FormInput
              id="inflation"
              label="Średnioroczna inflacja (%)"
              type="number"
              value={options.inflation}
              onChange={handleInflationChange}
              tooltip="Przewidywana średnia roczna stopa inflacji"
              required
              min={0}
              step={0.1}
            />
            
            {inflationSource && (
              <div className="text-xs text-teal-600 mt-1 italic">
                Źródło: {inflationSource}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onCalculate}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-md shadow-md transition-all duration-300 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:-translate-y-1 flex justify-center items-center"
      >
        Oblicz
      </button>
    </div>
  );
};

export default AnalysisForm; 