"use client";

import RequireRole from "../../../components/RequireRole";
import { useAuth } from "../../../context/AuthProvider";
import DashboardLayout from "../../../components/DashboardLayout";
import { useState } from "react";
import Link from "next/link";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("available");

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    // Aquí se implementaría la actualización del estado en Firestore
    // updateDriverStatus(user.uid, newStatus);
  };

  return (
    <RequireRole allowedRoles={['driver', 'admin', 'superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard de Conductor
          </h1>
          <p className="text-gray-600">Bienvenido/a, {user?.displayName || user?.email}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Estado Actual</h2>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center mb-4">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  status === 'available' ? 'bg-green-500' : 
                  status === 'busy' ? 'bg-yellow-500' : 
                  status === 'offline' ? 'bg-gray-500' : ''
                }`}></span>
                <span className="capitalize">{status === 'available' ? 'Disponible' : 
                           status === 'busy' ? 'En servicio' : 
                           status === 'offline' ? 'No disponible' : ''}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleStatusChange('available')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'available' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  Disponible
                </button>
                <button 
                  onClick={() => handleStatusChange('busy')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'busy' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  En servicio
                </button>
                <button 
                  onClick={() => handleStatusChange('offline')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'offline' 
                      ? 'bg-gray-500 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  No disponible
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Viajes Completados</h2>
            <p className="text-3xl font-bold text-yellow-500">0</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Calificación</h2>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-yellow-500 mr-2">5.0</span>
              <div className="flex text-yellow-400">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/driver/map" className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 text-center">
              Ver Mapa en Tiempo Real
            </Link>
            <Link href="/dashboard/driver/rides" className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 text-center">
              Historial de Viajes
            </Link>
            <Link href="/dashboard/driver/profile" className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 text-center">
              Perfil del Conductor
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Próximos Viajes</h2>
          <div className="text-gray-500 italic">No hay viajes programados.</div>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
