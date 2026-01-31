"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function TerminosCondicionesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  
  // SEO
  useSEO({
    title: 'Términos y Condiciones - Yassline Tour | Condiciones de Uso',
    description: 'Términos y condiciones de uso de los servicios de Yassline Tour. Conoce nuestras políticas de reserva, cancelación y uso del servicio de transporte turístico.',
    keywords: [
      'términos condiciones Yassline Tour',
      'condiciones uso transporte Marruecos',
      'política reserva Yassline Tour',
      'términos servicio transporte',
    ],
    url: '/terminos-condiciones',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${baseUrl}/terminos-condiciones#webpage`,
      name: 'Términos y Condiciones',
      description: 'Términos y condiciones de uso de los servicios de Yassline Tour',
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
          name: 'Términos y Condiciones',
        }}
      />
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Términos y Condiciones', href: '/terminos-condiciones' },
          ]}
        />
      </div>
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-full mb-6">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[var(--yass-gold)]" />
                1. Aceptación de los Términos
              </h2>
              <p className="text-gray-700">
                Al acceder y utilizar los servicios de Yassline Tour, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[var(--yass-gold)]" />
                2. Servicios Ofrecidos
              </h2>
              <p className="text-gray-700 mb-4">
                Yassline Tour ofrece los siguientes servicios:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Traslados al aeropuerto</li>
                <li>Traslados inter-ciudades</li>
                <li>Servicio por horas con chofer</li>
                <li>Servicios personalizados</li>
                <li>Circuitos turísticos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-[var(--yass-gold)]" />
                3. Reservas y Pagos
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  <strong>3.1 Reservas:</strong> Todas las reservas están sujetas a disponibilidad. Nos reservamos el derecho de rechazar cualquier reserva a nuestra discreción.
                </p>
                <p>
                  <strong>3.2 Confirmación:</strong> Las reservas se consideran confirmadas una vez recibido el pago o confirmación por parte de Yassline Tour.
                </p>
                <p>
                  <strong>3.3 Precios:</strong> Todos los precios están en Dirhams Marroquíes (MAD) y pueden estar sujetos a cambios sin previo aviso. Los precios finales se confirmarán al momento de la reserva.
                </p>
                <p>
                  <strong>3.4 Pagos:</strong> Los métodos de pago aceptados se especificarán al momento de la reserva. El pago completo puede ser requerido antes del servicio.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Cancelaciones y Reembolsos
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  <strong>4.1 Cancelaciones por el Cliente:</strong>
                </p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li>Cancelación con más de 48 horas de anticipación: Reembolso completo menos 10% de gastos administrativos</li>
                  <li>Cancelación con 24-48 horas de anticipación: Reembolso del 50%</li>
                  <li>Cancelación con menos de 24 horas: No hay reembolso</li>
                </ul>
                <p>
                  <strong>4.2 Cancelaciones por Yassline Tour:</strong> En caso de cancelación por nuestra parte debido a circunstancias fuera de nuestro control, ofreceremos un reembolso completo o reprogramación del servicio.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Responsabilidades del Cliente
              </h2>
              <p className="text-gray-700 mb-4">
                El cliente se compromete a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Proporcionar información precisa y completa al realizar la reserva</li>
                <li>Estar presente en el lugar y hora acordados</li>
                <li>Tratar al personal y vehículos con respeto</li>
                <li>Informar cualquier problema o incidencia inmediatamente</li>
                <li>Cumplir con todas las leyes y regulaciones locales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Responsabilidades de Yassline Tour
              </h2>
              <p className="text-gray-700 mb-4">
                Yassline Tour se compromete a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Proporcionar servicios de calidad con vehículos en buen estado</li>
                <li>Emplear choferes profesionales y con licencia</li>
                <li>Cumplir con los horarios acordados</li>
                <li>Mantener seguro de vehículos y pasajeros</li>
                <li>Tratar a los clientes con respeto y profesionalismo</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Limitación de Responsabilidad
              </h2>
              <p className="text-gray-700">
                Yassline Tour no será responsable por retrasos, cancelaciones o cambios en el servicio debido a circunstancias fuera de nuestro control, incluyendo pero no limitado a: condiciones climáticas adversas, tráfico, accidentes, huelgas, o eventos de fuerza mayor. Nuestra responsabilidad se limita al valor del servicio contratado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Propiedad Intelectual
              </h2>
              <p className="text-gray-700">
                Todo el contenido del sitio web, incluyendo textos, imágenes, logotipos y diseño, es propiedad de Yassline Tour y está protegido por leyes de propiedad intelectual. No está permitida la reproducción sin autorización previa.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Modificaciones de los Términos
              </h2>
              <p className="text-gray-700">
                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. Es responsabilidad del cliente revisar periódicamente estos términos.
              </p>
            </section>

            <section className="mb-8 bg-gray-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Contacto y Resolución de Disputas
              </h2>
              <p className="text-gray-700 mb-4">
                Para cualquier consulta o reclamación relacionada con estos términos:
              </p>
              <ul className="text-gray-700 space-y-2 mb-4">
                <li><strong>Email:</strong> info@yassline.com</li>
                <li><strong>Teléfono:</strong> +212 669 215 611</li>
                <li><strong>Ubicación:</strong> Tánger / Casablanca, Marruecos</li>
              </ul>
              <p className="text-gray-700">
                Cualquier disputa será resuelta mediante negociación de buena fe. Si no se alcanza un acuerdo, las disputas se resolverán según las leyes de Marruecos.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
