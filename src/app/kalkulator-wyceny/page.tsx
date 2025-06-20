import { Suspense } from 'react'
import ValuationCalculator from '../../components/ValuationCalculator'

export const revalidate = 0

export default function ValuationPage() {
  return (
    <section className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Kalkulator Wyceny Mieszkania</h1>
      <Suspense fallback={<p className="text-center py-10">Ładowanie formularza…</p>}>
        <ValuationCalculator />
      </Suspense>
    </section>
  )
} 