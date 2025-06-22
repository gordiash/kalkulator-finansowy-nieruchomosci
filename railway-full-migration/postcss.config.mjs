/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    "@tailwindcss/postcss",
    [
      "postcss-preset-env",
      {
        stage: 1,
        features: {
          "oklab-function": false,
          "color-mix": false,
        },
      },
    ],
  ],
};

export default config;
