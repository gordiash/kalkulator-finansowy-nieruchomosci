import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ScheduleItem } from './ScheduleTable';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface InstallmentBreakdownChartProps {
  scheduleData: ScheduleItem[];
}

const InstallmentBreakdownChart: React.FC<InstallmentBreakdownChartProps> = ({ scheduleData }) => {
  const isMobile = useIsMobile();
  
  if (!scheduleData || scheduleData.length === 0) return null;

  const chartData = scheduleData.map(item => ({
    miesiac: item.month,
    'Część kapitałowa': item.principalPart,
    'Część odsetkowa': item.interestPart,
  }));

  return (
    <div className="mt-8">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center px-2">Struktura Raty w Czasie</h3>
      <div className="w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 400} minWidth={320}>
          <AreaChart
            data={chartData}
            margin={{ 
              top: 10, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 20 : 50, 
              bottom: isMobile ? 40 : 20 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="miesiac" 
              label={!isMobile ? { value: 'Miesiąc', position: 'insideBottom', offset: 0 } : undefined}
              interval={isMobile ? Math.floor(chartData.length / 4) : 23}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              tickFormatter={(value) => {
                if (isMobile) {
                  return new Intl.NumberFormat('pl-PL', { 
                    style: 'currency', 
                    currency: 'PLN', 
                    minimumFractionDigits: 0,
                    notation: 'compact'
                  }).format(value);
                }
                return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 }).format(value);
              }}
              label={!isMobile ? { value: 'Kwota raty', angle: -90, position: 'insideLeft', offset: -35 } : undefined}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 60 : 120}
            />
            <Tooltip 
              formatter={(value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)}
              contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
            />
            <Legend 
              verticalAlign="top" 
              wrapperStyle={{ 
                paddingBottom: '10px',
                fontSize: isMobile ? '12px' : '14px'
              }}
            />
            <Area type="monotone" dataKey="Część odsetkowa" stackId="1" stroke="#ffc658" fill="#ffc658" />
            <Area type="monotone" dataKey="Część kapitałowa" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InstallmentBreakdownChart; 