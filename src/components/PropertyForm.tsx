import React, { useEffect, useState } from 'react';
import { PropertyFormData } from '../types';
import FormInput from './FormInput';

interface PropertyFormProps {
  data: PropertyFormData;
  onChange: (data: Partial<PropertyFormData>) => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ data, onChange }) => {
  const [downPaymentLabel, setDownPaymentLabel] = useState('Wkład własny');

  // Aktualizacja etykiety w zależności od typu wkładu własnego
  useEffect(() => {
    setDownPaymentLabel(`Wkład własny (${data.downPaymentType === 'percent' ? '%' : 'PLN'})`);
  }, [data.downPaymentType]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <h2 className="text-base font-semibold text-indigo-900 mb-3 border-b border-gray-200 pb-2">
        Parametry zakupu
      </h2>

      <div className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-3">
          <h3 className="font-medium text-blue-800 mb-2 text-sm">
            Podstawowe informacje
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-24">
              <FormInput
                id="propertyPrice"
                label="Cena nieruchomości (PLN)"
                type="number"
                value={data.propertyPrice}
                onChange={(value) => onChange({ propertyPrice: value })}
                tooltip="Cena zakupu nieruchomości w PLN"
                required
                min={0}
              />
            </div>

            <div className="h-24">
              <FormInput
                id="transactionCosts"
                label="Koszty transakcyjne (PLN)"
                type="number"
                value={data.transactionCosts}
                onChange={(value) => onChange({ transactionCosts: value })}
                tooltip="Jednorazowe koszty przy zakupie (notariusz, podatki)"
                required
                min={0}
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg mb-3">
          <h3 className="font-medium text-indigo-800 mb-2 text-sm">
            Wkład własny i kredyt
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-24">
              <FormInput
                id="downPaymentType"
                label="Typ wkładu własnego"
                type="select"
                value={data.downPaymentType}
                onChange={(value) => onChange({ downPaymentType: value })}
                tooltip="Wybierz czy wkład własny będzie podany jako kwota czy procent ceny"
                options={[
                  { value: 'amount', label: 'Kwota (PLN)' },
                  { value: 'percent', label: 'Procent (%)' }
                ]}
              />
            </div>

            <div className="h-24">
              <FormInput
                id="downPayment"
                label={downPaymentLabel}
                type="number"
                value={data.downPaymentValue}
                onChange={(value) => onChange({ downPaymentValue: value })}
                tooltip={data.downPaymentType === 'percent' ? 'Procent ceny nieruchomości jako wkład własny' : 'Kwota własna wpłacana przy zakupie'}
                required
                min={0}
                step={data.downPaymentType === 'percent' ? 0.1 : 1000}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="h-24">
              <FormInput
                id="baseRate"
                label="Stopa bazowa (%)"
                type="number"
                value={data.baseRate}
                onChange={(value) => onChange({ baseRate: value })}
                tooltip="Stopa referencyjna (np. WIBOR 3M)"
                required
                min={0}
                step={0.01}
              />
            </div>

            <div className="h-24">
              <FormInput
                id="bankMargin"
                label="Marża banku (%)"
                type="number"
                value={data.bankMargin}
                onChange={(value) => onChange({ bankMargin: value })}
                tooltip="Stała marża banku dodawana do stopy bazowej"
                required
                min={0}
                step={0.01}
              />
            </div>

            <div className="h-24">
              <FormInput
                id="loanTerm"
                label="Okres kredytowania (lata)"
                type="number"
                value={data.loanTerm}
                onChange={(value) => onChange({ loanTerm: value })}
                tooltip="Czas spłaty kredytu w latach"
                required
                min={1}
                max={35}
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-50 border border-green-100 rounded-lg mb-3">
          <h3 className="font-medium text-green-800 mb-2 text-sm">
            Koszty utrzymania nieruchomości
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-24">
              <FormInput
                id="propertyTax"
                label="Podatek od nieruchomości (PLN/rok)"
                type="number"
                value={data.propertyTax}
                onChange={(value) => onChange({ propertyTax: value })}
                tooltip="Roczny podatek od nieruchomości"
                required
                min={0}
              />
            </div>

            <div className="h-24">
              <FormInput
                id="insurance"
                label="Ubezpieczenie nieruchomości (PLN/rok)"
                type="number"
                value={data.insurance}
                onChange={(value) => onChange({ insurance: value })}
                tooltip="Roczna składka ubezpieczeniowa"
                required
                min={0}
              />
            </div>

            <div className="h-24">
              <FormInput
                id="maintenance"
                label="Koszty bieżące (PLN/rok)"
                type="number"
                value={data.maintenance}
                onChange={(value) => onChange({ maintenance: value })}
                tooltip="Roczne koszty utrzymania, napraw i remontów"
                required
                min={0}
              />
            </div>

            <div className="h-24">
              <FormInput
                id="communityRent"
                label="Czynsz wspólnoty/spółdzielni (PLN/rok)"
                type="number"
                value={data.communityRent}
                onChange={(value) => onChange({ communityRent: value })}
                tooltip="Roczna opłata do wspólnoty/spółdzielni"
                required
                min={0}
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <h3 className="font-medium text-amber-800 mb-2 text-sm">
            Potencjalny wzrost wartości
          </h3>
          
          <div className="h-24">
            <FormInput
              id="appreciation"
              label="Wzrost wartości nieruchomości (%/rok)"
              type="number"
              value={data.appreciation}
              onChange={(value) => onChange({ appreciation: value })}
              tooltip="Przewidywany roczny wzrost wartości nieruchomości"
              required
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm; 