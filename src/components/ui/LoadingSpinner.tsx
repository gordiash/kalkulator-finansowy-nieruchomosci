interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Ładowanie..." }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-6 text-gray-600 text-lg">{message}</p>
    </div>
  );
} 