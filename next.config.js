/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Optymalizacja obrazów
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lhihjbltatugcnbcpzzt.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com',
        pathname: '/**',
      },
    ],
  },

  // Optymalizacja kompilacji
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Source maps w produkcji
  productionBrowserSourceMaps: true,

  // Cache i optymalizacje
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'recharts',
      '@heroicons/react',
      'lucide-react',
      'date-fns',
      'lodash'
    ],
    webpackBuildWorker: true,
  },

  // Headers dla lepszego cache'owania
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    // Optymalizacja dla produkcji
    if (!dev && !isServer) {
      // Optymalizacja splitChunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 90000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Grupuj komponenty Recharts
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|react-smooth|d3-.*|internmap)[\\/]/,
              name: 'recharts',
              chunks: 'all',
              priority: 10,
            },
            // Grupuj zależności React
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
            },
            // Grupuj inne duże biblioteki
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: -10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
        // Optymalizacja modułów
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        mangleExports: true,
        minimize: true,
      };

      // Dodatkowe optymalizacje webpack
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      };
    }

    return config;
  },
}

module.exports = nextConfig