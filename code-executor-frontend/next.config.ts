import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enables strict mode for highlighting potential problems
  swcMinify: true, // Enables SWC compiler for faster builds
  experimental: {
    appDir: true, // Enables the Next.js App Router (if applicable)
  },
  webpack: (config: any) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }; // Fix issues with certain node modules in the browser
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)", // Applies to all routes
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-Requested-With, Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
