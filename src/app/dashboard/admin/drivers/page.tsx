"use client";

import RequireRole from "../../../../components/RequireRole";
import DashboardLayout from "../../../../components/DashboardLayout";
import Link from "next/link";
import { useState } from "react";

interface Driver {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  rating?: number;
  completedRides?: number;
  verified?: boolean;
  createdAt: string;
}

export default function DriverManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data - en una aplicación real, estos datos vendrían de Firestore
  const mockDrivers: Driver[] = [
    {
      id: "driver_001",
      fullName: "Juan Pérez",
      email: "juan@example.com",
      phone: "+123456789",
      status: "active",
      rating: 4.8,
      completedRides: 245,
      verified: true,
      createdAt: "2023-01-15"
    },
    {
      id: "driver_002",
      fullName: "María López",
      email: "maria@example.com",
      phone: "+122333444",
      status: "inactive",
      rating: 4.5,
      completedRides: 120,
      verified: true,
      createdAt: "2023-02-20"
    },
    {
      id: "driver_003",
      fullName: "Carlos Rodríguez",
      email: "carlos@example.com",
      phone: "+155566677",
      status: "pending",
      rating: 0,
      completedRides: 0,
      verified: false,
      createdAt: "2023-06-10"
    },
    {
      id: "driver_004",
      fullName: "Ana Martínez",
      email: "ana@example.com",
      phone: "+199988877",
      status: "active",
      rating: 4.9,
      completedRides: 320,
      verified: true,
      createdAt: "2022-11-05"
    },
    {
      id: "driver_005",
      fullName: "Roberto Sánchez",
      email: "roberto@example.com",
      phone: "+166677788",
      status: "suspended",
      rating: 3.2,
      completedRides: 45,
      verified: true,
      createdAt: "2023-03-18"
    },
  ];

  // Filtrar conductores basados en búsqueda y estado
  const filteredDrivers = mockDrivers.filter(driver => {
    const matchesSearch = 
      driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.includes(searchTerm) ||
      driver.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (driverId: string, newStatus: string) => {
    // En una aplicación real, aquí se actualizaría el estado del conductor en Firestore
    console.log(`Cambiar estado del conductor ${driverId} a ${newStatus}`);
  };

  return (
    <RequireRole allowedRoles={['admin', 'superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestión de Conductores
            </h1>
            <Link 
              href="/dashboard/admin" 
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            >
              Volver al Dashboard
            </Link>
          </div>
          <p className="text-gray-600">Administre los conductores registrados en la plataforma.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                id="search"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar por nombre, email, teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="md:w-64">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                id="status"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
            
            <div className="md:w-48 md:self-end">
              <Link 
                href="/dashboard/admin/drivers/new" 
                className="w-full block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
              >
                Añadir Conductor
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conductor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {driver.fullName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.fullName}</div>
                          <div className="text-sm text-gray-500">ID: {driver.id}</div>
                          <div className="text-xs text-gray-500">Desde: {driver.createdAt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.email}</div>
                      <div className="text-sm text-gray-500">{driver.phone || "No disponible"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 
                          driver.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          driver.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {driver.status === 'active' ? 'Activo' : 
                         driver.status === 'inactive' ? 'Inactivo' :
                         driver.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {driver.verified ? 
                          <span className="text-green-500">Verificado</span> : 
                          <span className="text-red-500">No verificado</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="font-medium mr-1">{driver.rating || 'N/A'}</span>
                        {driver.rating ? (
                          <span className="text-yellow-400">★</span>
                        ) : null}
                      </div>
                      <div>{driver.completedRides} viajes</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <Link href={`/dashboard/admin/drivers/${driver.id}`} className="text-blue-600 hover:text-blue-900">
                          Ver
                        </Link>
                        <Link href={`/dashboard/admin/drivers/${driver.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleStatusChange(driver.id, driver.status === 'active' ? 'inactive' : 'active')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {driver.status === 'active' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDrivers.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500">No se encontraron conductores que coincidan con los filtros.</p>
            </div>
          )}
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrando {filteredDrivers.length} de {mockDrivers.length} conductores
            </div>
            <div className="flex space-x-2">
              <button className="bg-gray-200 text-gray-800 py-1 px-3 rounded hover:bg-gray-300">
                Anterior
              </button>
              <button className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
