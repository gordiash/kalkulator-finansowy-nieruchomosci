'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ScheduleItem {
  month: number;
  principalPart: number;
  interestPart: number;
  overpayment?: number;
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