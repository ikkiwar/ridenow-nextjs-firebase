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
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastLogin?: Timestamp;
  forceRoleUpdate?: boolean; // Flag para forzar la actualización del rol
  [key: string]: unknown;
}

/**
 * Asigna un rol a un usuario en Firestore
 * 
 * @param userId - El ID del usuario
 * @param role - El rol a asignar ('driver', 'admin', 'superadmin')
 * @param metadata - Metadatos adicionales según el rol
 * @returns Promise<void>
 */
export async function assignUserRole(
  userId: string, 
  role: UserRole,
  metadata: Partial<Omit<UserData, 'uid' | 'role'>> = {}
): Promise<void> {
  if (!role) {
    throw new Error("El rol no puede estar vacío");
  }

  const userRef = doc(db, "users", userId);
  
  try {
    // Verificar si el usuario ya existe
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Obtenemos los datos actuales del usuario
      const userData = userDoc.data();
      const currentRole = userData.role;
      
      // Verificamos si el rol debe cambiarse (solo si se especificó forceRoleUpdate=true)
      let shouldUpdateRole = false;
      if ('forceRoleUpdate' in metadata && metadata.forceRoleUpdate === true && role !== currentRole) {
        shouldUpdateRole = true;
      }
      
      // Preparamos los campos básicos a actualizar como un objeto simple
      // y dejaremos que TypeScript infiera el tipo correcto basado en el uso
      const updateFields = {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      } as const;
      
      // Creamos un nuevo objeto para las actualizaciones combinando los campos básicos
      // con los metadatos filtrados, excluyendo 'forceRoleUpdate'
      const filteredMetadata = Object.fromEntries(
        Object.entries(metadata).filter(
          ([key, value]) => key !== 'forceRoleUpdate' && value !== undefined
        )
      );
      
      // Combinamos los campos básicos con los metadatos filtrados
      const fieldsToUpdate = {
        ...updateFields,
        ...filteredMetadata,
        // Si debemos actualizar el rol, lo añadimos
        ...(shouldUpdateRole ? { role } : {})
      };
      
      // Realizamos la actualización con los campos combinados
      await updateDoc(userRef, fieldsToUpdate);
    } else {
      // Crear nuevo documento para el usuario
      await setDoc(userRef, {
        uid: userId,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
        ...metadata,
      });
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
