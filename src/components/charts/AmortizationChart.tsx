'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ScheduleItem {
  month: number;
  remainingPrincipal: number;
}

export function AmortizationChart({ schedule }: { schedule: ScheduleItem[] }) {
    if (!schedule || schedule.length === 0) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Amortyzacja</CardTitle>
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
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Wykres Amortyzacji Kredytu',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value: unknown) {
                        const numValue = typeof value === 'number' ? value : 0;
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
                <CardTitle>Amortyzacja</CardTitle>
            </CardHeader>
            <CardContent>
                <Line options={options} data={data} />
            </CardContent>
        </Card>
    );
} 