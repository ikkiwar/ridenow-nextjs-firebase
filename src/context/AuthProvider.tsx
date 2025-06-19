"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// Define tipo para el rol del usuario
export type UserRole = "driver" | "admin" | "superadmin" | null;

// Interface extendida para incluir información de rol
interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isDriver: boolean;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  hasPermission: () => false,
  isAdmin: false,
  isSuperAdmin: false,
  isDriver: false,
  getDashboardPath: () => '/dashboard',
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

  useEffect(() => {
    // Solo ejecutar en el lado del cliente
    if (typeof window !== 'undefined') {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);
        
        if (user) {
          try {
            // Intentar obtener el rol del usuario desde Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserRole(userData.role as UserRole || 'driver'); // Por defecto es driver
              
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
      hasPermission, 
      isAdmin, 
      isSuperAdmin, 
      isDriver,
      getDashboardPath
    }}>
      {children}
    </AuthContext.Provider>
  );
}
