"use client";

import { useAuth } from "../../context/AuthProvider";
import RequireAuth from "../../components/RequireAuth";
import DashboardLayout from "../../components/DashboardLayout";
import RoleInfo from "../../components/RoleInfo";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { user, userRole, isAdmin, isSuperAdmin, isDriver, getDashboardPath } = useAuth();
  const router = useRouter();

  // Redireccionar a la página específica del rol
  useEffect(() => {
    if (user && userRole) {
      router.push(getDashboardPath());
    }
  }, [user, userRole, getDashboardPath, router]);

  const getRoleName = () => {
    if (isSuperAdmin) return "Super Administrador";
    if (isAdmin) return "Administrador";
    if (isDriver) return "Conductor";
    return "Usuario";
  };

  const getRoleRoute = () => {
    if (isSuperAdmin) return "/dashboard/superadmin";
    if (isAdmin) return "/dashboard/admin";
    if (isDriver) return "/dashboard/driver";
    return "#";
  };

  return (
    <RequireAuth>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido/a a RideNow
          </h1>
          <p className="text-gray-600">
            {user?.displayName || user?.email}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Información de Cuenta</h2>
          
          <div className="mb-6">
            <RoleInfo showPermissions={true} className="w-full max-w-sm" />
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-lg mb-2">Panel de {getRoleName()}</h3>
            <p className="text-sm text-gray-600 mb-3">
              Serás redirigido automáticamente al panel específico para tu rol. 
              Si no eres redirigido, haz clic en el botón siguiente:
            </p>
            <Link 
              href={getRoleRoute()} 
              className="inline-block bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
            >
              Ir al Dashboard de {getRoleName()}
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Estado del Sistema</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>API operativa</span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>Base de datos conectada</span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>Servicios de mapas operativos</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Versión Actual</h2>
            <p className="text-gray-600 mb-2">RideNow v1.0.0</p>
            <p className="text-xs text-gray-500">Última actualización: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
