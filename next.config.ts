import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

export default nextConfig;
