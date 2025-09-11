import React from 'react'

export interface FaqItem {
  question: string
  answer: string
}

interface FaqSectionProps {
  title?: string
  items: FaqItem[]
  className?: string
}

export default function FaqSection({ title = 'Najczęstsze pytania (FAQ)', items, className = '' }: FaqSectionProps) {
  if (!items || items.length === 0) return null

  return (
    <section aria-label="FAQ" className={`mt-12 md:mt-16 ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">Odpowiedzi na najczęściej zadawane pytania dotyczące tego kalkulatora.</p>

        <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
          {items.map((item, idx) => (
            <details key={idx} className="group p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span className="text-base sm:text-lg font-semibold text-gray-900">{item.question}</span>
                <span className="text-gray-400 transition-transform group-open:rotate-180" aria-hidden>
                  ▼
                </span>
              </summary>
              <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-700">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}


