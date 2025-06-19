"use client";

import DashboardNavigation from "./DashboardNavigation";
import { ReactNode, useState, useEffect } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px = lg breakpoint en Tailwind
      // Si cambiamos a móvil, aseguramos que el sidebar esté cerrado
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true); // Por defecto abierto en desktop
      }
    };
    
    // Verificar al inicio
    checkIsMobile();
    
    // Verificar al redimensionar la ventana
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay para móvil cuando el menú está abierto */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <DashboardNavigation 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsible={!isMobile}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header with menu button - solo para móvil */}
        <div className="bg-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            {/* Botón de hamburguesa solo visible en móvil */}
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 focus:outline-none mr-4 lg:hidden"
              aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Título de la página actual o breadcrumb puede ir aquí */}
            <h1 className="text-lg font-medium text-gray-800">Dashboard</h1>
          </div>
          
          {/* Espacio para elementos adicionales al header: notificaciones, perfil, etc. */}
          <div className="flex items-center">
            {/* Placeholder para futuras funcionalidades como notificaciones o perfil rápido */}
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
