"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthProvider";

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: string[];
  requiredPermission?: string;
  redirectTo?: string;
}

/**
 * Componente que protege rutas según el rol del usuario.
 * 
 * @param children - Componentes hijos que se mostrarán si el usuario tiene el rol adecuado
 * @param allowedRoles - Array de roles permitidos para acceder a esta ruta
 * @param requiredPermission - Permiso específico requerido (opcional)
 * @param redirectTo - Ruta a la que redirigir si no tiene acceso (por defecto "/")
 */
export default function RequireRole({ 
  children, 
  allowedRoles, 
  requiredPermission, 
  redirectTo = "/" 
}: RequireRoleProps) {
  const { user, loading, userRole, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si ya cargó y el usuario no está autenticado, redirigir al login
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    // Si ya cargó, hay usuario, pero no tiene el rol adecuado
    if (!loading && user && userRole) {
      const hasAllowedRole = allowedRoles.includes(userRole);
      const hasRequiredPermissions = requiredPermission ? hasPermission(requiredPermission) : true;

      if (!hasAllowedRole || !hasRequiredPermissions) {
        router.push(redirectTo);
      }
    }
  }, [user, loading, userRole, allowedRoles, requiredPermission, hasPermission, router, redirectTo]);

  // Mostrar indicador de carga mientras se verifica
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Verificando acceso...</p>
      </div>
    );
  }

  // No mostrar nada si no tiene acceso (mientras redirige)
  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  // Si requiere un permiso específico y no lo tiene
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  // Si todo está bien, mostrar el contenido protegido
  return <>{children}</>;
}
