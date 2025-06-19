"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';

/**
 * Hook personalizado para verificar si el usuario tiene un permiso específico
 * 
 * @param requiredPermission - El permiso requerido para cierta acción
 * @returns Un objeto con el estado de la verificación
 */
export function usePermission(requiredPermission: string) {
  const { user, userRole, hasPermission, loading } = useAuth();
  const [canAccess, setCanAccess] = useState<boolean>(false);
  const [permissionLoading, setPermissionLoading] = useState<boolean>(true);

  useEffect(() => {
    // Esperar a que termine de cargar el estado de autenticación
    if (!loading) {
      // Verificar si tiene permiso
      const allowed = user !== null && hasPermission(requiredPermission);
      setCanAccess(allowed);
      setPermissionLoading(false);
    }
  }, [user, userRole, hasPermission, loading, requiredPermission]);

  return {
    canAccess,
    loading: loading || permissionLoading,
    isAuthenticated: user !== null
  };
}

/**
 * Hook para verificar si el usuario tiene uno de los roles permitidos
 * 
 * @param allowedRoles - Lista de roles permitidos
 * @returns Un objeto con el estado de la verificación
 */
export function useRole(allowedRoles: string[]) {
  const { user, userRole, loading } = useAuth();
  const [hasRole, setHasRole] = useState<boolean>(false);
  const [roleLoading, setRoleLoading] = useState<boolean>(true);

  useEffect(() => {
    // Esperar a que termine de cargar el estado de autenticación
    if (!loading) {
      // Verificar si tiene el rol adecuado
      const allowed = user !== null && userRole !== null && allowedRoles.includes(userRole);
      setHasRole(allowed);
      setRoleLoading(false);
    }
  }, [user, userRole, loading, allowedRoles]);

  return {
    hasRole,
    loading: loading || roleLoading,
    isAuthenticated: user !== null,
    userRole
  };
}

export default usePermission;
