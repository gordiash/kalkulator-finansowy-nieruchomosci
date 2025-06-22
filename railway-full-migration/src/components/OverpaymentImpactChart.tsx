import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/useMediaQuery';

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
    const isMobile = useIsMobile();

    const interestData = [
        { name: 'Całkowite odsetki', 'Scenariusz bazowy': baseTotalInterest, 'Z nadpłatą': overpaymentTotalInterest },
    ];

    const termData = [
        { name: 'Okres kredytowania (miesiące)', 'Scenariusz bazowy': baseLoanTerm, 'Z nadpłatą': newLoanTerm },
    ];

    const formatCurrency = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);

    return (
        <div className="mt-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center px-2">Wpływ Nadpłaty na Kredyt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                <div>
                    <p className="text-center font-semibold text-gray-600 mb-2 text-sm sm:text-base px-2">Porównanie całkowitych odsetek</p>
                    <div className="w-full overflow-x-auto">
                        <ResponsiveContainer width="100%" height={isMobile ? 200 : 300} minWidth={280}>
                            <BarChart 
                                data={interestData} 
                                margin={{ 
                                    top: 20, 
                                    right: isMobile ? 10 : 30, 
                                    left: isMobile ? 20 : 40, 
                                    bottom: 5 
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={false}/>
                                <YAxis 
                                    tickFormatter={(value) => {
                                        if (isMobile) {
                                            return new Intl.NumberFormat('pl-PL', { 
                                                style: 'currency', 
                                                currency: 'PLN',
                                                notation: 'compact',
                                                minimumFractionDigits: 0
                                            }).format(value);
                                        }
                                        return formatCurrency(value);
                                    }}
                                    width={isMobile ? 60 : 120}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                <Tooltip 
                                    formatter={formatCurrency}
                                    contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                />
                                <Legend 
                                    wrapperStyle={{ fontSize: isMobile ? '11px' : '14px' }}
                                />
                                <Bar dataKey="Scenariusz bazowy" fill="#8884d8" />
                                <Bar dataKey="Z nadpłatą" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {overpaymentTarget === 'shorten-period' && (
                    <div>
                        <p className="text-center font-semibold text-gray-600 mb-2 text-sm sm:text-base px-2">Porównanie okresu kredytowania</p>
                        <div className="w-full overflow-x-auto">
                            <ResponsiveContainer width="100%" height={isMobile ? 200 : 300} minWidth={280}>
                                <BarChart 
                                    data={termData} 
                                    margin={{ 
                                        top: 20, 
                                        right: isMobile ? 10 : 30, 
                                        left: isMobile ? 15 : 20, 
                                        bottom: 5 
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={false}/>
                                    <YAxis 
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                        width={isMobile ? 40 : 60}
                                    />
                                    <Tooltip 
                                        contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                    />
                                    <Legend 
                                        wrapperStyle={{ fontSize: isMobile ? '11px' : '14px' }}
                                    />
                                    <Bar dataKey="Scenariusz bazowy" fill="#8884d8" />
                                    <Bar dataKey="Z nadpłatą" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverpaymentImpactChart; 