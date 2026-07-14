import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack to fix Windows filesystem issues
  // Turbopack has known issues with Windows 'nul' device file
  turbopack: undefined,
  // Use Webpack instead
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  allowedDevOrigins: ['geo-dev.online.localhost', '*.localhost', 'localhost']
};

export default nextConfig;