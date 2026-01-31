"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function PoliticaPrivacidadPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  
  // SEO
  useSEO({
    title: 'Política de Privacidad - Yassline Tour | Protección de Datos',
    description: 'Política de privacidad de Yassline Tour. Conoce cómo protegemos y utilizamos tus datos personales. Comprometidos con tu privacidad y seguridad.',
    keywords: [
      'política privacidad Yassline Tour',
      'protección datos Yassline Tour',
      'privacidad transporte Marruecos',
      'RGPD Marruecos',
    ],
    url: '/politica-privacidad',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${baseUrl}/politica-privacidad#webpage`,
      name: 'Política de Privacidad',
      description: 'Política de privacidad y protección de datos de Yassline Tour',
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`,
      },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
  });
  
  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <StructuredData
        type="WebSite"
        data={{
          name: 'Política de Privacidad',
        }}
      />
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Política de Privacidad', href: '/politica-privacidad' },
          ]}
        />
      </div>
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-full mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Política de Privacidad
            </h1>
            <p className="text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-[var(--yass-gold)]" />
                1. Información que Recopilamos
              </h2>
              <p className="text-gray-700 mb-4">
                En Yassline Tour, recopilamos información que nos proporcionas directamente cuando:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Realizas una reserva de servicio</li>
                <li>Te pones en contacto con nosotros a través de formularios</li>
                <li>Te registras en nuestro sitio web</li>
                <li>Nos envías un correo electrónico</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Esta información puede incluir: nombre, dirección de correo electrónico, número de teléfono, información de pago y otros datos que elijas proporcionar.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-[var(--yass-gold)]" />
                2. Uso de la Información
              </h2>
              <p className="text-gray-700 mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Procesar y gestionar tus reservas</li>
                <li>Comunicarnos contigo sobre tus servicios</li>
                <li>Enviarte confirmaciones y facturas</li>
                <li>Mejorar nuestros servicios y experiencia del usuario</li>
                <li>Enviar comunicaciones de marketing (con tu consentimiento)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[var(--yass-gold)]" />
                3. Protección de Datos
              </h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
              <p className="text-gray-700">
                Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por proteger tu información, no podemos garantizar su seguridad absoluta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Compartir Información
              </h2>
              <p className="text-gray-700 mb-4">
                No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en las siguientes circunstancias:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Con proveedores de servicios que nos ayudan a operar nuestro negocio (procesadores de pago, servicios de email)</li>
                <li>Cuando sea requerido por ley o para proteger nuestros derechos</li>
                <li>Con tu consentimiento explícito</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Tus Derechos
              </h2>
              <p className="text-gray-700 mb-4">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Acceder a tu información personal</li>
                <li>Rectificar datos inexactos</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Oponerte al procesamiento de tus datos</li>
                <li>Retirar tu consentimiento en cualquier momento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Cookies
              </h2>
              <p className="text-gray-700">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Cambios a esta Política
              </h2>
              <p className="text-gray-700">
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos de cualquier cambio publicando la nueva política en esta página y actualizando la fecha de "Última actualización".
              </p>
            </section>

            <section className="mb-8 bg-gray-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Contacto
              </h2>
              <p className="text-gray-700 mb-4">
                Si tienes preguntas sobre esta política de privacidad, puedes contactarnos:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Email:</strong> info@yassline.com</li>
                <li><strong>Teléfono:</strong> +212 669 215 611</li>
                <li><strong>Ubicación:</strong> Tánger / Casablanca, Marruecos</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
