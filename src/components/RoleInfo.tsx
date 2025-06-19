"use client";

import { useAuth } from '../context/AuthProvider';

interface RoleInfoProps {
  showPermissions?: boolean;
  className?: string;
}

/**
 * Componente que muestra información sobre el rol actual del usuario
 */
export default function RoleInfo({ showPermissions = false, className = '' }: RoleInfoProps) {
  const { user, userRole, hasPermission } = useAuth();

  // Si no hay usuario autenticado, no mostrar nada
  if (!user) return null;

  // Define colores según el rol
  const getRoleColor = () => {
    switch (userRole) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'driver':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Mapeo de nombres amigables para los roles
  const getRoleName = () => {
    switch (userRole) {
      case 'superadmin':
        return 'Super Administrador';
      case 'admin':
        return 'Administrador';
      case 'driver':
        return 'Conductor';
      default:
        return 'Usuario';
    }
  };

  // Lista de permisos comunes para mostrar como ejemplo
  const commonPermissions = [
    'view_own_rides',
    'update_own_status',
    'view_all_rides',
    'manage_drivers',
    'configure_system'
  ];

  return (
    <div className={`p-3 rounded-md border ${getRoleColor()} ${className}`}>
      <div className="font-medium">
        {getRoleName()}
      </div>
      
      {showPermissions && (
        <div className="mt-2">
          <p className="text-xs font-medium mb-1">Permisos:</p>
          <ul className="space-y-1">
            {commonPermissions.map(permission => (
              <li 
                key={permission}
                className="text-xs flex items-center"
              >
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${hasPermission(permission) ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {permission}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
