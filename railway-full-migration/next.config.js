/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output dla Railway
  output: 'standalone',
  
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    const path = require('path');
    
    // Rozwiązanie problemów z modułami - używaj ścieżek absolutnych
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/app': path.resolve(__dirname, './src/app'),
    };
    
    // Ignoruj Python pliki w webpack
    config.module.rules.push({
      test: /\.py$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
  
  // Headers dla API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/kalkulator',
        destination: '/kalkulator-wyceny',
        permanent: true,
      },
    ];
  },
  
  // Environment variables
  env: {
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT || 'development',
  },
  
  // Images configuration
  images: {
    domains: ['railway.app'],
    unoptimized: true, // Dla Railway
  },
  
  // Powerd by header
  poweredByHeader: false,
  
  // Compression
  compress: true,
  
  // Trailing slash
  trailingSlash: false,
  
  // TypeScript config
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint config
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 