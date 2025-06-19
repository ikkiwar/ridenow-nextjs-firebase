"use client";

import RequireRole from "../../../../components/RequireRole";
import DashboardLayout from "../../../../components/DashboardLayout";
import { useAuth } from "../../../../context/AuthProvider";
import { useState } from "react";

// Interfaces para nuestras estructuras de datos
interface StatsData {
  period: string;
  totalRides: number;
  activeDrivers: number;
  completionRate: number;
  avgRating: number;
  revenue: number; // en la moneda local
  users: number;
  regions: number;
}

interface RegionData {
  id: string;
  name: string;
  activeDrivers: number;
  rides: number;
  revenue: number;
}

// Componente principal para la página de estadísticas del superadmin
export default function SuperAdminStats() {
  useAuth(); // Keep the hook for authentication check
  const [timePeriod, setTimePeriod] = useState<string>("week");
  
  // Datos de muestra para estadísticas generales
  const mockStatsData: Record<string, StatsData[]> = {
    day: [
      { period: "Hoy", totalRides: 645, activeDrivers: 82, completionRate: 93, avgRating: 4.7, revenue: 38750, users: 950, regions: 5 },
      { period: "Ayer", totalRides: 612, activeDrivers: 79, completionRate: 92, avgRating: 4.6, revenue: 36950, users: 945, regions: 5 },
      { period: "Hace 2 días", totalRides: 656, activeDrivers: 84, completionRate: 94, avgRating: 4.8, revenue: 39250, users: 940, regions: 5 },
      { period: "Hace 3 días", totalRides: 628, activeDrivers: 80, completionRate: 91, avgRating: 4.5, revenue: 37600, users: 935, regions: 5 },
      { period: "Hace 4 días", totalRides: 642, activeDrivers: 83, completionRate: 92, avgRating: 4.7, revenue: 38400, users: 930, regions: 5 },
      { period: "Hace 5 días", totalRides: 638, activeDrivers: 82, completionRate: 93, avgRating: 4.6, revenue: 38200, users: 928, regions: 5 },
      { period: "Hace 6 días", totalRides: 621, activeDrivers: 78, completionRate: 90, avgRating: 4.5, revenue: 37100, users: 925, regions: 5 },
    ],
    week: [
      { period: "Esta semana", totalRides: 4442, activeDrivers: 84, completionRate: 92, avgRating: 4.6, revenue: 267250, users: 950, regions: 5 },
      { period: "Semana pasada", totalRides: 4302, activeDrivers: 81, completionRate: 91, avgRating: 4.5, revenue: 258800, users: 920, regions: 5 },
      { period: "Hace 2 semanas", totalRides: 4175, activeDrivers: 79, completionRate: 90, avgRating: 4.6, revenue: 249100, users: 900, regions: 5 },
      { period: "Hace 3 semanas", totalRides: 4225, activeDrivers: 80, completionRate: 92, avgRating: 4.7, revenue: 253000, users: 880, regions: 4 },
    ],
    month: [
      { period: "Este mes", totalRides: 18350, activeDrivers: 86, completionRate: 91, avgRating: 4.6, revenue: 1100000, users: 950, regions: 5 },
      { period: "Mes pasado", totalRides: 17650, activeDrivers: 84, completionRate: 90, avgRating: 4.5, revenue: 1055000, users: 880, regions: 5 },
      { period: "Hace 2 meses", totalRides: 16450, activeDrivers: 82, completionRate: 89, avgRating: 4.6, revenue: 985000, users: 850, regions: 4 },
      { period: "Hace 3 meses", totalRides: 15720, activeDrivers: 79, completionRate: 90, avgRating: 4.7, revenue: 942000, users: 820, regions: 4 },
    ]
  };

  // Datos de muestra para estadísticas por región
  const mockRegionsData: RegionData[] = [
    { id: "reg_001", name: "Capital", activeDrivers: 32, rides: 245, revenue: 14700 },
    { id: "reg_002", name: "Norte", activeDrivers: 18, rides: 156, revenue: 9360 },
    { id: "reg_003", name: "Sur", activeDrivers: 14, rides: 124, revenue: 7440 },
    { id: "reg_004", name: "Este", activeDrivers: 11, rides: 84, revenue: 5040 },
    { id: "reg_005", name: "Oeste", activeDrivers: 7, rides: 36, revenue: 2160 },
  ];
  
  // Obtener los datos correspondientes al período seleccionado
  const currentStats = mockStatsData[timePeriod];
  
  // Función para calcular porcentajes de cambio
  const calculateChange = (currentValue: number, previousValue: number): string => {
    if (!previousValue) return "+0%"; // No hay valor previo
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };
  
  // Determinar la clase CSS según el cambio (positivo o negativo)
  const getChangeClass = (currentValue: number, previousValue: number): string => {
    if (!previousValue) return "text-gray-500";
    return currentValue >= previousValue ? "text-green-500" : "text-red-500";
  };

  return (
    <RequireRole allowedRoles={['superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Estadísticas y Análisis del Sistema
          </h1>
          <p className="text-gray-600">
            Vista completa del rendimiento de la plataforma en todas las regiones
          </p>
        </div>
        
        {/* Filtro de período */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setTimePeriod("day")}
                className={`px-4 py-2 rounded-md ${
                  timePeriod === 'day' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Por día
              </button>
              <button 
                onClick={() => setTimePeriod("week")}
                className={`px-4 py-2 rounded-md ${
                  timePeriod === 'week' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Por semana
              </button>
              <button 
                onClick={() => setTimePeriod("month")}
                className={`px-4 py-2 rounded-md ${
                  timePeriod === 'month' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Por mes
              </button>
            </div>
          </div>
        </div>
        
        {/* Resumen general del sistema */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-lg font-medium mb-4">Resumen del Sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Usuarios Totales</p>
              <p className="text-2xl font-bold text-purple-500">{currentStats[0].users}</p>
              <p className={`text-xs ${getChangeClass(currentStats[0].users, currentStats[1]?.users)}`}>
                {calculateChange(currentStats[0].users, currentStats[1]?.users)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Regiones Activas</p>
              <p className="text-2xl font-bold text-blue-500">{currentStats[0].regions}</p>
              <p className={`text-xs ${getChangeClass(currentStats[0].regions, currentStats[1]?.regions)}`}>
                {calculateChange(currentStats[0].regions, currentStats[1]?.regions)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-500">${currentStats[0].revenue.toLocaleString()}</p>
              <p className={`text-xs ${getChangeClass(currentStats[0].revenue, currentStats[1]?.revenue)}`}>
                {calculateChange(currentStats[0].revenue, currentStats[1]?.revenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conductores Activos</p>
              <p className="text-2xl font-bold text-yellow-500">{currentStats[0].activeDrivers}</p>
              <p className={`text-xs ${getChangeClass(currentStats[0].activeDrivers, currentStats[1]?.activeDrivers)}`}>
                {calculateChange(currentStats[0].activeDrivers, currentStats[1]?.activeDrivers)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Viajes Totales</h2>
            <p className="text-3xl font-bold text-blue-500">{currentStats[0].totalRides}</p>
            <p className={`text-sm mt-2 ${getChangeClass(currentStats[0].totalRides, currentStats[1]?.totalRides)}`}>
              {calculateChange(currentStats[0].totalRides, currentStats[1]?.totalRides)} vs. {currentStats[1]?.period}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Tasa de Completitud</h2>
            <p className="text-3xl font-bold text-purple-500">{currentStats[0].completionRate}%</p>
            <p className={`text-sm mt-2 ${getChangeClass(currentStats[0].completionRate, currentStats[1]?.completionRate)}`}>
              {calculateChange(currentStats[0].completionRate, currentStats[1]?.completionRate)} vs. {currentStats[1]?.period}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Calificación Media</h2>
            <p className="text-3xl font-bold text-amber-500">
              <span className="flex items-center">
                {currentStats[0].avgRating.toFixed(1)}
                <span className="text-amber-400 text-xl ml-1">★</span>
              </span>
            </p>
            <p className={`text-sm mt-2 ${getChangeClass(currentStats[0].avgRating, currentStats[1]?.avgRating)}`}>
              {calculateChange(currentStats[0].avgRating, currentStats[1]?.avgRating)} vs. {currentStats[1]?.period}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Ingresos Diarios</h2>
            <p className="text-3xl font-bold text-green-500">${(currentStats[0].revenue / (timePeriod === 'day' ? 1 : timePeriod === 'week' ? 7 : 30)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
            <p className="text-sm mt-2 text-gray-600">Promedio por día</p>
          </div>
        </div>
        
        {/* Rendimiento por Región */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8">
          <h2 className="text-lg font-medium p-6 border-b border-gray-200">Rendimiento por Región</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Región
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conductores Activos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Viajes (Hoy)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos (Hoy)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockRegionsData.map((region, index) => (
                  <tr key={region.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {region.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {region.activeDrivers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {region.rides}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${region.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">
                        Ver detalles
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        Administrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Tabla de estadísticas históricas */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8">
          <h2 className="text-lg font-medium p-6 border-b border-gray-200">Historial por Período</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Viajes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conductores Activos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasa de Completitud
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calificación Promedio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuarios
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStats.map((stat, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.totalRides}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.activeDrivers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.completionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        {stat.avgRating.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${stat.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.users}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Nota sobre los datos */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-700">
          <p>
            <strong>Nota:</strong> Estos datos son de muestra y no representan información real. En una aplicación en producción, 
            esta página mostraría datos extraídos de Firestore y actualizados en tiempo real para todas las regiones.
          </p>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
