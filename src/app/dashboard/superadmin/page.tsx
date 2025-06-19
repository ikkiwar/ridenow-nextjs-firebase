"use client";

import RequireRole from "../../../components/RequireRole";
import { useAuth } from "../../../context/AuthProvider";
import DashboardLayout from "../../../components/DashboardLayout";
import Link from "next/link";
import dynamic from "next/dynamic";

// Importar el mapa de manera dinámica para evitar problemas de SSR
const DriversMapClient = dynamic(() => import("../../../components/DriversMapClient"), { ssr: false });

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  return (
    <RequireRole allowedRoles={['superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard de Super Administrador
          </h1>
          <p className="text-gray-600">Bienvenido/a, {user?.displayName || user?.email}</p>
        </div>
            
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Usuarios Totales</h2>
            <p className="text-3xl font-bold text-purple-500">124</p>
            <p className="text-sm text-gray-500 mt-2">+12 esta semana</p>
          </div>
              
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Administradores</h2>
            <p className="text-3xl font-bold text-blue-500">8</p>
            <p className="text-sm text-gray-500 mt-2">Sin cambios</p>
          </div>
              
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Conductores</h2>
            <p className="text-3xl font-bold text-green-500">112</p>
            <p className="text-sm text-gray-500 mt-2">+10 esta semana</p>
          </div>
              
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Regiones Activas</h2>
            <p className="text-3xl font-bold text-yellow-500">5</p>
            <p className="text-sm text-gray-500 mt-2">+1 nuevo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Distribución de Usuarios</h2>
                <Link href="/dashboard/superadmin/stats" className="text-sm text-blue-600 hover:underline">
                  Ver más
                </Link>
              </div>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de distribución de usuarios</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Monitoreo de Conductores</h2>
              <div className="h-80 bg-gray-100 rounded-lg overflow-hidden">
                <DriversMapClient />
              </div>
            </div>
          </div>
              
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Administración del Sistema</h2>
            <div className="flex flex-col space-y-3">
              <Link href="/dashboard/superadmin/users" className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 text-center">
                Gestionar Usuarios
              </Link>
              <Link href="/dashboard/superadmin/roles" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center">
                Gestionar Roles
              </Link>
              <Link href="/dashboard/superadmin/regions" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center">
                Gestionar Regiones
              </Link>
              <Link href="/dashboard/superadmin/settings" className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 text-center">
                Configuración del Sistema
              </Link>
              <Link href="/dashboard/superadmin/logs" className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 text-center">
                Registros del Sistema
              </Link>
            </div>
              
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Información del Sistema</h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm">
                  <span className="text-gray-600">Versión</span>
                  <span className="font-medium">1.0.0</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-600">Estado</span>
                  <span className="font-medium text-green-500">Operativo</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-600">Última actualización</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
            
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Ingresos Mensuales</h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Gráfico de Ingresos</p>
            </div>
          </div>
                
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Viajes Completados</h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Gráfico de Viajes</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
