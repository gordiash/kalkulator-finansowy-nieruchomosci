'use client'
import React, { useState } from 'react'
import { calculateFliper, type FliperInput, type FliperResult } from '@/lib/flipper'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatCurrencyShort } from '@/lib/utils'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ReferenceLine } from 'recharts'
import { Info, Calculator, TrendingUp, DollarSign, Home, Wrench, CreditCard, ShoppingCart } from 'lucide-react'

type NumericInputProps = {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  tooltip?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  error?: string | null
}

function NumericInput({ id, label, value, onChange, tooltip, placeholder, min, max, step, error }: NumericInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        {tooltip && (
          <div className="group relative">
            <Info className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
      <Input 
        id={id} 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min ?? 0}
        max={max}
        step={step ?? 0.01}
        inputMode="decimal"
        className={`w-full ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

type AmountPercentInputProps = {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  unit: 'amount' | 'percent'
  onUnitChange: (v: 'amount' | 'percent') => void
  tooltip?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  error?: string | null
}

function AmountPercentInput({ id, label, value, onChange, unit, onUnitChange, tooltip, placeholder, min, max, step, error }: AmountPercentInputProps) {
  const derivedMin = unit === 'percent' ? 0 : (min ?? 0)
  const derivedMax = unit === 'percent' ? 100 : max
  const derivedStep = unit === 'percent' ? 0.01 : (step ?? 0.01)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </Label>
          {tooltip && (
            <div className="group relative">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
        <Select value={unit} onValueChange={(v) => onUnitChange(v as 'amount' | 'percent')}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Jednostka" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="amount">PLN</SelectItem>
            <SelectItem value="percent">%</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input 
        id={id} 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={derivedMin}
        max={derivedMax}
        step={derivedStep}
        inputMode="decimal"
        className={`w-full ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

function toNum(v: string): number { return Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0 }

export default function FliperCalculator() {
  type FieldConfig = { decimals: number; min: number; max: number; maxIntegerDigits: number }
  const defaultAmountConfig: FieldConfig = { decimals: 2, min: 0, max: 1_000_000_000, maxIntegerDigits: 12 }
  const percentConfig: FieldConfig = { decimals: 2, min: 0, max: 100, maxIntegerDigits: 3 }
  const integerConfig = (min: number, max: number): FieldConfig => ({ decimals: 0, min, max, maxIntegerDigits: 4 })

  const fieldConfigs: Record<string, FieldConfig> = {
    // Miesiące / liczby całkowite
    czas_trwania_flipa: integerConfig(1, 60),
    okres_kredytowania: integerConfig(1, 360),
    // Procenty
    oprocentowanie_kredytu: percentConfig,
    stawka_podatku_od_zysku: percentConfig,
    // Pozostałe: kwoty (domyślne)
  }

  function sanitizeNumericInput(raw: string, cfg: FieldConfig): string {
    if (raw === '') return ''
    const replaced = raw.replace(',', '.')
    // usuń niedozwolone znaki, zostaw tylko cyfry i kropkę
    let filtered = ''
    let dotSeen = false
    for (const ch of replaced) {
      if (ch >= '0' && ch <= '9') {
        filtered += ch
      } else if (ch === '.' && !dotSeen && cfg.decimals > 0) {
        filtered += ch
        dotSeen = true
      }
    }
    if (filtered === '' || filtered === '.') return ''
    const [intPartRaw, decPartRaw = ''] = filtered.split('.')
    const intPart = intPartRaw.replace(/^0+(\d)/, '$1').slice(0, cfg.maxIntegerDigits)
    const decPart = cfg.decimals > 0 ? decPartRaw.slice(0, cfg.decimals) : ''
    const joined = decPart ? `${intPart || '0'}.${decPart}` : (intPart || '0')
    let num = parseFloat(joined)
    if (!Number.isFinite(num)) return ''
    // clamp do zakresu
    if (num < cfg.min) num = cfg.min
    if (num > cfg.max) num = cfg.max
    // formatuj z zachowaniem decimali użytkownika (nie wymuszamy stałej liczby miejsc)
    const [i2, d2] = num.toString().split('.')
    const i2c = i2.slice(0, cfg.maxIntegerDigits)
    const d2c = cfg.decimals > 0 && d2 ? d2.slice(0, cfg.decimals) : undefined
    return d2c != null ? `${i2c}.${d2c}` : i2c
  }

  function getConfig(name: string): FieldConfig {
    return fieldConfigs[name] ?? defaultAmountConfig
  }

  const [form, setForm] = useState<Record<string, string>>({
    // Zakup
    cena_zakupu: '400000', prowizja_posrednika_zakup: '0', podatek_PCC: '8000', taksa_notarialna: '3000',
    wpis_do_ksiegi_wieczystej: '200', oplata_za_wypis_aktow_notarialnych: '100', oplata_sadowa: '150',
    oplata_bankowa_za_przelew: '20', koszty_operatu_szacunkowego: '0', koszty_doradcy_kredytowego: '0',
    // Remont
    materialy_wykonczeniowe: '20000', materialy_instalacyjne: '5000', sprzet_AGD_RTV: '4000', meble: '5000',
    ekipa_remontowa: '25000', hydraulik: '2000', elektryk: '2000', stolarz: '3000', inne_uslugi_remontowe: '2000',
    projektant_wnetrz: '0', nadzor_budowlany: '0', wywoz_gruzu: '500', transport_materialow: '800',
    // Utrzymanie
    czynsz_administracyjny: '600', media_prad: '150', media_gaz: '100', media_woda: '120', internet: '60',
    ubezpieczenie_nieruchomosci: '30', podatek_od_nieruchomosci: '20', czas_trwania_flipa: '6',
    // Finansowanie
    typ_finansowania: 'gotówka', wysokosc_kredytu: '0', oprocentowanie_kredytu: '8', okres_kredytowania: '12',
    prowizja_bankowa: '0', ubezpieczenie_kredytu: '0', oplata_za_wczesniejsza_splate: '0',
    // Sprzedaż
    cena_sprzedazy: '520000', prowizja_posrednika_sprzedaz: '0', koszty_marketingu_fotograf: '500',
    koszty_marketingu_home_staging: '1000', koszty_marketingu_ogloszenia_online: '300', koszty_marketingu_inne_promocja: '200',
    oplata_notarialna_przy_sprzedazy: '300', inne_koszty_sprzedazy: '0',
    // Podatki
    stawka_podatku_od_zysku: '19', inne_podatki: '0',
  })

  const [units, setUnits] = useState({
    prowizja_posrednika_zakup: 'amount' as 'amount' | 'percent',
    podatek_PCC: 'amount' as 'amount' | 'percent',
    prowizja_bankowa: 'amount' as 'amount' | 'percent',
    prowizja_posrednika_sprzedaz: 'amount' as 'amount' | 'percent',
  })

  const [result, setResult] = useState<FliperResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  const updateUnit = (name: keyof typeof units) => (v: 'amount' | 'percent') => setUnits((p) => ({ ...p, [name]: v }))
  const updateRaw = (name: string) => (v: string) => setForm((p) => ({ ...p, [name]: v }))

  function validateField(name: string, value: string): string | null {
    const isCredit = form.typ_finansowania === 'kredyt'
    const num = value === '' ? NaN : parseFloat(value)
    const isEmpty = value === ''
    const required: string[] = ['cena_zakupu', 'cena_sprzedazy', 'czas_trwania_flipa']
    if (isCredit) required.push('wysokosc_kredytu', 'oprocentowanie_kredytu', 'okres_kredytowania')
    if (required.includes(name)) {
      if (isEmpty || !Number.isFinite(num)) return 'To pole jest wymagane.'
    }
    const unit = (name in units ? (units as Record<string, 'amount' | 'percent'>)[name] : undefined)
    const cfg = unit === 'percent' ? percentConfig : getConfig(name)
    if (!isEmpty && Number.isFinite(num)) {
      if (num < cfg.min) return `Wartość nie może być mniejsza niż ${cfg.min}.`
      if (cfg.max !== undefined && num > cfg.max) return `Wartość nie może być większa niż ${cfg.max}.`
    }
    return null
  }

  function hasAnyErrors(): boolean {
    return Object.values(errors).some((e) => !!e)
  }

  function hasMissingRequired(): boolean {
    const isCredit = form.typ_finansowania === 'kredyt'
    const required: string[] = ['cena_zakupu', 'cena_sprzedazy', 'czas_trwania_flipa']
    if (isCredit) required.push('wysokosc_kredytu', 'oprocentowanie_kredytu', 'okres_kredytowania')
    return required.some((f) => form[f] === '' || !Number.isFinite(parseFloat(form[f])))
  }

  const COST_LABELS: Record<string, string> = {
    zakup: 'Zakup',
    remont: 'Remont',
    utrzymanie: 'Utrzymanie',
    finansowanie: 'Finansowanie',
    sprzedaz: 'Sprzedaż',
  }
  const COST_COLORS: Record<keyof typeof COST_LABELS, string> = {
    zakup: '#2563EB',
    remont: '#10B981',
    utrzymanie: '#F59E0B',
    finansowanie: '#EF4444',
    sprzedaz: '#8B5CF6',
  }

  type TooltipProps = { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string; payload?: unknown }>; label?: string }
  function CustomTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload || payload.length === 0) return null
    const data = (payload[0]?.payload as unknown) as Record<string, number>
    const rows: Array<{ key: string; label: string; value: number; color?: string }> = []
    // Pokaż rozbicie kosztów jeśli to pierwszy słupek
    if (label?.startsWith('Koszty')) {
      ;(['zakup', 'remont', 'utrzymanie', 'finansowanie', 'sprzedaz'] as const).forEach((k) => {
        const val = Number(data?.[k] ?? 0)
        if (val > 0) rows.push({ key: k, label: COST_LABELS[k], value: val, color: COST_COLORS[k] })
      })
    } else if (label?.startsWith('Przychód')) {
      rows.push({ key: 'przychod', label: 'Przychód (sprzedaż)', value: Number(data?.przychod ?? 0), color: '#0EA5E9' })
    } else if (label?.startsWith('Zysk')) {
      rows.push({ key: 'zysk', label: 'Zysk netto', value: Number(data?.zysk ?? 0), color: Number(data?.zysk ?? 0) >= 0 ? '#22C55E' : '#EF4444' })
    }
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="mb-1 text-xs font-medium text-slate-600">{label}</div>
        <div className="space-y-1">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center gap-2 text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: r.color }} />
              <span className="text-slate-700">{r.label}:</span>
              <span className="font-semibold">{formatCurrency(r.value)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleInputChange = (name: string) => (raw: string) => {
    const unit = (name in units ? (units as Record<string, 'amount' | 'percent'>)[name] : undefined)
    const cfg = unit === 'percent' ? percentConfig : getConfig(name)
    const sanitized = sanitizeNumericInput(raw, cfg)
    setForm((prev) => ({ ...prev, [name]: sanitized }))
    const err = validateField(name, sanitized)
    setErrors((prev) => ({ ...prev, [name]: err }))
  }

  const handleCalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      const cenaZakupu = toNum(form.cena_zakupu)
      const cenaSprzedazy = toNum(form.cena_sprzedazy)
      const wysokoscKredytu = toNum(form.wysokosc_kredytu)

      const prowizjaPosrednikaZakupAmt = units.prowizja_posrednika_zakup === 'percent'
        ? (cenaZakupu * toNum(form.prowizja_posrednika_zakup)) / 100
        : toNum(form.prowizja_posrednika_zakup)
      const podatekPccAmt = units.podatek_PCC === 'percent'
        ? (cenaZakupu * toNum(form.podatek_PCC)) / 100
        : toNum(form.podatek_PCC)
      const prowizjaBankowaAmt = units.prowizja_bankowa === 'percent'
        ? (wysokoscKredytu * toNum(form.prowizja_bankowa)) / 100
        : toNum(form.prowizja_bankowa)
      const prowizjaPosrednikaSprzedazAmt = units.prowizja_posrednika_sprzedaz === 'percent'
        ? (cenaSprzedazy * toNum(form.prowizja_posrednika_sprzedaz)) / 100
        : toNum(form.prowizja_posrednika_sprzedaz)

      const payload: FliperInput = {
        cena_zakupu: cenaZakupu,
        prowizja_posrednika_zakup: prowizjaPosrednikaZakupAmt,
        podatek_PCC: podatekPccAmt, taksa_notarialna: toNum(form.taksa_notarialna),
        wpis_do_ksiegi_wieczystej: toNum(form.wpis_do_ksiegi_wieczystej),
        oplata_za_wypis_aktow_notarialnych: toNum(form.oplata_za_wypis_aktow_notarialnych),
        oplata_sadowa: toNum(form.oplata_sadowa), oplata_bankowa_za_przelew: toNum(form.oplata_bankowa_za_przelew),
        koszty_operatu_szacunkowego: toNum(form.koszty_operatu_szacunkowego), koszty_doradcy_kredytowego: toNum(form.koszty_doradcy_kredytowego),
        materialy_wykonczeniowe: toNum(form.materialy_wykonczeniowe), materialy_instalacyjne: toNum(form.materialy_instalacyjne),
        sprzet_AGD_RTV: toNum(form.sprzet_AGD_RTV), meble: toNum(form.meble), ekipa_remontowa: toNum(form.ekipa_remontowa),
        hydraulik: toNum(form.hydraulik), elektryk: toNum(form.elektryk), stolarz: toNum(form.stolarz), inne_uslugi_remontowe: toNum(form.inne_uslugi_remontowe),
        projektant_wnetrz: toNum(form.projektant_wnetrz), nadzor_budowlany: toNum(form.nadzor_budowlany), wywoz_gruzu: toNum(form.wywoz_gruzu), transport_materialow: toNum(form.transport_materialow),
        czynsz_administracyjny: toNum(form.czynsz_administracyjny), media_prad: toNum(form.media_prad), media_gaz: toNum(form.media_gaz), media_woda: toNum(form.media_woda),
        internet: toNum(form.internet), ubezpieczenie_nieruchomosci: toNum(form.ubezpieczenie_nieruchomosci), podatek_od_nieruchomosci: toNum(form.podatek_od_nieruchomosci), czas_trwania_flipa: toNum(form.czas_trwania_flipa),
        typ_finansowania: (form.typ_finansowania as 'gotówka' | 'kredyt'), wysokosc_kredytu: toNum(form.wysokosc_kredytu), oprocentowanie_kredytu: toNum(form.oprocentowanie_kredytu), okres_kredytowania: toNum(form.okres_kredytowania),
        prowizja_bankowa: prowizjaBankowaAmt, ubezpieczenie_kredytu: toNum(form.ubezpieczenie_kredytu), oplata_za_wczesniejsza_splate: toNum(form.oplata_za_wczesniejsza_splate),
        cena_sprzedazy: cenaSprzedazy, prowizja_posrednika_sprzedaz: prowizjaPosrednikaSprzedazAmt,
        koszty_marketingu_fotograf: toNum(form.koszty_marketingu_fotograf), koszty_marketingu_home_staging: toNum(form.koszty_marketingu_home_staging), koszty_marketingu_ogloszenia_online: toNum(form.koszty_marketingu_ogloszenia_online), koszty_marketingu_inne_promocja: toNum(form.koszty_marketingu_inne_promocja),
        oplata_notarialna_przy_sprzedazy: toNum(form.oplata_notarialna_przy_sprzedazy), inne_koszty_sprzedazy: toNum(form.inne_koszty_sprzedazy),
        stawka_podatku_od_zysku: toNum(form.stawka_podatku_od_zysku), inne_podatki: toNum(form.inne_podatki),
      }
      setResult(calculateFliper(payload))
      setIsCalculating(false)
    }, 500)
  }

  return (
    <div className="space-y-8">
      {(() => {
        const fieldLabels: Record<string, string> = {
          cena_zakupu: 'Cena zakupu',
          prowizja_posrednika_zakup: 'Prowizja pośrednika (zakup)',
          podatek_PCC: 'Podatek PCC',
          taksa_notarialna: 'Taksa notarialna',
          wpis_do_ksiegi_wieczystej: 'Wpis do księgi wieczystej',
          oplata_za_wypis_aktow_notarialnych: 'Wypis aktów notarialnych',
          oplata_sadowa: 'Opłata sądowa',
          oplata_bankowa_za_przelew: 'Opłata bankowa za przelew',
          koszty_operatu_szacunkowego: 'Operat szacunkowy',
          koszty_doradcy_kredytowego: 'Doradca kredytowy',
          materialy_wykonczeniowe: 'Materiały wykończeniowe',
          materialy_instalacyjne: 'Materiały instalacyjne',
          sprzet_AGD_RTV: 'Sprzęt AGD/RTV',
          meble: 'Meble',
          ekipa_remontowa: 'Ekipa remontowa',
          hydraulik: 'Hydraulik',
          elektryk: 'Elektryk',
          stolarz: 'Stolarz',
          inne_uslugi_remontowe: 'Inne usługi remontowe',
          projektant_wnetrz: 'Projektant wnętrz',
          nadzor_budowlany: 'Nadzór budowlany',
          wywoz_gruzu: 'Wywóz gruzu',
          transport_materialow: 'Transport materiałów',
          czynsz_administracyjny: 'Czynsz administracyjny',
          media_prad: 'Prąd',
          media_gaz: 'Gaz',
          media_woda: 'Woda',
          internet: 'Internet',
          ubezpieczenie_nieruchomosci: 'Ubezpieczenie',
          podatek_od_nieruchomosci: 'Podatek od nieruchomości',
          czas_trwania_flipa: 'Czas trwania flipa',
          wysokosc_kredytu: 'Kwota kredytu',
          oprocentowanie_kredytu: 'Oprocentowanie kredytu',
          okres_kredytowania: 'Okres kredytowania',
          prowizja_bankowa: 'Prowizja bankowa',
          ubezpieczenie_kredytu: 'Ubezpieczenie kredytu',
          oplata_za_wczesniejsza_splate: 'Opłata za wcześniejszą spłatę',
          cena_sprzedazy: 'Cena sprzedaży',
          prowizja_posrednika_sprzedaz: 'Prowizja pośrednika (sprzedaż)',
          koszty_marketingu_fotograf: 'Marketing: fotograf',
          koszty_marketingu_home_staging: 'Marketing: home staging',
          koszty_marketingu_ogloszenia_online: 'Marketing: ogłoszenia online',
          koszty_marketingu_inne_promocja: 'Marketing: inne/promocja',
          oplata_notarialna_przy_sprzedazy: 'Opłata notarialna przy sprzedaży',
          inne_koszty_sprzedazy: 'Inne koszty sprzedaży',
          stawka_podatku_od_zysku: 'Stawka podatku od zysku',
          inne_podatki: 'Inne podatki',
        }
        const isCredit = form.typ_finansowania === 'kredyt'
        const required: string[] = ['cena_zakupu', 'cena_sprzedazy', 'czas_trwania_flipa']
        if (isCredit) required.push('wysokosc_kredytu', 'oprocentowanie_kredytu', 'okres_kredytowania')
        const missing = required.filter((f) => form[f] === '' || !Number.isFinite(parseFloat(form[f])))
        const invalid = Object.entries(errors).filter(([_, v]) => !!v).map(([k]) => k)
        const issues = [...new Set([...missing, ...invalid])]
        if (issues.length === 0) return null
        const preview = issues.slice(0, 8).map((k) => fieldLabels[k] ?? k)
        return (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-semibold">Formularz zawiera błędy. Proszę uzupełnić/poprawić zaznaczone pola.</p>
            <p className="mt-1 text-sm">Problematyczne pola: {preview.join(', ')}{issues.length > 8 ? ' …' : ''}</p>
          </div>
        )
      })()}
      {/* Sekcja wprowadzania danych */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Koszty zakupu */}
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="bg-blue-50 border-b border-blue-200">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Home className="h-5 w-5" />
              Koszty zakupu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <NumericInput 
              id="cena_zakupu" 
              label="Cena zakupu (PLN)" 
              value={form.cena_zakupu} 
              onChange={handleInputChange('cena_zakupu')}
              tooltip="Cena nieruchomości przed remontem"
              placeholder="400000"
              error={errors.cena_zakupu}
            />
            <AmountPercentInput
              id="podatek_PCC"
              label="Podatek PCC"
              value={form.podatek_PCC}
              onChange={handleInputChange('podatek_PCC')}
              unit={units.podatek_PCC}
              onUnitChange={updateUnit('podatek_PCC')}
              tooltip="Podatek od czynności cywilnoprawnych (PLN lub %)"
              placeholder="8000"
              step={0.01}
            />
            <NumericInput 
              id="taksa_notarialna" 
              label="Taksa notarialna (PLN)" 
              value={form.taksa_notarialna} 
              onChange={handleInputChange('taksa_notarialna')}
              tooltip="Koszty notarialne przy zakupie"
              placeholder="3000"
              error={errors.taksa_notarialna}
            />
            <AmountPercentInput
              id="prowizja_posrednika_zakup"
              label="Prowizja pośrednika (zakup)"
              value={form.prowizja_posrednika_zakup}
              onChange={handleInputChange('prowizja_posrednika_zakup')}
              unit={units.prowizja_posrednika_zakup}
              onUnitChange={updateUnit('prowizja_posrednika_zakup')}
              tooltip="Prowizja agencji nieruchomości przy zakupie (PLN lub %)"
              placeholder="0"
              step={0.01}
              error={errors.prowizja_posrednika_zakup}
            />
            <NumericInput 
              id="wpis_do_ksiegi_wieczystej" 
              label="Wpis do księgi wieczystej (PLN)" 
              value={form.wpis_do_ksiegi_wieczystej} 
              onChange={handleInputChange('wpis_do_ksiegi_wieczystej')}
              placeholder="200"
              error={errors.wpis_do_ksiegi_wieczystej}
            />
            <NumericInput 
              id="oplata_za_wypis_aktow_notarialnych" 
              label="Wypis aktów notarialnych (PLN)" 
              value={form.oplata_za_wypis_aktow_notarialnych} 
              onChange={handleInputChange('oplata_za_wypis_aktow_notarialnych')}
              placeholder="100"
              error={errors.oplata_za_wypis_aktow_notarialnych}
            />
            <NumericInput 
              id="oplata_sadowa" 
              label="Opłata sądowa (PLN)" 
              value={form.oplata_sadowa} 
              onChange={handleInputChange('oplata_sadowa')}
              placeholder="150"
              error={errors.oplata_sadowa}
            />
            <NumericInput 
              id="oplata_bankowa_za_przelew" 
              label="Opłata bankowa za przelew (PLN)" 
              value={form.oplata_bankowa_za_przelew} 
              onChange={handleInputChange('oplata_bankowa_za_przelew')}
              placeholder="20"
              error={errors.oplata_bankowa_za_przelew}
            />
            <NumericInput 
              id="koszty_operatu_szacunkowego" 
              label="Operat szacunkowy (PLN)" 
              value={form.koszty_operatu_szacunkowego} 
              onChange={handleInputChange('koszty_operatu_szacunkowego')}
              placeholder="0"
              error={errors.koszty_operatu_szacunkowego}
            />
            <NumericInput 
              id="koszty_doradcy_kredytowego" 
              label="Doradca kredytowy (PLN)" 
              value={form.koszty_doradcy_kredytowego} 
              onChange={handleInputChange('koszty_doradcy_kredytowego')}
              placeholder="0"
              error={errors.koszty_doradcy_kredytowego}
            />
          </CardContent>
        </Card>

        {/* Koszty remontu */}
        <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Wrench className="h-5 w-5" />
              Koszty remontu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <NumericInput 
              id="materialy_wykonczeniowe" 
              label="Materiały wykończeniowe (PLN)" 
              value={form.materialy_wykonczeniowe} 
              onChange={handleInputChange('materialy_wykonczeniowe')}
              tooltip="Materiały do wykończenia wnętrz"
              placeholder="20000"
              error={errors.materialy_wykonczeniowe}
            />
            <NumericInput 
              id="materialy_instalacyjne" 
              label="Materiały instalacyjne (PLN)" 
              value={form.materialy_instalacyjne} 
              onChange={handleInputChange('materialy_instalacyjne')}
              placeholder="5000"
              error={errors.materialy_instalacyjne}
            />
            <NumericInput 
              id="sprzet_AGD_RTV" 
              label="Sprzęt AGD/RTV (PLN)" 
              value={form.sprzet_AGD_RTV} 
              onChange={handleInputChange('sprzet_AGD_RTV')}
              placeholder="4000"
              error={errors.sprzet_AGD_RTV}
            />
            <NumericInput 
              id="meble" 
              label="Meble (PLN)" 
              value={form.meble} 
              onChange={handleInputChange('meble')}
              placeholder="5000"
              error={errors.meble}
            />
            <NumericInput 
              id="ekipa_remontowa" 
              label="Ekipa remontowa (PLN)" 
              value={form.ekipa_remontowa} 
              onChange={handleInputChange('ekipa_remontowa')}
              tooltip="Koszty robocizny"
              placeholder="25000"
              error={errors.ekipa_remontowa}
            />
            <NumericInput 
              id="hydraulik" 
              label="Hydraulik (PLN)" 
              value={form.hydraulik} 
              onChange={handleInputChange('hydraulik')}
              placeholder="2000"
              error={errors.hydraulik}
            />
            <NumericInput 
              id="elektryk" 
              label="Elektryk (PLN)" 
              value={form.elektryk} 
              onChange={handleInputChange('elektryk')}
              placeholder="2000"
              error={errors.elektryk}
            />
            <NumericInput 
              id="stolarz" 
              label="Stolarz (PLN)" 
              value={form.stolarz} 
              onChange={handleInputChange('stolarz')}
              placeholder="3000"
              error={errors.stolarz}
            />
            <NumericInput 
              id="inne_uslugi_remontowe" 
              label="Inne usługi remontowe (PLN)" 
              value={form.inne_uslugi_remontowe} 
              onChange={handleInputChange('inne_uslugi_remontowe')}
              tooltip="Dodatkowe usługi remontowe"
              placeholder="2000"
              error={errors.inne_uslugi_remontowe}
            />
            <NumericInput 
              id="projektant_wnetrz" 
              label="Projektant wnętrz (PLN)" 
              value={form.projektant_wnetrz} 
              onChange={handleInputChange('projektant_wnetrz')}
              placeholder="0"
              error={errors.projektant_wnetrz}
            />
            <NumericInput 
              id="nadzor_budowlany" 
              label="Nadzór budowlany (PLN)" 
              value={form.nadzor_budowlany} 
              onChange={handleInputChange('nadzor_budowlany')}
              placeholder="0"
              error={errors.nadzor_budowlany}
            />
            <NumericInput 
              id="wywoz_gruzu" 
              label="Wywóz gruzu (PLN)" 
              value={form.wywoz_gruzu} 
              onChange={handleInputChange('wywoz_gruzu')}
              placeholder="500"
              error={errors.wywoz_gruzu}
            />
            <NumericInput 
              id="transport_materialow" 
              label="Transport materiałów (PLN)" 
              value={form.transport_materialow} 
              onChange={handleInputChange('transport_materialow')}
              placeholder="800"
              error={errors.transport_materialow}
            />
          </CardContent>
        </Card>

        {/* Koszty utrzymania */}
        <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="bg-orange-50 border-b border-orange-200">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <DollarSign className="h-5 w-5" />
              Koszty utrzymania
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <NumericInput 
              id="czynsz_administracyjny" 
              label="Czynsz administracyjny (mies.)" 
              value={form.czynsz_administracyjny} 
              onChange={handleInputChange('czynsz_administracyjny')}
              tooltip="Miesięczny czynsz administracyjny"
              placeholder="600"
              error={errors.czynsz_administracyjny}
            />
            <NumericInput 
              id="media_prad" 
              label="Prąd (mies.)" 
              value={form.media_prad} 
              onChange={handleInputChange('media_prad')}
              tooltip="Miesięczne koszty prądu"
              placeholder="150"
              error={errors.media_prad}
            />
            <NumericInput 
              id="media_gaz" 
              label="Gaz (mies.)" 
              value={form.media_gaz} 
              onChange={handleInputChange('media_gaz')}
              placeholder="100"
              error={errors.media_gaz}
            />
            <NumericInput 
              id="media_woda" 
              label="Woda (mies.)" 
              value={form.media_woda} 
              onChange={handleInputChange('media_woda')}
              placeholder="120"
              error={errors.media_woda}
            />
            <NumericInput 
              id="internet" 
              label="Internet (mies.)" 
              value={form.internet} 
              onChange={handleInputChange('internet')}
              placeholder="60"
              error={errors.internet}
            />
            <NumericInput 
              id="ubezpieczenie_nieruchomosci" 
              label="Ubezpieczenie (mies.)" 
              value={form.ubezpieczenie_nieruchomosci} 
              onChange={handleInputChange('ubezpieczenie_nieruchomosci')}
              placeholder="30"
              error={errors.ubezpieczenie_nieruchomosci}
            />
            <NumericInput 
              id="podatek_od_nieruchomosci" 
              label="Podatek od nieruchomości (mies.)" 
              value={form.podatek_od_nieruchomosci} 
              onChange={handleInputChange('podatek_od_nieruchomosci')}
              placeholder="20"
              error={errors.podatek_od_nieruchomosci}
            />
            <NumericInput 
              id="czas_trwania_flipa" 
              label="Czas trwania flipa (miesiące)" 
              value={form.czas_trwania_flipa} 
              onChange={handleInputChange('czas_trwania_flipa')}
              tooltip="Przewidywany czas trwania inwestycji"
              placeholder="6"
              min={1}
              max={60}
              step={1}
              error={errors.czas_trwania_flipa}
            />
          </CardContent>
        </Card>

        {/* Finansowanie i sprzedaż */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="bg-purple-50 border-b border-purple-200">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <CreditCard className="h-5 w-5" />
              Finansowanie i sprzedaż
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Typ finansowania */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700">
                  Typ finansowania
                </Label>
                <div className="group relative">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Wybierz sposób finansowania inwestycji
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <Select value={form.typ_finansowania} onValueChange={updateRaw('typ_finansowania')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wybierz typ finansowania" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gotówka">Gotówka</SelectItem>
                  <SelectItem value="kredyt">Kredyt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pola kredytu - pokazuj tylko gdy wybrano kredyt */}
            {form.typ_finansowania === 'kredyt' && (
              <>
                  <NumericInput 
                  id="wysokosc_kredytu" 
                  label="Kwota kredytu (PLN)" 
                  value={form.wysokosc_kredytu} 
                    onChange={handleInputChange('wysokosc_kredytu')}
                  tooltip="Kwota kredytu do zaciągnięcia"
                  placeholder="200000"
                    error={errors.wysokosc_kredytu}
                />
                  <NumericInput 
                  id="oprocentowanie_kredytu" 
                  label="Oprocentowanie (% rocznie)" 
                  value={form.oprocentowanie_kredytu} 
                    onChange={handleInputChange('oprocentowanie_kredytu')}
                  tooltip="Roczne oprocentowanie kredytu"
                  placeholder="8"
                  min={0}
                  max={20}
                  step={0.1}
                    error={errors.oprocentowanie_kredytu}
                />
                  <NumericInput 
                  id="okres_kredytowania" 
                  label="Okres kredytowania (miesiące)" 
                  value={form.okres_kredytowania} 
                    onChange={handleInputChange('okres_kredytowania')}
                  tooltip="Okres kredytowania w miesiącach"
                  placeholder="12"
                  min={1}
                    max={360}
                    step={1}
                    error={errors.okres_kredytowania}
                />
                  <AmountPercentInput 
                    id="prowizja_bankowa" 
                    label="Prowizja bankowa"
                    value={form.prowizja_bankowa} 
                    onChange={handleInputChange('prowizja_bankowa')}
                    unit={units.prowizja_bankowa}
                    onUnitChange={updateUnit('prowizja_bankowa')}
                    tooltip="Prowizja banku (PLN lub % kwoty kredytu)"
                    placeholder="0"
                    step={0.01}
                    error={errors.prowizja_bankowa}
                  />
                  <NumericInput 
                  id="ubezpieczenie_kredytu" 
                  label="Ubezpieczenie kredytu (PLN)" 
                  value={form.ubezpieczenie_kredytu} 
                    onChange={handleInputChange('ubezpieczenie_kredytu')}
                  tooltip="Koszty ubezpieczenia kredytu"
                  placeholder="0"
                    error={errors.ubezpieczenie_kredytu}
                />
                  <NumericInput 
                    id="oplata_za_wczesniejsza_splate" 
                    label="Opłata za wcześniejszą spłatę (PLN)" 
                    value={form.oplata_za_wczesniejsza_splate} 
                    onChange={handleInputChange('oplata_za_wczesniejsza_splate')}
                    placeholder="0"
                    error={errors.oplata_za_wczesniejsza_splate}
                  />
              </>
            )}

            <NumericInput 
              id="cena_sprzedazy" 
              label="Cena sprzedaży (PLN)" 
              value={form.cena_sprzedazy} 
              onChange={handleInputChange('cena_sprzedazy')}
              tooltip="Przewidywana cena sprzedaży po remoncie"
              placeholder="520000"
              error={errors.cena_sprzedazy}
            />
            <AmountPercentInput 
              id="prowizja_posrednika_sprzedaz" 
              label="Prowizja pośrednika (sprzedaż)" 
              value={form.prowizja_posrednika_sprzedaz} 
              onChange={handleInputChange('prowizja_posrednika_sprzedaz')}
              unit={units.prowizja_posrednika_sprzedaz}
              onUnitChange={updateUnit('prowizja_posrednika_sprzedaz')}
              tooltip="Prowizja agencji przy sprzedaży (PLN lub % ceny sprzedaży)"
              placeholder="0"
              step={0.01}
              error={errors.prowizja_posrednika_sprzedaz}
            />
            <NumericInput 
              id="koszty_marketingu_fotograf" 
              label="Marketing: fotograf (PLN)" 
              value={form.koszty_marketingu_fotograf} 
              onChange={handleInputChange('koszty_marketingu_fotograf')}
              placeholder="500"
              error={errors.koszty_marketingu_fotograf}
            />
            <NumericInput 
              id="koszty_marketingu_home_staging" 
              label="Marketing: home staging (PLN)" 
              value={form.koszty_marketingu_home_staging} 
              onChange={handleInputChange('koszty_marketingu_home_staging')}
              placeholder="1000"
              error={errors.koszty_marketingu_home_staging}
            />
            <NumericInput 
              id="koszty_marketingu_ogloszenia_online" 
              label="Marketing: ogłoszenia online (PLN)" 
              value={form.koszty_marketingu_ogloszenia_online} 
              onChange={handleInputChange('koszty_marketingu_ogloszenia_online')}
              placeholder="300"
              error={errors.koszty_marketingu_ogloszenia_online}
            />
            <NumericInput 
              id="koszty_marketingu_inne_promocja" 
              label="Marketing: inne/promocja (PLN)" 
              value={form.koszty_marketingu_inne_promocja} 
              onChange={handleInputChange('koszty_marketingu_inne_promocja')}
              placeholder="200"
              error={errors.koszty_marketingu_inne_promocja}
            />
            <NumericInput 
              id="oplata_notarialna_przy_sprzedazy" 
              label="Opłata notarialna przy sprzedaży (PLN)" 
              value={form.oplata_notarialna_przy_sprzedazy} 
              onChange={handleInputChange('oplata_notarialna_przy_sprzedazy')}
              placeholder="300"
              error={errors.oplata_notarialna_przy_sprzedazy}
            />
            <NumericInput 
              id="inne_koszty_sprzedazy" 
              label="Inne koszty sprzedaży (PLN)" 
              value={form.inne_koszty_sprzedazy} 
              onChange={handleInputChange('inne_koszty_sprzedazy')}
              placeholder="0"
              error={errors.inne_koszty_sprzedazy}
            />
            <NumericInput 
              id="stawka_podatku_od_zysku" 
              label="Stawka podatku od zysku (%)" 
              value={form.stawka_podatku_od_zysku} 
              onChange={handleInputChange('stawka_podatku_od_zysku')}
              placeholder="19"
              step={0.1}
              min={0}
              max={99}
              error={errors.stawka_podatku_od_zysku}
            />
            <NumericInput 
              id="inne_podatki" 
              label="Inne podatki (PLN)" 
              value={form.inne_podatki} 
              onChange={handleInputChange('inne_podatki')}
              placeholder="0"
              error={errors.inne_podatki}
            />
          </CardContent>
        </Card>
      </div>

      {/* Przycisk obliczania */}
      <div className="flex justify-center">
        <Button 
          onClick={handleCalculate} 
          disabled={isCalculating || hasAnyErrors() || hasMissingRequired()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {isCalculating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Obliczam...
            </>
          ) : (
            <>
              <Calculator className="h-5 w-5 mr-2" />
              Oblicz opłacalność flipa
            </>
          )}
        </Button>
      </div>

      {/* Wyniki */}
      {result && (
        <div className="space-y-8">
          {/* Karty z wynikami */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {formatCurrency(result.koszty_calkowite)}
                </div>
                <div className="text-sm text-gray-600">Całkowite koszty</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(result.zysk_netto)}
                </div>
                <div className="text-sm text-gray-600">Zysk netto</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {result.ROI.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">ROI</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {formatCurrency(result.sredni_miesieczny_zysk_netto)}
                </div>
                <div className="text-sm text-gray-600">Zysk/miesiąc</div>
              </CardContent>
            </Card>
          </div>

          {/* Szczegółowe wyniki */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Szczegółowe wyniki
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Koszty zakupu:</span>
                  <span className="font-semibold">{formatCurrency(result.koszt_zakupu_brutto)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Koszty remontu:</span>
                  <span className="font-semibold">{formatCurrency(result.koszt_remontu_calkowity)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Koszty utrzymania:</span>
                  <span className="font-semibold">{formatCurrency(result.koszty_utrzymania)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Koszty finansowania:</span>
                  <span className="font-semibold">{formatCurrency(result.koszty_finansowania)}</span>
                </div>
                {result.miesieczna_rata_kredytu && (
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-blue-700 font-medium">Miesięczna rata kredytu:</span>
                    <span className="font-bold text-blue-700">{formatCurrency(result.miesieczna_rata_kredytu)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Koszty sprzedaży:</span>
                  <span className="font-semibold">{formatCurrency(result.koszty_sprzedazy)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Podatek:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(result.podatek)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-700 font-medium">Zysk brutto:</span>
                  <span className="font-bold text-blue-700">{formatCurrency(result.zysk_brutto)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-700 font-medium">Zysk netto:</span>
                  <span className="font-bold text-green-700">{formatCurrency(result.zysk_netto)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-purple-700 font-medium">ROI:</span>
                  <span className="font-bold text-purple-700">{result.ROI.toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wykresy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wykres kołowy: Struktura kosztów */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle>Struktura kosztów</CardTitle>
              </CardHeader>
              <CardContent className="h-[420px] p-6">
                <ResponsiveContainer width="100%" height={360}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Zakup', value: result.koszt_zakupu_brutto },
                        { name: 'Remont', value: result.koszt_remontu_calkowity },
                        { name: 'Utrzymanie', value: result.koszty_utrzymania },
                        { name: 'Finansowanie', value: result.koszty_finansowania },
                        { name: 'Sprzedaż', value: result.koszty_sprzedazy },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine
                      outerRadius={140}
                      dataKey="value"
                    >
                      <LabelList
                        position="outside"
                        offset={10}
                        className="fill-slate-800"
                        formatter={(value: unknown, idx?: number) => {
                          const d = [
                            { name: 'Zakup', value: result.koszt_zakupu_brutto },
                            { name: 'Remont', value: result.koszt_remontu_calkowity },
                            { name: 'Utrzymanie', value: result.koszty_utrzymania },
                            { name: 'Finansowanie', value: result.koszty_finansowania },
                            { name: 'Sprzedaż', value: result.koszty_sprzedazy },
                          ]
                          const total = d.reduce((s, x) => s + x.value, 0)
                          const index = typeof idx === 'number' ? idx : 0
                          const percent = total > 0 ? (d[index].value / total) * 100 : 0
                          if (percent < 3) return ''
                          return `${d[index].name}: ${percent.toFixed(0)}%`
                        }}
                      />
                      {(() => {
                        const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                        return [0,1,2,3,4].map((i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))
                      })()}
                    </Pie>
                    <RechartsTooltip formatter={(v: number) => [`${formatCurrency(v as number)}`, 'Kwota']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Wykres słupkowy: Koszty vs Przychód i Zysk */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle>Koszty vs przychód i zysk</CardTitle>
              </CardHeader>
              <CardContent className="h-[420px] p-6">
                <div className="mb-2 flex flex-wrap items-center gap-4 text-sm">
                  {(['zakup', 'remont', 'utrzymanie', 'finansowanie', 'sprzedaz'] as const).map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: COST_COLORS[k] }} />
                      <span className="text-slate-700">{COST_LABELS[k]}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={(() => {
                    const zakup = result.koszt_zakupu_brutto
                    const remont = result.koszt_remontu_calkowity
                    const utrzymanie = result.koszty_utrzymania
                    const finansowanie = result.koszty_finansowania
                    const sprzedaz = result.koszty_sprzedazy
                    const totalCosts = zakup + remont + utrzymanie + finansowanie + sprzedaz
                    const przychod = totalCosts + result.zysk_brutto
                    return [
                      { name: 'Koszty', zakup, remont, utrzymanie, finansowanie, sprzedaz, przychod: 0, zysk: 0 },
                      { name: 'Przychód (sprzedaż)', zakup: 0, remont: 0, utrzymanie: 0, finansowanie: 0, sprzedaz: 0, przychod, zysk: 0 },
                      { name: 'Zysk netto', zakup: 0, remont: 0, utrzymanie: 0, finansowanie: 0, sprzedaz: 0, przychod: 0, zysk: result.zysk_netto },
                    ]
                  })()} margin={{ top: 10, right: 20, left: 8, bottom: 28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={{ stroke: '#94A3B8' }} tickLine={{ stroke: '#94A3B8' }} />
                    <YAxis domain={[(dataMin: number) => (dataMin < 0 ? dataMin * 1.25 : 0), (dataMax: number) => (dataMax > 0 ? dataMax * 1.1 : 0)]} tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={{ stroke: '#94A3B8' }} tickLine={{ stroke: '#94A3B8' }} tickFormatter={(v) => formatCurrencyShort(v)} width={90} />
                    <ReferenceLine y={0} stroke="#94A3B8" />
                    <RechartsTooltip content={(props: unknown) => <CustomTooltip {...(props as TooltipProps)} />} />
                    {/* Stacked koszty */}
                    <Bar dataKey="zakup" stackId="koszty" fill="#2563EB" />
                    <Bar dataKey="remont" stackId="koszty" fill="#10B981" />
                    <Bar dataKey="utrzymanie" stackId="koszty" fill="#F59E0B" />
                    <Bar dataKey="finansowanie" stackId="koszty" fill="#EF4444" />
                    <Bar dataKey="sprzedaz" stackId="koszty" fill="#8B5CF6" />
                    {/* Przychód */}
                    <Bar dataKey="przychod" fill="#0EA5E9" radius={[6, 6, 0, 0]}>
                      <LabelList position="top" offset={8} formatter={(v: unknown) => formatCurrencyShort(v as number)} fill="#0f172a" />
                    </Bar>
                    {/* Zysk netto (kolor zależny od znaku) */}
                    <Bar dataKey="zysk" fill={result.zysk_netto >= 0 ? '#22C55E' : '#EF4444'} radius={[6, 6, 0, 0]}>
                      <LabelList content={(props) => {
                        const { x = 0, y = 0, width = 0, height = 0, value } = props as unknown as { x: number; y: number; width: number; height: number; value: number }
                        const val = typeof value === 'number' ? value : parseFloat(String(value))
                        const cx = x + width / 2
                        const cy = val >= 0 ? y - 8 : y + height + 14
                        return (
                          <text x={cx} y={cy} textAnchor="middle" fill="#0f172a" fontSize={12}>
                            {formatCurrencyShort(val)}
                          </text>
                        )
                      }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}


