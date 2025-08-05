import { Metadata } from 'next';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import NotificationSettings from '@/components/NotificationSettings';

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
        
        {/* Sekcja powiadomień i subskrypcji */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Powiadomienia i subskrypcje</h2>
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
} 