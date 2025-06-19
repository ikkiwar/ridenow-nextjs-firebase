"use client";

import RequireRole from "../../../../components/RequireRole";
import DashboardLayout from "../../../../components/DashboardLayout";
import Link from "next/link";
import { useState } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data - en una aplicación real, estos datos vendrían de Firestore
  const mockUsers: User[] = [
    {
      id: "user_001",
      fullName: "Juan Pérez",
      email: "juan@example.com",
      role: "driver",
      status: "active",
      lastLogin: "2023-06-15",
      createdAt: "2023-01-10"
    },
    {
      id: "user_002",
      fullName: "María López",
      email: "maria@example.com",
      role: "driver",
      status: "inactive",
      lastLogin: "2023-05-20",
      createdAt: "2023-02-05"
    },
    {
      id: "user_003",
      fullName: "Carlos Rodríguez",
      email: "carlos@example.com",
      role: "admin",
      status: "active",
      lastLogin: "2023-06-18",
      createdAt: "2022-11-15"
    },
    {
      id: "user_004",
      fullName: "Ana Martínez",
      email: "ana@example.com",
      role: "driver",
      status: "suspended",
      lastLogin: "2023-04-10",
      createdAt: "2023-03-12"
    },
    {
      id: "user_005",
      fullName: "Roberto Sánchez",
      email: "roberto@example.com",
      role: "superadmin",
      status: "active",
      lastLogin: "2023-06-18",
      createdAt: "2022-10-01"
    },
  ];

  // Filtrar usuarios basados en búsqueda, rol y estado
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    // En una aplicación real, aquí se actualizaría el rol del usuario en Firestore
    console.log(`Cambiar rol del usuario ${userId} a ${newRole}`);
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    // En una aplicación real, aquí se actualizaría el estado del usuario en Firestore
    console.log(`Cambiar estado del usuario ${userId} a ${newStatus}`);
  };

  return (
    <RequireRole allowedRoles={['superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestión de Usuarios
            </h1>
            <Link 
              href="/dashboard/superadmin" 
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            >
              Volver al Dashboard
            </Link>
          </div>
          <p className="text-gray-600">Administre todos los usuarios registrados en la plataforma.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                id="search"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Buscar por nombre, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="md:w-48">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                id="role"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="driver">Conductor</option>
                <option value="admin">Administrador</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            
            <div className="md:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                id="status"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
            
            <div className="md:w-48 md:self-end">
              <Link 
                href="/dashboard/superadmin/users/new" 
                className="w-full block bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 text-center"
              >
                Añadir Usuario
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último acceso
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {userItem.fullName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userItem.fullName}</div>
                          <div className="text-sm text-gray-500">{userItem.email}</div>
                          <div className="text-xs text-gray-500">ID: {userItem.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${userItem.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 
                          userItem.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'}`}>
                        {userItem.role === 'superadmin' ? 'Super Admin' : 
                         userItem.role === 'admin' ? 'Administrador' : 'Conductor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${userItem.status === 'active' ? 'bg-green-100 text-green-800' : 
                          userItem.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'}`}>
                        {userItem.status === 'active' ? 'Activo' : 
                         userItem.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userItem.lastLogin}</div>
                      <div className="text-xs text-gray-500">Creado: {userItem.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <Link href={`/dashboard/superadmin/users/${userItem.id}`} className="text-purple-600 hover:text-purple-900">
                          Ver
                        </Link>
                        <Link href={`/dashboard/superadmin/users/${userItem.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                          Editar
                        </Link>
                        <div className="relative group">
                          <button className="text-gray-600 hover:text-gray-900">
                            Más
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            <button 
                              onClick={() => handleRoleChange(userItem.id, 'admin')}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Cambiar a Administrador
                            </button>
                            <button 
                              onClick={() => handleStatusChange(userItem.id, userItem.status === 'active' ? 'inactive' : 'active')}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              {userItem.status === 'active' ? 'Desactivar' : 'Activar'}
                            </button>
                            <button 
                              onClick={() => handleStatusChange(userItem.id, 'suspended')}
                              className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left"
                            >
                              Suspender
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500">No se encontraron usuarios que coincidan con los filtros.</p>
            </div>
          )}
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrando {filteredUsers.length} de {mockUsers.length} usuarios
            </div>
            <div className="flex space-x-2">
              <button className="bg-gray-200 text-gray-800 py-1 px-3 rounded hover:bg-gray-300">
                Anterior
              </button>
              <button className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
