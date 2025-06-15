import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Konfiguracja dla Vercel
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr'],
  },
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
};

export default nextConfig;
