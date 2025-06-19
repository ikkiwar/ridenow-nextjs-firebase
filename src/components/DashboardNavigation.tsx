"use client";

import { useAuth } from "../context/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { auth } from "../firebaseConfig";

interface DashboardNavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsible?: boolean;
  onToggle?: () => void; // Nueva prop para manejar el toggle desde el logo
}

export default function DashboardNavigation({ 
  isOpen = false, 
  onClose,
  isCollapsible = false,
  onToggle
}: DashboardNavigationProps) {
  const { user, userRole, isAdmin, isSuperAdmin, isDriver } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Determinar enlaces según el rol
  const getNavLinks = () => {
    // Función auxiliar para determinar la ruta de inicio según el rol
    const getHomePath = () => {
      if (isSuperAdmin) return "/dashboard/superadmin";
      if (isAdmin && !isSuperAdmin) return "/dashboard/admin";
      if (isDriver) return "/dashboard/driver";
      return "/dashboard";
    };
    
    const commonLinks = [
      {
        href: getHomePath(),
        label: "Inicio",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      },
      {
        href: "/profile",
        label: "Perfil",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      }
    ];

    // Enlaces específicos para conductores
    if (isDriver) {
      return [...commonLinks, 
        {
          href: "/dashboard/driver/rides",
          label: "Mis Viajes",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )
        },
        {
          href: "/dashboard/driver/map",
          label: "Mapa",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )
        }
      ];
    }

    // Enlaces para administradores
    if (isAdmin) {
      return [...commonLinks,
        {
          href: "/dashboard/admin/drivers",
          label: "Conductores",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )
        },
        {
          href: "/dashboard/admin/rides",
          label: "Viajes",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          href: "/dashboard/admin/map",
          label: "Mapa",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )
        },
        {
          href: "/dashboard/admin/stats",
          label: "Estadísticas",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      ];
    }

    // Enlaces para superadmin
    if (isSuperAdmin) {
      return [...commonLinks,
        {
          href: "/dashboard/superadmin/users",
          label: "Usuarios",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )
        },
        {
          href: "/dashboard/superadmin/roles",
          label: "Roles",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )
        },
        {
          href: "/dashboard/superadmin/regions",
          label: "Regiones",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          href: "/dashboard/superadmin/map",
          label: "Mapa",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )
        },
        {
          href: "/dashboard/superadmin/stats",
          label: "Estadísticas",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      ];
    }

    return commonLinks;
  };

  const navLinks = getNavLinks();

  // Función auxiliar para determinar la ruta de inicio según el rol
  const getCorrectHomePath = () => {
    if (isSuperAdmin) return "/dashboard/superadmin";
    if (isAdmin && !isSuperAdmin) return "/dashboard/admin";
    if (isDriver) return "/dashboard/driver";
    return "/dashboard";
  };

  // Determinar clases para los modos: normal, colapsado y responsive
  const sidebarWidthClass = isCollapsible && !isOpen ? 'lg:w-20' : 'w-64';
  const sidebarVisibilityClass = isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';

  return (
    <div className={`bg-white border-r border-gray-200 h-full fixed top-0 left-0 ${sidebarWidthClass} z-30 shadow-md transform transition-all duration-300 ease-in-out ${sidebarVisibilityClass}`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center overflow-hidden w-full" 
             onClick={isCollapsible ? onToggle : undefined} // Solo en desktop funciona como toggle
             style={isCollapsible ? { cursor: 'pointer' } : {}}
        >
          <Link href={getCorrectHomePath()} className="flex items-center overflow-hidden">
            <Image 
              src="/ridenow_short_logo.png" 
              alt="RideNow Logo" 
              width={40} 
              height={40} 
              className={`${isCollapsible && !isOpen ? 'mx-auto' : 'mr-2'}`}
            />
            {(!isCollapsible || isOpen) && (
              <span className="text-xl font-semibold text-gray-800 whitespace-nowrap">RideNow</span>
            )}
          </Link>
          
          {/* Indicador visual de colapso en desktop */}
          {isCollapsible && isOpen && (
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (onToggle) onToggle(); 
              }}
              className="ml-auto mr-2 text-gray-500 hidden lg:block focus:outline-none"
              aria-label="Collapse sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Botón para cerrar en móvil */}
        <button 
          onClick={onClose}
          className="text-gray-500 lg:hidden focus:outline-none"
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className={`p-4 border-b border-gray-200 ${isCollapsible && !isOpen ? 'text-center' : ''}`}>
        <div className={`${isCollapsible && !isOpen ? 'flex flex-col items-center' : 'flex items-center mb-4'}`}>
          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold mb-2 lg:mb-0 lg:mr-3">
            {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
          </div>
          {(!isCollapsible || isOpen) && (
            <div>
              <div className="font-medium text-sm truncate max-w-[160px]">{user?.displayName || user?.email}</div>
              <div className="text-xs text-gray-500">{
                userRole === 'superadmin' ? 'Super Admin' : 
                userRole === 'admin' ? 'Administrador' : 
                userRole === 'driver' ? 'Conductor' : 'Usuario'
              }</div>
            </div>
          )}
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href}
                className={`flex items-center p-2 rounded-lg ${
                  isActive(link.href)
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${isCollapsible && !isOpen ? 'justify-center' : ''}`}
                title={isCollapsible && !isOpen ? link.label : ''}
              >
                <span className={isCollapsible && !isOpen ? '' : 'mr-3'}>{link.icon}</span>
                {(!isCollapsible || isOpen) && <span>{link.label}</span>}
              </Link>
            </li>
          ))}
          
          <li className={`pt-4 mt-4 border-t border-gray-200 ${isCollapsible && !isOpen ? 'text-center' : ''}`}>
            <button 
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg ${isCollapsible && !isOpen ? 'mx-auto justify-center w-auto' : 'w-full'}`}
              onClick={() => auth.signOut()}
              title={isCollapsible && !isOpen ? 'Cerrar sesión' : ''}
            >
              <span className={isCollapsible && !isOpen ? '' : 'mr-3'}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              {(!isCollapsible || isOpen) && <span>Cerrar sesión</span>}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
