"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthProvider";
import Image from 'next/image';
import { motion } from 'framer-motion';
import '../../styles/login.css';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Si el usuario ya está autenticado, redirigir a la página principal
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    if (!isLogin && password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // La redirección se hará automáticamente gracias al useEffect
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Después de registrarse, limpiar campos y cambiar a modo login
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsLogin(true);
        // Mostrar mensaje de éxito
        alert("Registro exitoso. Por favor inicia sesión con tus credenciales.");
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || `Error al ${isLogin ? "iniciar sesión" : "registrarse"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // La redirección se hará automáticamente gracias al useEffect
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Error al iniciar sesión con Google");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  // Mostrar un indicador de carga mientras se verifica el estado de autenticación
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#FFD60A' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-5 rounded-lg shadow-md"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-black"></div>
            <p className="mt-3 text-gray-700 font-medium">Cargando...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6" style={{ backgroundColor: '#FFD60A' }}>
      <div className="flex justify-center mb-8 sm:mb-10">
        <div className="logo-animation">
          <Image 
            src="/ridenow_short_logo.png" 
            alt="RideNow Logo" 
            width={400} 
            height={70}
            priority
            className="drop-shadow-lg w-auto h-auto"
          />
        </div>
      </div>
      <motion.div 
        className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-center text-gray-800">{isLogin ? "Iniciar sesión" : "Registrarse"}</h1>
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 sm:gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded-md px-3 py-2.5 w-full text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-600 placeholder:font-medium"
            required
            disabled={isSubmitting}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded-md px-3 py-2.5 w-full text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-600 placeholder:font-medium"
            required
            disabled={isSubmitting}
          />
          
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="border rounded-md px-3 py-2.5 w-full text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-600 placeholder:font-medium"
              required
              disabled={isSubmitting}
            />
          )}
          
          <button 
            type="submit" 
            className="bg-black text-white rounded-md py-2.5 sm:py-3 text-base font-semibold mt-4 flex justify-center transition-all duration-200 ease-in-out hover:bg-gray-900 active:bg-black"
            disabled={isSubmitting}
            style={{ backgroundColor: isSubmitting ? '#333' : '#000' }}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              isLogin ? "Entrar" : "Registrarse"
            )}
          </button>
        </form>
        
        <button
          onClick={handleGoogleLogin}
          className="bg-white text-gray-700 border border-gray-300 rounded-md py-2.5 sm:py-3 text-base font-semibold w-full mt-4 sm:mt-5 flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all duration-200 active:bg-gray-100"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-700"></div>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Iniciar sesión con Google
            </>
          )}
        </button>
        
        <div className="mt-5 sm:mt-6 text-center">
          <button 
            onClick={toggleAuthMode} 
            className="text-gray-500 hover:text-gray-800 transition-colors duration-200 font-medium text-sm sm:text-base py-2"
            disabled={isSubmitting}
          >
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
        
        {error && <div className="text-red-600 text-xs sm:text-sm mt-3 p-2 bg-red-50 rounded-md">{error}</div>}
      </motion.div>
    </div>
  );
}
