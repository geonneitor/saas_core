import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // removed optimizePackageImports to fix 3-minute compile times
  allowedDevOrigins: ['geo-dev.online.localhost', '*.localhost', 'localhost']
};

export default nextConfig;
