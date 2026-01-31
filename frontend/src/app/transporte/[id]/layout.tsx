import { ReactNode } from 'react';

export async function generateStaticParams() {
  try {
    // Obtener todos los transportes del backend durante el build
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yassline-production.up.railway.app';
    const response = await fetch(`${apiUrl}/api/transport`, {
      cache: 'no-store', // Siempre obtener datos frescos durante el build
    });
    
    if (response.ok) {
      const data = await response.json();
      const transports = data.success && Array.isArray(data.data) ? data.data : [];
      
      // Retornar todos los IDs de transportes activos
      const params = transports
        .filter((t: any) => t.active && t._id)
        .map((t: any) => ({ id: t._id }));
      
      // Si hay transportes, retornarlos; si no, retornar placeholder
      return params.length > 0 ? params : [{ id: '__placeholder__' }];
    }
  } catch (error) {
    console.error('Error fetching transports in generateStaticParams:', error);
  }
  
  // Fallback: retornar placeholder si falla la petición
  return [{ id: '__placeholder__' }];
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
