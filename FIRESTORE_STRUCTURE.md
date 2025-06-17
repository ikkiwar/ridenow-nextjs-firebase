# Firestore structure example (drivers)

Collection: drivers

Document ID: <driver_id>

{
  "assignedRideId": "ride_abc123", // string, opcional
  "fullName": "kevin",             // string
  "lastUpdated": <timestamp>,        // Firestore timestamp
  "location": {                      // objeto con lat/lng
    "lat": 34.0522,                  // number
    "lng": -118.2437                 // number
  },
  "phone": "+50377806930",         // string, opcional
  "status": "available",            // string, opcional
  "vehicle": {                       // objeto, opcional
    "color": "black",               // string
    "make": "Toyota",               // string
    "model": "corolla",             // string
    "palte": "ABC123"               // string (nota: parece typo, ¿debería ser 'plate'?)
  }
}

- Cada documento representa un conductor.
- La ubicación se guarda en el objeto `location` con `lat` y `lng`.
- Los campos opcionales pueden omitirse.
- `lastUpdated` debe ser un timestamp de Firestore.
