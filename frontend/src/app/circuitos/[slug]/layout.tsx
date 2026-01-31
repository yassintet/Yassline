import { ReactNode } from 'react';

export async function generateStaticParams() {
  try {
    // Obtener todos los circuitos del backend durante el build
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yassline-production.up.railway.app';
    const response = await fetch(`${apiUrl}/api/circuits`, {
      cache: 'no-store', // Siempre obtener datos frescos durante el build
    });
    
    if (response.ok) {
      const data = await response.json();
      const circuits = data.success && Array.isArray(data.data) ? data.data : [];
      
      // Retornar todos los slugs de circuitos activos
      const params = circuits
        .filter((c: any) => c.active && c.slug)
        .map((c: any) => ({ slug: c.slug }));
      
      // Si hay circuitos, retornarlos; si no, retornar placeholder
      return params.length > 0 ? params : [{ slug: '__placeholder__' }];
    }
  } catch (error) {
    console.error('Error fetching circuits in generateStaticParams:', error);
  }
  
  // Fallback: retornar placeholder si falla la petición
  return [{ slug: '__placeholder__' }];
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
