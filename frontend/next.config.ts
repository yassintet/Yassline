import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Configuración para exportación estática (Hostinger)
  output: 'export',
  images: {
    unoptimized: true, // Necesario para exportación estática
  },
  // Desactivar trailing slash para compatibilidad
  trailingSlash: false,
};

export default nextConfig;
