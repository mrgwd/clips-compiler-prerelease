import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // disable eslint during build
  // disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
