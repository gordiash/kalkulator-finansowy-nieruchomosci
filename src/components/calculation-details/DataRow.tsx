interface DataRowProps {
  label: string;
  value: any;
}

export function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 px-4 odd:bg-gray-50/50 rounded-md">
      <span className="text-sm text-gray-500 mb-1 sm:mb-0 sm:mr-4">{label}</span>
      <span className="font-semibold text-gray-800 text-right break-words">{value}</span>
    </div>
  );
} 