'use client';

import { useState } from 'react';
import { FiPlus, FiMinus, FiHelpCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      question: "Jak dokładne są wyceny generowane przez AI?",
      answer: "Nasz model EstymatorAI osiąga dokładność 0.79% MAPE (Mean Absolute Percentage Error), co oznacza, że średni błąd predykcji wynosi mniej niż 1%. To jeden z najdokładniejszych modeli AI w Polsce.",
      category: "ai"
    },
    {
      question: "Czy muszę się rejestrować, aby korzystać z kalkulatorów?",
      answer: "Nie! Wszystkie nasze kalkulatory są w pełni darmowe i nie wymagają rejestracji ani podania danych osobowych. Możesz korzystać z nich od razu.",
      category: "usage"
    },
    {
      question: "Jakie dane są potrzebne do wyceny mieszkania?",
      answer: "Do podstawowej wyceny potrzebujemy: powierzchnię, liczbę pokoi, piętro, rok budowy, lokalizację (miasto/dzielnica) oraz typ budynku. Im więcej szczegółów podasz, tym dokładniejsza będzie wycena.",
      category: "ai"
    },
    {
      question: "Czy kalkulatory uwzględniają aktualne ceny rynkowe?",
      answer: "Tak! Nasze modele są regularnie aktualizowane o najnowsze dane rynkowe. Baza treningowa zawiera ponad 7000 aktualnych ofert z całej Polski.",
      category: "data"
    },
    {
      question: "Jak długo trwa generowanie wyceny?",
      answer: "Wycena jest generowana w ciągu 30 sekund. Nasz system AI przetwarza dane w czasie rzeczywistym i wykorzystuje zaawansowane algorytmy do szybkiej analizy.",
      category: "ai"
    },
    {
      question: "Czy mogę eksportować wyniki do PDF?",
      answer: "Tak! Wszystkie wyniki kalkulacji można eksportować do formatu PDF z profesjonalnym layoutem. To idealne rozwiązanie do prezentacji lub archiwizacji.",
      category: "usage"
    },
    {
      question: "Jakie są koszty korzystania z platformy?",
      answer: "Platforma jest w 100% darmowa. Nie pobieramy opłat za żadne funkcje, nie ma ukrytych kosztów ani limitów użycia. Naszym celem jest demokratyzacja dostępu do profesjonalnych narzędzi.",
      category: "pricing"
    },
    {
      question: "Czy moje dane są bezpieczne?",
      answer: "Absolutnie! Wszystkie dane są szyfrowane, nie są przechowywane na naszych serwerach i nigdy nie są udostępniane osobom trzecim. Stosujemy najwyższe standardy bezpieczeństwa.",
      category: "security"
    },
    {
      question: "Jak często aktualizujecie modele AI?",
      answer: "Modele są aktualizowane co miesiąc o nowe dane rynkowe. To zapewnia, że wyceny zawsze odzwierciedlają aktualną sytuację na rynku nieruchomości.",
      category: "ai"
    },
    {
      question: "Czy oferujecie wsparcie techniczne?",
      answer: "Tak! Oferujemy darmowe wsparcie techniczne przez email i chat. Nasz zespół ekspertów jest dostępny 24/7, aby pomóc w rozwiązaniu wszelkich problemów.",
      category: "support"
    }
  ];

  const categories = [
    { id: 'all', name: 'Wszystkie', count: faqs.length },
    { id: 'ai', name: 'AI & Technologia', count: faqs.filter(f => f.category === 'ai').length },
    { id: 'usage', name: 'Użytkowanie', count: faqs.filter(f => f.category === 'usage').length },
    { id: 'data', name: 'Dane & Aktualizacje', count: faqs.filter(f => f.category === 'data').length },
    { id: 'pricing', name: 'Cennik', count: faqs.filter(f => f.category === 'pricing').length },
    { id: 'security', name: 'Bezpieczeństwo', count: faqs.filter(f => f.category === 'security').length },
    { id: 'support', name: 'Wsparcie', count: faqs.filter(f => f.category === 'support').length }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="relative py-20 md:py-32 bg-slate-800/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300 font-medium text-sm">
            <FiHelpCircle className="text-blue-400 mr-2" size={16} />
            Często zadawane pytania
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Masz pytania?
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Mamy odpowiedzi!
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące naszej platformy, 
            technologii AI i procesu wyceny nieruchomości.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-700/50'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors duration-300"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openItems.includes(index) ? (
                      <FiMinus className="text-blue-400" size={20} />
                    ) : (
                      <FiPlus className="text-slate-400" size={20} />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6">
                        <p className="text-slate-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full text-slate-300 font-medium border border-slate-700/50">
            <span className="text-blue-400 mr-2">💬</span>
            Nie znalazłeś odpowiedzi? Skontaktuj się z nami!
          </div>
        </motion.div>
      </div>
    </section>
  );
}
