import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Funkcja do pobrania tokenu z nagłówka
function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Funkcja do mapowania nazw parametrów
function formatParameterName(key: string): string {
  const specialCases: { [key: string]: string } = {
    'cena_zakupu': 'Cena zakupu',
    'cena_sprzedazy': 'Cena sprzedaży',
    'materialy_wykonczeniowe': 'Materiały wykończeniowe',
    'materialy_instalacyjne': 'Materiały instalacyjne',
    'sprzet_AGD_RTV': 'Sprzęt AGD/RTV',
    'ekipa_remontowa': 'Ekipa remontowa',
    'inne_uslugi_remontowe': 'Inne usługi remontowe',
    'wywoz_gruzu': 'Wywóz gruzu',
    'transport_materialow': 'Transport materiałów',
    'czynsz_administracyjny': 'Czynsz administracyjny',
    'media_prad': 'Media - prąd',
    'media_gaz': 'Media - gaz',
    'media_woda': 'Media - woda',
    'ubezpieczenie_nieruchomosci': 'Ubezpieczenie nieruchomości',
    'podatek_od_nieruchomosci': 'Podatek od nieruchomości',
    'prowizja_bankowa': 'Prowizja bankowa',
    'oplata_za_wczesniejsza_splata': 'Opłata za wcześniejszą spłatę',
    'prowizja_posrednika_zakup': 'Prowizja pośrednika - zakup',
    'prowizja_posrednika_sprzedaz': 'Prowizja pośrednika - sprzedaż',
    'podatek_PCC': 'Podatek PCC',
    'taksa_notarialna': 'Taksa notarialna',
    'wpis_do_ksiegi_wieczystej': 'Wpis do księgi wieczystej',
    'oplata_za_wypisy_aktow_notarialnych': 'Opłata za wypisy aktów notarialnych',
    'oplata_sadowa': 'Opłata sądowa',
    'oplata_bankowa_za_pobranie': 'Opłata bankowa za pobranie',
    'koszty_operatu_szacunkowego': 'Koszty operatu szacunkowego',
    'koszty_doradcy_kredytowego': 'Koszty doradcy kredytowego',
    'projektant_wnetrza': 'Projektant wnętrza',
    'nadzor_budowlany': 'Nadzór budowlany',
    'koszt_trwania_flipa': 'Koszt trwania flipa',
    'wyposazenie_wnetrza': 'Wyposażenie wnętrza',
    'koszty_marketingu_fotograf': 'Koszty marketingu - fotograf',
    'koszty_marketingu_home_staging': 'Koszty marketingu - home staging',
    'koszty_marketingu_ogloszenia_online': 'Koszty marketingu - ogłoszenia online',
    'koszty_marketingu_inne_promocje': 'Koszty marketingu - inne promocje',
    'oplata_notarialna_przy_sprzedazy': 'Opłata notarialna przy sprzedaży',
    'sluzebnosc_przejscia_od_zysku': 'Służebność przejścia od zysku',
    'inne_podatki': 'Inne podatki',
    'propertyValue': 'Wartość nieruchomości',
    'loanAmount': 'Kwota kredytu',
    'downPayment': 'Wkład własny',
    'loanTerm': 'Okres kredytowania',
    'interestRate': 'Oprocentowanie',
    'monthlyIncome': 'Dochód miesięczny',
    'monthlyExpenses': 'Wydatki miesięczne',
    'purchasePrice': 'Cena zakupu',
    'monthlyRent': 'Czynsz miesięczny',
    'transactionCosts': 'Koszty transakcji',
    'renovationCosts': 'Koszty remontu',
    'adminFees': 'Opłaty administracyjne',
    'utilities': 'Media',
    'insurance': 'Ubezpieczenie',
    'otherCosts': 'Inne koszty',
    'propertyType': 'Typ nieruchomości',
    'area': 'Powierzchnia',
    'rooms': 'Liczba pokoi',
    'floor': 'Piętro',
    'condition': 'Stan techniczny',
    'location': 'Lokalizacja',
    'existingLoans': 'Istniejące kredyty',
    'creditCards': 'Karty kredytowe',
    'overdraft': 'Deklarowany debet'
  };

  if (specialCases[key]) {
    return specialCases[key];
  }

  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

// Funkcja do formatowania wartości
function formatValue(key: string, value: any): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  // Konwertuj wartość na liczbę jeśli to możliwe
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isNumeric = !isNaN(numericValue) && isFinite(numericValue);

  // Wartości pieniężne - rozszerzona lista kluczowych słów
  if (isNumeric && (
    key.toLowerCase().includes('cena') ||
    key.toLowerCase().includes('koszt') ||
    key.toLowerCase().includes('prowizja') ||
    key.toLowerCase().includes('oplata') ||
    key.toLowerCase().includes('price') ||
    key.toLowerCase().includes('cost') ||
    key.toLowerCase().includes('amount') ||
    key.toLowerCase().includes('income') ||
    key.toLowerCase().includes('expense') ||
    key.toLowerCase().includes('payment') ||
    key.toLowerCase().includes('rent') ||
    key.toLowerCase().includes('value') ||
    key.toLowerCase().includes('profit') ||
    key.toLowerCase().includes('repayment') ||
    key.toLowerCase().includes('zakup') ||
    key.toLowerCase().includes('sprzedaz') ||
    key.toLowerCase().includes('materialy') ||
    key.toLowerCase().includes('sprzet') ||
    key.toLowerCase().includes('ekipa') ||
    key.toLowerCase().includes('uslugi') ||
    key.toLowerCase().includes('wywoz') ||
    key.toLowerCase().includes('transport') ||
    key.toLowerCase().includes('podatek') ||
    key.toLowerCase().includes('taksa') ||
    key.toLowerCase().includes('wpis') ||
    key.toLowerCase().includes('bankowa') ||
    key.toLowerCase().includes('operat') ||
    key.toLowerCase().includes('doradcy') ||
    key.toLowerCase().includes('projektant') ||
    key.toLowerCase().includes('nadzor') ||
    key.toLowerCase().includes('wyposazenie') ||
    key.toLowerCase().includes('marketing') ||
    key.toLowerCase().includes('notarialna') ||
    key.toLowerCase().includes('sluzebnosc') ||
    key.toLowerCase().includes('inne_podatki') ||
    key.toLowerCase().includes('propertyvalue') ||
    key.toLowerCase().includes('loanamount') ||
    key.toLowerCase().includes('downpayment') ||
    key.toLowerCase().includes('monthlyincome') ||
    key.toLowerCase().includes('monthlyexpenses') ||
    key.toLowerCase().includes('purchaseprice') ||
    key.toLowerCase().includes('monthlyrent') ||
    key.toLowerCase().includes('transactioncosts') ||
    key.toLowerCase().includes('renovationcosts') ||
    key.toLowerCase().includes('adminfees') ||
    key.toLowerCase().includes('utilities') ||
    key.toLowerCase().includes('insurance') ||
    key.toLowerCase().includes('othercosts') ||
    key.toLowerCase().includes('existingloans') ||
    key.toLowerCase().includes('creditcards') ||
    key.toLowerCase().includes('overdraft') ||
    key.toLowerCase().includes('zysk') ||
    key.toLowerCase().includes('brutto') ||
    key.toLowerCase().includes('netto') ||
    key.toLowerCase().includes('calkowite') ||
    key.toLowerCase().includes('utrzymania') ||
    key.toLowerCase().includes('finansowania') ||
    key.toLowerCase().includes('sprzedazy') ||
    key.toLowerCase().includes('trwania') ||
    key.toLowerCase().includes('miesieczny') ||
    key.toLowerCase().includes('monthlypayment') ||
    key.toLowerCase().includes('totalinterest') ||
    key.toLowerCase().includes('totalcost') ||
    key.toLowerCase().includes('affordability') ||
    key.toLowerCase().includes('firstinstallment') ||
    key.toLowerCase().includes('lastinstallment') ||
    key.toLowerCase().includes('totalrepayment') ||
    key.toLowerCase().includes('monthlyprofit') ||
    key.toLowerCase().includes('annualprofit') ||
    key.toLowerCase().includes('paybackperiod') ||
    key.toLowerCase().includes('netrentalyield') ||
    key.toLowerCase().includes('estimatedvalue') ||
    key.toLowerCase().includes('pricepersqm') ||
    key.toLowerCase().includes('maxloanamount') ||
    key.toLowerCase().includes('hydraulik') ||
    key.toLowerCase().includes('elektryk') ||
    key.toLowerCase().includes('stolarz') ||
    key.toLowerCase().includes('meble') ||
    key.toLowerCase().includes('cena_sprzedazy') ||
    key.toLowerCase().includes('wysokosc_kredytu') ||
    key.toLowerCase().includes('oprocentowanie_kredytu') ||
    key.toLowerCase().includes('okres_kredytowania') ||
    key.toLowerCase().includes('stawka_podatku_od_zysku') ||
    key.toLowerCase().includes('czas_trwania_flipa') ||
    key.toLowerCase().includes('czynsz_administracyjny') ||
    key.toLowerCase().includes('media_prad') ||
    key.toLowerCase().includes('media_gaz') ||
    key.toLowerCase().includes('media_woda') ||
    key.toLowerCase().includes('ubezpieczenie_nieruchomosci') ||
    key.toLowerCase().includes('podatek_od_nieruchomosci') ||
    key.toLowerCase().includes('prowizja_bankowa') ||
    key.toLowerCase().includes('oplata_za_wczesniejsza_splata') ||
    key.toLowerCase().includes('prowizja_posrednika_sprzedaz') ||
    key.toLowerCase().includes('koszt_trwania_flipa') ||
    key.toLowerCase().includes('wyposazenie_wnetrza') ||
    key.toLowerCase().includes('koszty_marketingu_fotograf') ||
    key.toLowerCase().includes('koszty_marketingu_home_staging') ||
    key.toLowerCase().includes('koszty_marketingu_ogloszenia_online') ||
    key.toLowerCase().includes('koszty_marketingu_inne_promocje') ||
    key.toLowerCase().includes('oplata_notarialna_przy_sprzedazy') ||
    key.toLowerCase().includes('sluzebnosc_przejscia_od_zysku') ||
    key.toLowerCase().includes('inne_podatki')
  )) {
    if (numericValue % 1 === 0) {
      return `${numericValue.toLocaleString('pl-PL')} zł`;
    } else {
      return `${numericValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
    }
  }

  // Wartości procentowe
  if (isNumeric && (
    key.toLowerCase().includes('rate') ||
    key.toLowerCase().includes('oprocentowanie') ||
    key.toLowerCase().includes('roi') ||
    key.toLowerCase().includes('yield') ||
    key.toLowerCase().includes('ltv') ||
    key.toLowerCase().includes('dti')
  )) {
    if (numericValue <= 1) {
      return `${(numericValue * 100).toFixed(2)}%`;
    }
    return `${numericValue.toFixed(2)}%`;
  }

  // Wartości czasowe
  if (key.toLowerCase().includes('czas') || key.toLowerCase().includes('okres')) {
    return `${numericValue} ${numericValue === 1 ? 'rok' : numericValue < 5 ? 'lata' : 'lat'}`;
  }

  // Wartości powierzchni
  if (key.toLowerCase().includes('area') || key.toLowerCase().includes('powierzchnia')) {
    return `${numericValue} m²`;
  }

  return String(value);
}

// Funkcja do przygotowania tabeli danych wejściowych
function prepareInputTable(inputData: any, calculationType: string): Array<[string, string]> {
  const table: Array<[string, string]> = [];

  switch (calculationType) {
    case 'purchase':
      if (inputData.propertyValue) table.push(['Wartość nieruchomości', formatValue('propertyValue', inputData.propertyValue)]);
      if (inputData.loanAmount) table.push(['Kwota kredytu', formatValue('loanAmount', inputData.loanAmount)]);
      if (inputData.downPayment) table.push(['Wkład własny', formatValue('downPayment', inputData.downPayment)]);
      if (inputData.loanTerm) table.push(['Okres kredytowania', formatValue('loanTerm', inputData.loanTerm)]);
      if (inputData.interestRate) table.push(['Oprocentowanie', formatValue('interestRate', inputData.interestRate)]);
      if (inputData.monthlyIncome) table.push(['Dochód miesięczny', formatValue('monthlyIncome', inputData.monthlyIncome)]);
      if (inputData.monthlyExpenses) table.push(['Wydatki miesięczne', formatValue('monthlyExpenses', inputData.monthlyExpenses)]);
      break;
    default:
      Object.entries(inputData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const formattedName = formatParameterName(key);
          const formattedValue = formatValue(key, value);
          table.push([formattedName, formattedValue]);
        }
      });
  }

  return table;
}

// Funkcja do przygotowania tabeli wyników
function prepareResultTable(resultData: any, calculationType: string): Array<[string, string]> {
  const table: Array<[string, string]> = [];

  const resultNames: { [key: string]: string } = {
    'koszt_zakupu_brutto': 'Koszt zakupu brutto',
    'koszt_remontu_calkowity': 'Koszt remontu całkowity',
    'koszty_utrzymania': 'Koszty utrzymania',
    'koszty_finansowania': 'Koszty finansowania',
    'koszty_calkowite': 'Koszty całkowite',
    'koszty_sprzedazy': 'Koszty sprzedaży',
    'zysk_brutto': 'Zysk brutto',
    'podatek': 'Podatek',
    'zysk_netto': 'Zysk netto',
    'ROI': 'ROI',
    'czas_trwania_flipa': 'Czas trwania flipa',
    'srednio_miesieczny_zysk_netto': 'Średnio miesięczny zysk netto',
    'monthlyPayment': 'Rata miesięczna',
    'totalInterest': 'Całkowite odsetki',
    'totalCost': 'Całkowity koszt',
    'affordability': 'Zdolność kredytowa',
    'loanToValue': 'LTV',
    'debtToIncome': 'DTI',
    'firstInstallment': 'Pierwsza rata',
    'lastInstallment': 'Ostatnia rata',
    'totalRepayment': 'Całkowita spłata',
    'monthlyProfit': 'Zysk miesięczny',
    'annualProfit': 'Zysk roczny',
    'yield': 'Rentowność',
    'paybackPeriod': 'Okres zwrotu',
    'netRentalYield': 'Netto rentowność',
    'estimatedValue': 'Szacowana wartość',
    'pricePerSqm': 'Cena za m²',
    'confidence': 'Poziom pewności',
    'creditScore': 'Punktacja kredytowa',
    'maxLoanAmount': 'Maksymalna kwota kredytu',
    'recommendation': 'Rekomendacja'
  };

  switch (calculationType) {
    case 'purchase':
      if (resultData.firstInstallment) table.push(['Pierwsza rata', formatValue('firstInstallment', resultData.firstInstallment)]);
      if (resultData.lastInstallment) table.push(['Ostatnia rata', formatValue('lastInstallment', resultData.lastInstallment)]);
      if (resultData.totalRepayment) table.push(['Całkowita spłata', formatValue('totalRepayment', resultData.totalRepayment)]);
      if (resultData.totalInterest) table.push(['Całkowite odsetki', formatValue('totalInterest', resultData.totalInterest)]);
      if (resultData.monthlyPayment) table.push(['Rata miesięczna', formatValue('monthlyPayment', resultData.monthlyPayment)]);
      if (resultData.loanToValue) table.push(['LTV', formatValue('loanToValue', resultData.loanToValue)]);
      if (resultData.debtToIncome) table.push(['DTI', formatValue('debtToIncome', resultData.debtToIncome)]);
      break;
    default:
      Object.entries(resultData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const polishName = resultNames[key] || formatParameterName(key);
          const formattedValue = formatValue(key, value);
          table.push([polishName, formattedValue]);
        }
      });
  }

  return table;
}

// Funkcja do generowania wykresu kołowego SVG
function generatePieChartSVG(data: Array<{name: string, value: number}>, width: number = 400, height: number = 300): string {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return '';

  const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 60; // Zwiększono margines dla etykiet
  
  let currentAngle = 0;
  const paths: string[] = [];
  const labels: string[] = [];
  
  data.forEach((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 2 * Math.PI;
    const endAngle = currentAngle + angle;
    
    // Generuj ścieżkę dla segmentu
    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    paths.push(`<path d="${pathData}" fill="${colors[index % colors.length]}" stroke="white" stroke-width="2"/>`);
    
    // Dodaj etykietę tylko dla segmentów większych niż 5%
    if (percentage > 0.05) {
      const labelAngle = currentAngle + angle / 2;
      const labelRadius = radius + 30; // Zwiększono odległość etykiet
      const labelX = centerX + labelRadius * Math.cos(labelAngle);
      const labelY = centerY + labelRadius * Math.sin(labelAngle);
      const percent = (percentage * 100).toFixed(0);
      
      // Dodaj tło dla etykiety
      labels.push(`
        <rect x="${labelX - 40}" y="${labelY - 8}" width="80" height="16" 
              fill="white" stroke="${colors[index % colors.length]}" stroke-width="1" rx="3"/>
        <text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" 
              font-size="11" font-weight="bold" fill="#1f2937">
          ${item.name} (${percent}%)
        </text>
      `);
    }
    
    currentAngle = endAngle;
  });
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${paths.join('')}
      <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.3}" fill="white" stroke="#e5e7eb" stroke-width="2"/>
      <text x="${centerX}" y="${centerY - 5}" text-anchor="middle" dominant-baseline="middle" 
            font-size="12" font-weight="bold" fill="#1f2937">
        Suma kosztów
      </text>
      <text x="${centerX}" y="${centerY + 10}" text-anchor="middle" dominant-baseline="middle" 
            font-size="11" fill="#6b7280">
        ${total.toLocaleString('pl-PL')} zł
      </text>
      ${labels.join('')}
    </svg>
  `;
}

// Funkcja do generowania wykresu słupkowego SVG
function generateBarChartSVG(data: Array<{name: string, zakup: number, remont: number, utrzymanie: number, finansowanie: number, sprzedaz: number, przychod: number, zysk: number}>, width: number = 600, height: number = 400): string {
  const maxValue = Math.max(...data.map(d => Math.max(d.zakup, d.remont, d.utrzymanie, d.finansowanie, d.sprzedaz, d.przychod, d.zysk)));
  const barWidth = width / (data.length * 2.5); // Zwiększono szerokość słupków
  const chartHeight = height - 100; // Zwiększono margines
  const colors = {
    zakup: '#2563EB',
    remont: '#10B981', 
    utrzymanie: '#F59E0B',
    finansowanie: '#EF4444',
    sprzedaz: '#8B5CF6',
    przychod: '#22C55E',
    zysk: '#F97316'
  };
  
  const bars: string[] = [];
  const labels: string[] = [];
  const valueLabels: string[] = [];
  
  data.forEach((item, index) => {
    const x = 80 + (index * (width - 120)) / data.length; // Zwiększono margines z lewej strony
    let currentY = chartHeight + 50;
    let totalHeight = 0;
    
    // Rysuj słupki dla każdej kategorii
    const categories = [
      { key: 'zakup', value: item.zakup, label: 'Zakup' },
      { key: 'remont', value: item.remont, label: 'Remont' },
      { key: 'utrzymanie', value: item.utrzymanie, label: 'Utrzymanie' },
      { key: 'finansowanie', value: item.finansowanie, label: 'Finansowanie' },
      { key: 'sprzedaz', value: item.sprzedaz, label: 'Sprzedaż' },
      { key: 'przychod', value: item.przychod, label: 'Przychód' },
      { key: 'zysk', value: item.zysk, label: 'Zysk' }
    ];
    
    categories.forEach(cat => {
      if (cat.value > 0) {
        const barHeight = (cat.value / maxValue) * chartHeight;
        const y = currentY - barHeight;
        
        bars.push(`
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
                fill="${colors[cat.key as keyof typeof colors]}" stroke="white" stroke-width="2"/>
        `);
        
        // Dodaj etykietę wartości dla większych segmentów
        if (barHeight > 20) {
          valueLabels.push(`
            <text x="${x + barWidth/2}" y="${y + barHeight/2}" text-anchor="middle" 
                  dominant-baseline="middle" font-size="10" font-weight="bold" fill="white">
              ${cat.value.toLocaleString('pl-PL')} zł
            </text>
          `);
        }
        
        currentY = y;
        totalHeight += barHeight;
      }
    });
    
    // Dodaj etykietę kategorii
    labels.push(`
      <text x="${x + barWidth/2}" y="${height - 30}" text-anchor="middle" 
            font-size="12" font-weight="bold" fill="#1f2937">
        ${item.name}
      </text>
    `);
  });
  
  // Dodaj oś Y z wartościami
  const yAxisLabels: string[] = [];
  for (let i = 0; i <= 5; i++) {
    const value = (maxValue * i) / 5;
    const y = chartHeight + 50 - (i * chartHeight) / 5;
    yAxisLabels.push(`
      <text x="10" y="${y + 5}" font-size="11" fill="#6b7280">
        ${value.toLocaleString('pl-PL')} zł
      </text>
    `);
  }
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${yAxisLabels.join('')}
      ${bars.join('')}
      ${valueLabels.join('')}
      ${labels.join('')}
      <line x1="60" y1="50" x2="60" y2="${chartHeight + 50}" stroke="#94A3B8" stroke-width="2"/>
      <line x1="60" y1="${chartHeight + 50}" x2="${width - 20}" y2="${chartHeight + 50}" stroke="#94A3B8" stroke-width="2"/>
    </svg>
  `;
}

// Funkcja do generowania wykresu harmonogramu spłat kredytu
function generateLoanScheduleChartSVG(schedule: Array<{month: number, interestPart: number, totalPayment: number, overpayment: number, remainingPrincipal: number}>, width: number = 600, height: number = 400): string {
  if (!schedule || schedule.length === 0) {
    return '<div style="text-align: center; color: #6b7280; padding: 40px;">Brak danych harmonogramu</div>';
  }

  // Ogranicz do pierwszych 24 miesięcy dla czytelności
  const displaySchedule = schedule.slice(0, 24);
  const maxPayment = Math.max(...displaySchedule.map(item => item.totalPayment));
  const maxPrincipal = Math.max(...displaySchedule.map(item => item.remainingPrincipal));
  
  const chartHeight = height - 100;
  const barWidth = width / (displaySchedule.length * 1.5);
  
  const bars: string[] = [];
  const labels: string[] = [];
  
  displaySchedule.forEach((item, index) => {
    const x = 80 + (index * (width - 160)) / displaySchedule.length;
    const principalHeight = (item.remainingPrincipal / maxPrincipal) * chartHeight;
    const paymentHeight = (item.totalPayment / maxPayment) * chartHeight;
    
    // Słupek pozostałego kapitału (niebieski)
    bars.push(`
      <rect x="${x}" y="${chartHeight + 50 - principalHeight}" width="${barWidth}" height="${principalHeight}" 
            fill="#3B82F6" stroke="white" stroke-width="1" opacity="0.7"/>
    `);
    
    // Słupek raty (zielony)
    bars.push(`
      <rect x="${x}" y="${chartHeight + 50 - paymentHeight}" width="${barWidth}" height="${paymentHeight}" 
            fill="#10B981" stroke="white" stroke-width="1"/>
    `);
    
    // Etykiety miesięcy (co 3 miesiące)
    if (index % 3 === 0) {
      labels.push(`
        <text x="${x + barWidth/2}" y="${height - 30}" text-anchor="middle" 
              font-size="10" fill="#6b7280">
          M${item.month}
        </text>
      `);
    }
  });
  
  // Oś Y z wartościami
  const yAxisLabels: string[] = [];
  for (let i = 0; i <= 5; i++) {
    const value = (maxPayment * i) / 5;
    const y = chartHeight + 50 - (i * chartHeight) / 5;
    yAxisLabels.push(`
      <text x="10" y="${y + 5}" font-size="10" fill="#6b7280">
        ${value.toLocaleString('pl-PL')} zł
      </text>
    `);
  }
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${yAxisLabels.join('')}
      ${bars.join('')}
      ${labels.join('')}
      <line x1="60" y1="50" x2="60" y2="${chartHeight + 50}" stroke="#94A3B8" stroke-width="2"/>
      <line x1="60" y1="${chartHeight + 50}" x2="${width - 20}" y2="${chartHeight + 50}" stroke="#94A3B8" stroke-width="2"/>
      
      <!-- Legenda -->
      <g transform="translate(${width - 150}, 20)">
        <rect x="0" y="0" width="12" height="12" fill="#10B981"/>
        <text x="15" y="10" font-size="11" fill="#374151">Rata miesięczna</text>
        <rect x="0" y="20" width="12" height="12" fill="#3B82F6" opacity="0.7"/>
        <text x="15" y="30" font-size="11" fill="#374151">Pozostały kapitał</text>
      </g>
    </svg>
  `;
}

// Funkcja do generowania wykresu wyceny
function generateValuationChartSVG(resultData: any, width: number = 600, height: number = 300): string {
  const price = parseFloat(resultData.price) || 0;
  const confidence = parseFloat(resultData.confidence) || 0;
  
  if (price === 0) {
    return '<div style="text-align: center; color: #6b7280; padding: 40px;">Brak danych wyceny</div>';
  }

  const minPrice = price * (1 - confidence / 100);
  const maxPrice = price * (1 + confidence / 100);
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <!-- Tło -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="#f9fafb"/>
      
      <!-- Linia wyceny -->
      <line x1="50" y1="${height/2}" x2="${width-50}" y2="${height/2}" stroke="#3B82F6" stroke-width="4"/>
      
      <!-- Punkt wyceny -->
      <circle cx="${width/2}" cy="${height/2}" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
      
      <!-- Przedział ufności -->
      <rect x="${width/2 - 100}" y="${height/2 - 20}" width="200" height="40" fill="#3B82F6" opacity="0.2" rx="20"/>
      
      <!-- Etykiety -->
      <text x="${width/2}" y="${height/2 - 30}" text-anchor="middle" font-size="24" font-weight="bold" fill="#1f2937">
        ${price.toLocaleString('pl-PL')} zł
      </text>
      <text x="${width/2}" y="${height/2 + 50}" text-anchor="middle" font-size="14" fill="#6b7280">
        Przedział: ${minPrice.toLocaleString('pl-PL')} - ${maxPrice.toLocaleString('pl-PL')} zł
      </text>
      <text x="${width/2}" y="${height/2 + 70}" text-anchor="middle" font-size="12" fill="#6b7280">
        Dokładność: ±${confidence.toFixed(1)}%
      </text>
    </svg>
  `;
}

// Funkcja do generowania wykresu zdolności kredytowej
function generateCreditScoreChartSVG(resultData: any, width: number = 600, height: number = 400): string {
  const chartData = resultData.chartData || [];
  
  if (chartData.length === 0) {
    return '<div style="text-align: center; color: #6b7280; padding: 40px;">Brak danych budżetu</div>';
  }

  const maxValue = Math.max(...chartData.map((item: any) => item.value));
  const chartHeight = height - 100;
  const barWidth = width / (chartData.length * 1.5);
  
  const bars: string[] = [];
  const labels: string[] = [];
  
  chartData.forEach((item: any, index: number) => {
    const x = 80 + (index * (width - 160)) / chartData.length;
    const barHeight = (item.value / maxValue) * chartHeight;
    const y = chartHeight + 50 - barHeight;
    
    bars.push(`
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
            fill="${item.fill || '#3B82F6'}" stroke="white" stroke-width="2"/>
    `);
    
    // Etykiety wartości
    if (barHeight > 20) {
      bars.push(`
        <text x="${x + barWidth/2}" y="${y + barHeight/2}" text-anchor="middle" 
              dominant-baseline="middle" font-size="10" font-weight="bold" fill="white">
          ${item.value.toLocaleString('pl-PL')} zł
        </text>
      `);
    }
    
    // Etykiety kategorii
    labels.push(`
      <text x="${x + barWidth/2}" y="${height - 30}" text-anchor="middle" 
            font-size="11" font-weight="bold" fill="#1f2937">
        ${item.name}
      </text>
    `);
  });
  
  // Oś Y z wartościami
  const yAxisLabels: string[] = [];
  for (let i = 0; i <= 5; i++) {
    const value = (maxValue * i) / 5;
    const y = chartHeight + 50 - (i * chartHeight) / 5;
    yAxisLabels.push(`
      <text x="10" y="${y + 5}" font-size="11" fill="#6b7280">
        ${value.toLocaleString('pl-PL')} zł
      </text>
    `);
  }
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${yAxisLabels.join('')}
      ${bars.join('')}
      ${labels.join('')}
      <line x1="60" y1="50" x2="60" y2="${chartHeight + 50}" stroke="#94A3B8" stroke-width="2"/>
      <line x1="60" y1="${chartHeight + 50}" x2="${width - 20}" y2="${chartHeight + 50}" stroke="#94A3B8" stroke-width="2"/>
    </svg>
  `;
}

// Funkcja do mapowania typów kalkulacji
function getCalculationTypeLabel(calculationType: string): string {
  switch (calculationType) {
    case 'flipper': return 'Kalkulator flipera';
    case 'purchase': return 'Kalkulator zakupu';
    case 'rental': return 'Kalkulator wynajmu';
    case 'valuation': return 'Kalkulator wyceny';
    case 'creditScore': return 'Zdolność kredytowa';
    default: return 'Inna kalkulacja';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Brak tokenu autoryzacji' }, { status: 401 });
    }

    const calculationId = params.id;

    // Pobierz kalkulację z bazy danych
    const calculation = await prisma.property_calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Kalkulacja nie została znaleziona' }, { status: 404 });
    }

    // Parsuj dane JSON
    const inputData = calculation.input_json ? JSON.parse(calculation.input_json) : {};
    const resultData = calculation.result_json ? JSON.parse(calculation.result_json) : {};

    // Przygotuj HTML z pełną obsługą polskich znaków
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kalkulacja - ${calculation.title || 'Kalkulacja nieruchomości'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
            padding: 20px;
          }
          
          .header {
            background: #3b82f6;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
            border-radius: 8px;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 12px;
            opacity: 0.9;
          }
          
          .info-box {
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
          }
          
          .info-box h2 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 11px;
          }
          
          .section-header {
            background: #3b82f6;
            color: white;
            padding: 12px 20px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            border-radius: 6px;
            font-size: 14px;
          }
          
          .section-header.results {
            background: #22c55e;
          }
          
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .data-row {
            border-bottom: 1px solid #e5e7eb;
          }
          
          .data-row td {
            padding: 8px 12px;
            font-size: 11px;
          }
          
          .data-row .param {
            font-weight: bold;
            color: #374151;
            width: 60%;
          }
          
          .data-row .value {
            text-align: right;
            color: #1f2937;
            width: 40%;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            color: #6b7280;
            display: flex;
            justify-content: space-between;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .header {
              margin-bottom: 15px;
            }
            .info-box {
              margin-bottom: 15px;
            }
            .section-header {
              margin: 15px 0 8px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Kalkulatory Nieruchomości</h1>
          <p>@kalkulatorynieruchomosci.pl</p>
        </div>
        
        <div class="info-box">
          <h2>${calculation.title || 'Kalkulacja nieruchomości'}</h2>
          <div class="info-grid">
            <div><strong>Typ kalkulacji:</strong> ${getCalculationTypeLabel(calculation.calculation_type)}</div>
            <div><strong>ID kalkulacji:</strong> ${calculation.id}</div>
            <div><strong>Data utworzenia:</strong> ${new Date(calculation.created_at).toLocaleDateString('pl-PL')}</div>
            <div><strong>Status:</strong> Zapisana</div>
          </div>
        </div>

        <div class="section-header">DANE</div>
        <table class="data-table">
          ${prepareInputTable(inputData, calculation.calculation_type).map(([param, value]) => 
            `<tr class="data-row"><td class="param">${param}:</td><td class="value">${value}</td></tr>`
          ).join('')}
        </table>

        <div class="section-header results">WYNIKI KALKULACJI</div>
        <table class="data-table">
          ${prepareResultTable(resultData, calculation.calculation_type).map(([param, value]) => 
            `<tr class="data-row"><td class="param">${param}:</td><td class="value">${value}</td></tr>`
          ).join('')}
        </table>

        ${calculation.calculation_type === 'flipper' ? `
          <div class="section-header">WYKRESY</div>
          
          <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Struktura kosztów</h3>
            <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb;">
              ${generatePieChartSVG([
                { name: 'Zakup', value: parseFloat(resultData.koszt_zakupu_brutto) || 0 },
                { name: 'Remont', value: parseFloat(resultData.koszt_remontu_calkowity) || 0 },
                { name: 'Utrzymanie', value: parseFloat(resultData.koszty_utrzymania) || 0 },
                { name: 'Finansowanie', value: parseFloat(resultData.koszty_finansowania) || 0 },
                { name: 'Sprzedaż', value: parseFloat(resultData.koszty_sprzedazy) || 0 }
              ])}
            </div>
            <div style="margin-top: 20px;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 15px; color: #1f2937; text-align: center;">Legenda</div>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${(() => {
                  const pieData = [
                    { name: 'Zakup', value: parseFloat(resultData.koszt_zakupu_brutto) || 0 },
                    { name: 'Remont', value: parseFloat(resultData.koszt_remontu_calkowity) || 0 },
                    { name: 'Utrzymanie', value: parseFloat(resultData.koszty_utrzymania) || 0 },
                    { name: 'Finansowanie', value: parseFloat(resultData.koszty_finansowania) || 0 },
                    { name: 'Sprzedaż', value: parseFloat(resultData.koszty_sprzedazy) || 0 }
                  ];
                  const total = pieData.reduce((sum, item) => sum + item.value, 0);
                  const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                  
                  return pieData.map((item, index) => {
                    const percent = total > 0 ? (item.value / total) * 100 : 0;
                    const color = colors[index];
                    return `
                      <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: white; border-radius: 6px; border-left: 4px solid ${color}; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-width: 180px;">
                        <span style="color: ${color}; font-size: 18px; font-weight: bold;">■</span>
                        <div>
                          <div style="font-size: 13px; font-weight: bold; color: #1f2937;">${item.name}</div>
                          <div style="font-size: 12px; color: #6b7280;">${item.value.toLocaleString('pl-PL')} zł (${percent.toFixed(0)}%)</div>
                        </div>
                      </div>
                    `;
                  }).join('');
                })()}
              </div>
            </div>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Koszty vs przychód i zysk</h3>
            <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb;">
              ${generateBarChartSVG([
                {
                  name: 'Koszty',
                  zakup: parseFloat(resultData.koszt_zakupu_brutto) || 0,
                  remont: parseFloat(resultData.koszt_remontu_calkowity) || 0,
                  utrzymanie: parseFloat(resultData.koszty_utrzymania) || 0,
                  finansowanie: parseFloat(resultData.koszty_finansowania) || 0,
                  sprzedaz: parseFloat(resultData.koszty_sprzedazy) || 0,
                  przychod: 0,
                  zysk: 0
                },
                {
                  name: 'Przychód',
                  zakup: 0,
                  remont: 0,
                  utrzymanie: 0,
                  finansowanie: 0,
                  sprzedaz: 0,
                  przychod: (parseFloat(resultData.koszty_calkowite) || 0) + (parseFloat(resultData.zysk_brutto) || 0),
                  zysk: 0
                },
                {
                  name: 'Zysk netto',
                  zakup: 0,
                  remont: 0,
                  utrzymanie: 0,
                  finansowanie: 0,
                  sprzedaz: 0,
                  przychod: 0,
                  zysk: parseFloat(resultData.zysk_netto) || 0
                }
              ])}
            </div>
            <div style="margin-top: 15px;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #1f2937;">Legenda kategorii kosztów:</div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; max-width: 100%;">
                ${(() => {
                  const categories = [
                    { key: 'zakup', label: 'Zakup', color: '#2563EB', value: parseFloat(resultData.koszt_zakupu_brutto) || 0 },
                    { key: 'remont', label: 'Remont', color: '#10B981', value: parseFloat(resultData.koszt_remontu_calkowity) || 0 },
                    { key: 'utrzymanie', label: 'Utrzymanie', color: '#F59E0B', value: parseFloat(resultData.koszty_utrzymania) || 0 },
                    { key: 'finansowanie', label: 'Finansowanie', color: '#EF4444', value: parseFloat(resultData.koszty_finansowania) || 0 },
                    { key: 'sprzedaz', label: 'Sprzedaż', color: '#8B5CF6', value: parseFloat(resultData.koszty_sprzedazy) || 0 },
                    { key: 'przychod', label: 'Przychód', color: '#22C55E', value: (parseFloat(resultData.koszty_calkowite) || 0) + (parseFloat(resultData.zysk_brutto) || 0) },
                    { key: 'zysk', label: 'Zysk netto', color: '#F97316', value: parseFloat(resultData.zysk_netto) || 0 }
                  ];
                  
                  return categories.map(cat => `
                    <div style="display: flex; align-items: center; gap: 8px; padding: 6px; background: #f8fafc; border-radius: 4px; border-left: 3px solid ${cat.color};">
                      <span style="display: inline-block; width: 16px; height: 16px; background-color: ${cat.color}; border-radius: 3px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></span>
                      <div style="flex: 1;">
                        <div style="font-size: 12px; font-weight: bold; color: #1f2937;">${cat.label}</div>
                        <div style="font-size: 11px; color: #6b7280;">${cat.value.toLocaleString('pl-PL')} zł</div>
                      </div>
                    </div>
                  `).join('');
                })()}
              </div>
            </div>
          </div>
        ` : ''}

        ${calculation.calculation_type === 'purchase' ? `
          <div class="section-header">WYKRESY</div>
          
          <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Struktura kosztów zakupu</h3>
            <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb;">
              ${generatePieChartSVG([
                { name: 'Wartość nieruchomości', value: parseFloat(inputData.propertyValue) || 0 },
                { name: 'Podatek PCC', value: parseFloat(resultData.pccTax) || 0 },
                { name: 'Taksa notarialna', value: parseFloat(resultData.notaryFee) || 0 },
                { name: 'Prowizja bankowa', value: parseFloat(resultData.bankCommissionAmount) || 0 },
                { name: 'Prowizja agencji', value: parseFloat(resultData.agencyCommissionAmount) || 0 },
                { name: 'Opłaty sądowe', value: parseFloat(resultData.courtFees) || 0 }
              ])}
            </div>
            <div style="margin-top: 20px;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 15px; color: #1f2937; text-align: center;">Legenda</div>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${(() => {
                  const pieData = [
                    { name: 'Wartość nieruchomości', value: parseFloat(inputData.propertyValue) || 0 },
                    { name: 'Podatek PCC', value: parseFloat(resultData.pccTax) || 0 },
                    { name: 'Taksa notarialna', value: parseFloat(resultData.notaryFee) || 0 },
                    { name: 'Prowizja bankowa', value: parseFloat(resultData.bankCommissionAmount) || 0 },
                    { name: 'Prowizja agencji', value: parseFloat(resultData.agencyCommissionAmount) || 0 },
                    { name: 'Opłaty sądowe', value: parseFloat(resultData.courtFees) || 0 }
                  ];
                  const total = pieData.reduce((sum, item) => sum + item.value, 0);
                  const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
                  
                  return pieData.map((item, index) => {
                    const percent = total > 0 ? (item.value / total) * 100 : 0;
                    const color = colors[index];
                    return `
                      <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: white; border-radius: 6px; border-left: 4px solid ${color}; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-width: 180px;">
                        <span style="color: ${color}; font-size: 18px; font-weight: bold;">■</span>
                        <div>
                          <div style="font-size: 13px; font-weight: bold; color: #1f2937;">${item.name}</div>
                          <div style="font-size: 12px; color: #6b7280;">${item.value.toLocaleString('pl-PL')} zł (${percent.toFixed(0)}%)</div>
                        </div>
                      </div>
                    `;
                  }).join('');
                })()}
              </div>
            </div>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Harmonogram spłat kredytu</h3>
            <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb;">
              ${generateLoanScheduleChartSVG(resultData.schedule || [])}
            </div>
          </div>
        ` : ''}

        ${calculation.calculation_type === 'rental' ? `
          <div class="section-header">WYKRESY</div>
          
          <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Struktura kosztów wynajmu</h3>
            <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb;">
              ${generatePieChartSVG([
                { name: 'Przychód z wynajmu', value: parseFloat(resultData.annualIncome) || 0 },
                { name: 'Koszty operacyjne', value: parseFloat(resultData.costBreakdown?.find(c => c.name === 'Koszty operacyjne')?.value) || 0 },
                { name: 'Podatek', value: parseFloat(resultData.taxAmount) || 0 },
                { name: 'Koszty zarządzania', value: parseFloat(resultData.costBreakdown?.find(c => c.name === 'Koszty zarządzania')?.value) || 0 },
                { name: 'Inne koszty', value: parseFloat(resultData.costBreakdown?.find(c => c.name === 'Inne koszty')?.value) || 0 }
              ])}
            </div>
            <div style="margin-top: 20px;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 15px; color: #1f2937; text-align: center;">Legenda</div>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${(() => {
                  const pieData = [
                    { name: 'Przychód z wynajmu', value: parseFloat(resultData.annualIncome) || 0 },
                    { name: 'Koszty operacyjne', value: parseFloat(resultData.costBreakdown?.find(c => c.name === 'Koszty operacyjne')?.value) || 0 },
                    { name: 'Podatek', value: parseFloat(resultData.taxAmount) || 0 },
                    { name: 'Koszty zarządzania', value: parseFloat(resultData.costBreakdown?.find(c => c.name === 'Koszty zarządzania')?.value) || 0 },
                    { name: 'Inne koszty', value: parseFloat(resultData.costBreakdown?.find(c => c.name === 'Inne koszty')?.value) || 0 }
                  ];
                  const total = pieData.reduce((sum, item) => sum + item.value, 0);
                  const colors = ['#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#6B7280'];
                  
                  return pieData.map((item, index) => {
                    const percent = total > 0 ? (item.value / total) * 100 : 0;
                    const color = colors[index];
                    return `
                      <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: white; border-radius: 6px; border-left: 4px solid ${color}; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-width: 180px;">
                        <span style="color: ${color}; font-size: 18px; font-weight: bold;">■</span>
                        <div>
                          <div style="font-size: 13px; font-weight: bold; color: #1f2937;">${item.name}</div>
                          <div style="font-size: 12px; color: #6b7280;">${item.value.toLocaleString('pl-PL')} zł (${percent.toFixed(0)}%)</div>
                        </div>
                      </div>
                    `;
                  }).join('');
                })()}
              </div>
            </div>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Przychody vs koszty</h3>
            <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb;">
              ${generateBarChartSVG([
                {
                  name: 'Przychody',
                  zakup: 0,
                  remont: 0,
                  utrzymanie: 0,
                  finansowanie: 0,
                  sprzedaz: 0,
                  przychod: parseFloat(resultData.annualIncome) || 0,
                  zysk: 0
                },
                {
                  name: 'Koszty',
                  zakup: 0,
                  remont: 0,
                  utrzymanie: parseFloat(resultData.costBreakdown?.find(c => c.name === 'Koszty operacyjne')?.value) || 0,
                  finansowanie: parseFloat(resultData.costBreakdown?.find(c => c.name === 'Koszty zarządzania')?.value) || 0,
                  sprzedaz: parseFloat(resultData.taxAmount) || 0,
                  przychod: 0,
                  zysk: 0
                },
                {
                  name: 'Zysk netto',
                  zakup: 0,
                  remont: 0,
                  utrzymanie: 0,
                  finansowanie: 0,
                  sprzedaz: 0,
                  przychod: 0,
                  zysk: parseFloat(resultData.netAnnualIncome) || 0
                }
              ])}
            </div>
          </div>
        ` : ''}

        ${calculation.calculation_type === 'valuation' ? `
          <div class="section-header">WYKRESY</div>
          
          <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Analiza wyceny</h3>
            <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb;">
              ${generateValuationChartSVG(resultData)}
            </div>
          </div>
        ` : ''}

        ${calculation.calculation_type === 'creditScore' ? `
          <div class="section-header">WYKRESY</div>
          
          <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Struktura budżetu</h3>
            <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb;">
              ${generateCreditScoreChartSVG(resultData)}
            </div>
          </div>
        ` : ''}

        <div class="footer">
          <span>Wygenerowano przez Kalkulatory Nieruchomości</span>
          <span>Data wygenerowania: ${new Date().toLocaleString('pl-PL')}</span>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${calculation.title || 'kalkulacja'}.html"`,
      },
    });

  } catch (error) {
    console.error('Błąd podczas generowania PDF:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera' }, { status: 500 });
  }
}
