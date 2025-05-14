/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1a4e8e',
          green: '#2e9f74',
          darkblue: '#14365f',
          lightblue: '#e6f0fa',
          darkgreen: '#1e7d5b',
          lightgreen: '#e6f7f1',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in forwards',
        'fadeInOut': 'fadeInOut 4s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeInOut: {
          '0%': { opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
} 