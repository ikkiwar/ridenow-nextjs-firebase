"use client";

import DashboardNavigation from "./DashboardNavigation";
import CompanySelector from "./CompanySelector";
import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSuperAdmin, currentCompany } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Solo usar localStorage en desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      const saved = localStorage.getItem('sidebarOpen');
      return saved ? JSON.parse(saved) : true;
    }
    return false; // En móvil siempre cerrado por defecto
  });
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkIsMobile = () => {
      const newIsMobile = window.innerWidth < 1024; // 1024px = lg breakpoint en Tailwind
      
      // Solo cambiar el estado si realmente cambiamos entre móvil y desktop
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        
        if (newIsMobile) {
          // En móvil, cerrar el sidebar y no usar localStorage
          setSidebarOpen(false);
        } else {
          // En desktop, restaurar el estado guardado
          const saved = localStorage.getItem('sidebarOpen');
          if (saved !== null) {
            setSidebarOpen(JSON.parse(saved));
          }
        }
      }
    };
    
    // Verificar al inicio
    checkIsMobile();
    
    // Verificar al redimensionar la ventana
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Solo guardar en localStorage si no estamos en móvil
    if (typeof window !== 'undefined' && !isMobile) {
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    }
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
        <div className="bg-white px-4 py-6 flex items-center justify-between shadow-sm border-b border-gray-200 h-20">
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
            
            {/* Mostrar nombre de la compañía actual (para no superadmins) */}
            {currentCompany && !isSuperAdmin && (
              <div className="hidden md:block ml-4 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {currentCompany.name}
              </div>
            )}
          </div>
          
          {/* Elementos adicionales al header */}
          <div className="flex items-center">
            {/* Selector de compañía para superadmins */}
            <CompanySelector className="mr-4" />
            
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
