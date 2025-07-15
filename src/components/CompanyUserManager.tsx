"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { getUsersByCompany, transferUserBetweenCompanies, removeUserFromCompany } from "../utils/companyUtils";
import { UserData } from "../utils/roleUtils";
import { CompanyData } from "../utils/companyUtils";
import Image from "next/image";

interface CompanyUserManagerProps {
  companies: CompanyData[];
  onUserUpdated?: () => void;
}

export default function CompanyUserManager({ companies, onUserUpdated }: CompanyUserManagerProps) {
  const { currentCompany, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(currentCompany?.id || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [targetCompany, setTargetCompany] = useState<string>("");
  const [keepAccess, setKeepAccess] = useState<boolean>(false);
  
  // Load users based on selected company
  useEffect(() => {
    if (selectedCompany) {
      loadUsers(selectedCompany);
    }
  }, [selectedCompany]);
  
  async function loadUsers(companyId: string) {
    try {
      setLoading(true);
      setError(null);
      const companyUsers = await getUsersByCompany(companyId, { includeInactive: true });
      setUsers(companyUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Error al cargar usuarios: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompany(e.target.value);
  };
  
  const openTransferModal = (user: UserData) => {
    setSelectedUser(user);
    setTargetCompany("");
    setKeepAccess(false);
    setIsModalOpen(true);
  };
  
  const handleTransferUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !targetCompany) return;
    
    try {
      setLoading(true);
      await transferUserBetweenCompanies(selectedUser.uid, targetCompany, {
        keepAccessToPreviousCompany: keepAccess && selectedUser.role === 'superadmin'
      });
      
      setIsModalOpen(false);
      
      // Reload users
      if (selectedCompany) {
        await loadUsers(selectedCompany);
      }
      
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (err) {
      console.error("Error transferring user:", err);
      setError("Error al transferir usuario: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveFromCompany = async (userId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario de la compañía?")) {
      return;
    }
    
    try {
      setLoading(true);
      await removeUserFromCompany(userId);
      
      // Reload users
      if (selectedCompany) {
        await loadUsers(selectedCompany);
      }
      
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (err) {
      console.error("Error removing user:", err);
      setError("Error al eliminar usuario: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-2 rounded-lg mb-6 shadow-sm">
        Gestión de Usuarios por Compañía
      </h2>
      
      {/* Company selector */}
      {isSuperAdmin && (
        <div className="mb-6 bg-blue-50 p-5 rounded-lg border border-blue-200 shadow-sm">
          <label className="block text-sm font-bold text-blue-800 mb-3">Seleccionar Compañía</label>
          <div className="relative">
            <select
              value={selectedCompany || ""}
              onChange={handleCompanyChange}
              className="appearance-none block w-full px-4 py-3 text-base border border-blue-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 transition duration-150 ease-in-out"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #f0f9ff, #ffffff)'
              }}
            >
              <option value="">Seleccione una compañía</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-700">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-md mb-6 relative">
          <div className="flex items-center">
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button 
            className="absolute top-0 right-0 mt-3 mr-3" 
            onClick={() => setError(null)} 
            aria-label="Cerrar"
          >
            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {loading && !isModalOpen && (
        <div className="text-center py-6 bg-blue-50 border border-blue-100 rounded-lg mb-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="spinner-enhanced mb-2"></div>
            <p className="text-blue-700 font-medium">Cargando usuarios...</p>
          </div>
        </div>
      )}
      
      {/* Users table */}
      {!loading && selectedCompany && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200">
            <thead className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider rounded-tl-lg">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 italic">
                    No hay usuarios asignados a esta compañía.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.uid} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.photoURL ? (
                          <div className="h-8 w-8 rounded-full mr-3 relative overflow-hidden">
                            <Image 
                              src={user.photoURL} 
                              alt="Foto de perfil" 
                              width={32} 
                              height={32}
                              className="rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 font-medium shadow-sm">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || "Sin nombre"}
                          </div>
                          <div className="text-sm text-gray-500">{user.uid.substring(0, 12)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'superadmin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                          user.role === 'driver' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-green-100 text-green-800 border border-green-200'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' : 
                          user.status === 'inactive' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 
                          'bg-red-100 text-red-800 border border-red-200'}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openTransferModal(user)}
                          className="flex items-center justify-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 hover:text-indigo-900 rounded-md px-3 py-1.5 transition-colors duration-150"
                          title="Transferir usuario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                            <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                          </svg>
                          Transferir
                        </button>
                        <button
                          onClick={() => handleRemoveFromCompany(user.uid)}
                          className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded-md px-3 py-1.5 transition-colors duration-150"
                          title="Eliminar usuario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Transfer Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md border border-blue-200">
            <div className="flex items-center justify-between mb-6 border-b border-blue-100 pb-3">
              <h3 className="text-xl font-bold text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Transferir Usuario
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleTransferUser} className="space-y-5">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center">
                  {selectedUser.photoURL ? (
                    <div className="h-10 w-10 rounded-full mr-3 border-2 border-white shadow-sm relative overflow-hidden">
                      <Image 
                        src={selectedUser.photoURL} 
                        alt="Foto de perfil" 
                        width={40} 
                        height={40}
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 font-medium shadow-sm border-2 border-white">
                      {selectedUser.displayName?.charAt(0) || selectedUser.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Transferir a: <strong className="text-blue-900">{selectedUser.displayName || selectedUser.email}</strong>
                    </p>
                    <p className="text-xs text-blue-600">
                      Rol actual: <span className="font-semibold">{selectedUser.role}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Compañía Destino</label>
                <div className="relative">
                  <select
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-50 shadow-sm"
                    style={{
                      backgroundImage: 'linear-gradient(to bottom right, #f0f9ff, #ffffff)'
                    }}
                    required
                  >
                    <option value="">Seleccione una compañía</option>
                    {companies
                      .filter(company => company.id !== selectedCompany)
                      .map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))
                    }
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-600">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Only show this option for superadmins */}
              {selectedUser.role === 'superadmin' && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 flex items-center my-4">
                  <input
                    type="checkbox"
                    id="keepAccess"
                    checked={keepAccess}
                    onChange={(e) => setKeepAccess(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="keepAccess" className="ml-2 text-sm text-yellow-800 font-medium">
                    Mantener acceso a la compañía actual
                  </label>
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex items-center justify-center bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!targetCompany || loading}
                  className={`flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                    !targetCompany || loading 
                      ? 'bg-indigo-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                        <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                      </svg>
                      Transferir Usuario
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .spinner {
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-top-color: #3498db;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        
        .spinner-enhanced {
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
