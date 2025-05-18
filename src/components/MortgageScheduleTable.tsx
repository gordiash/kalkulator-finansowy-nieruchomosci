import React, { useState } from 'react';
import { MortgagePayment } from '../types';

interface MortgageScheduleTableProps {
  schedule: MortgagePayment[];
}

const MortgageScheduleTable: React.FC<MortgageScheduleTableProps> = ({ schedule }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12; // 1 rok
  const totalPages = Math.ceil(schedule.length / rowsPerPage);

  // Pobieranie rat do wyświetlenia na bieżącej stronie
  const currentPayments = schedule.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  // Formatowanie liczb
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' zł';
  };

  // Formatowanie dat
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  };

  // Funkcje do zmiany strony
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (schedule.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mt-6" role="region" aria-label="Harmonogram spłaty kredytu">
        <p aria-live="polite">Brak danych do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-6" role="region" aria-label="Harmonogram spłaty kredytu" data-testid="mortgage-schedule-table">
      <h3 className="text-xl font-semibold text-indigo-700 mb-4" id="mortgage-schedule-title">
        Harmonogram spłaty kredytu hipotecznego
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" role="table" aria-labelledby="mortgage-schedule-title">
          <caption className="sr-only">Harmonogram spłaty kredytu hipotecznego - raty miesięczne</caption>
          <thead>
            <tr className="bg-indigo-50">
              <th className="border border-gray-300 px-3 py-2 text-left" scope="col">Nr</th>
              <th className="border border-gray-300 px-3 py-2 text-left" scope="col">Data</th>
              <th className="border border-gray-300 px-3 py-2 text-right" scope="col">Rata</th>
              <th className="border border-gray-300 px-3 py-2 text-right" scope="col">Kapitał</th>
              <th className="border border-gray-300 px-3 py-2 text-right" scope="col">Odsetki</th>
              <th className="border border-gray-300 px-3 py-2 text-right" scope="col">Pozostały kapitał</th>
              <th className="border border-gray-300 px-3 py-2 text-right" scope="col">Suma wpłat</th>
            </tr>
          </thead>
          <tbody>
            {currentPayments.map((payment) => (
              <tr 
                key={payment.paymentNumber} 
                className={payment.paymentNumber % 2 === 0 ? 'bg-gray-50' : ''}
                data-testid={`mortgage-schedule-row-${payment.paymentNumber}`}
              >
                <td className="border border-gray-300 px-3 py-2">{payment.paymentNumber}</td>
                <td className="border border-gray-300 px-3 py-2">{formatDate(payment.date)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right" data-testid={`mortgage-schedule-row-${payment.paymentNumber}-total-payment`}>{formatCurrency(payment.totalPayment)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right" data-testid={`mortgage-schedule-row-${payment.paymentNumber}-principal`}>{formatCurrency(payment.principalPayment)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right" data-testid={`mortgage-schedule-row-${payment.paymentNumber}-interest`}>{formatCurrency(payment.interestPayment)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(payment.remainingPrincipal)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(payment.totalPaid)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-indigo-100 font-semibold">
              <td colSpan={2} className="border border-gray-300 px-3 py-2 text-left">
                Podsumowanie kredytu ({schedule.length} rat)
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {formatCurrency(schedule[0].totalPayment * schedule.length)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {formatCurrency(schedule[schedule.length - 1].totalPrincipalPaid)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {formatCurrency(schedule[schedule.length - 1].totalInterestPaid)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {formatCurrency(0)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {formatCurrency(schedule[schedule.length - 1].totalPaid)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2" role="navigation" aria-label="Paginacja harmonogramu">
          <div className="text-sm text-gray-600">
            Strona {currentPage} z {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-indigo-100 rounded disabled:opacity-50"
              aria-label="Pierwsza strona"
              tabIndex={0}
              data-testid="first-page-button"
              aria-disabled={currentPage === 1}
            >
              «
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-indigo-100 rounded disabled:opacity-50"
              aria-label="Poprzednia strona"
              tabIndex={0}
              data-testid="prev-page-button"
              aria-disabled={currentPage === 1}
            >
              ‹
            </button>
            
            {/* Wyświetlanie numerów stron */}
            <div className="flex space-x-1" role="group" aria-label="Numery stron">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.min(
                  Math.max(currentPage - 2, 1) + i,
                  totalPages
                );
                return pageNum <= totalPages ? (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-indigo-500 text-white'
                        : 'bg-indigo-100'
                    }`}
                    aria-label={`Strona ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                    tabIndex={0}
                  >
                    {pageNum}
                  </button>
                ) : null;
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-indigo-100 rounded disabled:opacity-50"
              aria-label="Następna strona"
              tabIndex={0}
              data-testid="next-page-button"
              aria-disabled={currentPage === totalPages}
            >
              ›
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-indigo-100 rounded disabled:opacity-50"
              aria-label="Ostatnia strona"
              tabIndex={0}
              data-testid="last-page-button"
              aria-disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-gray-700">
        <h4 className="font-medium text-indigo-700 mb-2">Informacje o harmonogramie:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Rata kredytu jest stała przez cały okres kredytowania przy założeniu stałej stopy procentowej.</li>
          <li>W początkowym okresie większość raty stanowią odsetki, z czasem proporcja zmienia się na korzyść kapitału.</li>
          <li>Harmonogram ma charakter poglądowy i może różnić się od oferty banku.</li>
          <li>Nie uwzględniono dodatkowych kosztów jak ubezpieczenie kredytu czy prowizje.</li>
        </ul>
      </div>
    </div>
  );
};

export default MortgageScheduleTable; 