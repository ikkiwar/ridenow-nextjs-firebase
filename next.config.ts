import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  // Prevenir pre-renderización de rutas que dependen de Firebase auth
  experimental: {
    // Esta opción es experimental y puede cambiar en futuras versiones de Next.js
    optimizeCss: true,
  },
  // Rutas que no se deben pre-renderizar
  output: 'standalone',
};

export default nextConfig;
