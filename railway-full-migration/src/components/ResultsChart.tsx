"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface ChartDataItem {
    name: string;
    value: number;
}

interface ResultsChartProps {
    loanAmount: number;
    totalInterest: number;
    initialCosts: number;
}

const COLORS = ['#0088FE', '#FF8042', '#FFBB28'];

const ResultsChart = ({ loanAmount, totalInterest, initialCosts }: ResultsChartProps) => {
    const isMobile = useIsMobile();
    
    const data: ChartDataItem[] = [
        { name: 'Kwota Kredytu', value: loanAmount },
        { name: 'Całkowite Odsetki', value: totalInterest },
        { name: 'Koszty Początkowe', value: initialCosts },
    ];
    
    return (
        <div className="mt-8 w-full">
            <h3 className="text-lg sm:text-2xl font-bold mb-4 text-center px-2">Struktura Kosztów</h3>
            <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300} minWidth={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={isMobile ? 60 : 80}
                            fill="#8884d8"
                            dataKey="value"
                            label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => `${value.toFixed(2)} zł`}
                            contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                        />
                        <Legend 
                            wrapperStyle={{ 
                                fontSize: isMobile ? '11px' : '14px',
                                paddingTop: '10px'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ResultsChart; 