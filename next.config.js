const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optymalizacje kompilacji
  experimental: {
    // optimizeCss: true, // Wyłączone - powoduje błąd z 'critters'
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optymalizacje tylko dla produkcji
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    // Minimalna konfiguracja webpack - pozwól Next.js obsłużyć aliasy
    // Usuń wszystkie custom aliasy - może powodują problemy na Vercel

    return config;
  },

  // Kompresja i cache
  compress: true,
  poweredByHeader: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lhihjbltatugcnbcpzzt.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Konfiguracja dla Next.js 15+
  serverExternalPackages: ['@supabase/ssr'],
  // Zapewnienie że middleware działa poprawnie
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog/:slug/',
        destination: '/blog/:slug',
        permanent: true,
      },
      // Przekierowania dla starych URL-i kalkulatorów
      {
        source: '/kalkulator-wartosci-najmu',
        destination: '/kalkulator-wynajmu',
        permanent: true,
      },
      {
        source: '/kalkulator-roi',
        destination: '/kalkulator-wynajmu',
        permanent: true,
      },
      {
        source: '/kalkulator-inwestycji',
        destination: '/kalkulator-wynajmu',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 