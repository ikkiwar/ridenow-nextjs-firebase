"use client";

import { useEffect, useState } from "react";
import RequireRole from "../../../components/RequireRole";
import { useAuth } from "../../../context/AuthProvider";
import DashboardLayout from "../../../components/DashboardLayout";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getCompanyDrivers } from "../../../utils/driverUtils";

// Importar el mapa de manera dinámica para evitar problemas de SSR
const DriversMapClient = dynamic(() => import("../../../components/DriversMapClient"), { ssr: false });

interface Ride {
  id: string;
  createdAt?: {
    toDate: () => Date;
  };
}

export default function AdminDashboard() {
  const { user, companyId, currentCompany } = useAuth();
  const [activeDrivers, setActiveDrivers] = useState<number>(0);
  const [todayRides, setTodayRides] = useState<number>(0);
  const [pendingDrivers, setPendingDrivers] = useState<number>(0);
  const [reportCount, setReportCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCompanyStats() {
      if (!companyId) return;
      
      try {
        setLoading(true);
        
        // Cargar los conductores de la compañía
        const drivers = await getCompanyDrivers(companyId);
        const activeDriversCount = drivers.filter(driver => driver.status === "available").length;
        const pendingDriversCount = drivers.filter(driver => 
          driver.documents?.license?.verified === false || 
          driver.documents?.insurance?.verified === false
        ).length;
        
        setActiveDrivers(activeDriversCount);
        setPendingDrivers(pendingDriversCount);
        
        // Cargar los viajes de la compañía (simulado por ahora)
        // En una implementación real, esto vendría de una función getCompanyRides
        const rides: Ride[] = []; // Simulado para demostración
        
        // Filtrar viajes de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        const todayRidesCount = rides.filter(ride => {
          const rideDate = ride.createdAt?.toDate?.();
          return rideDate && rideDate.getTime() >= todayTimestamp;
        }).length;
        
        setTodayRides(todayRidesCount);
        
        // Contar reportes (simulado por ahora)
        // En una implementación real, esto vendría de una colección de reportes en Firestore
        setReportCount(Math.floor(Math.random() * 5)); // Simulado para demostración
      } catch (error) {
        console.error("Error al cargar estadísticas de la compañía:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCompanyStats();
  }, [companyId]);

  return (
    <RequireRole allowedRoles={['admin', 'superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard de Administrador
          </h1>
          <p className="text-gray-600">
            Bienvenido/a, {user?.displayName || user?.email}
            {currentCompany && (
              <span className="ml-1">
                | Compañía: <strong>{currentCompany.name}</strong>
              </span>
            )}
          </p>
        </div>
        
        {!companyId ? (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-6">
            No hay compañía seleccionada. Por favor, seleccione una compañía para ver los datos del dashboard.
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse text-gray-500">Cargando datos de la compañía...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-base md:text-lg font-medium mb-2 md:mb-4">Conductores Activos</h2>
              <p className="text-2xl md:text-3xl font-bold text-blue-500">{activeDrivers}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-2">Listos para asignaciones</p>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-base md:text-lg font-medium mb-2 md:mb-4">Viajes Hoy</h2>
              <p className="text-2xl md:text-3xl font-bold text-green-500">{todayRides}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-2">{new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-base md:text-lg font-medium mb-2 md:mb-4">Pendientes de Aprobación</h2>
              <p className="text-2xl md:text-3xl font-bold text-yellow-500">{pendingDrivers}</p>
              <div className="mt-2">
                <Link href="/dashboard/admin/drivers?filter=pending" className="text-xs md:text-sm text-blue-600 hover:underline">
                  Ver solicitudes
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-base md:text-lg font-medium mb-2 md:mb-4">Reportes</h2>
              <p className="text-2xl md:text-3xl font-bold text-red-500">{reportCount}</p>
              <div className="mt-2">
                <Link href="/dashboard/admin/reports" className="text-sm text-blue-600 hover:underline">
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {companyId && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Mapa de Conductores en Tiempo Real</h2>
                <div className="h-60 sm:h-80 bg-gray-100 rounded-lg overflow-hidden">
                  <DriversMapClient />
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  <Link href="/dashboard/admin/drivers" className="bg-blue-500 text-white py-2 px-3 text-sm md:text-base rounded hover:bg-blue-600 text-center transition-colors">
                    Gestionar Conductores
                  </Link>
                  <Link href="/dashboard/admin/rides" className="bg-green-500 text-white py-2 px-3 text-sm md:text-base rounded hover:bg-green-600 text-center transition-colors">
                    Gestionar Viajes
                  </Link>
                  <Link href="/dashboard/admin/reports" className="bg-red-500 text-white py-2 px-3 text-sm md:text-base rounded hover:bg-red-600 text-center transition-colors">
                    Ver Reportes
                  </Link>
                  <Link href="/dashboard/admin/stats" className="bg-purple-500 text-white py-2 px-3 text-sm md:text-base rounded hover:bg-purple-600 text-center transition-colors">
                    Estadísticas
                  </Link>
                  <Link href="/dashboard/admin/regions" className="bg-yellow-500 text-white py-2 px-3 text-sm md:text-base rounded hover:bg-yellow-600 text-center transition-colors">
                    Configurar Regiones
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex flex-wrap justify-between items-center mb-3 md:mb-4 gap-2">
                <h2 className="text-lg md:text-xl font-semibold">Actividad Reciente</h2>
                <Link href="/dashboard/admin/activity" className="text-xs md:text-sm text-blue-600 hover:underline">
                  Ver todo
                </Link>
              </div>
              
              <div className="bg-white rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {loading ? (
                    <li className="p-4 text-center text-gray-500">Cargando actividad reciente...</li>
                  ) : (
                    <>
                      <li className="p-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <p>Nuevo conductor registrado: <span className="font-medium">Carlos M.</span></p>
                          <span className="ml-auto text-sm text-gray-500">hace 5 min</span>
                        </div>
                      </li>
                      <li className="p-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <p>Viaje completado #2459 - <span className="font-medium">$25.50</span></p>
                          <span className="ml-auto text-sm text-gray-500">hace 18 min</span>
                        </div>
                      </li>
                      <li className="p-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                          <p>Reporte recibido de usuario #127</p>
                          <span className="ml-auto text-sm text-gray-500">hace 37 min</span>
                        </div>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </RequireRole>
  );
}
