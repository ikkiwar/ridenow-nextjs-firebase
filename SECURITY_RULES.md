# Reglas de Seguridad para Multi-compañía en RideNow

Este documento detalla las reglas de seguridad de Firestore implementadas para asegurar el aislamiento de datos en la arquitectura multi-compañía de RideNow.

## Archivos de Configuración

Se han creado los siguientes archivos para la configuración de Firebase:

- `firestore.rules`: Define las reglas de acceso a datos en Firestore
- `storage.rules`: Define las reglas de acceso al almacenamiento
- `firebase.json`: Configuración general del proyecto Firebase
- `firestore.indexes.json`: Define índices compuestos para consultas optimizadas
- `.firebaserc`: Vincula el proyecto local con el proyecto Firebase en la nube

## Principios de Seguridad Implementados

Las reglas se basan en los siguientes principios:

1. **Aislamiento entre compañías**: Los usuarios solo pueden acceder a datos de las compañías a las que pertenecen
2. **Control por rol**: Diferentes roles (superadmin, admin, driver) tienen diferentes permisos
3. **Protección de datos sensibles**: Los datos sensibles solo son accesibles por usuarios autorizados
4. **Validación de datos**: Se asegura que los datos cumplan con formatos y restricciones esperados

## Estructura de Permisos

### Usuarios (users)

- Todos los usuarios autenticados pueden leer perfiles básicos
- Solo el propio usuario o un administrador puede leer datos completos o modificarlos
- Superadmins tienen acceso completo a todos los perfiles

### Compañías (companies)

- Solo miembros de una compañía pueden leer sus datos
- Solo administradores de la compañía pueden modificar datos
- Superadmins pueden administrar todas las compañías

### Conductores (drivers)

- Miembros de la compañía pueden ver sus conductores
- Solo administradores o el propio conductor pueden modificar datos de conductor

### Viajes (rides)

- Miembros de la compañía pueden ver viajes de la compañía
- Administradores pueden modificar cualquier viaje
- Conductores solo pueden modificar sus propios viajes asignados

### Regiones (regions)

- Visibles para todos los miembros de la compañía
- Solo administradores pueden modificarlas

## Cómo Desplegar las Reglas

Para desplegar estas reglas a Firebase:

1. Asegúrate de estar autenticado en Firebase CLI:
   ```
   firebase login
   ```

2. Asegúrate de tener los permisos adecuados en el proyecto Firebase.

3. Despliega las reglas de Firestore:
   ```
   firebase deploy --only firestore:rules
   ```

4. Despliega los índices de Firestore:
   ```
   firebase deploy --only firestore:indexes
   ```

5. Despliega las reglas de Storage:
   ```
   firebase deploy --only storage
   ```

## Funciones Auxiliares en las Reglas

Las reglas utilizan varias funciones helper para facilitar comprobaciones comunes:

- `isSignedIn()`: Verifica si el usuario está autenticado
- `getUserData()`: Obtiene datos del usuario desde Firestore
- `userRole()`: Determina el rol del usuario
- `isAdmin()`, `isSuperAdmin()`, `isDriver()`: Comprueban roles específicos
- `belongsToCompany()`: Verifica si un usuario pertenece a una compañía específica
- `isCurrentUser()`: Comprueba si el usuario es el propietario de los datos solicitados

## Pruebas de Reglas

Es recomendable probar estas reglas usando el emulador de Firebase antes de desplegarlas a producción:

```
firebase emulators:start
```

Esto iniciará un entorno local donde puedes probar las reglas sin afectar tu base de datos real.
