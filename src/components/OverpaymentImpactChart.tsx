import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OverpaymentImpactChartProps {
    baseTotalInterest: number;
    overpaymentTotalInterest: number;
    baseLoanTerm: number;
    newLoanTerm: number;
    overpaymentTarget: 'shorten-period' | 'lower-installment';
}

const OverpaymentImpactChart: React.FC<OverpaymentImpactChartProps> = ({
    baseTotalInterest,
    overpaymentTotalInterest,
    baseLoanTerm,
    newLoanTerm,
    overpaymentTarget
}) => {

    const interestData = [
        { name: 'Całkowite odsetki', 'Scenariusz bazowy': baseTotalInterest, 'Z nadpłatą': overpaymentTotalInterest },
    ];

    const termData = [
        { name: 'Okres kredytowania (miesiące)', 'Scenariusz bazowy': baseLoanTerm, 'Z nadpłatą': newLoanTerm },
    ];

    const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Wpływ Nadpłaty na Kredyt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <p className="text-center font-semibold text-gray-600 mb-2">Porównanie całkowitych odsetek</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={interestData} margin={{ top: 20, right: 30, left: 40, bottom: 5, }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={false}/>
                            <YAxis tickFormatter={formatCurrency} width={120}/>
                            <Tooltip formatter={formatCurrency} />
                            <Legend />
                            <Bar dataKey="Scenariusz bazowy" fill="#8884d8" />
                            <Bar dataKey="Z nadpłatą" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {overpaymentTarget === 'shorten-period' && (
                    <div>
                        <p className="text-center font-semibold text-gray-600 mb-2">Porównanie okresu kredytowania</p>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={termData} margin={{ top: 20, right: 30, left: 20, bottom: 5, }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={false}/>
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Scenariusz bazowy" fill="#8884d8" />
                                <Bar dataKey="Z nadpłatą" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverpaymentImpactChart; 