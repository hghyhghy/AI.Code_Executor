// next.config.js
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    workerThreads: false, // Disable worker threads
    cpus: 1, // Reduce CPU usage
  },
};

export default nextConfig;
