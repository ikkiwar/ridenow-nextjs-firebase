"use client";
import RequireAuth from "../components/RequireAuth";
import HomePage from "./HomePage";
import { useAuth } from "../context/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading, getDashboardPath } = useAuth();
  const router = useRouter();
  
  // Redireccionar al usuario al panel correspondiente según su rol
  useEffect(() => {
    // Solo redirigir cuando tengamos toda la información necesaria
    if (user && !loading) {
      const dashboardPath = getDashboardPath();
      router.push(dashboardPath);
    }
  }, [user, loading, getDashboardPath, router]);

  // Si está cargando o hay usuario (redirigiendo), no mostramos el contenido
  if (loading || user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-blue-500">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>
    );
  }

  // Solo mostrar el contenido si no hay usuario autenticado y no está cargando
  return (
    <RequireAuth>
      <HomePage />
    </RequireAuth>
  );
}
