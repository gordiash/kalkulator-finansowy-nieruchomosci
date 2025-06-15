import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl text-gray-600 mb-4">Strona nie została znaleziona</h2>
        <p className="text-gray-500 mb-8">
          Przepraszamy, ale strona której szukasz nie istnieje.
        </p>
        <Link 
          href="/" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Wróć do strony głównej
        </Link>
      </div>
    </div>
  );
} 