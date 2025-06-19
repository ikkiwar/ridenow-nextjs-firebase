# Estructura de Roles en Firestore para RideNow

## Colección: `users`

Documento ID: `<user_id>` (ID de usuario de Firebase Auth)

```json
{
  "uid": "abc123",             // ID de usuario (igual al ID del documento)
  "email": "user@example.com", // Email del usuario
  "displayName": "Juan Pérez", // Nombre completo del usuario
  "photoURL": "https://...",   // URL de la foto de perfil (opcional)
  "phoneNumber": "+1234567890",// Número de teléfono (opcional)
  "role": "driver",            // Rol del usuario: "driver", "admin", o "superadmin"
  "createdAt": <timestamp>,    // Fecha de creación de la cuenta
  "lastLogin": <timestamp>,    // Última vez que inició sesión
  "status": "active",          // Estado: "active", "inactive", "suspended"
  "metadata": {                // Metadatos adicionales según el rol
    // Para conductores:
    "driverId": "driver_123",  // Referencia al documento en la colección "drivers"
    "licenseVerified": true,   // Si la licencia ha sido verificada
    "documentsVerified": true  // Si los documentos han sido verificados
    
    // Para administradores:
    "managedRegions": ["region1", "region2"], // Regiones que administra
    "permissions": ["manage_drivers", "view_stats"] // Permisos específicos
  }
}
```

## Colección: `roles`

Documento ID: nombre del rol

```json
{
  "name": "driver",            // Nombre del rol
  "description": "Conductor que ofrece servicios de transporte",
  "permissions": [             // Permisos asociados al rol
    "view_own_rides",
    "update_own_status",
    "update_own_location"
  ],
  "level": 1,                  // Nivel de acceso (1: bajo, 2: medio, 3: alto)
  "createdAt": <timestamp>,    // Fecha de creación del rol
  "updatedAt": <timestamp>     // Última actualización del rol
}
```

```json
{
  "name": "admin",
  "description": "Administrador con acceso a gestión de conductores y estadísticas",
  "permissions": [
    "view_all_rides",
    "manage_drivers",
    "view_stats",
    "manage_regions"
  ],
  "level": 2,
  "createdAt": <timestamp>,
  "updatedAt": <timestamp>
}
```

```json
{
  "name": "superadmin",
  "description": "Administrador con acceso total al sistema",
  "permissions": [
    "view_all_rides",
    "manage_drivers",
    "view_stats",
    "manage_regions",
    "manage_admins",
    "configure_system",
    "manage_roles"
  ],
  "level": 3,
  "createdAt": <timestamp>,
  "updatedAt": <timestamp>
}
```

## Permisos por Rol

### Driver (Conductor)
- `view_own_rides`: Ver sus propios viajes
- `update_own_status`: Actualizar su estado (disponible, ocupado, offline)
- `update_own_location`: Actualizar su ubicación
- `accept_rides`: Aceptar solicitudes de viaje
- `complete_rides`: Completar viajes

### Admin (Administrador)
- `view_all_rides`: Ver todos los viajes
- `manage_drivers`: Gestionar conductores (aprobar, suspender)
- `view_stats`: Ver estadísticas y reportes
- `manage_regions`: Gestionar regiones geográficas

### SuperAdmin (Super Administrador)
- Todos los permisos de Admin
- `manage_admins`: Gestionar administradores
- `configure_system`: Configurar parámetros del sistema
- `manage_roles`: Gestionar roles y permisos
