"use client";

import RequireRole from "../../../../components/RequireRole";
import DashboardLayout from "../../../../components/DashboardLayout";
import { useAuth } from "../../../../context/AuthProvider";
import { useState } from "react";

// Interface para nuestra estructura de datos estadísticos
interface StatsData {
  period: string;
  totalRides: number;
  activeDrivers: number;
  completionRate: number;
  avgRating: number;
  revenue: number; // en la moneda local
}

// Componente principal para la página de estadísticas
export default function AdminStats() {
  useAuth(); // Keep the hook for authentication check but we don't need the values
  const [timePeriod, setTimePeriod] = useState<string>("week");
  
  // Datos de muestra - en una aplicación real, estos vendrían de Firestore o una API
  const mockStatsData: Record<string, StatsData[]> = {
    day: [
      { period: "Hoy", totalRides: 145, activeDrivers: 12, completionRate: 92, avgRating: 4.7, revenue: 8750 },
      { period: "Ayer", totalRides: 132, activeDrivers: 10, completionRate: 94, avgRating: 4.6, revenue: 7950 },
      { period: "Hace 2 días", totalRides: 156, activeDrivers: 14, completionRate: 91, avgRating: 4.8, revenue: 9250 },
      { period: "Hace 3 días", totalRides: 128, activeDrivers: 11, completionRate: 89, avgRating: 4.5, revenue: 7600 },
      { period: "Hace 4 días", totalRides: 142, activeDrivers: 13, completionRate: 93, avgRating: 4.7, revenue: 8400 },
      { period: "Hace 5 días", totalRides: 138, activeDrivers: 12, completionRate: 90, avgRating: 4.6, revenue: 8200 },
      { period: "Hace 6 días", totalRides: 121, activeDrivers: 9, completionRate: 88, avgRating: 4.5, revenue: 7100 },
    ],
    week: [
      { period: "Esta semana", totalRides: 962, activeDrivers: 14, completionRate: 91, avgRating: 4.6, revenue: 57250 },
      { period: "Semana pasada", totalRides: 902, activeDrivers: 13, completionRate: 90, avgRating: 4.5, revenue: 53800 },
      { period: "Hace 2 semanas", totalRides: 875, activeDrivers: 12, completionRate: 89, avgRating: 4.6, revenue: 52100 },
      { period: "Hace 3 semanas", totalRides: 925, activeDrivers: 13, completionRate: 92, avgRating: 4.7, revenue: 55000 },
    ],
    month: [
      { period: "Este mes", totalRides: 3850, activeDrivers: 16, completionRate: 90, avgRating: 4.6, revenue: 230000 },
      { period: "Mes pasado", totalRides: 3650, activeDrivers: 15, completionRate: 89, avgRating: 4.5, revenue: 218500 },
      { period: "Hace 2 meses", totalRides: 3450, activeDrivers: 14, completionRate: 88, avgRating: 4.6, revenue: 205000 },
      { period: "Hace 3 meses", totalRides: 3720, activeDrivers: 15, completionRate: 91, avgRating: 4.7, revenue: 222000 },
    ]
  };

  // Obtener los datos correspondientes al período seleccionado
  const currentStats = mockStatsData[timePeriod];
  
  // Obtener los porcentajes de cambio para mostrar las tendencias
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
    <RequireRole allowedRoles={['admin', 'superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Estadísticas y Análisis
          </h1>
          <p className="text-gray-600">
            Visualiza el rendimiento de la plataforma en tu región
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
        
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Viajes Totales</h2>
            <p className="text-3xl font-bold text-blue-500">{currentStats[0].totalRides}</p>
            <p className={`text-sm mt-2 ${getChangeClass(currentStats[0].totalRides, currentStats[1]?.totalRides)}`}>
              {calculateChange(currentStats[0].totalRides, currentStats[1]?.totalRides)} vs. {currentStats[1]?.period}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Conductores Activos</h2>
            <p className="text-3xl font-bold text-green-500">{currentStats[0].activeDrivers}</p>
            <p className={`text-sm mt-2 ${getChangeClass(currentStats[0].activeDrivers, currentStats[1]?.activeDrivers)}`}>
              {calculateChange(currentStats[0].activeDrivers, currentStats[1]?.activeDrivers)} vs. {currentStats[1]?.period}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Tasa de Completitud</h2>
            <p className="text-3xl font-bold text-purple-500">{currentStats[0].completionRate}%</p>
            <p className={`text-sm mt-2 ${getChangeClass(currentStats[0].completionRate, currentStats[1]?.completionRate)}`}>
              {calculateChange(currentStats[0].completionRate, currentStats[1]?.completionRate)} vs. {currentStats[1]?.period}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Ingresos</h2>
            <p className="text-3xl font-bold text-yellow-500">${currentStats[0].revenue.toLocaleString()}</p>
            <p className={`text-sm mt-2 ${getChangeClass(currentStats[0].revenue, currentStats[1]?.revenue)}`}>
              {calculateChange(currentStats[0].revenue, currentStats[1]?.revenue)} vs. {currentStats[1]?.period}
            </p>
          </div>
        </div>
        
        {/* Tabla de estadísticas */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8">
          <h2 className="text-lg font-medium p-6 border-b border-gray-200">Detalles por Período</h2>
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
            esta página mostraría datos extraídos de Firestore y actualizados en tiempo real.
          </p>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
