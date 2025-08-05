import Link from 'next/link';

interface ErrorDisplayProps {
  error: string;
  backLink?: string;
}

export function ErrorDisplay({ error, backLink }: ErrorDisplayProps) {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6" role="alert">
      <p className="font-bold text-lg">Błąd</p>
      <p>{error}</p>
      {backLink && (
        <Link href={backLink} className="text-blue-600 hover:underline mt-4 inline-block">
          &larr; Wróć do listy kalkulacji
        </Link>
      )}
    </div>
  );
} 