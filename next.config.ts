import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb", // Maximum allowed for serverless functions
    },
  },
  // Vercel optimizations
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
};

export default nextConfig;

