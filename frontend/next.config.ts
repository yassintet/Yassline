import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler temporalmente deshabilitado para evitar conflictos con Turbopack
  // reactCompiler: true,
  
  // Configuración para exportación estática (Hostinger)
  output: 'export',
  
  // Configurar root para evitar warnings de lockfiles
  outputFileTracingRoot: require('path').join(__dirname),
  images: {
    unoptimized: true, // Necesario para exportación estática
    // Configurar dominios permitidos para imágenes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Desactivar trailing slash para compatibilidad
  trailingSlash: false,
  // Deshabilitar prefetching para evitar errores 403 en Hostinger
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  // Optimizaciones SEO
  compress: true,
  poweredByHeader: false, // Ocultar header X-Powered-By para seguridad
  // Headers de seguridad: con output: 'export' no se aplican aquí.
  // Se aplican en producción vía frontend/public/.htaccess (copiado a out/).
  // headers() comentado para evitar el warning del build.
  // async headers() { ... }
};

export default nextConfig;
