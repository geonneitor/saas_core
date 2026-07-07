import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // added optimizePackageImports to fix lucide-react compile times
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  allowedDevOrigins: ['geo-dev.online.localhost', '*.localhost', 'localhost']
};

export default nextConfig;
