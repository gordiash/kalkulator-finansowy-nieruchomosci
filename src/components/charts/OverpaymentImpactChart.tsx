'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface OverpaymentResults {
  savedInterest: number;
  newLoanTerm: number;
}

export function OverpaymentImpactChart({ overpaymentResults }: { overpaymentResults: OverpaymentResults }) {
    if (!overpaymentResults) return null;

    const data = {
        labels: ['Zaoszczędzone odsetki', 'Nowy okres (msc)'],
        datasets: [
            {
                label: 'Wpływ nadpłaty',
                data: [overpaymentResults.savedInterest, overpaymentResults.newLoanTerm],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                ],
                borderColor: [
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Wpływ Nadpłaty',
            },
        },
    };

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Wpływ Nadpłaty</CardTitle>
            </CardHeader>
            <CardContent>
                <Bar options={options} data={data} />
            </CardContent>
        </Card>
    );
} 