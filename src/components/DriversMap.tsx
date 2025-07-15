"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { collection, onSnapshot, QuerySnapshot, DocumentData, setDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthProvider";
import L from "leaflet";

// Icono personalizado para los conductores (taxi visto desde arriba)
const driverIcon = new L.Icon({
  iconUrl: "/taxi.svg", // Usa tu archivo taxi.svg en public/
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Define our own interface instead of extending DriverData
interface Driver {
  id: string;
  fullName: string;
  location?: { 
    lat: number; 
    lng: number; 
    lastUpdated?: Timestamp; 
  };
  assignedRideId?: string;
  phone?: string;
  status?: string;
  vehicle?: {
    color?: string;
    make?: string;
    model?: string;
    plate?: string;
  };
}

export default function DriversMap() {
  const { companyId, currentCompany } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Obtener la posición actual del usuario
  useEffect(() => {
    let watchId: number | null = null;
    if (typeof window !== "undefined" && navigator.geolocation) {
      setStatusMsg("Solicitando ubicación...");
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserPosition(coords);
          setStatusMsg(`Ubicación obtenida: ${coords[0]}, ${coords[1]}`);

          // Solo permitimos actualizar la ubicación si hay una compañía seleccionada
          if (!companyId) {
            setStatusMsg("No hay compañía seleccionada. No se actualizará la ubicación");
            return;
          }
          
          // Generar driverId robusto
          let newDriverId: string | null = null;
          try {
            newDriverId = window.localStorage.getItem("driverId");
            if (!newDriverId) {
              if (window.crypto && window.crypto.randomUUID) {
                newDriverId = window.crypto.randomUUID();
              } else {
                newDriverId = `driver_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
              }
              window.localStorage.setItem("driverId", newDriverId);
            }
            setStatusMsg((msg) => msg + ` | driverId: ${newDriverId}`);
          } catch (e) {
            setStatusMsg("Error generando driverId: " + (e as Error).message);
          }

          // Subir la posición a Firestore como un nuevo conductor en la compañía actual
          try {
            const driverRef = doc(db, `companies/${companyId}/drivers`, newDriverId!);
            await setDoc(driverRef, {
              fullName: userName || "Usuario Web",
              location: { 
                lat: coords[0], 
                lng: coords[1],
                lastUpdated: serverTimestamp()
              },
              status: "available",
              updatedAt: serverTimestamp(),
              // Solo añadimos createdAt si es una creación nueva
              ...(!newDriverId && { createdAt: serverTimestamp() })
            }, { merge: true });
            setStatusMsg((msg) => msg + ` | Ubicación subida a la compañía: ${currentCompany?.name || companyId}`);
          } catch (e) {
            setStatusMsg("Error subiendo a Firestore: " + (e as Error).message);
          }
        },
        (err) => {
          setStatusMsg("Error de geolocalización: " + err.message);
        }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [userName, companyId, currentCompany]);

  useEffect(() => {
    if (!companyId) {
      setStatusMsg("No hay compañía seleccionada. No se pueden mostrar conductores.");
      return () => {};
    }
    
    // Suscripción a los conductores de la compañía actual
    const unsub = onSnapshot(
      collection(db, `companies/${companyId}/drivers`),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDrivers(data as Driver[]);
      }
    );

    return () => unsub();
  }, [companyId]); // Añadimos companyId como dependencia

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = window.localStorage.getItem("driverName") || "";
      setUserName(savedName);
    }
  }, []);

  if (!companyId) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-3 rounded">
        No hay compañía seleccionada. Por favor, seleccione una compañía para ver los conductores.
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Tu nombre"
          value={userName}
          onChange={e => {
            setUserName(e.target.value);
            if (typeof window !== "undefined") {
              window.localStorage.setItem("driverName", e.target.value);
            }
          }}
          className="border rounded px-2 py-1 text-sm"
        />
        <span className="text-xs text-gray-500">(visible en el mapa)</span>
      </div>
      <div className="mb-2 text-xs text-blue-700 bg-blue-100 rounded px-2 py-1 max-w-xl break-all">{statusMsg}</div>
      <MapContainer
        center={userPosition || [19.4326, -99.1332]}
        zoom={12}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userPosition && (
          <Marker position={userPosition} icon={driverIcon}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
        )}
        {drivers
          .filter(driver => driver.location && typeof driver.location.lat === "number" && typeof driver.location.lng === "number")
          .map((driver) => (
            <Marker 
              key={driver.id} 
              position={[driver.location!.lat, driver.location!.lng]} 
              icon={driverIcon}
            >
              <Popup>
                <strong>{driver.fullName}</strong>
                <br />
                Estado: {driver.status || "-"}<br />
                Tel: {driver.phone || "-"}<br />
                Vehículo: {driver.vehicle?.make || "-"} {driver.vehicle?.model || ""}<br />
                Placa: {driver.vehicle?.plate || "-"}<br />
                Última actualización:<br />
                {driver.location?.lastUpdated?.toDate?.() 
                  ? driver.location.lastUpdated.toDate().toLocaleString() 
                  : "-"}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </>
  );
}
