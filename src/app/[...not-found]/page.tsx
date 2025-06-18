"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';

// Esta configuración evita que la página se renderice estáticamente
export const dynamic = 'force-dynamic';

// Este componente catch-all redirige a la página 404 personalizada
export default function NotFoundCatchAll() {
  const router = useRouter();
  
  useEffect(() => {
    // Utilizamos la función notFound() de Next.js para mostrar la página 404
    // Esto es más compatible con diferentes modos de renderizado
    notFound();
  }, [router]);
  
  // Fallback para SSR
  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-400">
      <p className="text-black">Página no encontrada</p>
    </div>
  );
}
