import { NextConfig } from "next";
import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  experimental: { webpackBuildWorker: true },
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pexels.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/webp", "image/avif"],
    unoptimized: isDev,
  },
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,   // SW désactivé en dev comme ton portfolio
})(nextConfig);
