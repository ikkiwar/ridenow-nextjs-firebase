"use client";

import { useState, useEffect } from "react";
import AuthProvider from "../context/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Estados para manejar el SplashScreen y su visibilidad
  const [SplashScreen, setSplashScreenComponent] = useState<React.ComponentType<{onSplashComplete?: () => void}> | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Importación dinámica del SplashScreen (solo en el cliente)
    const importSplashScreen = async () => {
      const { default: SplashComponent } = await import("../components/SplashScreen");
      setSplashScreenComponent(() => SplashComponent);
    };
    importSplashScreen();

    // Verificamos si es una recarga de página o navegación entre páginas
    const isReload = !sessionStorage.getItem("appInitialized");
    
    // Siempre mostrar splash durante los reloads
    if (isReload) {
      setShowSplash(true);
      sessionStorage.setItem("appInitialized", "true");
    } else {
      // Solo durante navegación entre páginas, verificar si ya mostramos el splash antes
      const splashShown = localStorage.getItem("splashShown");
      if (splashShown) {
        setShowSplash(false);
        // Ya podemos mostrar el contenido
        setAppReady(true);
      } else {
        setShowSplash(true);
        // Marcamos que ya se mostró el splash
        localStorage.setItem("splashShown", "true");
        
        // Limpiamos el flag después de un tiempo para que aparezca eventualmente
        setTimeout(() => {
          localStorage.removeItem("splashShown");
        }, 1000 * 60 * 60); // 1 hora
      }
    }
    
    setIsInitialLoad(false);
  }, []);

  // Función para manejar cuando el splash screen termina
  const handleSplashComplete = () => {
    setShowSplash(false);
    setAppReady(true);
  };

  // Durante la carga inicial o mientras el splash está activo, ocultamos el contenido principal
  const shouldShowContent = !isInitialLoad && (appReady || !showSplash);
  
  return (
    <AuthProvider>
      {/* Mostrar SplashScreen si está disponible y debe mostrarse */}
      {showSplash && SplashScreen ? (
        <SplashScreen onSplashComplete={handleSplashComplete} />
      ) : null}
      
      {/* Mostrar contenido solo cuando la app está lista */}
      <div style={{ display: shouldShowContent ? 'block' : 'none' }}>
        {children}
      </div>
      
      {/* Pantalla de carga de respaldo si no hay splash pero aún no está listo */}
      {!showSplash && !appReady && (
        <div className="fixed inset-0 bg-blue-500 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
        </div>
      )}
    </AuthProvider>
  );
}
