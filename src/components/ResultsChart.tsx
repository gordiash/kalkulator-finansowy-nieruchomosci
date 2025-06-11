"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    const data: ChartDataItem[] = [
        { name: 'Kwota Kredytu', value: loanAmount },
        { name: 'Całkowite Odsetki', value: totalInterest },
        { name: 'Koszty Początkowe', value: initialCosts },
    ];

    return (
        <div className="mt-8" style={{ width: '100%', height: 300 }}>
            <h3 className="text-2xl font-bold mb-4 text-center">Struktura Kosztów</h3>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} zł`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ResultsChart; 