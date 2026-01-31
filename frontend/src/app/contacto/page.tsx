"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import { contactAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    servicio: "",
    mensaje: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { t } = useI18n();

  // SEO Avanzado para Contacto
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  
  useSEO({
    title: 'Contacto Yassline Tour | Reserva Transporte Turístico Marruecos | Teléfono +212-669-215-611',
    description: 'Contacta con Yassline Tour para reservar tu transporte o circuito turístico en Marruecos. Teléfono: +212-669-215-611, Email: info@yassline.com. Disponibles 24/7. Reserva tu viaje de lujo ahora.',
    keywords: [
      'contacto Yassline Tour',
      'reservar transporte Marruecos',
      'contacto turismo Marruecos',
      'teléfono Yassline Tour',
      'email Yassline Tour',
      'reservar circuito Marruecos',
      'contacto transporte lujo Marruecos',
      'reservar tour Marruecos',
      'consultar precios transporte Marruecos',
      'solicitar cotización transporte',
      'WhatsApp transporte Marruecos'
    ],
    url: '/contacto',
    image: '/img/Marrakech-cityf.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': `${baseUrl}/contacto#contactpage`,
      name: 'Contacto Yassline Tour',
      description: 'Contacta con Yassline Tour para reservar tu transporte o circuito turístico en Marruecos',
      mainEntity: {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: 'Yassline Tour',
        telephone: '+212-669-215-611',
        email: 'info@yassline.com',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'MA',
          addressLocality: 'Marruecos',
          addressRegion: 'Marruecos',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+212-669-215-611',
            contactType: 'customer service',
            areaServed: {
              '@type': 'Country',
              name: 'Morocco',
            },
            availableLanguage: ['Spanish', 'English', 'French', 'Arabic'],
          },
          {
            '@type': 'ContactPoint',
            email: 'info@yassline.com',
            contactType: 'customer service',
          },
        ],
      },
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await contactAPI.send(formData);

      if (response.success) {
        setSuccess(true);
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          servicio: "",
          mensaje: ""
        });
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.error || t('contact.errorSending'));
      }
    } catch (err) {
      setError(t('contact.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const whatsappNumber = "212669215611";
  const whatsappMessage = "Hola, me gustaría obtener más información sobre sus servicios.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <StructuredData
        type="LocalBusiness"
        data={{
          name: 'Yassline Tour',
          telephone: '+212-669-215-611',
          email: 'info@yassline.com',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'MA',
            addressLocality: 'Marruecos'
          }
        }}
      />
      <Navbar />

      {/* Header Section - Mejorado */}
      <section className="relative pt-24 pb-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/Marrakech-cityf.jpg"
            alt="Marrakech"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--yass-gold)]/10 via-[var(--yass-gold-light)]/10 to-[var(--yass-gold)]/10"></div>
        </div>
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-28">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
            <span className="text-xs font-bold text-[var(--yass-gold)] uppercase tracking-widest bg-gradient-to-r from-[var(--yass-gold)]/10 via-[var(--yass-gold-light)]/10 to-[var(--yass-gold)]/10 px-6 py-2 rounded-full border-2 border-[var(--yass-gold)]/30 shadow-lg backdrop-blur-sm">
              {t('contact.contactInfo') || 'Contacto'}
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-[var(--yass-black)] via-[var(--yass-gold)] to-[var(--yass-black)] bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
            {t('contact.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Section - Mejorado */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--yass-gold)]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--yass-gold)]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info - Mejorado */}
            <div>
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--yass-gold)]"></div>
                  <span className="text-sm font-bold text-[var(--yass-gold)] uppercase tracking-widest">
                    {t('contact.contactInfo')}
                  </span>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--yass-gold)]"></div>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  {t('contact.stayConnected') || 'Mantente Conectado'}
                </h2>
                <p className="text-base text-gray-600">
                  {t('contact.contactDescription') || 'Estamos aquí para ayudarte en todo momento'}
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Phone mejorado */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl hover:border-[var(--yass-gold)]/30 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('contact.phone')}</h3>
                      <a href="tel:+212669215611" className="text-gray-700 hover:text-[var(--yass-gold)] transition-colors font-semibold text-base">
                        +212 669 215 611
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email mejorado */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl hover:border-[var(--yass-gold)]/30 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('contact.email')}</h3>
                      <a href="mailto:info@yassline.com" className="text-gray-700 hover:text-[var(--yass-gold)] transition-colors font-semibold text-base break-all">
                        info@yassline.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Location mejorado */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl hover:border-green-500/30 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('contact.location')}</h3>
                      <p className="text-gray-700 font-semibold">
                        {t('contact.marrakechMorocco')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp mejorado */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl hover:border-[#25D366]/30 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-[#25D366] to-[#20BA5A] p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('contact.whatsapp')}</h3>
                      <a 
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-[#25D366] transition-colors font-semibold text-base inline-flex items-center gap-2 group-hover:gap-3"
                      >
                        <span>{t('contact.chatWithUs')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Mejorado */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100/50">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--yass-gold)]"></div>
                  <span className="text-sm font-bold text-[var(--yass-gold)] uppercase tracking-widest">
                    {t('contact.sendMessage')}
                  </span>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--yass-gold)]"></div>
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  {t('contact.sendMessage')}
                </h2>
                <p className="text-gray-600">
                  {t('contact.formDescription') || 'Completa el formulario y te responderemos lo antes posible'}
                </p>
              </div>

              {/* Success Message mejorado */}
              {success && (
                <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl flex items-start gap-3 shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-semibold text-green-800">{t('contact.messageSent')}</p>
                    <p className="text-sm text-green-700 mt-1">{t('contact.weWillContactYou') || 'Nos pondremos en contacto contigo pronto'}</p>
                  </div>
                </div>
              )}

              {/* Error Message mejorado */}
              {error && (
                <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 shadow-sm">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-semibold text-red-800">{t('contact.error') || 'Error'}</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre mejorado */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    {t('contact.fullName')} <span className="text-[var(--yass-gold)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white hover:border-gray-400"
                    placeholder={t('contact.fullNamePlaceholder')}
                  />
                </div>

                {/* Email mejorado */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    {t('contact.email')} <span className="text-[var(--yass-gold)]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white hover:border-gray-400"
                    placeholder={t('contact.emailPlaceholder')}
                  />
                </div>

                {/* Teléfono mejorado */}
                <div>
                  <label htmlFor="telefono" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    {t('contact.phone2')}
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white hover:border-gray-400"
                    placeholder={t('contact.phonePlaceholder')}
                  />
                </div>

                {/* Servicio mejorado */}
                <div>
                  <label htmlFor="servicio" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    {t('contact.serviceInterest')}
                  </label>
                  <select
                    id="servicio"
                    name="servicio"
                    value={formData.servicio}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white hover:border-gray-400 cursor-pointer"
                  >
                    <option value="">{t('contact.selectService')}</option>
                    <option value="transporte">{t('contact.transport2')}</option>
                    <option value="circuito">{t('contact.touristCircuits')}</option>
                    <option value="hotel">{t('contact.hotel')}</option>
                    <option value="otro">{t('contact.other')}</option>
                  </select>
                </div>

                {/* Mensaje mejorado */}
                <div>
                  <label htmlFor="mensaje" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    {t('contact.message')} <span className="text-[var(--yass-gold)]">*</span>
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows={6}
                    disabled={loading}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none bg-white hover:border-gray-400"
                    placeholder={t('contact.messagePlaceholder')}
                  />
                </div>

                {/* Submit Button mejorado */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[var(--yass-gold)] via-[var(--yass-gold-light)] to-[var(--yass-gold)] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white py-5 px-8 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-[var(--yass-gold)]/30 hover:scale-[1.02] transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[var(--yass-gold)]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>{t('contact.sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                      <span>{t('contact.sendMessage2')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
