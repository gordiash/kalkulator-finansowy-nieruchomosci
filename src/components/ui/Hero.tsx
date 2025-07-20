'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiActivity, FiShield } from 'react-icons/fi';

const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

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
  }, [end, duration]);

  return <span className="tabular-nums">{count.toLocaleString('pl-PL')}{suffix}</span>;
};

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-success-400/5 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left column - Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-glassmorphism backdrop-blur-sm border border-primary-200/30 rounded-full text-primary-700 font-medium text-sm shadow-lg">
              <span className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></span>
              Najdokładniejsze wyceny w Polsce
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="text-gray-900">Centrum</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                  Analityki
                </span>
                <br />
                <span className="text-gray-900">Nieruchomości</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 font-light leading-relaxed max-w-2xl">
                Profesjonalne narzędzia analityczne z AI. 
                <span className="font-semibold text-primary-700"> Podejmij świadomą decyzję</span> 
                dzięki najdokładniejszym wycenom w Polsce.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 py-6">
              <div className="text-center">
                <div className="text-3xl font-black text-primary-600">
                  <AnimatedCounter end={99} suffix="%" />
                </div>
                <div className="text-sm text-gray-600 font-medium">Dokładność AI</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-success-600">
                  <AnimatedCounter end={15000} suffix="+" />
                </div>
                <div className="text-sm text-gray-600 font-medium">Wycen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-accent-600">
                  <AnimatedCounter end={0.13} suffix="%" />
                </div>
                <div className="text-sm text-gray-600 font-medium">MAPE Error</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/kalkulator-wyceny"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <FiDollarSign className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                Wycena z AI
                <div className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</div>
              </Link>
              
              <Link 
                href="/blog"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 text-gray-900 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <FiTrendingUp className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                Dowiedz się więcej
              </Link>
            </div>
          </div>

          {/* Right column - Interactive mockup */}
          <div className={`relative ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              {/* Mock calculator interface */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <div className="ml-auto text-sm font-medium text-gray-600">Kalkulator Wyceny</div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Lokalizacja</label>
                    <div className="h-12 bg-gray-100 rounded-xl flex items-center px-4 text-gray-600">
                      📍 Olsztyn, Centrum
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Powierzchnia</label>
                      <div className="h-12 bg-gray-100 rounded-xl flex items-center px-4 text-gray-600">
                        64 m²
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rok budowy</label>
                      <div className="h-12 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center px-4 text-gray-600 dark:text-gray-400">
                        2010
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-success-50 to-primary-50 dark:from-success-900/20 dark:to-primary-900/20 rounded-xl p-4 border border-success-200/50 dark:border-success-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Szacowana wartość</span>
                      <div className="flex items-center gap-2">
                        <FiShield className="text-success-600" size={16} />
                        <span className="text-xs text-success-600 font-medium">99.87% pewności</span>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                      <AnimatedCounter end={485000} suffix=" zł" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <AnimatedCounter end={7578} suffix=" zł/m²" />
                    </div>
                  </div>

                  <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
                    <FiActivity size={18} />
                    Oblicz wycenę
                  </button>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-3xl blur-xl -z-10 opacity-75"></div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-success-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold animate-bounce-slow">
              ✓
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-500 rounded-2xl shadow-lg flex items-center justify-center text-white animate-float">
              <FiTrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 