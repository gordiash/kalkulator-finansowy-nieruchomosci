import { Metadata } from 'next';
import ProfileForm from '@/components/ProfileForm';

export const metadata: Metadata = {
  title: 'Profil - Panel użytkownika',
  description: 'Zarządzaj swoimi danymi osobowymi',
};

export default function ProfilPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil użytkownika</h1>
        <p className="text-gray-600 mt-2">Zarządzaj swoimi danymi osobowymi</p>
      </div>
      
      <ProfileForm />
    </div>
  );
} 