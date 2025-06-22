'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackCalculatorUse, trackCalculatorResult, trackError, trackPageView } from "@/lib/analytics";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { validateField, sanitizeInput, FIELD_DEFINITIONS } from "@/lib/validation";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

// Komponent pomocniczy dla inputs z walidacją
const InputWithValidation = ({ 
  id, 
  name,
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "number",
  step,
  error,
  disabled = false,
  className = ""
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}) => (
  <div>
    <Label htmlFor={id} className={error ? "text-red-600" : ""}>{label}</Label>
    <Input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      disabled={disabled}
      className={`${error ? "border-red-500 focus:border-red-500" : ""} ${className}`}
    />
    {error && (
      <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
        <AlertTriangle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )}
  </div>
);
import { Line, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationService } from '@/lib/CalculationService';
import { formatCurrency, normalizeText } from '@/lib/utils';
import { AmortizationChart } from '@/components/charts/AmortizationChart';
import { InstallmentStructureChart } from '@/components/charts/InstallmentStructureChart';
import { OverpaymentImpactChart } from '@/components/charts/OverpaymentImpactChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

// Definicja nowego komponentu wykresu bezpośrednio w pliku
const OverpaymentComparisonChart: React.FC<{
    scheduleWithoutOverpayment: ScheduleItem[];
    scheduleWithOverpayment: ScheduleItem[];
}> = ({ scheduleWithoutOverpayment, scheduleWithOverpayment }) => {
    
    const maxLength = Math.max(scheduleWithoutOverpayment.length, scheduleWithOverpayment.length);
    const labels = Array.from({ length: maxLength }, (_, i) => i + 1);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Saldo bez nadpłat',
                data: scheduleWithoutOverpayment.map(item => item.remainingPrincipal),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1,
                pointRadius: 0,
                fill: false,
            },
            {
                label: 'Saldo z nadpłatami',
                data: scheduleWithOverpayment.map(item => item.remainingPrincipal),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                pointRadius: 0,
                fill: false,
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
                text: 'Porównanie salda zadłużenia w czasie',
            },
            tooltip: {
                callbacks: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Miesiąc'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Pozostałe saldo (zł)'
                },
                ticks: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    callback: function(value: any) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    return <Line options={options} data={data} />;
};

// Komponent wykresu nadpłat
const OverpaymentTimelineChart: React.FC<{
    schedule: ScheduleItem[];
}> = ({ schedule }) => {
    
    const overpaymentMonths = schedule
        .map((item) => ({ month: item.month, overpayment: item.overpayment }))
        .filter(item => item.overpayment > 0);

    if (overpaymentMonths.length === 0) {
        return <div className="text-center text-gray-500 py-8">Brak nadpłat w harmonogramie</div>;
    }

    const data = {
        labels: overpaymentMonths.map(item => `Miesiąc ${item.month}`),
        datasets: [
            {
                label: 'Kwota nadpłaty',
                data: overpaymentMonths.map(item => item.overpayment),
                backgroundColor: 'rgba(255, 206, 86, 0.8)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 2,
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
                text: 'Harmonogram nadpłat',
            },
            tooltip: {
                callbacks: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label: function(context: any) {
                        return `Nadpłata: ${formatCurrency(context.parsed.y)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Okresy nadpłat'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Kwota nadpłaty (zł)'
                },
                ticks: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    callback: function(value: any) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    return (
        <div>
            <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-yellow-100 p-3 rounded-lg text-center">
                        <div className="font-semibold text-yellow-800">Łączna kwota nadpłat</div>
                        <div className="text-lg font-bold text-yellow-600">
                            {formatCurrency(overpaymentMonths.reduce((sum, item) => sum + item.overpayment, 0))}
                        </div>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg text-center">
                        <div className="font-semibold text-blue-800">Liczba nadpłat</div>
                        <div className="text-lg font-bold text-blue-600">{overpaymentMonths.length}</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                        <div className="font-semibold text-green-800">Pierwsza nadpłata</div>
                        <div className="text-lg font-bold text-green-600">Miesiąc {overpaymentMonths[0].month}</div>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg text-center">
                        <div className="font-semibold text-purple-800">Ostatnia nadpłata</div>
                        <div className="text-lg font-bold text-purple-600">
                            Miesiąc {overpaymentMonths[overpaymentMonths.length - 1].month}
                        </div>
                    </div>
                </div>
            </div>
            <Bar options={options} data={data} />
        </div>
    );
};

type ScheduleItem = {
  month: number;
  principalPart: number;
  interestPart: number;
  totalPayment: number;
  overpayment: number;
  remainingPrincipal: number;
};

type FormData = {
  propertyValue: string;
  loanAmount: string;
  loanTerm: string;
  bankMargin: string;
  referenceRate: string;
  installmentType: 'equal' | 'decreasing';
  bankCommission: string;
  agencyCommission: string;
  pccTaxRate: string;
  notaryFeeType: 'max' | 'custom';
  customNotaryFee: string;
  referenceRateChange: string;
  bridgeInsuranceMonths: string;
  bridgeInsuranceMarginIncrease: string;
  overpaymentAmount: string;
  overpaymentFrequency: 'one-time' | 'monthly' | 'yearly';
  overpaymentStartMonth: string;
  overpaymentTarget: 'lower-installment' | 'shorten-period';
  overpaymentInterval: string;
};

type CalculationResults = {
  pccTax: number | null;
  notaryFee: number | null;
  bankCommissionAmount: number | null;
  courtFees: number | null;
  agencyCommissionAmount: number | null;
  schedule: ScheduleItem[] | null;
  firstInstallment: number | null;
  lastInstallment: number | null;
  totalRepayment: number | null;
  totalInterest: number | null;
  overpaymentResults: { savedInterest: number; newLoanTerm: number; monthsShortened: number; } | null;
  simulationResults?: SimulationResults;
  baseSchedule?: ScheduleItem[] | null;
};

type SimulationResults = {
  newFirstInstallment: number;
  newLastInstallment: number;
};

function RealEstateCalculatorPageContent() {
  const searchParams = useSearchParams();
  
  // Pre-wypełnianie ceny z parametru URL
  const initialPrice = searchParams.get('cena') || '';
  
  const [formData, setFormData] = useState<FormData>({
    propertyValue: initialPrice || '500000',
    loanAmount: '400000',
    loanTerm: '30',
    bankMargin: '2.1',
    referenceRate: '5.85',
    installmentType: 'equal',
    bankCommission: '2',
    agencyCommission: '3',
    pccTaxRate: '2',
    notaryFeeType: 'max',
    customNotaryFee: '',
    referenceRateChange: '1.5',
    bridgeInsuranceMonths: '6',
    bridgeInsuranceMarginIncrease: '1.0',
    overpaymentAmount: '0',
    overpaymentFrequency: 'one-time',
    overpaymentStartMonth: '1',
    overpaymentTarget: 'shorten-period',
    overpaymentInterval: '1',
  });
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [useSimulationRate, setUseSimulationRate] = useState(false);
  const [isFirstPropertyPurchase, setIsFirstPropertyPurchase] = useState(false);
  const [showOverpayment, setShowOverpayment] = useState(false);
  const [downPaymentType, setDownPaymentType] = useState<'percentage' | 'amount'>('amount');
  const [downPaymentInput, setDownPaymentInput] = useState('100000');

  // System walidacji
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Śledzenie wejścia na stronę
    trackPageView('kalkulator_zakupu_nieruchomosci');
  }, []);

  // Funkcja walidacji wszystkich pól
  const validateAllFields = () => {
    const errors: Record<string, string> = {};
    const fieldDefinitions = FIELD_DEFINITIONS.PURCHASE;

    const formDataToValidate = {
      propertyValue: formData.propertyValue,
      loanAmount: formData.loanAmount,
      loanTerm: formData.loanTerm,
      bankMargin: formData.bankMargin,
      referenceRate: formData.referenceRate,
      bankCommission: formData.bankCommission,
      agencyCommission: formData.agencyCommission,
      pccTaxRate: formData.pccTaxRate
    };

    // Walidacja każdego pola
    Object.entries(formDataToValidate).forEach(([fieldName, value]) => {
      const rules = fieldDefinitions[fieldName as keyof typeof fieldDefinitions];
      if (rules) {
        const result = validateField(value, fieldName, rules);
        if (!result.isValid) {
          errors[fieldName] = result.errors[0].message;
        }
      }
    });

    // Dodatkowa walidacja biznesowa
    if (parseFloat(formData.loanAmount) > parseFloat(formData.propertyValue)) {
      errors.loanAmount = 'Kwota kredytu nie może być wyższa niż wartość nieruchomości';
    }

    // Sprawdź czy wkład własny nie jest zbyt mały
    const downPaymentPercent = ((parseFloat(formData.propertyValue) - parseFloat(formData.loanAmount)) / parseFloat(formData.propertyValue)) * 100;
    if (downPaymentPercent < 10) {
      errors.loanAmount = 'Zalecany wkład własny to minimum 10% wartości nieruchomości';
    }

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  // Walidacja z debouncing dla lepszej wydajności
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateAllFields();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.propertyValue, formData.loanAmount, formData.loanTerm, 
      formData.bankMargin, formData.referenceRate, formData.bankCommission, 
      formData.agencyCommission, formData.pccTaxRate]);

  // Funkcje pomocnicze do obsługi input-ów z sanityzacją
  const handleNumericInput = (name: string, allowDecimals = true) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeInput(e.target.value, allowDecimals);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    };
  };

  useEffect(() => {
    const propertyValueNum = parseFloat(formData.propertyValue) || 0;
    const downPaymentInputNum = parseFloat(downPaymentInput) || 0;
    let newLoanAmount = 0;

    if (propertyValueNum > 0) {
        if (downPaymentType === 'amount') {
            newLoanAmount = propertyValueNum - downPaymentInputNum;
        } else { // percentage
            const downPaymentAmount = propertyValueNum * (downPaymentInputNum / 100);
            newLoanAmount = propertyValueNum - downPaymentAmount;
        }
    }

    setFormData(prev => ({
        ...prev,
        loanAmount: String(Math.max(0, Math.round(newLoanAmount)))
    }));
  }, [formData.propertyValue, downPaymentInput, downPaymentType]);

  const service = new CalculationService();

  const formatLoanTerm = (months: number | null) => {
    if (months === null || months === undefined) return 'N/A';
    if (months <= 0) return '0';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    let termString = '';
    if (years > 0) {
        termString += `${years} ${years === 1 ? 'rok' : (years > 1 && years < 5) ? 'lata' : 'lat'}`;
    }
    if (remainingMonths > 0) {
        termString += `${years > 0 ? ' i ' : ''}${remainingMonths} ${remainingMonths === 1 ? 'miesiąc' : (remainingMonths > 1 && remainingMonths < 5) ? 'miesiące' : 'miesięcy'}`;
    }
    return termString || 'Poniżej miesiąca';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleDownPaymentTypeChange = (newType: 'percentage' | 'amount') => {
    if (downPaymentType === newType) return;

    const propertyValueNum = parseFloat(formData.propertyValue) || 0;
    const downPaymentInputNum = parseFloat(downPaymentInput) || 0;

    if (propertyValueNum > 0 && downPaymentInputNum > 0) {
        if (newType === 'percentage' && downPaymentType === 'amount') {
            const percentage = (downPaymentInputNum / propertyValueNum) * 100;
            setDownPaymentInput(percentage.toFixed(2));
        } else if (newType === 'amount' && downPaymentType === 'percentage') {
            const amount = propertyValueNum * (downPaymentInputNum / 100);
            setDownPaymentInput(String(Math.round(amount)));
        }
    }
    setDownPaymentType(newType);
  };

  const handleFirstPropertySwitch = (checked: boolean) => {
    setIsFirstPropertyPurchase(checked);
    setFormData(prev => ({
        ...prev,
        pccTaxRate: checked ? '0' : '2'
    }));
  };

  const fetchData = async () => {
    // Sprawdź walidację przed rozpoczęciem obliczeń
    if (!validateAllFields()) {
      setErrors({ api: 'Proszę poprawić błędy w formularzu przed obliczeniem' });
      trackError('validation_error', 'Błędy walidacji w kalkulatorze zakupu nieruchomości');
      return;
    }
    setIsLoading(true);
    setResults(null);
    
    // Śledzenie użycia kalkulatora
    trackCalculatorUse('purchase');
    
    try {
      const dataToSend = {
        ...formData,
        useSimulationRate: useSimulationRate,
      };
      const data = await service.calculate(dataToSend);
      setResults(data);
      
      // Śledzenie wyniku kalkulatora
      trackCalculatorResult('purchase', {
        total_repayment: data.totalRepayment || 0,
        property_value: parseFloat(formData.propertyValue),
        loan_amount: parseFloat(formData.loanAmount),
        loan_term: parseFloat(formData.loanTerm),
        total_interest: data.totalInterest,
        first_installment: data.firstInstallment
      });
      
    } catch (error) {
      console.error("Błąd podczas pobierania danych z API:", error);
      const errorMessage = "Nie udało się połączyć z serwisem obliczeniowym.";
      
      // Śledzenie błędów
      trackError('purchase_calculation_error', errorMessage);
      
      setErrors({ api: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCalculateClick = () => {
    fetchData();
  };

  const clearForm = () => {
    setFormData({
        propertyValue: '500000',
        loanAmount: '400000',
        loanTerm: '30',
        bankMargin: '2.1',
        referenceRate: '5.85',
        installmentType: 'equal',
        bankCommission: '2',
        agencyCommission: '3',
        pccTaxRate: '2',
        notaryFeeType: 'max',
        customNotaryFee: '',
        referenceRateChange: '1.5',
        bridgeInsuranceMonths: '6',
        bridgeInsuranceMarginIncrease: '1.0',
        overpaymentAmount: '0',
        overpaymentFrequency: 'one-time',
        overpaymentStartMonth: '1',
        overpaymentTarget: 'shorten-period',
        overpaymentInterval: '1',
    });
    setResults(null);
    setErrors({});
    setShowSchedule(false);
    setCurrentPage(1);
    setIsFirstPropertyPurchase(false);
    setShowOverpayment(false);
    setDownPaymentType('amount');
    setDownPaymentInput('100000');
  };
  
  const generatePdfReport = async () => {
    if (!results || !results.schedule) {
      console.error("Brak wyników do wygenerowania raportu.");
      return;
    }

    const doc = new jsPDF();
    const chartElements = document.querySelectorAll('.chart-container-pdf');
    const html2canvas = (await import('html2canvas')).default;
    
    const ancillaryCosts = (results?.notaryFee ?? 0) + (results?.pccTax ?? 0) + (results?.bankCommissionAmount ?? 0) + (results?.courtFees ?? 0) + (results?.agencyCommissionAmount ?? 0);
    const totalCreditCost = (results?.totalInterest ?? 0) + (results?.bankCommissionAmount ?? 0);
    const totalInitialOutlay = (parseFloat(formData.propertyValue) - parseFloat(formData.loanAmount)) + ancillaryCosts;

    // === STRONA 1: PODSUMOWANIE WYKONAWCZE ===
    doc.setFontSize(24);
    doc.text(normalizeText("RAPORT KREDYTOWY"), 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(normalizeText(`Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')}`), 105, 35, { align: 'center' });

    // Sekcja parametrów kredytu
    doc.setFontSize(16);
    doc.text(normalizeText("Parametry kredytu"), 15, 50);
    
    const loanData = [
        ['Wartość nieruchomości', formatCurrency(parseFloat(formData.propertyValue))],
        ['Kwota kredytu', formatCurrency(parseFloat(formData.loanAmount))],
        ['Wkład własny', formatCurrency(parseFloat(formData.propertyValue) - parseFloat(formData.loanAmount))],
        ['Okres kredytowania', `${formData.loanTerm} lat`],
        ['Oprocentowanie', `${(parseFloat(formData.bankMargin) + parseFloat(formData.referenceRate)).toFixed(2)}% (marża: ${formData.bankMargin}% + wskaźnik: ${formData.referenceRate}%)`],
        ['Rodzaj rat', formData.installmentType === 'equal' ? 'Równe' : 'Malejące'],
    ];

    autoTable(doc, {
        startY: 55,
        head: [['Parametr', 'Wartość']],
        body: loanData.map(row => [normalizeText(row[0]), normalizeText(row[1])]),
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255], font: 'helvetica', fontStyle: 'bold' },
        bodyStyles: { font: 'helvetica' },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 100 } }
    });

    // Sekcja kosztów
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text(normalizeText("Koszty początkowe"), 15, yPos);
    yPos += 5;

    const costsData = [
        ['Wkład własny', formatCurrency(parseFloat(formData.propertyValue) - parseFloat(formData.loanAmount))],
        ...(results.pccTax && results.pccTax > 0 ? [['Podatek PCC', formatCurrency(results.pccTax)]] : [['Podatek PCC', 'Zwolnienie (pierwsza nieruchomość)']]),
        ['Taksa notarialna', formatCurrency(results.notaryFee)],
        ['Prowizja bankowa', formatCurrency(results.bankCommissionAmount)],
        ['Opłaty sądowe', formatCurrency(results.courtFees)],
        ['Prowizja agencji', formatCurrency(results.agencyCommissionAmount)],
        ['RAZEM koszty okołozakupowe', formatCurrency(ancillaryCosts)],
        ['CAŁKOWITA gotówka na start', formatCurrency(totalInitialOutlay)],
    ];

    autoTable(doc, {
        startY: yPos,
        body: costsData.map(row => [normalizeText(row[0]), normalizeText(row[1])]),
        theme: 'striped',
        bodyStyles: { font: 'helvetica' },
        columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 70, halign: 'right', fontStyle: 'bold' } }
    });

    // === STRONA 2: PODSUMOWANIE KREDYTU ===
    doc.addPage();
    doc.setFontSize(18);
    doc.text(normalizeText("Podsumowanie spłaty kredytu"), 105, 25, { align: 'center' });

    const summaryData = [
        ['Pierwsza rata', formatCurrency(results.firstInstallment)],
        ['Ostatnia rata', formatCurrency(results.lastInstallment)],
        ['Suma odsetek', formatCurrency(results.totalInterest)],
        ['Całkowity koszt kredytu (z prowizją)', formatCurrency(totalCreditCost)],
        ['Całkowita kwota do spłaty', formatCurrency(results.totalRepayment)],
    ];

    if (results.overpaymentResults && parseFloat(formData.overpaymentAmount) > 0) {
        summaryData.push(['', '']); // Pusty wiersz
        summaryData.push(['=== WYNIKI NADPŁATY ===', '']);
        summaryData.push(['Kwota nadpłaty', formatCurrency(parseFloat(formData.overpaymentAmount))]);
        summaryData.push(['Częstotliwość', formData.overpaymentFrequency === 'one-time' ? 'Jednorazowa' : formData.overpaymentFrequency === 'monthly' ? 'Miesięczna' : 'Roczna']);
        summaryData.push(['Zaoszczędzone odsetki', formatCurrency(results.overpaymentResults.savedInterest)]);
        summaryData.push(['Skrócenie o', formatLoanTerm(results.overpaymentResults.monthsShortened > 0 ? results.overpaymentResults.monthsShortened : 0)]);
    }

    autoTable(doc, {
        startY: 35,
        body: summaryData.map(row => [normalizeText(row[0]), normalizeText(row[1])]),
        theme: 'striped',
        bodyStyles: { font: 'helvetica', fontSize: 11 },
        columnStyles: { 
            0: { cellWidth: 120, fontStyle: 'bold' }, 
            1: { cellWidth: 70, halign: 'right', fontStyle: 'bold' } 
        }
    });

    // === STRONA 3+: WYKRESY ===
    const chartImages = await Promise.all(
        Array.from(chartElements).map(async (chart) => {
            const canvas = await html2canvas(chart as HTMLElement, { scale: 1.5 });
            return { img: canvas.toDataURL('image/png') };
        })
    );

    if (chartImages.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.text(normalizeText("Analiza graficzna"), 105, 20, { align: 'center' });
        
        let chartYPos = 30;
        const chartWidth = 170;
        const chartHeight = 120;

        for (let i = 0; i < chartImages.length; i++) {
            if (chartYPos + chartHeight > 270) {
                doc.addPage();
                chartYPos = 20;
            }
            doc.addImage(chartImages[i].img, 'PNG', 20, chartYPos, chartWidth, chartHeight);
            chartYPos += chartHeight + 15;
        }
    }

    // === OSTATNIA STRONA: SKRÓCONY HARMONOGRAM ===
    if (results.schedule && results.schedule.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.text(normalizeText("Harmonogram spłat (skrócony)"), 105, 20, { align: 'center' });

        const schedule = results.schedule;
        const firstMonths = schedule.slice(0, 12); // Pierwsze 12 miesięcy
        const lastMonths = schedule.length > 24 ? schedule.slice(-12) : []; // Ostatnie 12 miesięcy (jeśli kredyt > 24 miesiące)
        
        // Funkcja do tworzenia tabeli harmonogramu
        const createScheduleTable = (scheduleData: ScheduleItem[], title: string, startY: number) => {
            if (scheduleData.length === 0) return startY;
            
            doc.setFontSize(14);
            doc.text(normalizeText(title), 15, startY);
            
            const scheduleHead = [['Miesiąc', 'Rata', 'Kapitał', 'Odsetki', 'Nadpłata', 'Saldo']];
            const scheduleBody = scheduleData.map(item => [
                item.month.toString(),
                formatCurrency(item.totalPayment),
                formatCurrency(item.principalPart),
                formatCurrency(item.interestPart),
                formatCurrency(item.overpayment),
                formatCurrency(item.remainingPrincipal),
            ].map(cell => normalizeText(String(cell))));

            autoTable(doc, {
                startY: startY + 5,
                head: scheduleHead,
                body: scheduleBody,
                theme: 'striped',
                headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255], font: 'helvetica', fontSize: 9 },
                bodyStyles: { font: 'helvetica', fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 20, halign: 'center' },
                    1: { cellWidth: 30, halign: 'right' },
                    2: { cellWidth: 30, halign: 'right' },
                    3: { cellWidth: 30, halign: 'right' },
                    4: { cellWidth: 25, halign: 'right' },
                    5: { cellWidth: 35, halign: 'right' }
                }
            });
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (doc as any).lastAutoTable.finalY + 10;
        };

        let currentY = 30;
        currentY = createScheduleTable(firstMonths, "Pierwsze 12 miesięcy:", currentY);
        
        if (lastMonths.length > 0) {
            if (currentY > 200) {
                doc.addPage();
                currentY = 30;
            }
            
            if (schedule.length > 24) {
                doc.setFontSize(12);
                doc.text(normalizeText(`... pominięto ${schedule.length - 24} miesięcy ...`), 105, currentY, { align: 'center' });
                currentY += 15;
            }
            
            createScheduleTable(lastMonths, "Ostatnie 12 miesięcy:", currentY);
        }

        // Podsumowanie harmonogramu
        const totalOverpayments = schedule.reduce((sum, item) => sum + item.overpayment, 0);
        if (totalOverpayments > 0) {
            doc.setFontSize(10);
            doc.text(normalizeText(`Łączna kwota nadpłat: ${formatCurrency(totalOverpayments)}`), 15, doc.internal.pageSize.height - 15);
        }
    }

    doc.save(normalizeText('Raport_Kredytowy.pdf'));
  }

  const propertyValueNum = parseFloat(formData.propertyValue) || 0;
  const loanAmountNum = parseFloat(formData.loanAmount) || 0;
  const downPayment = propertyValueNum - loanAmountNum;
  
  const ancillaryCosts = results ? (results.notaryFee ?? 0) + (results.pccTax ?? 0) + (results.bankCommissionAmount ?? 0) + (results.courtFees ?? 0) + (results.agencyCommissionAmount ?? 0) : 0;
  const totalInitialOutlay = downPayment + ancillaryCosts;
  const totalCreditCost = results ? (results.totalInterest ?? 0) + (results.bankCommissionAmount ?? 0) : 0;

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
              <Card className="mb-6 sm:mb-8">
                  <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-center font-bold">
            Kalkulator Zakupu Nieruchomości
            {initialPrice && (
              <div className="mt-3 text-sm text-green-600 bg-green-100 px-3 py-2 rounded-lg inline-block">
                💰 Cena z kalkulatora wyceny: {parseInt(initialPrice).toLocaleString('pl-PL')} zł
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sekcja Nieruchomość i Kredyt */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Nieruchomość i Kredyt</h3>
                <InputWithValidation
                  id="propertyValue"
                  name="propertyValue"
                  label="Wartość nieruchomości (zł)"
                  value={formData.propertyValue}
                  onChange={handleNumericInput('propertyValue')}
                  placeholder="np. 500000"
                  error={validationErrors.propertyValue}
                />
                <div className="space-y-2">
                  <Label>Wkład własny</Label>
                  <div className="flex items-center space-x-2">
                    <Select value={downPaymentType} onValueChange={(v) => handleDownPaymentTypeChange(v as 'percentage' | 'amount')}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amount">Kwotowo (PLN)</SelectItem>
                        <SelectItem value="percentage">Procentowo (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="downPaymentInput"
                      value={downPaymentInput}
                      onChange={(e) => setDownPaymentInput(e.target.value)}
                      type="number"
                      placeholder={downPaymentType === 'amount' ? 'np. 100000' : 'np. 20'}
                      step={downPaymentType === 'percentage' ? "0.1" : "1000"}
                    />
                  </div>
                </div>
                <InputWithValidation
                  id="loanAmount"
                  name="loanAmount"
                  label="Kwota kredytu (zł)"
                  value={formData.loanAmount}
                  onChange={() => {}} // Read-only
                  placeholder="np. 400000"
                  disabled={true}
                  className="bg-gray-100"
                  error={validationErrors.loanAmount}
                />
                <InputWithValidation
                  id="loanTerm"
                  name="loanTerm"
                  label="Okres kredytowania (lata)"
                  value={formData.loanTerm}
                  onChange={handleNumericInput('loanTerm', false)}
                  placeholder="np. 30"
                  error={validationErrors.loanTerm}
                />
                <div>
                  <Label>Rodzaj rat</Label>
                  <Select name="installmentType" onValueChange={(value) => handleSelectChange('installmentType', value)} defaultValue={formData.installmentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal">Równe</SelectItem>
                      <SelectItem value="decreasing">Malejące</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sekcja Oprocentowanie i Ubezpieczenia */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Oprocentowanie i Ubezpieczenia</h3>
                <InputWithValidation
                  id="bankMargin"
                  name="bankMargin"
                  label="Marża banku (%)"
                  value={formData.bankMargin}
                  onChange={handleNumericInput('bankMargin')}
                  step="0.1"
                  placeholder="np. 2.1"
                  error={validationErrors.bankMargin}
                />
                <InputWithValidation
                  id="referenceRate"
                  name="referenceRate"
                  label="Wskaźnik referencyjny (WIBOR/WIRON) (%)"
                  value={formData.referenceRate}
                  onChange={handleNumericInput('referenceRate')}
                  step="0.01"
                  placeholder="np. 5.85"
                  error={validationErrors.referenceRate}
                />
                <div>
                  <Label htmlFor="bridgeInsuranceMonths">Ubezpieczenie pomostowe (liczba miesięcy)</Label>
                  <Input id="bridgeInsuranceMonths" name="bridgeInsuranceMonths" value={formData.bridgeInsuranceMonths} onChange={handleInputChange} type="number" placeholder="np. 6" />
                </div>
                <div>
                  <Label htmlFor="bridgeInsuranceMarginIncrease">Podwyższenie marży w okresie ubezp. (%)</Label>
                  <Input id="bridgeInsuranceMarginIncrease" name="bridgeInsuranceMarginIncrease" value={formData.bridgeInsuranceMarginIncrease} onChange={handleInputChange} type="number" step="0.1" placeholder="np. 1.0" />
                </div>
              </div>
              
              {/* Sekcja Koszty Transakcyjne */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Koszty Transakcyjne</h3>
                <InputWithValidation
                  id="bankCommission"
                  name="bankCommission"
                  label="Prowizja banku za udzielenie kredytu (%)"
                  value={formData.bankCommission}
                  onChange={handleNumericInput('bankCommission')}
                  step="0.1"
                  placeholder="np. 2"
                  error={validationErrors.bankCommission}
                />
                <InputWithValidation
                  id="agencyCommission"
                  name="agencyCommission"
                  label="Prowizja agencji nieruchomości (%)"
                  value={formData.agencyCommission}
                  onChange={handleNumericInput('agencyCommission')}
                  step="0.1"
                  placeholder="np. 3"
                  error={validationErrors.agencyCommission}
                />
                <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="isFirstPropertyPurchase" className="flex flex-col pr-2">
                            <span>Zwolnienie z PCC</span>
                            <span className="text-xs text-gray-500">zakup pierwszej nieruchomości</span>
                        </Label>
                        <Switch id="isFirstPropertyPurchase" checked={isFirstPropertyPurchase} onCheckedChange={handleFirstPropertySwitch} />
                    </div>
                    <InputWithValidation
                      id="pccTaxRate"
                      name="pccTaxRate"
                      label="Podatek PCC (%)"
                      value={formData.pccTaxRate}
                      onChange={handleNumericInput('pccTaxRate')}
                      step="0.1"
                      placeholder="np. 2"
                      disabled={isFirstPropertyPurchase}
                      error={validationErrors.pccTaxRate}
                    />
                </div>
                 <div className="space-y-2 pt-2 border-t">
                    <Label>Opłata notarialna</Label>
                    <Select name="notaryFeeType" onValueChange={(value) => handleSelectChange('notaryFeeType', value)} defaultValue={formData.notaryFeeType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="max">Maksymalna stawka</SelectItem>
                            <SelectItem value="custom">Własna kwota</SelectItem>
                        </SelectContent>
                    </Select>
                    {formData.notaryFeeType === 'custom' && (
                    <div>
                        <Label htmlFor="customNotaryFee">Własna kwota opłaty (zł)</Label>
                        <Input id="customNotaryFee" name="customNotaryFee" value={formData.customNotaryFee} onChange={handleInputChange} type="number" placeholder="np. 3000" />
                    </div>
                    )}
                </div>
              </div>
            </div>
             <div className="pt-4 border-t">
                  <button type="button" onClick={() => setShowOverpayment(!showOverpayment)} className="font-semibold text-lg w-full text-left flex justify-between items-center">
                      <span>Nadpłata Kredytu</span>
                      <span className="text-xl">{showOverpayment ? '▲' : '▼'}</span>
                  </button>
                  {showOverpayment && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <Label htmlFor="overpaymentAmount">Kwota nadpłaty (zł)</Label>
                        <Input id="overpaymentAmount" name="overpaymentAmount" value={formData.overpaymentAmount} onChange={handleInputChange} type="number" placeholder="np. 10000" />
                      </div>
                      {parseFloat(formData.overpaymentAmount) > 0 && (
                        <>
                          <div>
                            <Label>Częstotliwość nadpłat</Label>
                            <Select onValueChange={(v) => handleSelectChange('overpaymentFrequency', v)} defaultValue={formData.overpaymentFrequency}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="one-time">Jednorazowa</SelectItem>
                                <SelectItem value="monthly">Miesięczna</SelectItem>
                                <SelectItem value="yearly">Roczna</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {(formData.overpaymentFrequency === 'monthly' || formData.overpaymentFrequency === 'yearly') && (
                            <div>
                                <Label>Co ile {formData.overpaymentFrequency === 'monthly' ? 'miesięcy' : 'lat'}</Label>
                                <Input 
                                  name="overpaymentInterval" 
                                  value={formData.overpaymentInterval} 
                                  onChange={handleInputChange} 
                                  type="number"
                                  min="1"
                                />
                            </div>
                          )}
                          <div>
                            <Label htmlFor="overpaymentStartMonth">Nadpłata od miesiąca</Label>
                            <Input id="overpaymentStartMonth" name="overpaymentStartMonth" value={formData.overpaymentStartMonth} onChange={handleInputChange} type="number"/>
                          </div>
                          <div className="md:col-span-3">
                            <Label>Cel nadpłaty</Label>
                            <Select onValueChange={(v) => handleSelectChange('overpaymentTarget', v)} defaultValue={formData.overpaymentTarget}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="shorten-period">Skrócenie okresu</SelectItem>
                                <SelectItem value="lower-installment">Zmniejszenie raty</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  )}
              </div>
             <div className="pt-4 border-t">
                <h3 className="font-semibold text-lg mb-4">Symulacja Zmiany Stóp Procentowych</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="useSimulationRate" checked={useSimulationRate} onCheckedChange={setUseSimulationRate} />
                    <Label htmlFor="useSimulationRate" className="text-sm md:text-base">Uwzględnij w głównych wynikach</Label>
                  </div>
                  <div className="w-full sm:w-auto">
                      <Label htmlFor="referenceRateChange" className="text-sm md:text-base">Zmiana wskaźnika referencyjnego (p.p.)</Label>
                      <Input 
                        id="referenceRateChange" 
                        name="referenceRateChange" 
                        value={formData.referenceRateChange} 
                        onChange={handleInputChange} 
                        type="number" 
                        step="0.1" 
                        placeholder="np. 1.5 lub -0.5" 
                        className="w-full sm:w-48 mt-1"
                      />
                  </div>
                </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 mt-6">
        <Button 
          onClick={handleCalculateClick} 
          disabled={isLoading || !isFormValid} 
          className={`w-full md:w-auto ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? 'Obliczanie...' : 'Oblicz'}
        </Button>
        <Button onClick={clearForm} variant="outline" className="w-full md:w-auto">Wyczyść</Button>
      </div>

      {!isFormValid && Object.keys(validationErrors).length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Formularz zawiera błędy:</span>
          </div>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.entries(validationErrors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        </div>
      )}

      {isClient && !results && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <h2 className="text-2xl font-semibold mb-2">Gotowy do obliczeń?</h2>
          <p>Wprowadź dane i kliknij &quot;Oblicz&quot;, aby zobaczyć szczegółową analizę kredytu.</p>
        </div>
      )}

      {isLoading && <div className="text-center py-12">Wczytywanie wyników...</div>}
      
      {errors.api && <div className="text-center py-12 text-red-500">{errors.api}</div>}

      {isClient && results && (
          <div className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Koszty Początkowe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 md:p-6 bg-gray-100 rounded-lg">
                    <p className="text-sm md:text-base text-gray-600 mb-2 sm:mb-0">Wkład własny</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{formatCurrency(downPayment)}</p>
                </div>
                <div className="p-4 md:p-6 bg-gray-100 rounded-lg">
                    <p className="text-sm md:text-base text-gray-600 mb-4 font-semibold">Koszty okołozakupowe</p>
                    <div className="space-y-3 text-sm md:text-base">
                        {(results.pccTax ?? 0) > 0 && <div className="flex justify-between items-center"><span>Podatek PCC:</span> <span className="font-semibold">{formatCurrency(results.pccTax)}</span></div>}
                        {isFirstPropertyPurchase && (results.pccTax === 0) && <div className="flex justify-between items-center"><span>Podatek PCC:</span> <span className="font-semibold text-green-600">Zwolnienie (pierwsza nieruchomość)</span></div>}
                        {(results.notaryFee ?? 0) > 0 && <div className="flex justify-between items-center"><span>Taksa notarialna:</span> <span className="font-semibold">{formatCurrency(results.notaryFee)}</span></div>}
                        {(results.bankCommissionAmount ?? 0) > 0 && <div className="flex justify-between items-center"><span>Prowizja bankowa:</span> <span className="font-semibold">{formatCurrency(results.bankCommissionAmount)}</span></div>}
                        {(results.courtFees ?? 0) > 0 && <div className="flex justify-between items-center"><span>Opłaty sądowe:</span> <span className="font-semibold">{formatCurrency(results.courtFees)}</span></div>}
                        {(results.agencyCommissionAmount ?? 0) > 0 && <div className="flex justify-between items-center"><span>Prowizja agencji:</span> <span className="font-semibold">{formatCurrency(results.agencyCommissionAmount)}</span></div>}
                        <div className="flex justify-between items-center font-bold border-t pt-3 mt-3 text-base md:text-lg"><span>Suma kosztów okołozakupowych:</span> <span>{formatCurrency(ancillaryCosts)}</span></div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 md:p-6 bg-blue-100 rounded-lg">
                  <p className="text-sm md:text-base font-semibold text-gray-700 mb-2 sm:mb-0">RAZEM (gotówka na start)</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-800">{formatCurrency(totalInitialOutlay)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Podsumowanie Płatności Kredytu</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center">
                      <p className="text-sm md:text-base text-gray-600 mb-2">Pierwsza Rata</p>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">{formatCurrency(results.firstInstallment)}</p>
                  </div>
                  <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center">
                      <p className="text-sm md:text-base text-gray-600 mb-2">Ostatnia Rata</p>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">{formatCurrency(results.lastInstallment)}</p>
                  </div>
                  <div className="p-4 md:p-6 bg-gray-100 rounded-lg text-center">
                      <p className="text-sm md:text-base text-gray-600 mb-2">Suma Odsetek</p>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600">{formatCurrency(results.totalInterest)}</p>
                  </div>
                  <div className="p-4 md:p-6 bg-red-100 rounded-lg text-center">
                      <p className="text-sm md:text-base text-gray-700 mb-2">Całkowity Koszt Kredytu</p>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-800">{formatCurrency(totalCreditCost)}</p>
                  </div>
              </CardContent>
            </Card>

            {results.overpaymentResults && parseFloat(formData.overpaymentAmount) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Wyniki Nadpłaty</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 md:p-6 bg-green-100 rounded-lg text-center">
                    <p className="text-sm md:text-base text-green-800 mb-2">Zaoszczędzone odsetki</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600">{formatCurrency(results.overpaymentResults.savedInterest)}</p>
                  </div>
                  <div className="p-4 md:p-6 bg-green-100 rounded-lg text-center">
                    <p className="text-sm md:text-base text-green-800 mb-2">Kredyt spłacisz szybciej o</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600">{results.overpaymentResults.monthsShortened > 0 ? formatLoanTerm(results.overpaymentResults.monthsShortened) : '0'}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {useSimulationRate && results.simulationResults && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg md:text-xl">Wynik Symulacji Zmiany Stóp Procentowych</CardTitle>
                    </CardHeader>
                     <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-4 md:p-6 bg-yellow-100 rounded-lg text-center">
                             <p className="text-sm md:text-base text-yellow-800 mb-2">Nowa pierwsza rata</p>
                             <p className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-600">{formatCurrency(results.simulationResults.newFirstInstallment)}</p>
                         </div>
                         <div className="p-4 md:p-6 bg-yellow-100 rounded-lg text-center">
                            <p className="text-sm md:text-base text-yellow-800 mb-2">Nowa ostatnia rata</p>
                            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-600">{formatCurrency(results.simulationResults.newLastInstallment)}</p>
                         </div>
                     </CardContent>
                 </Card>
            )}

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
              <Button 
                onClick={() => setShowSchedule(!showSchedule)} 
                variant="secondary"
                className="w-full sm:w-auto text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
              >
                {showSchedule ? 'Ukryj' : 'Pokaż'} Harmonogram Spłat
              </Button>
              <Button 
                onClick={generatePdfReport} 
                disabled={!results?.schedule}
                className="w-full sm:w-auto text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
              >
                Pobierz raport PDF
              </Button>
            </div>
            
            {showSchedule && results?.schedule && (
              <Card ref={scheduleRef} className="mt-6 w-full overflow-x-auto">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-center">Harmonogram Spłat</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          {['Miesiąc', 'Część kapitałowa', 'Część odsetkowa', 'Nadpłata', 'Rata całkowita', 'Pozostałe saldo'].map(head => (
                            <th key={head} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.schedule?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                          <tr key={item.month}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{item.month}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.principalPart)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.interestPart)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.overpayment)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatCurrency(item.totalPayment)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.remainingPrincipal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                variant="outline"
                                size="sm"
                                className="text-xs sm:text-sm px-2 sm:px-3"
                            >
                                Pierwsza
                            </Button>
                            <Button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                size="sm"
                                className="text-xs sm:text-sm px-2 sm:px-3"
                            >
                                Poprzednia
                            </Button>
                        </div>
                        <span className="px-2 sm:px-4 text-xs sm:text-sm text-gray-600 text-center">
                            Strona {currentPage} z {Math.ceil((results.schedule?.length ?? 0) / itemsPerPage)}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil((results.schedule?.length ?? 0) / itemsPerPage)))}
                                disabled={currentPage === Math.ceil((results.schedule?.length ?? 0) / itemsPerPage)}
                                size="sm"
                                className="text-xs sm:text-sm px-2 sm:px-3"
                            >
                                Następna
                            </Button>
                            <Button
                                onClick={() => setCurrentPage(Math.ceil((results.schedule?.length ?? 0) / itemsPerPage))}
                                disabled={currentPage === Math.ceil((results.schedule?.length ?? 0) / itemsPerPage)}
                                variant="outline"
                                size="sm"
                                className="text-xs sm:text-sm px-2 sm:px-3"
                            >
                                Ostatnia
                            </Button>
                        </div>
                    </div>
                </CardContent>
              </Card>
            )}
            
            <div className="mt-8 grid grid-cols-1 gap-8">
                <Card className="chart-container-pdf">
                    <CardHeader><CardTitle>Struktura Raty</CardTitle></CardHeader>
                    <CardContent><InstallmentStructureChart schedule={results.schedule ?? []} /></CardContent>
                </Card>
                <Card className="chart-container-pdf">
                    <CardHeader><CardTitle>Amortyzacja</CardTitle></CardHeader>
                    <CardContent><AmortizationChart schedule={results.schedule ?? []} /></CardContent>
                </Card>
                {results.overpaymentResults && parseFloat(formData.overpaymentAmount) > 0 && (
                  <Card className="chart-container-pdf">
                    <CardHeader><CardTitle>Wpływ Nadpłaty</CardTitle></CardHeader>
                    <CardContent>
                        <OverpaymentImpactChart 
                            overpaymentResults={results.overpaymentResults}
                        />
                    </CardContent>
                  </Card>
                )}
                {results.baseSchedule && results.schedule && parseFloat(formData.overpaymentAmount) > 0 && (
                    <Card className="chart-container-pdf">
                        <CardHeader><CardTitle>Porównanie Harmonogramów</CardTitle></CardHeader>
                        <CardContent>
                            <OverpaymentComparisonChart 
                                scheduleWithoutOverpayment={results.baseSchedule}
                                scheduleWithOverpayment={results.schedule}
                            />
                        </CardContent>
                    </Card>
                )}
                {results.schedule && parseFloat(formData.overpaymentAmount) > 0 && (
                    <Card className="chart-container-pdf">
                        <CardHeader><CardTitle>Harmonogram Nadpłat</CardTitle></CardHeader>
                        <CardContent>
                            <OverpaymentTimelineChart schedule={results.schedule} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

export default function RealEstateCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie kalkulatora...</p>
        </div>
      </div>
    }>
      <RealEstateCalculatorPageContent />
    </Suspense>
  );
}