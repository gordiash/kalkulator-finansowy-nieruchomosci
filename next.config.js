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
    
    // Bardzo robustna konfiguracja aliasów dla Vercel
    const srcPath = path.resolve(__dirname, 'src');
    
    // Wyczyść istniejące aliasy
    config.resolve.alias = config.resolve.alias || {};
    
    // Dodaj nasze aliasy
    Object.assign(config.resolve.alias, {
      '@': srcPath,
      '@/lib': path.resolve(srcPath, 'lib'),
      '@/components': path.resolve(srcPath, 'components'),
      '@/app': path.resolve(srcPath, 'app'),
      '@/hooks': path.resolve(srcPath, 'hooks'),
      '@/types': path.resolve(srcPath, 'types'),
    });

    // Konfiguracja modułów
    config.resolve.modules = [
      srcPath,
      'node_modules',
      path.resolve(__dirname),
    ];

    // Rozszerzenia
    config.resolve.extensions = [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
      '.mjs',
      ...(config.resolve.extensions || [])
    ];

    // Dodatkowe ustawienia dla Vercel
    config.resolve.symlinks = false;
    config.resolve.cacheWithContext = false;

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