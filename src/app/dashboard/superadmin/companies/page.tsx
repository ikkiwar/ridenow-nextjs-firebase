"use client";

import { useState, useEffect } from "react";
import RequireRole from "../../../../components/RequireRole";
import { useAuth } from "../../../../context/AuthProvider";
import DashboardLayout from "../../../../components/DashboardLayout";
import { CompanyData, getAllCompanies, createCompany, updateCompany } from "../../../../utils/companyUtils";
import CompanyUserManager from "../../../../components/CompanyUserManager";

export default function CompaniesManager() {
  const { userRole } = useAuth();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [activeTab, setActiveTab] = useState<'companies' | 'users'>('companies');
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    primaryColor: "#FF5500",
    active: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompanies();
  }, [userRole]);

  async function loadCompanies() {
    try {
      setLoading(true);
      // Pasamos el rol de usuario para verificar permisos
      const companiesList = await getAllCompanies(userRole || undefined);
      setCompanies(companiesList);
    } catch (error) {
      console.error("Error cargando compañías:", error);
      setError("Error al cargar las compañías: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const companyData = {
        ...formData,
        active: true,
      };
      await createCompany(companyData);
      setIsCreateModalOpen(false);
      resetForm();
      await loadCompanies();
    } catch (error) {
      console.error("Error al crear compañía:", error);
      setError("Error al crear la compañía");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    try {
      setLoading(true);
      await updateCompany(selectedCompany.id, formData);
      setIsEditModalOpen(false);
      resetForm();
      await loadCompanies();
    } catch (error) {
      console.error("Error al actualizar compañía:", error);
      setError("Error al actualizar la compañía");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (company: CompanyData) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      contactEmail: company.contactEmail || "",
      contactPhone: company.contactPhone || "",
      primaryColor: company.primaryColor || "#FF5500",
      active: company.active,
    });
    setIsEditModalOpen(true);
  };

  const toggleCompanyStatus = async (company: CompanyData) => {
    try {
      setLoading(true);
      await updateCompany(company.id, { active: !company.active });
      await loadCompanies();
    } catch (error) {
      console.error("Error al cambiar estado de la compañía:", error);
      setError("Error al actualizar el estado de la compañía");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contactEmail: "",
      contactPhone: "",
      primaryColor: "#FF5500",
      active: true,
    });
    setSelectedCompany(null);
    setError("");
  };

  return (
    <RequireRole allowedRoles={['superadmin']}>
      <DashboardLayout>
        <div className="mb-4 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button 
                onClick={() => setActiveTab('companies')}
                className={`inline-block py-2 px-4 border-b-2 ${
                  activeTab === 'companies' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Administrar Compañías
              </button>
            </li>
            <li className="mr-2">
              <button 
                onClick={() => setActiveTab('users')}
                className={`inline-block py-2 px-4 border-b-2 ${
                  activeTab === 'users' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gestionar Usuarios
              </button>
            </li>
          </ul>
        </div>

        {activeTab === 'companies' ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Gestión de Compañías
                </h1>
                <p className="text-gray-600">
                  Administra todas las compañías del sistema
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                + Nueva Compañía
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email de Contacto
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Color Primario
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                          No hay compañías registradas
                        </td>
                      </tr>
                    ) : (
                      companies.map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b border-gray-200">{company.name}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{company.contactEmail || "-"}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{company.contactPhone || "-"}</td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            <div className="flex items-center">
                              <div
                                className="h-4 w-4 rounded-full mr-2"
                                style={{ backgroundColor: company.primaryColor || "#FF5500" }}
                              ></div>
                              {company.primaryColor || "#FF5500"}
                            </div>
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                company.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {company.active ? "Activa" : "Inactiva"}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            <button
                              onClick={() => openEditModal(company)}
                              className="text-blue-600 hover:underline mr-2"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => toggleCompanyStatus(company)}
                              className={`${
                                company.active ? "text-red-600" : "text-green-600"
                              } hover:underline`}
                            >
                              {company.active ? "Desactivar" : "Activar"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios por Compañía</h1>
            <CompanyUserManager 
              companies={companies} 
              onUserUpdated={loadCompanies}
            />
          </div>
        )}

        {/* Modal para crear nueva compañía */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Crear Nueva Compañía</h2>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleCreateCompany}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                    Color Primario
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="color"
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-md border border-gray-300 shadow-sm"
                    />
                    <span className="ml-3 text-sm text-gray-500">{formData.primaryColor}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creando..." : "Crear Compañía"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Modal para editar compañía */}
        {isEditModalOpen && selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Editar Compañía</h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleEditCompany}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                    Color Primario
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="color"
                      id="editPrimaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-md border border-gray-300 shadow-sm"
                    />
                    <span className="ml-3 text-sm text-gray-500">{formData.primaryColor}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Compañía activa</span>
                  </label>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RequireRole>
  );
}
