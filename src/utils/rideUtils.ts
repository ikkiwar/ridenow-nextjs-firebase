import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp, 
  Timestamp
  // deleteDoc - uncomment if needed for future implementations
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export type RideStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'credit_card' | 'app_credit';

/**
 * Interface for ride data in Firestore
 */
export interface RideData {
  id: string;
  customerId: string;
  driverId?: string;
  status: RideStatus;
  pickup: {
    lat: number;
    lng: number;
    address: string;
    name?: string;
  };
  dropoff: {
    lat: number;
    lng: number;
    address: string;
    name?: string;
  };
  route?: {
    distance: number; // en kilómetros
    duration: number; // en minutos
    polyline?: string;
    waypoints?: Array<[number, number]>;
  };
  timestamps: {
    requested: Timestamp;
    accepted?: Timestamp;
    pickupArrival?: Timestamp;
    pickupConfirmed?: Timestamp;
    dropoffArrival?: Timestamp;
    completed?: Timestamp;
    cancelled?: Timestamp;
  };
  payment: {
    method: PaymentMethod;
    baseFare: number;
    distance: number;
    time: number;
    surge?: number;
    tax?: number;
    tip?: number;
    total: number;
    currency: string;
    status: 'pending' | 'completed' | 'refunded';
  };
  ratings?: {
    fromCustomer?: {
      rating: number;
      comment?: string;
      timestamp: Timestamp;
    };
    fromDriver?: {
      rating: number;
      comment?: string;
      timestamp: Timestamp;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Create a new ride in a company
 * 
 * @param companyId - Company ID
 * @param rideData - Ride data
 * @returns Promise with ride ID
 */
export async function createRide(
  companyId: string,
  rideData: Omit<RideData, 'id' | 'createdAt' | 'updatedAt' | 'timestamps'> & { 
    timestamps?: Partial<RideData['timestamps']> 
  }
): Promise<string> {
  try {
    const ridesRef = collection(db, `companies/${companyId}/rides`);
    const newRideRef = doc(ridesRef);
    
    const now = serverTimestamp();
    
    const timestamps = {
      requested: now,
      ...(rideData.timestamps || {})
    };
    
    // Create a new ride object without the original timestamps property
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timestamps: originalTimestamps, ...rideWithoutOriginalTimestamps } = rideData;
    
    const rideWithTimestamps = {
      ...rideWithoutOriginalTimestamps,
      id: newRideRef.id,
      timestamps,
      status: rideData.status || 'pending',
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(newRideRef, rideWithTimestamps);
    
    return newRideRef.id;
  } catch (error) {
    console.error("Error creating ride:", error);
    throw error;
  }
}

/**
 * Get a ride by ID
 * 
 * @param companyId - Company ID
 * @param rideId - Ride ID
 * @returns Promise with ride data
 */
export async function getRideById(
  companyId: string,
  rideId: string
): Promise<RideData | null> {
  try {
    const rideRef = doc(db, `companies/${companyId}/rides/${rideId}`);
    const rideDoc = await getDoc(rideRef);
    
    if (rideDoc.exists()) {
      return {
        ...rideDoc.data(),
        id: rideDoc.id
      } as RideData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting ride:", error);
    throw error;
  }
}

/**
 * Update ride data
 * 
 * @param companyId - Company ID
 * @param rideId - Ride ID
 * @param rideData - Data to update
 * @returns Promise<void>
 */
export async function updateRide(
  companyId: string,
  rideId: string,
  rideData: Partial<Omit<RideData, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const rideRef = doc(db, `companies/${companyId}/rides/${rideId}`);
    
    const updateData = {
      ...rideData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(rideRef, updateData);
  } catch (error) {
    console.error("Error updating ride:", error);
    throw error;
  }
}

/**
 * Update ride status
 * 
 * @param companyId - Company ID
 * @param rideId - Ride ID
 * @param status - New status
 * @param timestamp - Optional name of timestamp to update
 * @returns Promise<void>
 */
export async function updateRideStatus(
  companyId: string,
  rideId: string,
  status: RideStatus,
  timestamp?: keyof Omit<RideData['timestamps'], 'requested'>
): Promise<void> {
  try {
    const rideRef = doc(db, `companies/${companyId}/rides/${rideId}`);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      status,
      updatedAt: serverTimestamp()
    };
    
    // If a timestamp field is specified, update it
    if (timestamp) {
      updateData[`timestamps.${timestamp}`] = serverTimestamp();
    }
    
    await updateDoc(rideRef, updateData);
  } catch (error) {
    console.error("Error updating ride status:", error);
    throw error;
  }
}

/**
 * Get all rides from a company
 * 
 * @param companyId - Company ID
 * @param options - Query options
 * @returns Promise with array of ride data
 */
export async function getCompanyRides(
  companyId: string,
  options: { 
    limit?: number;
    status?: RideStatus | RideStatus[];
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}
): Promise<RideData[]> {
  try {
    const ridesRef = collection(db, `companies/${companyId}/rides`);
    let ridesQuery = query(ridesRef);
    
    // Apply status filter if provided
    if (options.status) {
      if (Array.isArray(options.status)) {
        ridesQuery = query(ridesQuery, where('status', 'in', options.status));
      } else {
        ridesQuery = query(ridesQuery, where('status', '==', options.status));
      }
    }
    
    // Apply sorting if provided
    if (options.orderByField) {
      ridesQuery = query(ridesQuery, orderBy(options.orderByField, options.orderDirection || 'desc'));
    } else {
      // Default sorting by creation time descending
      ridesQuery = query(ridesQuery, orderBy('createdAt', 'desc'));
    }
    
    // Apply limit if provided
    if (options.limit) {
      ridesQuery = query(ridesQuery, limit(options.limit));
    }
    
    const snapshot = await getDocs(ridesQuery);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }) as RideData);
  } catch (error) {
    console.error("Error getting company rides:", error);
    throw error;
  }
}

/**
 * Get rides by customer
 * 
 * @param companyId - Company ID
 * @param customerId - Customer ID
 * @param options - Query options
 * @returns Promise with array of ride data
 */
export async function getRidesByCustomer(
  companyId: string,
  customerId: string,
  options: {
    status?: RideStatus | RideStatus[];
    limit?: number;
  } = {}
): Promise<RideData[]> {
  try {
    let q = query(
      collection(db, `companies/${companyId}/rides`),
      where("customerId", "==", customerId),
      orderBy("createdAt", "desc")
    );
    
    // Add status filter if provided
    if (options.status) {
      if (Array.isArray(options.status)) {
        // Can't do IN with orderBy, so we need to create separate queries
        // This is a simplification; for complex queries with IN + orderBy,
        // consider using multiple queries or Cloud Functions
        q = query(q, where("status", "in", options.status));
      } else {
        q = query(q, where("status", "==", options.status));
      }
    }
    
    // Add limit if provided
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }) as RideData);
  } catch (error) {
    console.error("Error getting rides by customer:", error);
    throw error;
  }
}

/**
 * Get rides by driver
 * 
 * @param companyId - Company ID
 * @param driverId - Driver ID
 * @param options - Query options
 * @returns Promise with array of ride data
 */
export async function getRidesByDriver(
  companyId: string,
  driverId: string,
  options: {
    status?: RideStatus | RideStatus[];
    limit?: number;
  } = {}
): Promise<RideData[]> {
  try {
    let q = query(
      collection(db, `companies/${companyId}/rides`),
      where("driverId", "==", driverId),
      orderBy("createdAt", "desc")
    );
    
    // Add status filter if provided
    if (options.status) {
      if (Array.isArray(options.status)) {
        // See note above about IN + orderBy limitations
        q = query(q, where("status", "in", options.status));
      } else {
        q = query(q, where("status", "==", options.status));
      }
    }
    
    // Add limit if provided
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }) as RideData);
  } catch (error) {
    console.error("Error getting rides by driver:", error);
    throw error;
  }
}
