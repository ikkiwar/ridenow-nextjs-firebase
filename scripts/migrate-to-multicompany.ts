import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Cargar variables de entorno desde archivo .env.local
dotenv.config({ path: '.env.local' });

// Verificar que las variables de entorno estén cargadas
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('❌ Variables de entorno de Firebase no encontradas.');
  console.error('Por favor, asegúrate de que el archivo .env.local existe y contiene las variables necesarias.');
  console.error('Las variables requeridas son: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, etc.');
  process.exit(1);
}

// Imprimir información de depuración
console.log(`📋 Información de conexión:`);
console.log(`- Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
console.log(`- Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`);

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * IMPORTANTE: Este script debe ejecutarse con precaución y solo una vez
 * para migrar los datos existentes a la nueva estructura multi-compañía.
 * Se recomienda hacer una copia de seguridad de los datos antes de ejecutarlo.
 */

// Función para probar la conexión a Firestore
async function testFirestoreConnection() {
  try {
    console.log('🔄 Probando conexión a Firestore...');
    // Intentar obtener un documento inexistente es una buena forma de probar la conexión
    const testRef = doc(db, '_connection_test_', 'test_doc');
    await getDoc(testRef);
    console.log('✅ Conexión a Firestore establecida con éxito.');
    return true;
  } catch (error) {
    // Verificar si el error tiene un código (típico de errores de Firebase)
    const firebaseError = error as { code?: string };
    
    if (firebaseError.code === 'unavailable' || firebaseError.code === 'resource-exhausted') {
      console.error('❌ No se pudo conectar a Firestore. Verifica tu conexión a Internet.');
    } else if (firebaseError.code === 'permission-denied') {
      console.error('❌ Permiso denegado. Verifica las credenciales y reglas de seguridad de Firestore.');
    } else {
      console.error('❌ Error al conectar con Firestore:', error);
    }
    return false;
  }
}

async function migrationScript() {
  try {
    console.log('🚀 Iniciando migración a estructura multi-compañía...');
    
    // Probar conexión antes de continuar
    const isConnected = await testFirestoreConnection();
    if (!isConnected) {
      console.error('❌ No se pudo establecer conexión con Firestore. La migración no puede continuar.');
      console.error('   Intenta lo siguiente:');
      console.error('   1. Verifica tu conexión a Internet');
      console.error('   2. Asegúrate de que las credenciales de Firebase sean correctas');
      console.error('   3. Confirma que el proyecto de Firebase esté activo');
      return;
    }

    // 1. Crear una compañía por defecto para los datos existentes
    console.log('Creando compañía por defecto...');
    const defaultCompanyId = 'default_company';
    const defaultCompanyRef = doc(db, 'companies', defaultCompanyId);
    
    // Verificar si la compañía ya existe para evitar duplicados
    const companyDoc = await getDoc(defaultCompanyRef);
    
    if (!companyDoc.exists()) {
      await setDoc(defaultCompanyRef, {
        id: defaultCompanyId,
        name: 'RideNow Taxis',
        contactEmail: 'info@ridenow.com',
        contactPhone: '',
        logoUrl: '',
        primaryColor: '#FF5500',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Compañía por defecto creada');
    } else {
      console.log('ℹ️ La compañía por defecto ya existe');
    }

    // 2. Migrar usuarios existentes - añadir companyId
    console.log('Migrando usuarios existentes...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userBatch = writeBatch(db);
    let userCount = 0;

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const userRef = doc(db, 'users', userDoc.id);
      
      // Solo actualizar si no tienen ya un companyId
      if (!userData.companyId) {
        userCount++;
        if (userData.role === 'superadmin') {
          // Para superadmins, dar acceso a la compañía por defecto
          userBatch.update(userRef, {
            companiesAccess: [defaultCompanyId],
            updatedAt: serverTimestamp(),
          });
        } else {
          // Para otros usuarios, asignar a la compañía por defecto
          userBatch.update(userRef, {
            companyId: defaultCompanyId,
            updatedAt: serverTimestamp(),
          });
        }
      }
    });

    if (userCount > 0) {
      await userBatch.commit();
      console.log(`✅ ${userCount} usuarios migrados`);
    } else {
      console.log('ℹ️ No hay usuarios para migrar');
    }

    // 3. Crear subcollección de conductores y migrar datos existentes
    console.log('Migrando conductores existentes...');
    
    try {
      // Intentar obtener la colección de conductores si existe
      const driversPath = collection(db, 'drivers');
      const driversSnapshot = await getDocs(driversPath);
      let driverCount = 0;

      // Si llegamos aquí, la colección existe
      for (const driverDoc of driversSnapshot.docs) {
        const driverData = driverDoc.data();
        const newDriverRef = doc(db, `companies/${defaultCompanyId}/drivers`, driverDoc.id);
        
        // Migrar datos del conductor a la nueva ubicación
        await setDoc(newDriverRef, {
          ...driverData,
          updatedAt: serverTimestamp(),
        });
        
        driverCount++;
      }

      console.log(`✅ ${driverCount} conductores migrados`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Si hay un error al obtener la colección, puede que no exista aún
      console.log('ℹ️ No se encontraron conductores para migrar o la colección no existe aún');
    }

    // 4. Crear subcollección de viajes y migrar datos existentes
    console.log('Migrando viajes existentes...');
    
    try {
      // Intentar obtener la colección de viajes si existe
      const ridesPath = collection(db, 'rides');
      const ridesSnapshot = await getDocs(ridesPath);
      let rideCount = 0;

      // Si llegamos aquí, la colección existe
      for (const rideDoc of ridesSnapshot.docs) {
        const rideData = rideDoc.data();
        const newRideRef = doc(db, `companies/${defaultCompanyId}/rides`, rideDoc.id);
        
        // Migrar datos del viaje a la nueva ubicación
        await setDoc(newRideRef, {
          ...rideData,
          updatedAt: serverTimestamp(),
        });
        
        rideCount++;
      }

      console.log(`✅ ${rideCount} viajes migrados`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Si hay un error al obtener la colección, puede que no exista aún
      console.log('ℹ️ No se encontraron viajes para migrar o la colección no existe aún');
    }

    console.log('✅ Migración completada exitosamente');
    console.log('⚠️ IMPORTANTE: No ejecutar este script nuevamente para evitar duplicar datos');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar el script
console.log('📝 Script de migración RideNow a estructura multi-compañía');
console.log('------------------------------------------------------------');

// Envolver en una función asíncrona autoejecutable
(async () => {
  try {
    await migrationScript();
    console.log('📝 Proceso completado');
  } catch (error) {
    console.error('❌ Error crítico:', error);
    process.exit(1);
  }
})();
