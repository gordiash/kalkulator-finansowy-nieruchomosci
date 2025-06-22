'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/useMediaQuery';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ScheduleItem {
  month: number;
  principalPart: number;
  interestPart: number;
  overpayment?: number;
}

export function InstallmentStructureChart({ schedule }: { schedule: ScheduleItem[] }) {
    const isMobile = useIsMobile();
    
    if (!schedule || schedule.length === 0) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Struktura Raty</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 text-gray-500">
                        Brak danych do wyświetlenia
                    </div>
                </CardContent>
            </Card>
        );
    }

    const data = {
        labels: schedule.map(item => item.month),
        datasets: [
            {
              label: 'Część kapitałowa',
              data: schedule.map((item) => item.principalPart - (item.overpayment || 0)),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 1,
            },
            {
              label: 'Nadpłata',
              data: schedule.map((item) => item.overpayment || 0),
              backgroundColor: 'rgba(255, 205, 86, 0.6)',
              borderColor: 'rgb(255, 205, 86)',
              borderWidth: 1,
            },
            {
              label: 'Część odsetkowa',
              data: schedule.map((item) => item.interestPart),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1,
            }
          ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: isMobile ? 10 : 14
                    }
                }
            },
            title: {
                display: true,
                text: 'Struktura Raty',
                font: {
                    size: isMobile ? 12 : 16
                }
            },
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    font: {
                        size: isMobile ? 8 : 12
                    },
                    maxTicksLimit: isMobile ? 6 : 12
                }
            },
            y: {
                stacked: true,
                ticks: {
                    font: {
                        size: isMobile ? 8 : 12
                    },
                    callback: function(value: unknown) {
                        const numValue = typeof value === 'number' ? value : 0;
                        if (isMobile) {
                            return new Intl.NumberFormat('pl-PL', { 
                                style: 'currency', 
                                currency: 'PLN',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                                notation: 'compact'
                            }).format(numValue);
                        }
                        return new Intl.NumberFormat('pl-PL', { 
                            style: 'currency', 
                            currency: 'PLN',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(numValue);
                    }
                }
            }
        }
    };

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Struktura Raty</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
                <div style={{ height: isMobile ? '200px' : '300px' }}>
                    <Bar options={options} data={data} />
                </div>
            </CardContent>
        </Card>
    );
} 