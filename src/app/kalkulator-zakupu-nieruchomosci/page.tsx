'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CalculationService } from '@/lib/CalculationService';
import { formatCurrency, normalizeText } from '@/lib/utils';
import { AmortizationChart } from '@/components/charts/AmortizationChart';
import { InstallmentStructureChart } from '@/components/charts/InstallmentStructureChart';
import { OverpaymentImpactChart } from '@/components/charts/OverpaymentImpactChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

type ScheduleItem = {
  month: number;
  principalPart: number;
  interestPart: number;
  totalPayment: number;
  overpayment: number;
  remainingBalance: number;
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
  overpaymentResults: { savedInterest: number; newLoanTerm: number; } | null;
  simulationResults?: SimulationResults;
};

type SimulationResults = {
  newFirstInstallment: number;
  newLastInstallment: number;
};

export default function RealEstateCalculatorPage() {
  const [formData, setFormData] = useState<FormData>({
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const service = new CalculationService();

  const formatLoanTerm = (months: number | null) => {
    if (!months || months <= 0) return 'N/A';
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
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (parseFloat(formData.loanAmount) > parseFloat(formData.propertyValue)) {
      newErrors.loanAmount = "Kwota kredytu nie może być wyższa niż wartość nieruchomości.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const fetchData = async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setResults(null);
    try {
      const dataToSend = {
        ...formData,
        useSimulationRate: useSimulationRate,
      };
      const data = await service.calculate(dataToSend);
      setResults(data);
    } catch (error) {
      console.error("Błąd podczas pobierania danych z API:", error);
      setErrors({ api: "Nie udało się połączyć z serwisem obliczeniowym." });
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
    });
    setResults(null);
    setErrors({});
    setShowSchedule(false);
    setCurrentPage(1);
  };
  
  const generatePdfReport = async () => {
    if (!results || !results.schedule) {
      console.error("Brak wyników do wygenerowania raportu.");
      return;
    }

    const doc = new jsPDF();
    const chartElements = document.querySelectorAll('.chart-container-pdf');
    const html2canvas = (await import('html2canvas')).default;
    const chartImages = await Promise.all(
        Array.from(chartElements).map(async (chart) => {
            const canvas = await html2canvas(chart as HTMLElement);
            return { img: canvas.toDataURL('image/png') };
        })
    );
    
    const ancillaryCosts = (results?.notaryFee ?? 0) + (results?.pccTax ?? 0) + (results?.bankCommissionAmount ?? 0) + (results?.courtFees ?? 0) + (results?.agencyCommissionAmount ?? 0);
    const totalCreditCost = (results?.totalInterest ?? 0) + (results?.bankCommissionAmount ?? 0);

    // Title
    doc.setFontSize(22);
    doc.text(normalizeText("Raport Kredytowy"), 105, 20, { align: 'center' });

    // Summary Table
    const summaryData = [
        ['Pierwsza rata', formatCurrency(results.firstInstallment)],
        ['Ostatnia rata', formatCurrency(results.lastInstallment)],
        ['Suma odsetek', formatCurrency(results.totalInterest)],
        ['Całkowity koszt kredytu (z prowizją)', formatCurrency(totalCreditCost)],
        ['Koszty okołozakupowe', formatCurrency(ancillaryCosts)],
        ['Całkowita kwota do spłaty', formatCurrency(results.totalRepayment)],
    ];
    if (results.overpaymentResults && parseFloat(formData.overpaymentAmount) > 0) {
        summaryData.push(['Zaoszczędzone odsetki (nadpłata)', formatCurrency(results.overpaymentResults.savedInterest)]);
        summaryData.push(['Nowy okres kredytowania', formatLoanTerm(results.overpaymentResults.newLoanTerm)]);
    }

    (doc as any).autoTable({
        startY: 30,
        head: [['Kategoria', 'Wartość']],
        body: summaryData.map(row => [normalizeText(row[0]), normalizeText(row[1])]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], font: 'helvetica' },
        bodyStyles: { font: 'helvetica' }
    });

    // Charts
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    const chartWidth = 90;
    const chartHeight = 70;
    chartImages.forEach(({ img }, i) => {
        const xPos = (i % 2 === 0) ? 15 : 110;
        if (i > 0 && i % 2 === 0) {
            yPos += chartHeight + 10;
        }
        if (yPos + chartHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
        doc.addImage(img, 'PNG', xPos, yPos, chartWidth, chartHeight);
    });

    // Schedule Table
    if (results.schedule && results.schedule.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.text(normalizeText("Harmonogram Spłat"), 105, 20, { align: 'center' });

        const scheduleHead = [['Miesiąc', 'Rata', 'Część kap.', 'Część ods.', 'Nadpłata', 'Saldo']];
        const scheduleBody = results.schedule.map(item => [
            item.month,
            formatCurrency(item.totalPayment),
            formatCurrency(item.principalPart),
            formatCurrency(item.interestPart),
            formatCurrency(item.overpayment),
            formatCurrency(item.remainingBalance),
        ].map(cell => normalizeText(String(cell))));

        (doc as any).autoTable({
            startY: 30,
            head: scheduleHead,
            body: scheduleBody,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], font: 'helvetica' },
            bodyStyles: { font: 'helvetica' },
            didDrawPage: (data: any) => {
                // You can add headers/footers for each page here if needed
            }
        });
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
    <div className="container mx-auto p-4 md:p-8 bg-gray-50">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Kalkulator Zakupu Nieruchomości</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sekcja Nieruchomość i Kredyt */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Nieruchomość i Kredyt</h3>
                <div>
                  <Label htmlFor="propertyValue">Wartość nieruchomości (zł)</Label>
                  <Input id="propertyValue" name="propertyValue" value={formData.propertyValue} onChange={handleInputChange} type="number" placeholder="np. 500000" />
                </div>
                <div>
                  <Label htmlFor="loanAmount">Kwota kredytu (zł)</Label>
                  <Input id="loanAmount" name="loanAmount" value={formData.loanAmount} onChange={handleInputChange} type="number" placeholder="np. 400000" />
                   {errors.loanAmount && <p className="text-red-500 text-sm mt-1">{errors.loanAmount}</p>}
                </div>
                <div>
                  <Label htmlFor="loanTerm">Okres kredytowania (lata)</Label>
                  <Input id="loanTerm" name="loanTerm" value={formData.loanTerm} onChange={handleInputChange} type="number" placeholder="np. 30" />
                </div>
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

              {/* Sekcja Oprocentowanie i Prowizje */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Oprocentowanie i Prowizje</h3>
                <div>
                  <Label htmlFor="bankMargin">Marża banku (%)</Label>
                  <Input id="bankMargin" name="bankMargin" value={formData.bankMargin} onChange={handleInputChange} type="number" step="0.1" placeholder="np. 2.1" />
                </div>
                <div>
                  <Label htmlFor="referenceRate">Wskaźnik referencyjny (WIBOR/WIRON) (%)</Label>
                  <Input id="referenceRate" name="referenceRate" value={formData.referenceRate} onChange={handleInputChange} type="number" step="0.01" placeholder="np. 5.85" />
                </div>
                 <div>
                  <Label htmlFor="bankCommission">Prowizja banku za udzielenie kredytu (%)</Label>
                  <Input id="bankCommission" name="bankCommission" value={formData.bankCommission} onChange={handleInputChange} type="number" step="0.1" placeholder="np. 2" />
                </div>
                <div>
                  <Label htmlFor="agencyCommission">Prowizja agencji nieruchomości (%)</Label>
                   <Input id="agencyCommission" name="agencyCommission" value={formData.agencyCommission} onChange={handleInputChange} type="number" step="0.1" placeholder="np. 3" />
                </div>
              </div>

              {/* Sekcja Ubezpieczenie i Nadpłata */}
              <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Ubezpieczenie i Nadpłata</h3>
                  <div>
                    <Label htmlFor="bridgeInsuranceMonths">Ubezpieczenie pomostowe (liczba miesięcy)</Label>
                    <Input id="bridgeInsuranceMonths" name="bridgeInsuranceMonths" value={formData.bridgeInsuranceMonths} onChange={handleInputChange} type="number" placeholder="np. 6" />
                  </div>
                  <div>
                    <Label htmlFor="bridgeInsuranceMarginIncrease">Podwyższenie marży w okresie ubezp. (%)</Label>
                    <Input id="bridgeInsuranceMarginIncrease" name="bridgeInsuranceMarginIncrease" value={formData.bridgeInsuranceMarginIncrease} onChange={handleInputChange} type="number" step="0.1" placeholder="np. 1.0" />
                  </div>
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
                       <div>
                         <Label htmlFor="overpaymentStartMonth">Nadpłata od miesiąca</Label>
                         <Input id="overpaymentStartMonth" name="overpaymentStartMonth" value={formData.overpaymentStartMonth} onChange={handleInputChange} type="number"/>
                       </div>
                       <div>
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
            </div>
             <div className="pt-4 border-t">
                <h3 className="font-semibold text-lg mb-2">Symulacja Zmiany Stóp Procentowych</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="useSimulationRate" checked={useSimulationRate} onCheckedChange={setUseSimulationRate} />
                    <Label htmlFor="useSimulationRate">Uwzględnij w głównych wynikach</Label>
                  </div>
                  <div>
                      <Label htmlFor="referenceRateChange">Zmiana wskaźnika referencyjnego (p.p.)</Label>
                      <Input id="referenceRateChange" name="referenceRateChange" value={formData.referenceRateChange} onChange={handleInputChange} type="number" step="0.1" placeholder="np. 1.5 lub -0.5" className="w-48"/>
                  </div>
                </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 mt-6">
        <Button onClick={handleCalculateClick} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? 'Obliczanie...' : 'Oblicz'}
        </Button>
        <Button onClick={clearForm} variant="outline" className="w-full md:w-auto">Wyczyść</Button>
      </div>

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
                <CardTitle>Koszty Początkowe</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">Wkład własny</p>
                  <p className="text-2xl font-bold">{formatCurrency(downPayment)}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">Koszty okołozakupowe</p>
                  <p className="text-2xl font-bold">{formatCurrency(ancillaryCosts)}</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-lg">
                  <p className="text-sm text-gray-700">RAZEM (gotówka na start)</p>
                  <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalInitialOutlay)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Podsumowanie Płatności Kredytu</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600">Pierwsza Rata</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(results.firstInstallment)}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600">Ostatnia Rata</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(results.lastInstallment)}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600">Suma Odsetek</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(results.totalInterest)}</p>
                  </div>
                  <div className="p-4 bg-red-100 rounded-lg">
                      <p className="text-sm text-gray-700">Całkowity Koszt Kredytu</p>
                      <p className="text-2xl font-bold text-red-800">{formatCurrency(totalCreditCost)}</p>
                  </div>
              </CardContent>
            </Card>

            {results.overpaymentResults && parseFloat(formData.overpaymentAmount) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Wyniki Nadpłaty</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">Zaoszczędzone odsetki</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(results.overpaymentResults.savedInterest)}</p>
                  </div>
                  <div className="p-4 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">Kredyt spłacisz szybciej o</p>
                    <p className="text-2xl font-bold text-green-600">{formatLoanTerm(parseInt(formData.loanTerm) * 12 - results.overpaymentResults.newLoanTerm)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {useSimulationRate && results.simulationResults && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Wynik Symulacji Zmiany Stóp Procentowych</CardTitle>
                    </CardHeader>
                     <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                         <div className="p-4 bg-yellow-100 rounded-lg">
                             <p className="text-sm text-yellow-800">Nowa pierwsza rata</p>
                             <p className="text-2xl font-bold text-yellow-600">{formatCurrency(results.simulationResults.newFirstInstallment)}</p>
                         </div>
                         <div className="p-4 bg-yellow-100 rounded-lg">
                            <p className="text-sm text-yellow-800">Nowa ostatnia rata</p>
                            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(results.simulationResults.newLastInstallment)}</p>
                         </div>
                     </CardContent>
                 </Card>
            )}

            <div className="flex justify-center items-center space-x-4 mt-6">
              <Button onClick={() => setShowSchedule(!showSchedule)} variant="secondary">
                {showSchedule ? 'Ukryj' : 'Pokaż'} Harmonogram Spłat
              </Button>
              <Button onClick={generatePdfReport} disabled={!results?.schedule}>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.remainingBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-center items-center space-x-2 mt-4">
                        <Button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            variant="outline"
                        >
                            Pierwsza
                        </Button>
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Poprzednia
                        </Button>
                        <span className="px-4 text-sm text-gray-600">
                            Strona {currentPage} z {Math.ceil((results.schedule?.length ?? 0) / itemsPerPage)}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil((results.schedule?.length ?? 0) / itemsPerPage)))}
                            disabled={currentPage === Math.ceil((results.schedule?.length ?? 0) / itemsPerPage)}
                        >
                            Następna
                        </Button>
                        <Button
                            onClick={() => setCurrentPage(Math.ceil((results.schedule?.length ?? 0) / itemsPerPage))}
                            disabled={currentPage === Math.ceil((results.schedule?.length ?? 0) / itemsPerPage)}
                            variant="outline"
                        >
                            Ostatnia
                        </Button>
                    </div>
                </CardContent>
              </Card>
            )}
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-1">
                    <Card className="chart-container-pdf">
                        <CardHeader><CardTitle>Struktura Raty</CardTitle></CardHeader>
                        <CardContent><InstallmentStructureChart schedule={results.schedule ?? []} /></CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card className="chart-container-pdf">
                        <CardHeader><CardTitle>Amortyzacja</CardTitle></CardHeader>
                        <CardContent><AmortizationChart schedule={results.schedule ?? []} /></CardContent>
                    </Card>
                </div>
                {results.overpaymentResults && parseFloat(formData.overpaymentAmount) > 0 && (
                     <div className="lg:col-span-2">
                      <Card className="chart-container-pdf">
                        <CardHeader><CardTitle>Wpływ Nadpłaty</CardTitle></CardHeader>
                        <CardContent>
                            <OverpaymentImpactChart 
                                schedule={results.schedule ?? []} 
                                overpaymentResults={results.overpaymentResults}
                            />
                        </CardContent>
                      </Card>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}