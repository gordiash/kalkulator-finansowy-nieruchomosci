'use client';

import LogoutButton from '@/components/LogoutButton';

export default function AdminHeader() {
  return (
    <div className="flex items-center mb-6">
      <h1 className="text-3xl font-bold">Panel administracyjny</h1>
      <LogoutButton />
    </div>
  );
} 