'use client';

import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InstallmentStructureChart({ schedule }: { schedule: any[] }) {
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
                stacked: true
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