import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  ...defaultMeta,
  title: 'Logowanie Administratora - Panel Admin | Analityka Nieruchomości',
  description: 'Logowanie do panelu administratora kalkulatorów nieruchomości. Dostęp do zarządzania blogiem i treściami.',
  keywords: [
    'logowanie administratora',
    'panel admin',
    'zarządzanie blogiem',
    'administracja',
    'dostęp admin',
    'panel administratora',
    'kalkulator kredytu hipotecznego',
    'kalkulator zdolności kredytowej',
    'zdolność kredytowa kalkulator',
    'oblicz zdolność kredytową',
    'symulacja kredytu hipotecznego',
    'kalkulator kredytu mieszkaniowego',
    'rata kredytu hipotecznego',
    'kalkulator RRSO',
    'kredyt hipoteczny kalkulator',
    'kredyt na mieszkanie kalkulator',
    'oprocentowanie kredytu hipotecznego',
    'koszt kredytu hipotecznego',
    'porównanie ofert kredytowych',
    'kredyt hipoteczny rata',
    'wkład własny kalkulator',
    'kalkulator prowizji bankowej',
    'kredyt mieszkaniowy warunki',
    'najlepszy kredyt hipoteczny',
    'kredyt dla młodych kalkulator',
    'ile kosztuje kredyt na mieszkanie',
    'jaki kredyt hipoteczny wybrać',
    'kredyt hipoteczny bez wkładu własnego',
    'kredyt mieszkaniowy dla singla',
    'refinansowanie kredytu hipotecznego',
    'przedterminowa spłata kredytu kalkulator',
    'kredyt hipoteczny w CHF kalkulator',
    'kredyt gotówkowy czy hipoteczny',
    'kredyt na dom z działką',
    'ubezpieczenie kredytu hipotecznego koszt',
    'banki kredyt hipoteczny porównanie',
    'kredyt hipoteczny PKO kalkulator',
    'mBank kredyt hipoteczny warunki',
    'ING kredyt mieszkaniowy oprocentowanie',
    'Santander kredyt hipoteczny opinie',
    'kredyt hipoteczny dla firm',
    'kredyt na nieruchomość inwestycyjną',
    'kredyt mieszkaniowy dla bezrobotnych',
    'kredyt hipoteczny senior',
    'kredyt mieszkaniowy rodzina 3+',
    'wycena nieruchomości online',
    'kalkulator wyceny mieszkania',
    'rentowność wynajmu',
    'kalkulator wynajmu',
    'kalkulator zakupu nieruchomości',
    'nieruchomości kalkulator kosztów',
    'podatek od nieruchomości kalkulator',
    'koszt notariusza przy kredycie',
    'ubezpieczenie nieruchomości kalkulator',
    'opłaty dodatkowe kredyt hipoteczny',
    'marża kredytu hipotecznego',
    'WIBOR aktualne stawki',
    'rejestr zabezpieczeń koszt',
    'kredyt hipoteczny dokumenty wymagane'
  ],
  alternates: {
    canonical: `${baseUrl}/login`,
  },
  openGraph: {
    ...defaultMeta.openGraph,
    title: 'Logowanie Administratora - Panel Admin',
    description: 'Logowanie do panelu administratora kalkulatorów nieruchomości.',
    url: `${baseUrl}/login`,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 