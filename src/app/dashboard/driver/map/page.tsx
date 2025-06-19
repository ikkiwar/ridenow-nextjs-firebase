"use client";

import RequireRole from "../../../../components/RequireRole";
import DashboardLayout from "../../../../components/DashboardLayout";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

// Importar el mapa de manera dinámica para evitar problemas de SSR
const DriversMapClient = dynamic(() => import("../../../../components/DriversMapClient"), { ssr: false });

export default function DriverMapPage() {
  
  const [activeFilter, setActiveFilter] = useState<string>("all");

  return (
    <RequireRole allowedRoles={['driver', 'admin', 'superadmin']}>
      <DashboardLayout>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Mapa de Conductores
            </h1>
            <Link 
              href="/dashboard/driver" 
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            >
              Volver al Dashboard
            </Link>
          </div>
          <p className="text-gray-600">
            Ubicación en tiempo real de conductores registrados.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter("available")}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === "available"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setActiveFilter("busy")}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === "busy"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              En servicio
            </button>
            <button
              onClick={() => setActiveFilter("offline")}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === "offline"
                  ? "bg-gray-500 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              No disponibles
            </button>
          </div>
          
          <div className="h-[calc(100vh-300px)] min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
            <DriversMapClient />
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Filtro activo: {activeFilter === "all" ? "Todos" : 
                              activeFilter === "available" ? "Disponibles" : 
                              activeFilter === "busy" ? "En servicio" : 
                              "No disponibles"}</p>
            <p className="mt-1">Los marcadores mostrados son datos de ejemplo. En una versión completa, se aplicarían filtros en tiempo real.</p>
          </div>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}
