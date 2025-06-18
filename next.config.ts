import type { NextConfig } from "next";

// Configuración específica para evitar errores de Firebase durante el build
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  // Usamos configuración de salida estándar para Vercel
  output: 'standalone',
  // Optimizaciones de rendimiento
  swcMinify: true,
  // Configuración para evitar pre-renderizado de páginas con autenticación
  reactStrictMode: true,
  // Deshabilitar la generación automática de páginas de error estáticas
  // que pueden causar conflictos con los errores personalizados basados en cliente
  typescript: {
    // Ignoramos errores de TypeScript durante la compilación para desarrollo
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },
};

export default nextConfig;
