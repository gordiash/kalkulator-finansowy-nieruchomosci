import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AmortizationChartProps {
  baseSchedule: { month: number; remainingBalance: number; }[];
  overpaymentSchedule?: { month: number; remainingBalance: number; }[];
}

const AmortizationChart: React.FC<AmortizationChartProps> = ({ baseSchedule, overpaymentSchedule }) => {
  if (!baseSchedule || baseSchedule.length === 0) return null;

  const chartData = baseSchedule.map(item => {
    const dataPoint: any = {
      miesiac: item.month,
      'Saldo bazowe': item.remainingBalance,
    };
    if (overpaymentSchedule) {
      const overpaymentPoint = overpaymentSchedule.find(op => op.month === item.month);
      if (overpaymentPoint) {
        dataPoint['Saldo z nadpłatą'] = overpaymentPoint.remainingBalance;
      }
    }
    return dataPoint;
  });

  // Add remaining points from overpayment schedule if it's shorter
  if (overpaymentSchedule && overpaymentSchedule.length < baseSchedule.length) {
      // This part is tricky because the x-axis (months) would be inconsistent.
      // For now, we only plot up to the length of the base schedule.
  }


  return (
    <div className="mt-8 py-10">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Wykres Amortyzacji Kredytu</h3>
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 50, bottom: 20, }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="miesiac" label={{ value: 'Miesiąc', position: 'insideBottom', offset: 0 }} interval={23}/>
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 }).format(value)}
                  label={{ value: 'Pozostałe zadłużenie', angle: -90, position: 'insideLeft', offset: -35 }}
                />
                <Tooltip formatter={(value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }}/>
                <Line type="monotone" dataKey="Saldo bazowe" stroke="#8884d8" activeDot={{ r: 8 }} dot={false}/>
                {overpaymentSchedule && (
                    <Line type="monotone" dataKey="Saldo z nadpłatą" stroke="#82ca9d" dot={false}/>
                )}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default AmortizationChart; 