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
    domains: ['pexels.com', 'images.pexels.com'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
