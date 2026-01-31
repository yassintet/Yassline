"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--yass-cream)] flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl md:text-[12rem] font-extrabold bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] bg-clip-text text-transparent leading-none">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Página no encontrada
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            <p className="text-gray-500">
              Puede que el enlace esté roto o que hayas escrito mal la URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              prefetch={false}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Volver al inicio
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:border-[var(--yass-gold)] hover:text-[var(--yass-gold)] transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver atrás
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">O visita nuestras páginas principales:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/transporte"
                prefetch={false}
                className="text-[var(--yass-gold)] hover:underline font-medium"
              >
                Transporte
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/circuitos"
                prefetch={false}
                className="text-[var(--yass-gold)] hover:underline font-medium"
              >
                Circuitos
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/vehiculos"
                prefetch={false}
                className="text-[var(--yass-gold)] hover:underline font-medium"
              >
                Vehículos
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/contacto"
                prefetch={false}
                className="text-[var(--yass-gold)] hover:underline font-medium"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
