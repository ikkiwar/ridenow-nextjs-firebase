"use client";

import RequireRole from "../../../../components/RequireRole";
import DashboardLayout from "../../../../components/DashboardLayout";
import { useAuth } from "../../../../context/AuthProvider";
import { useState } from "react";

// Interfaces para los datos
interface Region {
  id: string;
  name: string;
  code: string;
  status: string;
  admins: number;
  drivers: number;
  createdAt: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export default function RegionsManagement() {
  useAuth(); // Keep the hook for authentication check
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddRegionModal, setShowAddRegionModal] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // Datos de muestra para las regiones
  const mockRegions: Region[] = [
    {
      id: "reg_001",
      name: "Capital",
      code: "CAP",
      status: "active",
      admins: 3,
      drivers: 32,
      createdAt: "2022-10-15",
      coordinates: {
        lat: 18.4861,
        lng: -69.9312
      }
    },
    {
      id: "reg_002",
      name: "Norte",
      code: "NTE",
      status: "active",
      admins: 2,
      drivers: 18,
      createdAt: "2023-01-20",
      coordinates: {
        lat: 19.7983,
        lng: -70.6927
      }
    },
    {
      id: "reg_003",
      name: "Sur",
      code: "SUR",
      status: "active",
      admins: 1,
      drivers: 14,
      createdAt: "2023-02-05",
      coordinates: {
        lat: 18.2083,
        lng: -71.0950
      }
    },
    {
      id: "reg_004",
      name: "Este",
      code: "EST",
      status: "active",
      admins: 1,
      drivers: 11,
      createdAt: "2023-03-10",
      coordinates: {
        lat: 18.6821,
        lng: -68.4505
      }
    },
    {
      id: "reg_005",
      name: "Oeste",
      code: "OES",
      status: "inactive",
      admins: 1,
      drivers: 7,
      createdAt: "2023-04-25",
      coordinates: {
        lat: 19.1800,
        lng: -71.7000
      }
    },
  ];

  // Filtrar regiones basadas en la búsqueda y el estado
  const filteredRegions = mockRegions.filter(region => {
    const matchesSearch = 
      region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || region.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (regionId: string, newStatus: string) => {
    // En una aplicación real, aquí se actualizaría el estado de la región en Firestore
    console.log(`Cambiar estado de la región ${regionId} a ${newStatus}`);
  };

  const handleViewRegion = (region: Region) => {
    setSelectedRegion(region);
  };

  const handleAddRegion = (formData: FormData) => {
    // En una aplicación real, aquí se crearía una nueva región en Firestore
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    console.log(`Añadir región: ${name} (${code})`);
    setShowAddRegionModal(false);
  };

  return (
    <RequireRole allowedRoles={['superadmin']}>
      <DashboardLayout>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestión de Regiones
            </h1>
            <p className="text-gray-600">
              Administra las regiones geográficas del sistema
            </p>
          </div>
          <button 
            onClick={() => setShowAddRegionModal(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Añadir Región
            </span>
          </button>
        </div>
        
        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="sr-only">Buscar</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  placeholder="Buscar por nombre o código..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="min-w-max">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                id="status"
                name="status"
                className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de regiones */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administradores
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conductores
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => (
                    <tr key={region.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {region.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {region.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          region.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {region.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {region.admins}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {region.drivers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(region.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          onClick={() => handleViewRegion(region)}
                        >
                          Ver
                        </button>
                        <button 
                          className={`mr-3 ${
                            region.status === 'active' 
                              ? 'text-yellow-600 hover:text-yellow-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          onClick={() => handleStatusChange(region.id, region.status === 'active' ? 'inactive' : 'active')}
                        >
                          {region.status === 'active' ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron regiones que coincidan con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Modal de detalles de la región */}
        {selectedRegion && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Detalles de la Región</h2>
                  <button 
                    onClick={() => setSelectedRegion(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID de la Región</p>
                    <p className="mt-1">{selectedRegion.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre</p>
                    <p className="mt-1">{selectedRegion.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Código</p>
                    <p className="mt-1">{selectedRegion.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estado</p>
                    <p className="mt-1">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                        selectedRegion.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedRegion.status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Administradores</p>
                    <p className="mt-1">{selectedRegion.admins}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Conductores</p>
                    <p className="mt-1">{selectedRegion.drivers}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                    <p className="mt-1">{new Date(selectedRegion.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Coordenadas</p>
                    <p className="mt-1">
                      {selectedRegion.coordinates 
                        ? `Lat: ${selectedRegion.coordinates.lat}, Lng: ${selectedRegion.coordinates.lng}` 
                        : 'No disponibles'}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Acciones</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors">
                      Editar Región
                    </button>
                    <button className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors">
                      Ver Administradores
                    </button>
                    <button className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-600 transition-colors">
                      Ver Conductores
                    </button>
                    <button className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 transition-colors">
                      Ver Estadísticas
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal para añadir región */}
        {showAddRegionModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Añadir Nueva Región</h2>
                  <button 
                    onClick={() => setShowAddRegionModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddRegion(new FormData(e.target as HTMLFormElement));
              }}>
                <div className="px-6 py-4">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Región
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="Ej: Región Central"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                      Código de la Región
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      required
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="Ej: CEN"
                      maxLength={5}
                    />
                    <p className="mt-1 text-xs text-gray-500">Código único de 2-5 caracteres</p>
                  </div>
                  
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                        Latitud
                      </label>
                      <input
                        type="number"
                        id="latitude"
                        name="latitude"
                        step="any"
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        placeholder="Ej: 18.4861"
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                        Longitud
                      </label>
                      <input
                        type="number"
                        id="longitude"
                        name="longitude"
                        step="any"
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        placeholder="Ej: -69.9312"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      defaultValue="active"
                    >
                      <option value="active">Activa</option>
                      <option value="inactive">Inactiva</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddRegionModal(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors mr-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    Guardar Región
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Nota sobre los datos */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-700">
          <p>
            <strong>Nota:</strong> Estos datos son de muestra y no representan información real. En una aplicación en producción, 
            esta página mostraría datos extraídos de Firestore y permitiría la gestión completa de las regiones geográficas.
          </p>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
