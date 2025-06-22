import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      'xs': ['0.675rem', { lineHeight: '0.9rem' }], // 0.75rem * 0.9
      'sm': ['0.79rem', { lineHeight: '1.125rem' }], // 0.875rem * 0.9  
      'base': ['0.9rem', { lineHeight: '1.35rem' }], // 1rem * 0.9
      'lg': ['1.02rem', { lineHeight: '1.575rem' }], // 1.125rem * 0.9
      'xl': ['1.125rem', { lineHeight: '1.575rem' }], // 1.25rem * 0.9
      '2xl': ['1.35rem', { lineHeight: '1.8rem' }], // 1.5rem * 0.9
      '3xl': ['1.71rem', { lineHeight: '2.025rem' }], // 1.875rem * 0.9
      '4xl': ['2.025rem', { lineHeight: '2.25rem' }], // 2.25rem * 0.9
      '5xl': ['2.7rem', { lineHeight: '1' }], // 3rem * 0.9
      '6xl': ['3.375rem', { lineHeight: '1' }], // 3.75rem * 0.9
      '7xl': ['4.05rem', { lineHeight: '1' }], // 4.5rem * 0.9
      '8xl': ['5.4rem', { lineHeight: '1' }], // 6rem * 0.9
      '9xl': ['7.2rem', { lineHeight: '1' }], // 8rem * 0.9
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // Poprawione kolory dla lepszej dostępności (WCAG AA)
      colors: {
        // Nadpisanie problematycznych kolorów
        emerald: {
          600: '#047857', // było #059669 - lepszy kontrast dla białego tekstu
          700: '#065f46', // ciemniejszy dla hover states
        },
        red: {
          50: '#FEE2E2',   // było #FEF2F2 - lepszy kontrast dla czerwonego tekstu
          100: '#FECACA',  // dodatkowa opcja
          600: '#B91C1C',  // było #DC2626 - lepszy kontrast
          700: '#991B1B',  // ciemniejszy dla hover states
        },
        green: {
          50: '#D1FAE5',   // było #ECFDF5 - lepszy kontrast dla zielonego tekstu
          100: '#A7F3D0',  // dodatkowa opcja
        },
        // Nowe kolory dla accessibility
        'accessible-success': '#047857',   // emerald-700
        'accessible-success-bg': '#D1FAE5', // green-100
        'accessible-error': '#B91C1C',     // red-700
        'accessible-error-bg': '#FEE2E2',  // red-100
      },
       backgroundColor: ({ theme }) => ({
        ...theme('colors'),
        DEFAULT: 'rgba(var(--tw-bg-color-rgb) / var(--tw-bg-opacity, 1))'
      }),
      borderColor: ({ theme }) => ({
        ...theme('colors'),
        DEFAULT: 'rgba(var(--tw-border-color-rgb) / var(--tw-border-opacity, 1))'
      }),
      textColor: ({ theme }) => ({
        ...theme('colors'),
        DEFAULT: 'rgba(var(--tw-text-color-rgb) / var(--tw-text-opacity, 1))'
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
};
export default config; 