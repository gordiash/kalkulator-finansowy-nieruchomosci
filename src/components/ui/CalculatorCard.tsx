'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface CalculatorCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  gradient?: string;
  badge?: string;
  badgeColor?: string;
}

const CalculatorCard = ({ 
  icon, 
  title, 
  description, 
  href, 
  gradient = "from-primary-500 to-accent-500",
  badge,
  badgeColor = "bg-primary-100 text-primary-700"
}: CalculatorCardProps) => {
  return (
    <Link 
      href={href}
      className="group relative block h-full"
    >
      <div className="relative h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-600/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] overflow-hidden">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
        
        {/* Badge */}
        {badge && (
          <div className={`absolute top-4 right-4 px-3 py-1 ${badgeColor} dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-xs font-medium`}>
            {badge}
          </div>
        )}

        {/* Icon container */}
        <div className="relative z-10 mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>

          {/* CTA */}
          <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300">
            <span>Sprawdź teraz</span>
            <div className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">
              →
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
        
        {/* Decorative gradient orb */}
        <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700`}></div>
        
        {/* Floating elements */}
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-success-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
      </div>
    </Link>
  );
};

export default CalculatorCard; 