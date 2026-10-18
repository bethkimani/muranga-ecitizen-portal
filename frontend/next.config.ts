import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  cacheComponents: true,
  experimental: {
    ppr: true,
  },
};

export default nextConfig;