"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { CompanyData } from "../utils/companyUtils";

// Define tipo para el rol del usuario
export type UserRole = "driver" | "admin" | "superadmin" | null;

// Interface extendida para incluir información de rol y compañía
interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole;
  companyId: string | null;
  currentCompany: CompanyData | null;
  userCompanies: CompanyData[];
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isDriver: boolean;
  getDashboardPath: () => string;
  setCurrentCompany: (companyId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  companyId: null,
  currentCompany: null,
  userCompanies: [],
  hasPermission: () => false,
  isAdmin: false,
  isSuperAdmin: false,
  isDriver: false,
  getDashboardPath: () => '/dashboard',
  setCurrentCompany: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Mapeo de permisos por rol
const rolePermissions: Record<string, string[]> = {
  driver: [
    "view_own_rides",
    "update_own_status",
    "update_own_location",
    "accept_rides",
    "complete_rides"
  ],
  admin: [
    "view_all_rides",
    "manage_drivers",
    "view_stats",
    "manage_regions",
    "view_own_rides",
    "update_own_status",
    "update_own_location"
  ],
  superadmin: [
    "view_all_rides",
    "manage_drivers",
    "view_stats",
    "manage_regions",
    "manage_admins",
    "configure_system",
    "manage_roles",
    "view_own_rides",
    "update_own_status",
    "update_own_location"
  ]
};

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [currentCompany, setCurrentCompany] = useState<CompanyData | null>(null);
  const [userCompanies, setUserCompanies] = useState<CompanyData[]>([]);

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission: string): boolean => {
    if (!userRole) return false;
    return rolePermissions[userRole]?.includes(permission) || false;
  };

  // Propiedades computadas para roles comunes
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isSuperAdmin = userRole === 'superadmin';
  const isDriver = userRole === 'driver';
  
  // Obtener la ruta del dashboard correspondiente al rol del usuario
  const getDashboardPath = () => {
    if (isSuperAdmin) return '/dashboard/superadmin';
    if (isAdmin) return '/dashboard/admin';
    if (isDriver) return '/dashboard/driver';
    return '/dashboard'; // Ruta por defecto
  };
  
  // Función para cambiar la compañía activa (para superadmins que gestionan múltiples compañías)
  const handleSetCurrentCompany = async (newCompanyId: string) => {
    try {
      const companyRef = doc(db, 'companies', newCompanyId);
      const companyDoc = await getDoc(companyRef);
      
      if (companyDoc.exists()) {
        const companyData = companyDoc.data() as CompanyData;
        setCompanyId(newCompanyId);
        setCurrentCompany(companyData);
        
        // Guardar la selección en localStorage para persistencia
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedCompanyId', newCompanyId);
        }
      }
    } catch (error) {
      console.error('Error al cambiar de compañía:', error);
    }
  };

  useEffect(() => {
    // Solo ejecutar en el lado del cliente
    if (typeof window !== 'undefined') {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);
        
        if (user) {
          try {
            // Intentar obtener el rol y compañía del usuario desde Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userRole = userData.role as UserRole || 'driver';
              setUserRole(userRole);
              
              // Obtener compañía del usuario
              if (userData.companyId) {
                setCompanyId(userData.companyId as string);
                
                // Cargar los datos de la compañía
                try {
                  const companyRef = doc(db, 'companies', userData.companyId as string);
                  const companyDoc = await getDoc(companyRef);
                  if (companyDoc.exists()) {
                    setCurrentCompany(companyDoc.data() as CompanyData);
                  }
                } catch (companyErr) {
                  console.error('Error al obtener datos de la compañía:', companyErr);
                }
              }
              
              // Para superadmin, cargar todas las compañías a las que tiene acceso
              if (userRole === 'superadmin') {
                try {
                  const companiesAccess = userData.companiesAccess || [];
                  const companies: CompanyData[] = [];
                  
                  if (Array.isArray(companiesAccess) && companiesAccess.length > 0) {
                    // Cargar solo las primeras 10 compañías para evitar demasiadas consultas
                    const companiesToLoad = companiesAccess.slice(0, 10);
                    
                    for (const companyId of companiesToLoad) {
                      const companyRef = doc(db, 'companies', companyId);
                      const companyDoc = await getDoc(companyRef);
                      
                      if (companyDoc.exists()) {
                        companies.push(companyDoc.data() as CompanyData);
                      }
                    }
                  }
                  
                  setUserCompanies(companies);
                  
                  // Si hay compañías pero no hay ninguna seleccionada, seleccionar la primera
                  if (companies.length > 0 && !userData.companyId) {
                    await handleSetCurrentCompany(companies[0].id);
                  }
                } catch (companiesErr) {
                  console.error('Error al cargar compañías del superadmin:', companiesErr);
                }
              }
              
              // Actualizar lastLogin si existe el documento, manteniendo el resto de datos
              try {
                await updateDoc(doc(db, 'users', user.uid), {
                  lastLogin: serverTimestamp()
                  // Solo actualizamos lastLogin, manteniendo el resto de campos como están
                });
              } catch (updateErr) {
                console.error('Error al actualizar lastLogin:', updateErr);
              }
            } else {
              // Si el usuario no tiene un documento en Firestore, crear uno con rol por defecto
              try {
                await setDoc(doc(db, 'users', user.uid), {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName || null,
                  photoURL: user.photoURL || null,
                  phoneNumber: user.phoneNumber || null,
                  role: 'driver',
                  status: 'active',
                  createdAt: serverTimestamp(),
                  lastLogin: serverTimestamp(),
                });
                setUserRole('driver');
              } catch (createErr) {
                console.error('Error al crear documento de usuario:', createErr);
                setUserRole('driver');
              }
            }
          } catch (error) {
            console.error('Error al obtener el rol del usuario:', error);
            setUserRole('driver'); // Rol por defecto en caso de error
          }
        } else {
          setUserRole(null);
          setCompanyId(null);
          setCurrentCompany(null);
          setUserCompanies([]);
        }
        
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // En el servidor, simplemente establecer loading=false
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      userRole, 
      companyId,
      currentCompany,
      userCompanies,
      hasPermission, 
      isAdmin, 
      isSuperAdmin, 
      isDriver,
      getDashboardPath,
      setCurrentCompany: handleSetCurrentCompany
    }}>
      {children}
    </AuthContext.Provider>
  );
}
