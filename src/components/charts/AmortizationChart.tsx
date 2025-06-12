'use client';

import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScheduleItem {
  month: number;
  remainingBalance: number;
}

export function AmortizationChart({ schedule }: { schedule: ScheduleItem[] }) {
    const data = {
        labels: schedule.map(item => item.month),
        datasets: [
            {
                label: 'Pozostałe saldo',
                data: schedule.map(item => item.remainingBalance),
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