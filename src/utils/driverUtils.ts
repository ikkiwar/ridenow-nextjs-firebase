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

/**
 * Interface for driver data in Firestore
 */
export interface DriverData {
  id: string;
  userId: string;
  fullName: string;
  location?: {
    lat: number;
    lng: number;
    lastUpdated: Timestamp;
  };
  status: "available" | "busy" | "offline" | "resting";
  rating?: number;
  completedRides?: number;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    photo?: string;
  };
  documents?: {
    license?: {
      number: string;
      expiryDate: string;
      verified: boolean;
      photoUrl?: string;
    };
    insurance?: {
      number: string;
      expiryDate: string;
      verified: boolean;
      photoUrl?: string;
    };
  };
  assignedRideId?: string;
  earnings?: {
    total: number;
    pendingPayout: number;
    lastPayout?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Create a new driver in a company
 * 
 * @param companyId - Company ID
 * @param driverData - Driver data
 * @returns Promise with driver ID
 */
export async function createDriverInCompany(
  companyId: string,
  driverData: Omit<DriverData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    // Create a reference to a new driver document
    const driversRef = collection(db, `companies/${companyId}/drivers`);
    const newDriverRef = doc(driversRef);
    
    const driverWithTimestamps = {
      ...driverData,
      id: newDriverRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(newDriverRef, driverWithTimestamps);
    
    return newDriverRef.id;
  } catch (error) {
    console.error("Error creating driver:", error);
    throw error;
  }
}

/**
 * Get all drivers from a company
 * 
 * @param companyId - Company ID
 * @returns Promise with array of driver data
 */
export async function getCompanyDrivers(companyId: string): Promise<DriverData[]> {
  try {
    const driversRef = collection(db, `companies/${companyId}/drivers`);
    const querySnapshot = await getDocs(driversRef);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }) as DriverData);
  } catch (error) {
    console.error("Error getting company drivers:", error);
    throw error;
  }
}

/**
 * Get a driver by ID
 * 
 * @param companyId - Company ID
 * @param driverId - Driver ID
 * @returns Promise with driver data
 */
export async function getDriverById(
  companyId: string,
  driverId: string
): Promise<DriverData | null> {
  try {
    const driverRef = doc(db, `companies/${companyId}/drivers/${driverId}`);
    const driverDoc = await getDoc(driverRef);
    
    if (driverDoc.exists()) {
      return {
        ...driverDoc.data(),
        id: driverDoc.id
      } as DriverData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting driver:", error);
    throw error;
  }
}

/**
 * Update driver data
 * 
 * @param companyId - Company ID
 * @param driverId - Driver ID
 * @param driverData - Data to update
 * @returns Promise<void>
 */
export async function updateDriver(
  companyId: string,
  driverId: string,
  driverData: Partial<Omit<DriverData, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const driverRef = doc(db, `companies/${companyId}/drivers/${driverId}`);
    
    const updateData = {
      ...driverData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(driverRef, updateData);
  } catch (error) {
    console.error("Error updating driver:", error);
    throw error;
  }
}

/**
 * Update driver location
 * 
 * @param companyId - Company ID
 * @param driverId - Driver ID
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise<void>
 */
export async function updateDriverLocation(
  companyId: string,
  driverId: string,
  lat: number,
  lng: number
): Promise<void> {
  try {
    const driverRef = doc(db, `companies/${companyId}/drivers/${driverId}`);
    
    await updateDoc(driverRef, {
      location: {
        lat,
        lng,
        lastUpdated: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating driver location:", error);
    throw error;
  }
}

/**
 * Update driver status
 * 
 * @param companyId - Company ID
 * @param driverId - Driver ID
 * @param status - New status
 * @returns Promise<void>
 */
export async function updateDriverStatus(
  companyId: string,
  driverId: string,
  status: "available" | "busy" | "offline" | "resting"
): Promise<void> {
  try {
    const driverRef = doc(db, `companies/${companyId}/drivers/${driverId}`);
    
    await updateDoc(driverRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating driver status:", error);
    throw error;
  }
}

/**
 * Get driver by user ID
 * 
 * @param companyId - Company ID
 * @param userId - User ID
 * @returns Promise with driver data
 */
export async function getDriverByUserId(
  companyId: string,
  userId: string
): Promise<DriverData | null> {
  try {
    const driversRef = collection(db, `companies/${companyId}/drivers`);
    const q = query(driversRef, where("userId", "==", userId));
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const driverDoc = querySnapshot.docs[0];
      return {
        ...driverDoc.data(),
        id: driverDoc.id
      } as DriverData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting driver by user ID:", error);
    throw error;
  }
}
