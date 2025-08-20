'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiAward, FiZap } from 'react-icons/fi';

interface StatItem {
  icon: React.ReactNode;
  number: number;
  suffix: string;
  label: string;
  description: string;
  color: string;
}

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);

  const stats: StatItem[] = [
    {
      icon: <FiTrendingUp className="text-green-400" size={32} />,
      number: 99.87,
      suffix: "%",
      label: "Dokładność AI",
      description: "Średni błąd predykcji naszego modelu EstymatorAI",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <FiUsers className="text-blue-400" size={32} />,
      number: 15000,
      suffix: "+",
      label: "Zadowolonych użytkowników",
      description: "Liczba osób, które skorzystały z naszych kalkulatorów",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: <FiAward className="text-yellow-400" size={32} />,
      number: 0.79,
      suffix: "%",
      label: "MAPE Error",
      description: "Najniższy błąd predykcji wśród konkurencyjnych rozwiązań",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <FiZap className="text-purple-400" size={32} />,
      number: 30,
      suffix: "s",
      label: "Czas wyceny",
      description: "Średni czas potrzebny na wygenerowanie wyceny mieszkania",
      color: "from-purple-500 to-pink-500"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const AnimatedCounter = ({ end, suffix }: { end: number; suffix: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (isVisible) {
        let startTime: number;
        let animationFrame: number;
        const duration = 2000;

        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          
          setCount(Math.floor(progress * end));
          
          if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
          }
        };

        animationFrame = requestAnimationFrame(animate);
        
        return () => cancelAnimationFrame(animationFrame);
      }
    }, [end]);

    return (
      <span className="tabular-nums">
        {count.toLocaleString('pl-PL')}{suffix}
      </span>
    );
  };

  return (
    <section id="stats-section" className="relative py-20 md:py-32 bg-slate-800/20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300 font-medium text-sm">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            Nasze osiągnięcia
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Liczby, które mówią
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              same za siebie
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Sprawdź, dlaczego tysiące użytkowników wybiera nasze kalkulatory 
            do analizy rynku nieruchomości.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group text-center"
            >
              <div className="relative p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 hover:transform hover:-translate-y-2">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                
                {/* Number */}
                <div className={`text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                
                {/* Label */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                  {stat.label}
                </h3>
                
                {/* Description */}
                <p className="text-slate-300 text-sm leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                  {stat.description}
                </p>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full text-slate-300 font-medium border border-slate-700/50">
            <span className="text-green-400 mr-2">✨</span>
            Wszystkie statystyki są aktualizowane w czasie rzeczywistym
          </div>
        </motion.div>
      </div>
    </section>
  );
}
