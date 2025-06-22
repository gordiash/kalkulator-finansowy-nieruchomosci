import { useState } from "react";

export interface ScheduleItem {
  month: number;
  principalPart: number;
  interestPart: number;
  totalPayment: number;
  remainingBalance: number;
}

interface ScheduleTableProps {
  data: ScheduleItem[];
}

const ITEMS_PER_PAGE = 12;

const ScheduleTable = ({ data }: ScheduleTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4 text-center">Harmonogram Spłat</h3>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
            <tr>
              <th scope="col" className="py-3 px-6">Nr Raty</th>
              <th scope="col" className="py-3 px-6">Rata Kapitałowa</th>
              <th scope="col" className="py-3 px-6">Rata Odsetkowa</th>
              <th scope="col" className="py-3 px-6">Całkowita Rata</th>
              <th scope="col" className="py-3 px-6">Pozostałe Saldo</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr key={item.month} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                  {item.month}
                </th>
                <td className="py-4 px-6">{item.principalPart.toFixed(2)} zł</td>
                <td className="py-4 px-6">{item.interestPart.toFixed(2)} zł</td>
                <td className="py-4 px-6 font-bold">{item.totalPayment.toFixed(2)} zł</td>
                <td className="py-4 px-6">{item.remainingBalance.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToFirstPage} 
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pierwsza
          </button>
          <button 
            onClick={goToPreviousPage} 
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Poprzednia
          </button>
        </div>
        <span className="text-sm text-gray-700">
          Strona {currentPage} z {totalPages}
        </span>
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Następna
          </button>
          <button 
            onClick={goToLastPage} 
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ostatnia
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable; 