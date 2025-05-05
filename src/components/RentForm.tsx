import React from 'react';
import { RentFormData } from '../types';
import FormInput from './FormInput';

interface RentFormProps {
  data: RentFormData;
  onChange: (data: Partial<RentFormData>) => void;
}

const RentForm: React.FC<RentFormProps> = ({ data, onChange }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <h2 className="text-base font-semibold text-indigo-900 mb-3 border-b border-gray-200 pb-2">
        Parametry najmu
      </h2>

      <div className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-3">
          <h3 className="font-medium text-blue-800 mb-2 text-sm">
            Podstawowe informacje
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-24">
              <FormInput
                id="monthlyRent"
                label="Miesięczny czynsz (PLN)"
                type="number"
                value={data.monthlyRent}
                onChange={(value) => onChange({ monthlyRent: value })}
                tooltip="Miesięczna kwota czynszu najmu"
                required
                min={0}
              />
            </div>

            <div className="h-24">
              <FormInput
                id="rentIncrease"
                label="Wzrost czynszu (%/rok)"
                type="number"
                value={data.rentIncrease}
                onChange={(value) => onChange({ rentIncrease: value })}
                tooltip="Przewidywany roczny wzrost pobieranego czynszu"
                required
                min={0}
                step={0.1}
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg mb-3">
          <h3 className="font-medium text-indigo-800 mb-2 text-sm">
            Koszty i opłaty
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-24">
              <FormInput
                id="securityDeposit"
                label="Kaucja zabezpieczająca (PLN)"
                type="number"
                value={data.securityDeposit}
                onChange={(value) => onChange({ securityDeposit: value })}
                tooltip="Kwota kaucji wpłacana przez najemcę na początku najmu"
                required
                min={0}
              />
            </div>

            <div className="h-24">
              <FormInput
                id="renterInsurance"
                label="Ubezpieczenie najemcy (PLN/rok)"
                type="number"
                value={data.renterInsurance}
                onChange={(value) => onChange({ renterInsurance: value })}
                tooltip="Roczny koszt ubezpieczenia najemcy"
                required
                min={0}
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-50 border border-green-100 rounded-lg mb-3">
          <h3 className="font-medium text-green-800 mb-2 text-sm">
            Utrzymanie
          </h3>
          
          <div className="h-24">
            <FormInput
              id="rentMaintenance"
              label="Koszty utrzymania (PLN/rok)"
              type="number"
              value={data.rentMaintenance}
              onChange={(value) => onChange({ rentMaintenance: value })}
              tooltip="Roczne koszty utrzymania nieruchomości pod wynajem"
              required
              min={0}
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <h3 className="font-medium text-amber-800 mb-2 text-sm">
            Inwestycja
          </h3>
          
          <div className="h-24">
            <FormInput
              id="investmentReturn"
              label="Zwrot z inwestycji (%/rok)"
              type="number"
              value={data.investmentReturn}
              onChange={(value) => onChange({ investmentReturn: value })}
              tooltip="Przewidywany roczny zwrot z inwestycji w wynajem"
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

export default RentForm; 