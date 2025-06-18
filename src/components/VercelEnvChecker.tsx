// vercel-env-check.js
"use client";

import { useState } from 'react';

export default function VercelEnvChecker() {
  const [showDetails, setShowDetails] = useState(false);
  
  const envVariables = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'No definido',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'No definido',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'No definido',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'No definido',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'No definido',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'No definido',
  };
  
  return (
    <div className="fixed top-4 left-4 z-50">
      <button 
        onClick={() => setShowDetails(!showDetails)} 
        className="bg-black text-white rounded px-2 py-1 text-xs"
      >
        {showDetails ? 'Ocultar Variables' : 'Ver Variables ENV'}
      </button>
      
      {showDetails && (
        <div className="mt-2 bg-white p-3 rounded shadow-lg border text-xs w-96 max-h-96 overflow-auto">
          <h3 className="font-bold text-sm">Variables de Entorno</h3>
          
          <div className="mt-2 space-y-1">
            {Object.entries(envVariables).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <span className="font-medium">{key}:</span> 
                <span className="text-gray-700 break-all">{
                  // Ocultar parte de las claves por seguridad
                  key === 'apiKey' || key === 'appId' 
                    ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}`
                    : value
                }</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-2 border-t border-gray-200">
            <p className="text-gray-700">
              Si las variables no están definidas correctamente, asegúrate de configurarlas en Vercel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
