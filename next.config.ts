import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration PWA
  experimental: {
    webpackBuildWorker: true,
  },
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Permet le build même avec des warnings ESLint
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Permet le build même avec des erreurs TypeScript mineures
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
