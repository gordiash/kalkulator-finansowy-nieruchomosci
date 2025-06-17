import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

export const metadata: Metadata = {
  ...defaultMeta,
  title: 'O nas',
  description: 'Poznaj nasz zespół i misję – dostarczamy przejrzyste narzędzia finansowe, które pomagają podejmować lepsze decyzje.'
}

export default function AboutPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return (
    <section className="container mx-auto p-4 md:p-8 max-w-3xl">
      

      <h2 className="text-2xl font-semibold mt-8 mb-4">Kilka słów od twórcy</h2>
      <p className="mb-4 text-gray-700 whitespace-pre-line">
        {`Cześć! Nazywam się Jarosław Jakubczyk i jestem twórcą oraz jedyną osobą stojącą za projektem KalkulatoryNieruchomosci.pl.

Od zawsze pasjonował mnie rynek nieruchomości – jego dynamika, złożoność i potencjał. Zauważyłem, jak wiele osób zmaga się z trudnościami w szybkim oszacowaniu kosztów związanych z zakupem, sprzedażą czy wynajmem nieruchomości, a także z analizą opłacalności inwestycji. Właśnie z tej potrzeby narodziła się idea stworzenia miejsca, które dostarczy intuicyjne i precyzyjne narzędzia do wspierania Twoich decyzji.

Moim celem jest, aby KalkulatoryNieruchomosci.pl stały się Twoim niezawodnym wsparciem w świecie nieruchomości. Staram się, aby każdy kalkulator był nie tylko łatwy w obsłudze, ale przede wszystkim dostarczał rzetelnych danych, które pomogą Ci lepiej zrozumieć finansowe aspekty każdej transakcji.

Rozumiem, że rynek nieruchomości bywa zawiły, dlatego z pełnym zaangażowaniem śledzę jego zmiany, aktualizuję dane i rozwijam nowe funkcjonalności, by sprostać Twoim oczekiwaniom. To projekt, w który wkładam całe serce i wiedzę, abyś Ty mógł podejmować świadome i korzystne decyzje.

Jeśli masz jakieś pytania, sugestie lub po prostu chcesz porozmawiać o nieruchomościach, śmiało napisz! Twoja opinia jest dla mnie niezwykle cenna.`}
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            url: `${baseUrl}/o-nas`,
            mainEntity: {
              '@type': 'Organization',
              name: 'Przykładowa Sp. z o.o.',
              url: baseUrl,
              sameAs: [baseUrl]
            }
          })
        }}
      />
    </section>
  )
} 