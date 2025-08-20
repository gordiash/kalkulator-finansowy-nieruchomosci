'use client';

import { FiZap, FiShield, FiTrendingUp, FiUsers, FiBarChart2, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  const features = [
    {
      icon: <FiZap className="text-yellow-400" size={24} />,
      title: "Szybka Wycena AI",
      description: "Otrzymaj wycenę mieszkania w ciągu 30 sekund dzięki zaawansowanemu modelowi EstymatorAI z dokładnością 0.79% MAPE.",
      gradient: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: <FiShield className="text-green-400" size={24} />,
      title: "Bezpieczeństwo Danych",
      description: "Twoje dane są chronione przez najnowsze standardy szyfrowania i nigdy nie są udostępniane osobom trzecim.",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: <FiTrendingUp className="text-blue-400" size={24} />,
      title: "Analiza Rynku",
      description: "Śledź zmiany cen na rynku nieruchomości w czasie rzeczywistym z pomocą zaawansowanych wykresów i statystyk.",
      gradient: "from-blue-500/20 to-indigo-500/20"
    },
    {
      icon: <FiUsers className="text-purple-400" size={24} />,
      title: "Wsparcie Ekspertów",
      description: "Dostęp do zespołu ekspertów ds. nieruchomości, którzy pomogą Ci w interpretacji wyników i podjęciu decyzji.",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <FiBarChart2 className="text-indigo-400" size={24} />,
      title: "Szczegółowe Raporty",
      description: "Generuj kompleksowe raporty PDF z analizą rynku, porównaniami cen i rekomendacjami inwestycyjnymi.",
      gradient: "from-indigo-500/20 to-blue-500/20"
    },
    {
      icon: <FiClock className="text-cyan-400" size={24} />,
      title: "Dostęp 24/7",
      description: "Korzystaj z platformy o każdej porze dnia i nocy - nasze serwery działają nieprzerwanie.",
      gradient: "from-cyan-500/20 to-blue-500/20"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
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
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            Kluczowe funkcje
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Dlaczego wybrać
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 ml-4">
              naszą platformę?
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Oferujemy kompleksowe rozwiązania, które łączą w sobie zaawansowaną technologię AI 
            z intuicyjnym interfejsem użytkownika.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl hover:border-slate-600/50 transition-all duration-500 hover:transform hover:-translate-y-2"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 mb-6 bg-slate-700/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                  {feature.description}
                </p>
                
                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full group-hover:w-full transition-all duration-500"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border border-blue-500/20">
            <span>Rozpocznij darmowe kalkulacje</span>
            <FiZap className="ml-3 h-5 w-5" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
