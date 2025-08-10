'use client';

import { useState } from 'react';
import FliperCalculator from './FliperCalculator';
import SaveCalculationButton from './SaveCalculationButton';

export default function FliperCalculatorWithSave() {
  const [inputData, setInputData] = useState<Record<string, string>>({});
  const [resultData, setResultData] = useState<any>(null);

  return (
    <div>
      <FliperCalculator onInputChange={setInputData} onResultChange={setResultData} />
      <SaveCalculationButton
        calculationData={inputData}
        resultData={resultData}
        calculationType="flipper"
        className="mt-6"
      />
    </div>
  );
}


