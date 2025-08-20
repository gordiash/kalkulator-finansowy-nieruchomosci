'use client';

import Link from 'next/link';
import { FiArrowRight, FiCheckCircle, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function CTASection() {
  const benefits = [
    "Bezpłatne kalkulacje bez limitów",
    "Dokładność AI 0.79% MAPE",
    "Wsparcie ekspertów 24/7",
    "Bezpieczeństwo danych gwarantowane",
    "Aktualne dane rynkowe",
    "Eksport wyników do PDF"
  ];

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-slate-800/50 to-slate-900/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300 font-medium text-sm">
              <FiStar className="text-yellow-400 mr-2" size={16} />
              Rozpocznij już dziś
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Gotowy na
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                profesjonalną analizę nieruchomości?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Dołącz do tysięcy zadowolonych inwestorów, którzy już odkryli 
              potęgę sztucznej inteligencji w wycenie nieruchomości.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
                Co otrzymujesz:
              </h3>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiCheckCircle className="text-green-400" size={20} />
                    </div>
                    <span className="text-slate-300 text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
              
              {/* Trust indicators */}
              <div className="mt-8 p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <FiStar className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Gwarancja jakości</div>
                    <div className="text-slate-400 text-sm">99.9% uptime</div>
                  </div>
                </div>
                <p className="text-slate-300 text-sm">
                  Nasze serwery działają nieprzerwanie, zapewniając dostęp do kalkulatorów 
                  o każdej porze dnia i nocy.
                </p>
              </div>
            </motion.div>

            {/* Right - CTA Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <FiStar className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Rozpocznij teraz
                  </h3>
                  <p className="text-slate-300">
                    Darmowe kalkulacje bez rejestracji
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <Link
                    href="/kalkulator-wyceny"
                    className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 group"
                  >
                    <span>Wycena AI - Darmowa</span>
                    <FiArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  
                  <Link
                    href="/kalkulator-zakupu-nieruchomosci"
                    className="w-full flex items-center justify-center px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300"
                  >
                    Kalkulator zakupu
                  </Link>
                  
                  <Link
                    href="/kalkulator-wynajmu"
                    className="w-full flex items-center justify-center px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300"
                  >
                    Kalkulator wynajmu
                  </Link>
                </div>

                <div className="text-center">
                  <p className="text-slate-400 text-sm">
                    💳 Nie wymagamy karty kredytowej
                  </p>
                  <p className="text-slate-400 text-sm">
                    🔒 Twoje dane są bezpieczne
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center px-8 py-4 bg-slate-800/50 backdrop-blur-sm rounded-full text-slate-300 font-medium border border-slate-700/50">
              <span className="text-green-400 mr-2">🚀</span>
              Dołącz do 15,000+ zadowolonych inwestorów
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
