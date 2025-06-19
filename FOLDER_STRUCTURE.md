# Estructura de Carpetas para Roles en RideNow

Esta estructura de carpetas organiza la aplicación según los diferentes roles (driver, admin, superadmin) y sus funcionalidades específicas.

```
src/
├── app/
│   ├── dashboard/         # Tablero principal (requiere autenticación)
│   │   ├── page.tsx       # Vista principal del dashboard (común)
│   │   │
│   │   ├── driver/        # Sección exclusiva para conductores
│   │   │   ├── page.tsx   # Vista principal de conductor
│   │   │   ├── profile/   # Perfil del conductor
│   │   │   ├── rides/     # Historial de viajes del conductor
│   │   │   └── settings/  # Configuración del conductor
│   │   │
│   │   ├── admin/         # Sección exclusiva para administradores
│   │   │   ├── page.tsx   # Vista principal de administrador
│   │   │   ├── drivers/   # Gestión de conductores
│   │   │   ├── reports/   # Informes y estadísticas
│   │   │   └── regions/   # Gestión de regiones
│   │   │
│   │   └── superadmin/    # Sección exclusiva para super administradores
│   │       ├── page.tsx   # Vista principal de super admin
│   │       ├── users/     # Gestión de usuarios (todos los roles)
│   │       ├── settings/  # Configuración del sistema
│   │       └── roles/     # Gestión de roles y permisos
│   │
│   └── login/            # Página de inicio de sesión
│       └── page.tsx
│
├── components/
│   ├── RequireAuth.tsx   # Componente que requiere autenticación
│   ├── RequireRole.tsx   # Componente que requiere rol específico
│   ├── RoleInfo.tsx      # Componente para mostrar info del rol actual
│   │
│   ├── driver/           # Componentes específicos de conductores
│   │   ├── DriverMap.tsx
│   │   ├── RidesList.tsx
│   │   └── StatusToggle.tsx
│   │
│   ├── admin/            # Componentes específicos de administradores
│   │   ├── DriversTable.tsx
│   │   ├── ReportsChart.tsx
│   │   └── RegionSelector.tsx
│   │
│   └── superadmin/       # Componentes específicos de super administradores
│       ├── UserManager.tsx
│       ├── RoleEditor.tsx
│       └── SystemSettings.tsx
│
├── context/
│   └── AuthProvider.tsx  # Proveedor de autenticación con soporte de roles
│
├── utils/
│   └── roleUtils.ts      # Utilidades para gestión de roles
│
└── hooks/
    └── usePermission.ts  # Hook para verificar permisos
```

## Ejemplo de implementación de rutas protegidas

### 1. Ruta para conductores
```tsx
// src/app/dashboard/driver/page.tsx
'use client';

import RequireRole from "@/components/RequireRole";

export default function DriverDashboard() {
  return (
    <RequireRole allowedRoles={['driver', 'admin', 'superadmin']}>
      <div>
        <h1>Dashboard del Conductor</h1>
        {/* Contenido específico para conductores */}
      </div>
    </RequireRole>
  );
}
```

### 2. Ruta para administradores
```tsx
// src/app/dashboard/admin/page.tsx
'use client';

import RequireRole from "@/components/RequireRole";

export default function AdminDashboard() {
  return (
    <RequireRole allowedRoles={['admin', 'superadmin']}>
      <div>
        <h1>Dashboard del Administrador</h1>
        {/* Contenido específico para administradores */}
      </div>
    </RequireRole>
  );
}
```

### 3. Ruta para super administradores
```tsx
// src/app/dashboard/superadmin/page.tsx
'use client';

import RequireRole from "@/components/RequireRole";

export default function SuperAdminDashboard() {
  return (
    <RequireRole allowedRoles={['superadmin']}>
      <div>
        <h1>Dashboard del Super Administrador</h1>
        {/* Contenido específico para super administradores */}
      </div>
    </RequireRole>
  );
}
```
