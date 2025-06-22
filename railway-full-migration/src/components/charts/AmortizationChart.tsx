'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/useMediaQuery';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ScheduleItem {
  month: number;
  remainingPrincipal: number;
}

export function AmortizationChart({ schedule }: { schedule: ScheduleItem[] }) {
    const isMobile = useIsMobile();
    
    if (!schedule || schedule.length === 0) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Amortyzacja</CardTitle>
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
                label: 'Pozostałe saldo',
                data: schedule.map(item => item.remainingPrincipal),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                yAxisID: 'y',
            },
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
                        size: isMobile ? 11 : 14
                    }
                }
            },
            title: {
                display: true,
                text: 'Wykres Amortyzacji Kredytu',
                font: {
                    size: isMobile ? 12 : 16
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: isMobile ? 9 : 12
                    },
                    maxTicksLimit: isMobile ? 6 : 12
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: isMobile ? 9 : 12
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
                <CardTitle className="text-lg sm:text-xl">Amortyzacja</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
                <div style={{ height: isMobile ? '200px' : '300px' }}>
                    <Line options={options} data={data} />
                </div>
            </CardContent>
        </Card>
    );
} 