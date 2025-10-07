const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optymalizacje kompilacji
  experimental: {
    // optimizeCss: true, // Wyłączone - powoduje błąd z 'critters'
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    // Buduj wyłącznie dla nowoczesnych przeglądarek – bez ES5 i polyfilli legacy
    legacyBrowsers: false,
  },

  // Mapy źródeł dla produkcji (ułatwia debugowanie i spełnia wymagania Lighthouse)
  productionBrowserSourceMaps: true,

  // Konfiguracja dla Vercel
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  webpack: (config, { dev, isServer }) => {
    // Uproszczona konfiguracja aliasów dla Next.js 15
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
    };
    
    // Dodaj fallback dla modułów
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Dodaj rozszerzenia dla lepszego rozpoznawania modułów
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', ...config.resolve.extensions];
    
    // Konfiguracja TLS dla HTTPS
    if (config.devServer) {
      config.devServer = {
        ...config.devServer,
        https: true,
        http2: true,
      };
    }
    
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
  
  // Security Headers
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    // Content Security Policy przeniesiona do nagłówka HTTP
    const csp = [
      "default-src 'self'",
      // Next.js i analityka (GA/Tag Manager) – dopasuj do używanych integracji
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://*.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://estymatorai-production.up.railway.app",
      "frame-src https://www.youtube.com https://player.vimeo.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // W prod wymuś upgrade HTTP→HTTPS (nie używaj w dev, aby nie psuć localhost)
      isProd ? 'upgrade-insecure-requests' : ''
    ]
      .filter(Boolean)
      .join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://www.kalkulatorynieruchomosci.pl' 
              : 'https://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, X-Timestamp',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
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