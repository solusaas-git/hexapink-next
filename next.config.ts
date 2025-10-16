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
      bodySizeLimit: "50mb", // Reduced from 500mb for Vercel limits
    },
  },
  // Vercel optimizations
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  // Handle large file uploads
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
    responseLimit: "50mb",
  },
};

export default nextConfig;

