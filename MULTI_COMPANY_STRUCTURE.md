# Estructura Multi-Compañía para RideNow

Este documento define la arquitectura propuesta para soportar múltiples compañías de taxis en la plataforma RideNow.

## Introducción

Para escalar el sistema a múltiples compañías de taxis, necesitamos modificar la estructura de Firestore para permitir que cada compañía tenga sus propios conductores, usuarios y viajes, mientras mantenemos un control centralizado mediante superadministradores.

## Estructura de Datos

### 1. Colección: `companies`

Almacena información de cada compañía de taxis.

Documento ID: `<company_id>` (generado automáticamente o personalizado)

```json
{
  "id": "company_abc123",           // ID de la compañía (igual al ID del documento)
  "name": "Taxis Express",          // Nombre de la compañía
  "contactEmail": "info@taxis.com", // Email de contacto
  "contactPhone": "+1234567890",    // Teléfono de contacto
  "logoUrl": "https://...",         // URL del logo
  "primaryColor": "#FF5500",        // Color principal (para personalización de UI)
  "address": {                      // Dirección física
    "street": "123 Main St",
    "city": "Ciudad",
    "state": "Estado",
    "country": "País",
    "postalCode": "12345"
  },
  "settings": {                     // Configuraciones específicas de la compañía
    "fareMultiplier": 1.0,          // Multiplicador de tarifa base
    "minimumFare": 5.0,             // Tarifa mínima
    "commissionPercentage": 15,     // Porcentaje de comisión
    "allowedPaymentMethods": ["cash", "credit_card", "app_credit"],
    "dispatchMode": "automatic"     // "automatic" o "manual"
  },
  "operationAreas": [               // Áreas donde opera
    {
      "name": "Centro",
      "coordinates": {              // Polígono de coordenadas
        "type": "Polygon",
        "coordinates": [[[lng1, lat1], [lng2, lat2], ... ]]
      }
    }
  ],
  "active": true,                   // Si la compañía está activa
  "subscriptionPlan": "premium",    // Plan de suscripción
  "subscriptionExpiresAt": "<timestamp>", // Fecha de expiración de suscripción
  "createdAt": "<timestamp>",       // Fecha de creación
  "updatedAt": "<timestamp>"        // Última actualización
}
```

### 2. Colección: `users`

Almacena todos los usuarios de la plataforma.

Documento ID: `<user_id>` (ID de Firebase Auth)

```json
{
  "uid": "user_abc123",           // ID del usuario
  "email": "user@example.com",    // Email
  "displayName": "Juan Pérez",    // Nombre completo
  "photoURL": "https://...",      // URL de foto de perfil
  "phoneNumber": "+1234567890",   // Número de teléfono
  "role": "driver",               // Rol: "driver", "admin", "superadmin", "customer"
  "companyId": "company_abc123",  // ID de la compañía a la que está asociado (opcional para superadmin)
  "companiesAccess": [            // Array de IDs de compañías a las que tiene acceso (para superadmin)
    "company_abc123",
    "company_def456"
  ],
  "status": "active",             // "active", "inactive", "suspended"
  "metadata": {                   // Metadatos específicos por rol
    // Para conductores:
    "driverId": "driver_123",     // Referencia a la subcolección
    "licenseVerified": true,      // Verificación de licencia
    
    // Para administradores:
    "managedRegions": ["region1"] // Regiones que administra
  },
  "createdAt": "<timestamp>",     // Fecha de creación
  "updatedAt": "<timestamp>",     // Última actualización
  "lastLogin": "<timestamp>"      // Último inicio de sesión
}
```

### 3. Subcolección: `companies/<company_id>/drivers`

Almacena los conductores específicos de cada compañía.

Documento ID: `<driver_id>` (generado automáticamente)

```json
{
  "userId": "user_abc123",        // ID del usuario asociado
  "fullName": "Juan Pérez",       // Nombre completo
  "location": {                   // Ubicación actual
    "lat": 34.0522,
    "lng": -118.2437,
    "lastUpdated": "<timestamp>"
  },
  "status": "available",          // "available", "busy", "offline"
  "rating": 4.8,                  // Calificación promedio
  "completedRides": 120,          // Número de viajes completados
  "vehicle": {                    // Información del vehículo
    "make": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "color": "black",
    "plate": "ABC123",
    "photo": "https://..."
  },
  "documents": {                  // Documentos del conductor
    "license": {
      "number": "DL12345",
      "expiryDate": "2025-12-31",
      "verified": true,
      "photoUrl": "https://..."
    },
    "insurance": {
      "number": "INS67890",
      "expiryDate": "2025-12-31",
      "verified": true,
      "photoUrl": "https://..."
    }
  },
  "assignedRideId": "ride_xyz789", // ID del viaje asignado actualmente (opcional)
  "earnings": {                    // Información de ganancias
    "total": 1500.50,
    "pendingPayout": 350.75,
    "lastPayout": "<timestamp>"
  },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

### 4. Subcolección: `companies/<company_id>/rides`

Almacena los viajes específicos de cada compañía.

Documento ID: `<ride_id>` (generado automáticamente)

```json
{
  "customerId": "user_def456",    // ID del usuario cliente
  "driverId": "driver_abc123",    // ID del conductor (opcional hasta asignación)
  "status": "pending",            // "pending", "assigned", "in_progress", "completed", "cancelled"
  "pickup": {                     // Ubicación de recogida
    "lat": 34.0522,
    "lng": -118.2437,
    "address": "123 Main St, Ciudad",
    "name": "Mi Casa"
  },
  "dropoff": {                    // Ubicación de destino
    "lat": 34.0822,
    "lng": -118.2137,
    "address": "456 Oak St, Ciudad",
    "name": "Oficina"
  },
  "route": {                      // Ruta completa (opcional)
    "distance": 5.2,              // en kilómetros
    "duration": 15,               // en minutos
    "polyline": "encoded_polyline_string",
    "waypoints": []               // Puntos adicionales en la ruta
  },
  "timestamps": {                 // Marcas de tiempo del viaje
    "requested": "<timestamp>",
    "accepted": "<timestamp>",
    "pickupArrival": "<timestamp>",
    "pickupConfirmed": "<timestamp>",
    "dropoffArrival": "<timestamp>",
    "completed": "<timestamp>",
    "cancelled": "<timestamp>"
  },
  "payment": {                    // Información de pago
    "method": "cash",             // "cash", "credit_card", "app_credit"
    "baseFare": 10.00,
    "distance": 5.00,
    "time": 3.00,
    "surge": 1.5,
    "tax": 2.50,
    "tip": 2.00,
    "total": 22.50,
    "currency": "USD",
    "status": "pending"           // "pending", "completed", "refunded"
  },
  "ratings": {                    // Calificaciones
    "fromCustomer": {
      "rating": 5,                // 1-5
      "comment": "Excelente servicio",
      "timestamp": "<timestamp>"
    },
    "fromDriver": {
      "rating": 5,                // 1-5
      "comment": "Buen cliente",
      "timestamp": "<timestamp>"
    }
  },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

### 5. Colección: `roles`

Mantiene los roles del sistema. Similar a la estructura actual pero con capacidades extendidas.

Documento ID: `<role_name>`

```json
{
  "name": "company_admin",
  "description": "Administrador de una compañía específica",
  "permissions": [
    "manage_company_drivers",
    "view_company_stats",
    "manage_company_rides",
    "manage_company_settings"
  ],
  "level": 2,
  "scope": "company",           // "global" o "company"
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

### 6. Colección: `system_settings`

Configuraciones globales del sistema.

Documento ID: `settings`

```json
{
  "platformFee": 0.05,            // Porcentaje que cobra la plataforma
  "defaultCurrency": "USD",
  "supportEmail": "support@ridenow.com",
  "termsUrl": "https://...",
  "privacyUrl": "https://...",
  "appVersions": {
    "customer": {
      "ios": "1.2.0",
      "android": "1.2.1",
      "minRequired": "1.1.0"
    },
    "driver": {
      "ios": "1.3.0",
      "android": "1.3.1",
      "minRequired": "1.2.0"
    }
  },
  "updatedAt": "<timestamp>"
}
```

## Niveles de Acceso y Roles

### 1. Superadmin (Global)
- Acceso a todas las compañías
- Gestión de compañías (crear, activar/desactivar, configurar)
- Acceso a estadísticas globales
- Gestión de roles y permisos globales

### 2. Admin de Compañía
- Acceso solo a su compañía asignada
- Gestión de conductores de su compañía
- Visualización de estadísticas de su compañía
- Configuración limitada de su compañía

### 3. Conductor
- Acceso a su perfil y viajes
- Actualización de su ubicación y estado
- Visualización de sus estadísticas personales

### 4. Cliente
- Solicitud de viajes
- Visualización de su historial
- Calificación de viajes

## Implementación de Seguridad

### Reglas de Firestore

Se deben implementar reglas de seguridad en Firestore para:

1. Limitar el acceso a los datos de cada compañía solo a los usuarios asociados a ella
2. Permitir que los superadmin accedan a todas las compañías
3. Restringir a los conductores a ver solo sus propios datos y viajes actuales
4. Limitar el acceso de los clientes a sus propios datos y viajes

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función para verificar si es superadmin
    function isSuperAdmin() {
      return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "superadmin";
    }
    
    // Función para verificar si pertenece a la compañía
    function belongsToCompany(companyId) {
      return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId == companyId;
    }
    
    // Función para verificar si es admin de la compañía
    function isCompanyAdmin(companyId) {
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return request.auth != null && user.role == "admin" && user.companyId == companyId;
    }
    
    // Acceso a compañías
    match /companies/{companyId} {
      allow read: if isSuperAdmin() || belongsToCompany(companyId);
      allow write: if isSuperAdmin();
      
      // Subcolecciones de la compañía
      match /drivers/{driverId} {
        allow read: if isSuperAdmin() || isCompanyAdmin(companyId) || request.auth.uid == resource.data.userId;
        allow write: if isSuperAdmin() || isCompanyAdmin(companyId);
        allow update: if request.auth.uid == resource.data.userId && 
                     (request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['status', 'location']));
      }
      
      match /rides/{rideId} {
        allow read: if isSuperAdmin() || isCompanyAdmin(companyId) || 
                     resource.data.driverId == get(/databases/$(database)/documents/companies/$(companyId)/drivers/$(driverId)).data.userId ||
                     resource.data.customerId == request.auth.uid;
        allow create: if isSuperAdmin() || isCompanyAdmin(companyId) || 
                       request.auth.uid == request.resource.data.customerId;
        allow update: if isSuperAdmin() || isCompanyAdmin(companyId) || 
                       (request.auth.uid == resource.data.customerId && 
                       ['ratings.fromCustomer'].hasOnly(request.resource.data.diff(resource.data).affectedKeys())) ||
                       (request.auth.uid == get(/databases/$(database)/documents/companies/$(companyId)/drivers/$(request.resource.data.driverId)).data.userId &&
                       ['status', 'timestamps', 'ratings.fromDriver'].hasAny(request.resource.data.diff(resource.data).affectedKeys()));
      }
    }
    
    // Acceso a usuarios
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isSuperAdmin() || 
                  (isCompanyAdmin(resource.data.companyId) && resource.data.companyId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId);
      allow create: if isSuperAdmin();
      allow update: if request.auth.uid == userId || isSuperAdmin() || 
                    (isCompanyAdmin(resource.data.companyId) && resource.data.companyId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId &&
                    !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'companyId']));
    }
    
    // Acceso a roles
    match /roles/{roleName} {
      allow read: if request.auth != null;
      allow write: if isSuperAdmin();
    }
    
    // Acceso a configuraciones del sistema
    match /system_settings/{document=**} {
      allow read: if request.auth != null;
      allow write: if isSuperAdmin();
    }
  }
}
```

## Cambios Requeridos en la Aplicación

Para implementar esta estructura, se necesitarán los siguientes cambios en la aplicación:

1. Modificar el sistema de autenticación para incluir la selección/asignación de compañía
2. Actualizar las operaciones CRUD para trabajar con la estructura jerárquica de compañías
3. Implementar filtrado de datos basado en la compañía del usuario
4. Actualizar los paneles de administración para mostrar datos específicos de la compañía
5. Crear un nuevo panel para superadministradores que permita gestionar todas las compañías

## Consideraciones Adicionales

### Escalabilidad
- Utilizar consultas eficientes y índices compuestos
- Considerar el uso de Cloud Functions para operaciones complejas
- Implementar paginación para grandes conjuntos de datos

### Respaldo y Recuperación
- Configurar backups periódicos 
- Planificar estrategias de recuperación ante desastres

### Auditoría y Cumplimiento
- Mantener registros de auditoría para cambios críticos
- Almacenar datos históricos para cumplimiento normativo
