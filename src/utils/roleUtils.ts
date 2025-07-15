import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { UserRole } from "../context/AuthProvider";

/**
 * Define los posibles estados de un usuario
 */
export type UserStatus = "active" | "inactive" | "suspended";

/**
 * Interfaz para los datos de un usuario en Firestore
 */
export interface UserData {
  uid: string;
  role: UserRole;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  status?: UserStatus;
  companyId?: string | null;  // ID de la compañía principal a la que pertenece
  companiesAccess?: string[]; // Array de IDs de compañías a las que tiene acceso (para superadmin)
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastLogin?: Timestamp;
  forceRoleUpdate?: boolean; // Flag para forzar la actualización del rol
  metadata?: {
    driverId?: string;      // ID del conductor (para rol driver)
    licenseVerified?: boolean;
    documentsVerified?: boolean;
    managedRegions?: string[]; // Regiones que administra (para rol admin)
  };
  [key: string]: unknown;
}

/**
 * Asigna un rol a un usuario en Firestore y opcionalmente lo asocia a una compañía
 * 
 * @param userId - El ID del usuario
 * @param role - El rol a asignar ('driver', 'admin', 'superadmin')
 * @param options - Opciones adicionales para asignación de rol
 * @returns Promise<void>
 */
export async function assignUserRole(
  userId: string, 
  role: UserRole,
  options: {
    companyId?: string;           // La compañía a la que se asigna el usuario
    forceRoleUpdate?: boolean;    // Forzar la actualización del rol aunque ya exista
    companiesAccess?: string[];   // Array de IDs de compañías a las que tendrá acceso (para superadmin)
    metadata?: {                  // Metadatos específicos del rol
      driverId?: string;          // ID de conductor 
      licenseVerified?: boolean;
      documentsVerified?: boolean;
      managedRegions?: string[];  // Regiones que gestiona (para admin)
    };
    [key: string]: unknown;       // Otros campos adicionales
  } = {}
): Promise<void> {
  if (!role) {
    throw new Error("El rol no puede estar vacío");
  }

  const userRef = doc(db, "users", userId);
  
  try {
    // Verificar si el usuario ya existe
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Obtener los datos actuales del usuario
      const userData = userDoc.data();
      const currentRole = userData.role;
      
      // Verificar si el rol debe cambiarse
      const shouldUpdateRole = options.forceRoleUpdate === true && role !== currentRole;
      
      // Preparamos los campos a actualizar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: {[key: string]: any} = {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Si debemos actualizar el rol, lo añadimos
      if (shouldUpdateRole) {
        updateData.role = role;
      }
      
      // Si se especificó una companyId, la añadimos
      if (options.companyId) {
        updateData.companyId = options.companyId;
      }
      
      // Si es superadmin y se especificaron compañías de acceso, las añadimos
      if (role === 'superadmin' && options.companiesAccess) {
        updateData.companiesAccess = options.companiesAccess;
      }
      
      // Si hay metadatos, los procesamos
      if (options.metadata) {
        updateData.metadata = {
          ...(userData.metadata || {}),
          ...options.metadata
        };
      }
      
      // Añadir otros campos que puedan existir en options
      Object.entries(options).forEach(([key, value]) => {
        if (![
          'forceRoleUpdate', 
          'companyId', 
          'companiesAccess', 
          'metadata'
        ].includes(key)) {
          updateData[key] = value;
        }
      });
      
      // Realizamos la actualización
      await updateDoc(userRef, updateData);
    } else {
      // Construir objeto para el documento nuevo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newUserData: {[key: string]: any} = {
        uid: userId,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active"
      };
      
      // Añadir companyId si se especificó
      if (options.companyId) {
        newUserData.companyId = options.companyId;
      }
      
      // Si es superadmin y se especificaron compañías, las añadimos
      if (role === 'superadmin' && options.companiesAccess && options.companiesAccess.length > 0) {
        newUserData.companiesAccess = options.companiesAccess;
      }
      
      // Si hay metadatos, los añadimos
      if (options.metadata) {
        newUserData.metadata = options.metadata;
      }
      
      // Añadir otros campos que puedan existir en options
      Object.entries(options).forEach(([key, value]) => {
        if (![
          'forceRoleUpdate', 
          'companyId', 
          'companiesAccess', 
          'metadata'
        ].includes(key)) {
          newUserData[key] = value;
        }
      });
      
      // Crear el nuevo documento
      await setDoc(userRef, newUserData);
    }
  } catch (error) {
    console.error("Error al asignar rol:", error);
    throw error;
  }
}

/**
 * Obtiene el rol y los datos del usuario desde Firestore
 * 
 * @param userId - El ID del usuario
 * @returns Promise con los datos del usuario incluyendo su rol
 */
export async function getUserRoleData(userId: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        ...userData,
        uid: userId, // Garantizamos que el campo uid esté presente
        role: userData.role as UserRole,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    throw error;
  }
}

/**
 * Verifica si un usuario tiene un permiso específico
 * 
 * @param userId - El ID del usuario
 * @param permission - El permiso a verificar
 * @returns Promise<boolean> - True si tiene el permiso
 */
export async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  try {
    // Obtenemos los datos del usuario incluyendo su rol
    const userData = await getUserRoleData(userId);
    
    if (!userData || !userData.role) {
      return false;
    }
    
    // Obtenemos los permisos asociados a ese rol
    const roleRef = doc(db, "roles", userData.role);
    const roleDoc = await getDoc(roleRef);
    
    if (roleDoc.exists()) {
      const roleData = roleDoc.data();
      return roleData.permissions?.includes(permission) || false;
    }
    
    return false;
  } catch (error) {
    console.error("Error al verificar permiso:", error);
    return false;
  }
}

/**
 * Actualiza el estado de un usuario (active, inactive, suspended)
 * 
 * @param userId - ID del usuario
 * @param status - Nuevo estado
 * @returns Promise<void>
 */
export async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al actualizar estado del usuario:", error);
    throw error;
  }
}
