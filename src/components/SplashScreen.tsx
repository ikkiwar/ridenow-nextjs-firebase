"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

interface SplashScreenProps {
  minimumDisplayTime?: number; // Tiempo mínimo en milisegundos que se mostrará el splash
  onSplashComplete?: () => void; // Callback a ejecutar cuando termine la animación
}

export default function SplashScreen({ 
  minimumDisplayTime = 2500, 
  onSplashComplete 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Asegurarse de que el componente se muestre inmediatamente
    document.body.style.overflow = 'hidden'; // Prevenir scroll
    
    // Temporizador para ocultar el splash después de tiempo mínimo
    const timer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = ''; // Restaurar scroll
      if (onSplashComplete) {
        onSplashComplete();
      }
    }, minimumDisplayTime);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = ''; // Restaurar scroll si se desmonta
    };
  }, [minimumDisplayTime, onSplashComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600 to-blue-400 flex flex-col items-center justify-center z-50"
        >
          {/* Logo de la app */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="mb-6"
          >
            <Image 
              src="/ridenow_logo.png" 
              alt="RideNow Logo" 
              width={200} 
              height={120} 
              priority
              className="drop-shadow-xl"
            />
          </motion.div>
          
          {/* Animación sencilla (en lugar de Lottie) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -10, 0, -10, 0],
              rotate: [0, 2, 0, -2, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="flex items-center justify-center w-64 h-64 mb-4"
          >
            <div className="relative">
              <div className="absolute w-20 h-8 bg-blue-800 rounded-t-full top-0 left-10 right-10"></div>
              <div className="w-40 h-16 bg-blue-700 rounded-lg shadow-lg"></div>
              <div className="absolute -bottom-4 left-4 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-600"></div>
              <div className="absolute -bottom-4 right-4 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-600"></div>
            </div>
          </motion.div>
          
          {/* Barra de progreso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6"
          >
            <div className="w-48 h-2 bg-blue-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: minimumDisplayTime / 1000 }}
              />
            </div>
          </motion.div>
          
          {/* Eslogan */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-8 text-white text-sm font-medium"
          >
            Conectando pasajeros y conductores
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
