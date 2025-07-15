import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp, 
  Timestamp
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { UserData, UserStatus } from "./roleUtils";
import { UserRole } from "../context/AuthProvider";

/**
 * Interface for company data in Firestore
 */
export interface CompanyData {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  primaryColor?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  settings?: {
    fareMultiplier?: number;
    minimumFare?: number;
    commissionPercentage?: number;
    allowedPaymentMethods?: string[];
    dispatchMode?: "automatic" | "manual";
  };
  operationAreas?: Array<{
    name: string;
    coordinates?: {
      type: string;
      coordinates: number[][][];
    };
  }>;
  active: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Create a new company in Firestore
 * 
 * @param companyData - Company data
 * @returns Promise with the created company ID
 */
export async function createCompany(companyData: Omit<CompanyData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Create a new document reference in the companies collection
    const companyRef = doc(collection(db, "companies"));
    
    // Add timestamps and copy the ID to the data
    const companyWithTimestamps = {
      ...companyData,
      id: companyRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Create the document
    await setDoc(companyRef, companyWithTimestamps);
    
    return companyRef.id;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
}

/**
 * Get company data by ID
 * 
 * @param companyId - Company ID
 * @returns Promise with company data
 */
export async function getCompany(companyId: string): Promise<CompanyData | null> {
  try {
    const companyRef = doc(db, "companies", companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (companyDoc.exists()) {
      return companyDoc.data() as CompanyData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting company:", error);
    throw error;
  }
}

/**
 * Update company data
 * 
 * @param companyId - Company ID
 * @param companyData - Data to update
 */
export async function updateCompany(
  companyId: string, 
  companyData: Partial<Omit<CompanyData, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const companyRef = doc(db, "companies", companyId);
    
    // Add updatedAt timestamp
    const updateData = {
      ...companyData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(companyRef, updateData);
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
}

/**
 * Get all active companies
 * 
 * @returns Promise with array of company data
 */
export async function getActiveCompanies(): Promise<CompanyData[]> {
  try {
    const companiesQuery = query(
      collection(db, "companies"),
      where("active", "==", true)
    );
    
    const querySnapshot = await getDocs(companiesQuery);
    return querySnapshot.docs.map(doc => doc.data() as CompanyData);
  } catch (error) {
    console.error("Error getting active companies:", error);
    throw error;
  }
}

/**
 * Get companies that a user has access to
 * 
 * @param userId - User ID
 * @returns Promise with array of company data
 */
export async function getUserCompanies(userId: string): Promise<CompanyData[]> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data() as UserData;
    
    // If user is superadmin, they can access all companies
    if (userData.role === 'superadmin' && userData.companiesAccess && Array.isArray(userData.companiesAccess)) {
      const companies: CompanyData[] = [];
      
      for (const companyId of userData.companiesAccess) {
        const companyData = await getCompany(companyId);
        if (companyData) {
          companies.push(companyData);
        }
      }
      
      return companies;
    }
    
    // If user has a companyId field, get that specific company
    if (userData.companyId) {
      const companyData = await getCompany(userData.companyId as string);
      return companyData ? [companyData] : [];
    }
    
    return [];
  } catch (error) {
    console.error("Error getting user companies:", error);
    throw error;
  }
}

/**
 * Assign user to a company
 * 
 * @param userId - User ID
 * @param companyId - Company ID
 */
export async function assignUserToCompany(userId: string, companyId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      companyId: companyId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error assigning user to company:", error);
    throw error;
  }
}

/**
 * Add company access for a superadmin
 * 
 * @param userId - User ID (superadmin)
 * @param companyId - Company ID to add access to
 */
export async function addCompanyAccessForSuperadmin(userId: string, companyId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User does not exist");
    }
    
    const userData = userDoc.data() as UserData;
    
    if (userData.role !== 'superadmin') {
      throw new Error("Only superadmins can be granted access to multiple companies");
    }
    
    // Initialize or update companiesAccess array
    const currentCompaniesAccess = userData.companiesAccess || [];
    const newCompaniesAccess = Array.isArray(currentCompaniesAccess) 
      ? [...new Set([...currentCompaniesAccess, companyId])] // Ensure no duplicates
      : [companyId];
    
    await updateDoc(userRef, {
      companiesAccess: newCompaniesAccess,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding company access:", error);
    throw error;
  }
}

/**
 * Get all companies, including inactive ones (for superadmins)
 * 
 * @param currentUserRole - The role of the current user (optional, for permission check)
 * @returns Promise with array of all company data
 */
export async function getAllCompanies(currentUserRole?: string): Promise<CompanyData[]> {
  try {
    // Solo permitir esta operación a superadmins
    if (currentUserRole && currentUserRole !== 'superadmin') {
      console.error("Permission denied: Only superadmins can list all companies");
      throw new Error("Permission denied: Only superadmins can list all companies");
    }
    
    const companiesQuery = query(collection(db, "companies"));
    
    const querySnapshot = await getDocs(companiesQuery);
    return querySnapshot.docs.map(doc => {
      // Asegurar que los datos incluyan el ID del documento
      const data = doc.data();
      return {
        ...data,
        id: doc.id
      } as CompanyData;
    });
  } catch (error) {
    console.error("Error getting all companies:", error);
    throw error;
  }
}

/**
 * Remove a user from a company
 * 
 * @param userId - User ID to remove from company
 * @returns Promise<void>
 */
export async function removeUserFromCompany(userId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User does not exist");
    }
    
    await updateDoc(userRef, {
      companyId: null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error removing user from company:", error);
    throw error;
  }
}

/**
 * Transfer a user between companies
 * 
 * @param userId - User ID to transfer
 * @param newCompanyId - Destination company ID
 * @param options - Additional options for transfer
 * @returns Promise<void>
 */
export async function transferUserBetweenCompanies(
  userId: string, 
  newCompanyId: string,
  options: {
    newRole?: UserRole;
    keepAccessToPreviousCompany?: boolean;
  } = {}
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User does not exist");
    }
    
    const userData = userDoc.data() as UserData;
    const previousCompanyId = userData.companyId;
    
    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      companyId: newCompanyId,
      updatedAt: serverTimestamp()
    };
    
    // If a new role is specified, update it
    if (options.newRole) {
      updateData.role = options.newRole;
    }
    
    // If user is superadmin and we want to keep access to previous company
    if (userData.role === 'superadmin' && 
        options.keepAccessToPreviousCompany && 
        previousCompanyId) {
      
      // Get current companies access array or initialize it
      const currentCompaniesAccess = Array.isArray(userData.companiesAccess) 
        ? userData.companiesAccess 
        : [];
      
      // Add both previous and new company IDs to the access array (avoiding duplicates)
      updateData.companiesAccess = [...new Set([
        ...currentCompaniesAccess, 
        previousCompanyId,
        newCompanyId
      ])];
    }
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error("Error transferring user between companies:", error);
    throw error;
  }
}

/**
 * Get all users that belong to a specific company
 * 
 * @param companyId - Company ID
 * @param options - Additional options for filtering
 * @returns Promise with array of user data
 */
export async function getUsersByCompany(
  companyId: string,
  options: {
    role?: UserRole;
    status?: UserStatus;
    limit?: number;
    includeInactive?: boolean;
  } = {}
): Promise<UserData[]> {
  try {
    // Build query constraints
    const constraints = [where("companyId", "==", companyId)];
    
    // Add role filter if specified
    if (options.role) {
      constraints.push(where("role", "==", options.role));
    }
    
    // Add status filter
    if (options.status) {
      constraints.push(where("status", "==", options.status));
    } else if (!options.includeInactive) {
      // By default, only include active users
      constraints.push(where("status", "==", "active"));
    }
    
    // Create the query
    const usersQuery = query(
      collection(db, "users"),
      ...constraints
    );
    
    // Execute the query
    const querySnapshot = await getDocs(usersQuery);
    
    // Map results and apply limit if needed
    let users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id
      } as UserData;
    });
    
    // Apply limit if specified
    if (options.limit && options.limit > 0) {
      users = users.slice(0, options.limit);
    }
    
    return users;
  } catch (error) {
    console.error("Error getting users by company:", error);
    throw error;
  }
}

/**
 * Remove company access for a superadmin
 * 
 * @param userId - User ID (superadmin)
 * @param companyId - Company ID to remove access from
 * @returns Promise<void>
 */
export async function removeCompanyAccessForSuperadmin(userId: string, companyId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User does not exist");
    }
    
    const userData = userDoc.data() as UserData;
    
    if (userData.role !== 'superadmin') {
      throw new Error("This operation is only applicable for superadmins");
    }
    
    // Initialize or update companiesAccess array
    const currentCompaniesAccess = userData.companiesAccess || [];
    
    if (!Array.isArray(currentCompaniesAccess)) {
      return; // Nothing to remove
    }
    
    // Remove the specified company ID from the access array
    const newCompaniesAccess = currentCompaniesAccess.filter(id => id !== companyId);
    
    await updateDoc(userRef, {
      companiesAccess: newCompaniesAccess,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error removing company access:", error);
    throw error;
  }
}
