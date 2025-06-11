import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
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
  plugins: [],
};
export default config; 