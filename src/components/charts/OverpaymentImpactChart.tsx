'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/useMediaQuery';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface OverpaymentResults {
  savedInterest: number;
  monthsShortened: number;
}

export function OverpaymentImpactChart({ overpaymentResults }: { overpaymentResults: OverpaymentResults }) {
    const isMobile = useIsMobile();
    
    if (!overpaymentResults) return null;

    const data = {
        labels: ['Zaoszczędzone odsetki', 'Skrócenie (msc)'],
        datasets: [
            {
                label: 'Zaoszczędzone odsetki (PLN)',
                data: [overpaymentResults.savedInterest, 0],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1,
                yAxisID: 'y',
            },
            {
                label: 'Skrócenie okresu (miesiące)',
                data: [0, overpaymentResults.monthsShortened],
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgb(153, 102, 255)',
                borderWidth: 1,
                yAxisID: 'y1',
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Wpływ Nadpłaty',
                font: {
                    size: isMobile ? 12 : 16
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: isMobile ? 8 : 12
                    }
                }
            },
            y: {
                position: 'left',
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
                                maximumFractionDigits: 0,
                                notation: 'compact'
                            }).format(numValue);
                        }
                        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(numValue);
                    }
                }
            },
            y1: {
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: {
                    font: {
                        size: isMobile ? 8 : 12
                    },
                    callback: function(value: unknown) {
                        return `${value} msc`;
                    }
                }
            }
        }
    };

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Wpływ Nadpłaty</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
                <div style={{ height: isMobile ? '200px' : '300px' }}>
                    <Bar options={options} data={data} />
                </div>
            </CardContent>
        </Card>
    );
} 