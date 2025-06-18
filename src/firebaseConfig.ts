// src/firebaseConfig.ts
import { FirebaseApp, getApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// Manejo seguro para evitar la inicialización en el lado del servidor durante la compilación
const isBrowser = () => typeof window !== 'undefined';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'placeholder-app-id',
};

// Inicializar Firebase de forma segura
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Función para inicializar Firebase
function createFirebaseApp() {
  try {
    return getApp();
  } catch {
    return initializeApp(firebaseConfig);
  }
}

// Inicializar Firebase con un patrón más seguro
if (isBrowser()) {
  // Solo ejecutar en el navegador
  app = createFirebaseApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Proporcionar un valor mock para el entorno del servidor
  app = {} as FirebaseApp;
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
  } as unknown as Auth;
  db = {} as Firestore;
}

export { app, auth, db };
