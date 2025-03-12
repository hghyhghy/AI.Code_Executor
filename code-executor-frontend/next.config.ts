import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false, // Reduce memory usage by disabling worker threads
    cpus: 1, // Limit CPU usage to 1 core
  },
  output: "standalone", // Optimize for serverless deployment
  images: {
    unoptimized: true, // Disable Next.js image optimization to reduce memory usage
  },
  swcMinify: true, // Use SWC for faster builds
  reactStrictMode: true, // Enable strict mode for better debugging
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Remove console logs in production
  },
};

export default nextConfig;
