import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface AmortizationChartProps {
  baseSchedule: { month: number; remainingBalance: number; }[];
  overpaymentSchedule?: { month: number; remainingBalance: number; }[];
}

const AmortizationChart: React.FC<AmortizationChartProps> = ({ baseSchedule, overpaymentSchedule }) => {
  const isMobile = useIsMobile();
  
  if (!baseSchedule || baseSchedule.length === 0) return null;

  const chartData = baseSchedule.map(item => {
    const dataPoint: Record<string, number> = {
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
    <div className="mt-8 py-4 sm:py-10">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center px-2">Wykres Amortyzacji Kredytu</h3>
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={300} minWidth={320}>
              <LineChart
                  data={chartData}
                  margin={{ 
                    top: 5, 
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
                    label={!isMobile ? { value: 'Pozostałe zadłużenie', angle: -90, position: 'insideLeft', offset: -35 } : undefined}
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
                  <Line type="monotone" dataKey="Saldo bazowe" stroke="#8884d8" activeDot={{ r: isMobile ? 4 : 8 }} dot={false}/>
                  {overpaymentSchedule && (
                      <Line type="monotone" dataKey="Saldo z nadpłatą" stroke="#82ca9d" dot={false}/>
                  )}
              </LineChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
};

export default AmortizationChart; 