import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'
import ContactFormWrapper from '@/components/ContactFormWrapper'

export const metadata: Metadata = {
  ...defaultMeta,
  title: 'Kontakt',
  description: 'Skontaktuj się z nami – chętnie odpowiemy na wszystkie pytania dotyczące naszych kalkulatorów i treści.'
}

export default function KontaktPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return (
    <section className="container mx-auto p-4 md:p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Kontakt</h1>
      <p className="mb-4 text-gray-700">Masz pytania lub sugestie? Skontaktuj się z nami, korzystając z poniższych danych lub formularza. Odpowiadamy zwykle w ciągu 24 godzin.</p>

      <div className="space-y-4 mb-12">
        <div>
          <h2 className="text-xl font-semibold">Email</h2>
          <a href="mailto:kontakt@kalkulatorynieruchomosci.pl" className="text-blue-600 hover:underline">kontakt@kalkulatorynieruchomosci.pl</a>
        </div>
        {/* <div>
          <h2 className="text-xl font-semibold">Telefon</h2>
          <a href="tel:+48123456789" className="text-blue-600 hover:underline">+48 123 456 789</a>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Adres korespondencyjny</h2>
          <address className="not-italic text-gray-700">
            Ul. Przykładowa 1/2<br />
            00-000 Warszawa
          </address>
        </div> */}
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Formularz kontaktowy</h2>
      <ContactFormWrapper />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            url: `${baseUrl}/kontakt`,
            contactPoint: [{
              '@type': 'ContactPoint',
              telephone: '+48-123-456-789',
              contactType: 'customer support',
              email: 'kontakt@kalkulatorynieruchomosci.pl'
            }]
          })
        }}
      />
    </section>
  )
} 