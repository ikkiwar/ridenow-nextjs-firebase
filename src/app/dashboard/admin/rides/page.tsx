"use client";

import RequireRole from "../../../../components/RequireRole";
import DashboardLayout from "../../../../components/DashboardLayout";
import { useAuth } from "../../../../context/AuthProvider";
import { useState } from "react";

// Interfaces para los datos
interface Ride {
  id: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  fare: number;
  date: string;
  time: string;
  duration: number; // en minutos
  distance: number; // en kilómetros
  driverId: string;
  driverName: string;
  driverRating?: number;
  passengerName: string;
  passengerRating?: number;
  rating?: number;
}

export default function AdminRides() {
  useAuth(); // Keep the hook for authentication check
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  // Datos de muestra para los viajes
  const mockRides: Ride[] = [
    {
      id: "ride_001",
      status: "completed",
      pickupAddress: "Av. Winston Churchill, Santo Domingo",
      dropoffAddress: "Av. Abraham Lincoln, Santo Domingo",
      fare: 250,
      date: "2023-10-20",
      time: "14:30:00",
      duration: 22,
      distance: 5.7,
      driverId: "driver_001",
      driverName: "Juan Pérez",
      driverRating: 4.8,
      passengerName: "Carlos Méndez",
      passengerRating: 4.8,
      rating: 5
    },
    {
      id: "ride_002",
      status: "completed",
      pickupAddress: "Av. 27 de Febrero, Santo Domingo",
      dropoffAddress: "Av. John F. Kennedy, Santo Domingo",
      fare: 180,
      date: "2023-10-20",
      time: "10:15:00",
      duration: 15,
      distance: 3.2,
      driverId: "driver_002",
      driverName: "María López",
      driverRating: 4.6,
      passengerName: "María Rodríguez",
      passengerRating: 4.6,
      rating: 4
    },
    {
      id: "ride_003",
      status: "cancelled",
      pickupAddress: "Calle El Conde, Zona Colonial",
      dropoffAddress: "Malecón Center, Santo Domingo",
      fare: 0,
      date: "2023-10-19",
      time: "18:45:00",
      duration: 0,
      distance: 2.8,
      driverId: "driver_001",
      driverName: "Juan Pérez",
      driverRating: 4.8,
      passengerName: "Juan Pérez",
      passengerRating: 4.2
    },
    {
      id: "ride_004",
      status: "completed",
      pickupAddress: "Aeropuerto Las Américas, Santo Domingo",
      dropoffAddress: "Hotel Jaragua, Santo Domingo",
      fare: 950,
      date: "2023-10-19",
      time: "09:20:00",
      duration: 45,
      distance: 28.5,
      driverId: "driver_004",
      driverName: "Ana Martínez",
      driverRating: 4.9,
      passengerName: "Luis González",
      passengerRating: 4.9,
      rating: 5
    },
    {
      id: "ride_005",
      status: "in_progress",
      pickupAddress: "Universidad APEC, Santo Domingo",
      dropoffAddress: "Parque Mirador Sur, Santo Domingo",
      fare: 220,
      date: "2023-10-20",
      time: "16:10:00",
      duration: 18,
      distance: 4.3,
      driverId: "driver_002",
      driverName: "María López",
      driverRating: 4.6,
      passengerName: "Ana Torres",
      passengerRating: 4.7
    },
    {
      id: "ride_006",
      status: "completed",
      pickupAddress: "Blue Mall, Santo Domingo",
      dropoffAddress: "Ágora Mall, Santo Domingo",
      fare: 150,
      date: "2023-10-17",
      time: "13:40:00",
      duration: 12,
      distance: 2.1,
      driverId: "driver_001",
      driverName: "Juan Pérez",
      driverRating: 4.8,
      passengerName: "Roberto Sánchez",
      passengerRating: 4.5,
      rating: 4
    },
    {
      id: "ride_007",
      status: "cancelled",
      pickupAddress: "Acropolis Center, Santo Domingo",
      dropoffAddress: "Plaza Central, Santo Domingo",
      fare: 0,
      date: "2023-10-15",
      time: "11:05:00",
      duration: 0,
      distance: 6.2,
      driverId: "driver_002",
      driverName: "María López",
      driverRating: 4.6,
      passengerName: "Carmen Díaz",
      passengerRating: 4.3
    },
  ];

  // Obtener días únicos para el filtro
  const uniqueDates = [...new Set(mockRides.map(ride => ride.date))];
  
  // Filtrar viajes basados en la búsqueda y filtros
  const filteredRides = mockRides.filter(ride => {
    const matchesSearch = 
      ride.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.dropoffAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    const matchesDate = dateFilter === 'all' || ride.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calcular totales para estadísticas
  const completedRides = mockRides.filter(ride => ride.status === 'completed');
  const cancelledRides = mockRides.filter(ride => ride.status === 'cancelled');
  const inProgressRides = mockRides.filter(ride => ride.status === 'in_progress');
  const totalFare = completedRides.reduce((sum, ride) => sum + ride.fare, 0);

  const getStatusDisplayName = (status: string): string => {
    switch(status) {
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'in_progress': return 'En Progreso';
      default: return status;
    }
  };

  const getStatusClassName = (status: string): string => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <RequireRole allowedRoles={['admin', 'superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gestión de Viajes
          </h1>
          <p className="text-gray-600">
            Monitoreo y administración de viajes en la plataforma
          </p>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Total de Viajes</h2>
            <p className="text-3xl font-bold text-gray-700">{mockRides.length}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-blue-500 font-medium">
                {inProgressRides.length} en progreso
              </span>
              <span className="text-green-500 font-medium">
                {completedRides.length} completados
              </span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Ingresos Totales</h2>
            <p className="text-3xl font-bold text-green-500">${totalFare}</p>
            <p className="text-sm text-gray-500 mt-2">
              Promedio: ${completedRides.length > 0 ? (totalFare / completedRides.length).toFixed(0) : 0}/viaje
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Tasa de Completitud</h2>
            <p className="text-3xl font-bold text-purple-500">
              {mockRides.length > 0 ? (completedRides.length / mockRides.length * 100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {cancelledRides.length} viajes cancelados
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Viajes Activos</h2>
            <p className="text-3xl font-bold text-blue-500">{inProgressRides.length}</p>
            <p className="text-sm text-gray-500 mt-2">
              En tiempo real
            </p>
          </div>
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
                  placeholder="Buscar por dirección, conductor o pasajero..."
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
                <option value="completed">Completados</option>
                <option value="in_progress">En Progreso</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
            
            <div className="min-w-max">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <select
                id="date"
                name="date"
                className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Todas las fechas</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de viajes */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen - Destino
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conductor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pasajero
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarifa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRides.length > 0 ? (
                  filteredRides.map((ride) => (
                    <tr key={ride.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">{ride.id}</div>
                        <div className="text-gray-500">{new Date(ride.date).toLocaleDateString()} {ride.time.substring(0, 5)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="truncate max-w-xs">
                          <div>{ride.pickupAddress}</div>
                          <div className="text-gray-500">{ride.dropoffAddress}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusClassName(ride.status)}`}>
                          {getStatusDisplayName(ride.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900">{ride.driverName}</div>
                        {ride.driverRating && (
                          <div className="text-gray-500 flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            {ride.driverRating.toFixed(1)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900">{ride.passengerName}</div>
                        {ride.passengerRating && (
                          <div className="text-gray-500 flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            {ride.passengerRating.toFixed(1)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ride.fare > 0 ? `$${ride.fare.toFixed(0)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          onClick={() => setSelectedRide(ride)}
                        >
                          Detalles
                        </button>
                        {ride.status === 'in_progress' && (
                          <button 
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            Monitorear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron viajes que coincidan con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Modal de detalles del viaje */}
        {selectedRide && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Detalles del Viaje</h2>
                  <button 
                    onClick={() => setSelectedRide(null)}
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
                    <p className="text-sm font-medium text-gray-500">ID del Viaje</p>
                    <p className="mt-1">{selectedRide.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha y Hora</p>
                    <p className="mt-1">
                      {new Date(selectedRide.date).toLocaleDateString()} a las {selectedRide.time.substring(0, 5)}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Dirección de Recogida</p>
                  <p className="mt-1">{selectedRide.pickupAddress}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Dirección de Destino</p>
                  <p className="mt-1">{selectedRide.dropoffAddress}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estado</p>
                    <p className="mt-1">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusClassName(selectedRide.status)}`}>
                        {getStatusDisplayName(selectedRide.status)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Distancia</p>
                    <p className="mt-1">{selectedRide.distance.toFixed(1)} km</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duración</p>
                    <p className="mt-1">{selectedRide.duration} minutos</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Conductor</p>
                    <p className="mt-1 flex items-center">
                      {selectedRide.driverName} (ID: {selectedRide.driverId})
                      {selectedRide.driverRating && (
                        <span className="ml-2 flex items-center">
                          <span className="text-yellow-400 text-xs mr-1">★</span>
                          <span className="text-sm">{selectedRide.driverRating.toFixed(1)}</span>
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pasajero</p>
                    <p className="mt-1 flex items-center">
                      {selectedRide.passengerName}
                      {selectedRide.passengerRating && (
                        <span className="ml-2 flex items-center">
                          <span className="text-yellow-400 text-xs mr-1">★</span>
                          <span className="text-sm">{selectedRide.passengerRating.toFixed(1)}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tarifa</p>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      {selectedRide.fare > 0 ? `$${selectedRide.fare.toFixed(0)}` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Calificación del Viaje</p>
                    <div className="mt-1 flex items-center">
                      {selectedRide.rating ? (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-xl ${i < selectedRide.rating! ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </>
                      ) : (
                        <span className="text-gray-500">No calificado</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedRide.status === 'in_progress' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <strong>Viaje en progreso</strong> - Puede monitorear este viaje en tiempo real para comprobar la ubicación actual del conductor.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                {selectedRide.status === 'in_progress' && (
                  <button 
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    Monitorear en tiempo real
                  </button>
                )}
                <button 
                  onClick={() => setSelectedRide(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nota sobre los datos */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-700">
          <p>
            <strong>Nota:</strong> Estos datos son de muestra y no representan información real. En una aplicación en producción, 
            esta página mostraría datos extraídos de Firestore y actualizados en tiempo real.
          </p>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
