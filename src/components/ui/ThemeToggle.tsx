'use client';

import { useTheme } from './ThemeProvider';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

const ThemeToggle = () => {
  const { theme, setTheme, actualTheme } = useTheme();

  const themes = [
    { key: 'light', icon: FiSun, label: 'Jasny' },
    { key: 'dark', icon: FiMoon, label: 'Ciemny' },
    { key: 'system', icon: FiMonitor, label: 'System' },
  ] as const;

  return (
    <div className="relative">
      <div className="flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-600/50 rounded-full p-1 shadow-lg">
        {themes.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={`
              relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
              ${theme === key 
                ? 'bg-primary-600 text-white shadow-lg' 
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }
            `}
            title={label}
          >
            <Icon size={18} />
            
            {/* Active indicator */}
            {theme === key && (
              <div className="absolute inset-0 bg-primary-600 rounded-full animate-scale-in"></div>
            )}
            
            {/* Icon with z-index above indicator */}
            <div className="relative z-10">
              <Icon size={18} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle; 