import Link from "next/link";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'No encontrado - RideNow',
  description: 'La página que estás buscando no existe',
};
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#FFD60A' }}>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
        <p className="mb-6 text-gray-600">No pudimos encontrar la página que estás buscando.</p>
        <Link 
          href="/" 
          className="bg-black text-white px-6 py-2 rounded-md inline-block hover:bg-gray-800 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
