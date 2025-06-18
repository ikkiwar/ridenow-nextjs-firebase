// src/components/AuthDebugger.tsx
"use client";

import { useState, useEffect } from 'react';

export const AuthDebugger = () => {
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [info, setInfo] = useState({
    authDomain: '',
    currentDomain: '',
    authorizedDomains: [] as string[]
  });

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      setInfo({
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'No configurado',
        currentDomain: window.location.hostname,
        authorizedDomains: [
          'ridenow-6a5dc.firebaseapp.com',
          'ridenow-nextjs-firebase.vercel.app',
          'localhost'
        ]
      });
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsDebugOpen(!isDebugOpen)}
        className="bg-black text-white px-3 py-1 rounded-md text-xs"
      >
        {isDebugOpen ? 'Cerrar Depurador' : 'Depurador Auth'}
      </button>
      
      {isDebugOpen && (
        <div className="mt-2 bg-white p-3 rounded shadow-lg border border-gray-200 text-xs w-80">
          <h3 className="font-bold text-sm mb-2">Depurador de Autenticación</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Auth Domain:</span> {info.authDomain}</p>
            <p><span className="font-medium">Dominio actual:</span> {info.currentDomain}</p>
            
            <div>
              <p className="font-medium">Dominios autorizados:</p>
              <ul className="pl-4 list-disc">
                {info.authorizedDomains.map((domain, i) => (
                  <li key={i} className={info.currentDomain === domain ? "text-green-600 font-medium" : ""}>
                    {domain} {info.currentDomain === domain ? "✓" : ""}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-2 text-amber-700 border-t pt-2 border-amber-200">
              <p className="font-medium">Posibles problemas:</p>
              {info.currentDomain !== 'localhost' && !info.authorizedDomains.includes(info.currentDomain) && (
                <p>⚠️ El dominio actual no está en la lista de dominios autorizados.</p>
              )}
              {info.authDomain !== 'ridenow-6a5dc.firebaseapp.com' && (
                <p>⚠️ El Auth Domain no coincide con el esperado.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
