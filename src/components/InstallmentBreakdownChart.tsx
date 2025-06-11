import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ScheduleItem } from './ScheduleTable';

interface InstallmentBreakdownChartProps {
  scheduleData: ScheduleItem[];
}

const InstallmentBreakdownChart: React.FC<InstallmentBreakdownChartProps> = ({ scheduleData }) => {
  if (!scheduleData || scheduleData.length === 0) return null;

  const chartData = scheduleData.map(item => ({
    miesiac: item.month,
    'Część kapitałowa': item.principalPart,
    'Część odsetkowa': item.interestPart,
  }));

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Struktura Raty w Czasie</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 50, bottom: 20, }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="miesiac" label={{ value: 'Miesiąc', position: 'insideBottom', offset: 0 }} interval={23}/>
          <YAxis 
            tickFormatter={(value) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 }).format(value)}
            label={{ value: 'Kwota raty', angle: -90, position: 'insideLeft', offset: -35 }}
            />
          <Tooltip formatter={(value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)} />
          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }}/>
          <Area type="monotone" dataKey="Część odsetkowa" stackId="1" stroke="#ffc658" fill="#ffc658" />
          <Area type="monotone" dataKey="Część kapitałowa" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InstallmentBreakdownChart; 