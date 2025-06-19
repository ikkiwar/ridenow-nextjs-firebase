"use client";

import RequireRole from "../../../../components/RequireRole";
import DashboardLayout from "../../../../components/DashboardLayout";
import Link from "next/link";
import { useState } from "react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
  usersCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function RoleManagement() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Mock data - en una aplicación real, estos datos vendrían de Firestore
  const mockRoles: Role[] = [
    {
      id: "superadmin",
      name: "Super Administrador",
      description: "Administrador con acceso total al sistema",
      permissions: [
        "view_all_rides",
        "manage_drivers",
        "view_stats",
        "manage_regions",
        "manage_admins",
        "configure_system",
        "manage_roles"
      ],
      level: 3,
      usersCount: 2,
      createdAt: "2022-10-01",
      updatedAt: "2023-01-15"
    },
    {
      id: "admin",
      name: "Administrador",
      description: "Administrador con acceso a gestión de conductores y estadísticas",
      permissions: [
        "view_all_rides",
        "manage_drivers",
        "view_stats",
        "manage_regions"
      ],
      level: 2,
      usersCount: 8,
      createdAt: "2022-10-01",
      updatedAt: "2023-01-15"
    },
    {
      id: "driver",
      name: "Conductor",
      description: "Conductor que ofrece servicios de transporte",
      permissions: [
        "view_own_rides",
        "update_own_status",
        "update_own_location",
        "accept_rides",
        "complete_rides"
      ],
      level: 1,
      usersCount: 112,
      createdAt: "2022-10-01",
      updatedAt: "2023-03-10"
    },
  ];

  const toggleRoleExpand = (roleId: string) => {
    if (expandedRole === roleId) {
      setExpandedRole(null);
    } else {
      setExpandedRole(roleId);
    }
  };

  const handleAddPermission = (roleId: string, permissionName: string) => {
    console.log(`Agregar permiso ${permissionName} al rol ${roleId}`);
  };

  const handleRemovePermission = (roleId: string, permissionName: string) => {
    console.log(`Quitar permiso ${permissionName} del rol ${roleId}`);
  };

  return (
    <RequireRole allowedRoles={['superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestión de Roles
            </h1>
            <Link 
              href="/dashboard/superadmin" 
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            >
              Volver al Dashboard
            </Link>
          </div>
          <p className="text-gray-600">Administre los roles y permisos del sistema.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Roles del Sistema</h2>
            <Link 
              href="/dashboard/superadmin/roles/new" 
              className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
            >
              Crear Nuevo Rol
            </Link>
          </div>
          
          <div className="space-y-4">
            {mockRoles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg">
                <div 
                  className={`p-4 flex justify-between items-center cursor-pointer ${
                    role.id === 'superadmin' ? 'bg-purple-50' : 
                    role.id === 'admin' ? 'bg-blue-50' : 'bg-green-50'
                  }`}
                  onClick={() => toggleRoleExpand(role.id)}
                >
                  <div>
                    <h3 className="font-medium text-lg">{role.name}</h3>
                    <p className="text-gray-600 text-sm">{role.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white px-3 py-1 rounded-full text-sm">
                      {role.usersCount} usuarios
                    </div>
                    <div className="bg-white px-3 py-1 rounded-full text-sm">
                      Nivel {role.level}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedRole === role.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {expandedRole === role.id && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Permisos</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {role.permissions.map(permission => (
                        <div 
                          key={permission} 
                          className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center"
                        >
                          <span>{permission}</span>
                          <button 
                            onClick={() => handleRemovePermission(role.id, permission)}
                            className="ml-1 text-gray-500 hover:text-red-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => handleAddPermission(role.id, "new_permission")}
                        className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center hover:bg-gray-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Agregar Permiso</span>
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <div>
                        <span>Creado: {role.createdAt}</span>
                        <span className="mx-2">|</span>
                        <span>Última modificación: {role.updatedAt}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link 
                          href={`/dashboard/superadmin/roles/${role.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        {role.id !== 'superadmin' && role.id !== 'admin' && role.id !== 'driver' && (
                          <button className="text-red-600 hover:text-red-900">
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Información de Permisos</h2>
          <div className="prose">
            <p>Los permisos controlan a qué funcionalidades puede acceder cada rol. A continuación se presenta una lista de permisos disponibles en el sistema:</p>
            
            <h3 className="mt-4 text-lg font-medium">Permisos de Conductores</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>view_own_rides</strong>: Ver sus propios viajes</li>
              <li><strong>update_own_status</strong>: Actualizar su estado (disponible, ocupado, offline)</li>
              <li><strong>update_own_location</strong>: Actualizar su ubicación</li>
              <li><strong>accept_rides</strong>: Aceptar solicitudes de viaje</li>
              <li><strong>complete_rides</strong>: Completar viajes</li>
            </ul>
            
            <h3 className="mt-4 text-lg font-medium">Permisos de Administradores</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>view_all_rides</strong>: Ver todos los viajes</li>
              <li><strong>manage_drivers</strong>: Gestionar conductores (aprobar, suspender)</li>
              <li><strong>view_stats</strong>: Ver estadísticas y reportes</li>
              <li><strong>manage_regions</strong>: Gestionar regiones geográficas</li>
            </ul>
            
            <h3 className="mt-4 text-lg font-medium">Permisos de Super Administradores</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>manage_admins</strong>: Gestionar administradores</li>
              <li><strong>configure_system</strong>: Configuración del sistema</li>
              <li><strong>manage_roles</strong>: Gestionar roles y permisos</li>
            </ul>
          </div>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
