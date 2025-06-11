/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    "@tailwindcss/postcss",
    [
      "postcss-preset-env",
      {
        features: { "oklch-color": { preserve: false } },
      },
    ],
  ],
};

export default config;
