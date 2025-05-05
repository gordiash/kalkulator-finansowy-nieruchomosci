/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
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