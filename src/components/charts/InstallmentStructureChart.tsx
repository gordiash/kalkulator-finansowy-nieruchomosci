'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ScheduleItem {
  month: number;
  principalPart: number;
  interestPart: number;
}

export function InstallmentStructureChart({ schedule }: { schedule: ScheduleItem[] }) {
    if (!schedule || schedule.length === 0) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Struktura Raty</CardTitle>
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
                data: schedule.map(item => item.principalPart),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                stack: 'combined',
                type: 'bar' as const,
            },
            {
                label: 'Część odsetkowa',
                data: schedule.map(item => item.interestPart),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                stack: 'combined',
                type: 'bar' as const,
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
                text: 'Struktura Raty',
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
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
                <CardTitle>Struktura Raty</CardTitle>
            </CardHeader>
            <CardContent>
                <Bar options={options} data={data} />
            </CardContent>
        </Card>
    );
} 