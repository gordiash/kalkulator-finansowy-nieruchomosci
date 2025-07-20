import { Metadata } from 'next';
import ChangePasswordForm from '@/components/ChangePasswordForm';

export const metadata: Metadata = {
  title: 'Ustawienia - Panel użytkownika',
  description: 'Zarządzaj ustawieniami konta',
};

export default function UstawieniaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ustawienia konta</h1>
        <p className="text-gray-600 mt-2">Zarządzaj ustawieniami konta i bezpieczeństwem</p>
      </div>
      
      <div className="space-y-8">
        {/* Sekcja zmiany hasła */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Zmiana hasła</h2>
          <ChangePasswordForm />
        </div>
        
        {/* Placeholder dla innych ustawień */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Inne ustawienia</h3>
          <p className="text-gray-600">
            Tutaj będą dodane dodatkowe opcje konfiguracyjne w przyszłości.
          </p>
        </div>
      </div>
    </div>
  );
} 