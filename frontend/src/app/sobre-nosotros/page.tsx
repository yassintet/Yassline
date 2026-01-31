"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Shield, 
  Award, 
  Users, 
  Heart,
  CheckCircle2,
  MapPin,
  Clock,
  Star
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import Link from "next/link";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function SobreNosotrosPage() {
  const { t } = useI18n();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  
  // SEO
  useSEO({
    title: 'Sobre Nosotros - Yassline Tour | Transporte Turístico Premium en Marruecos',
    description: 'Conoce Yassline Tour: tu empresa de transporte turístico premium en Marruecos. Flota Mercedes-Benz, servicio profesional 24/7, circuitos exclusivos. Más de 10 años de experiencia.',
    keywords: [
      'sobre Yassline Tour',
      'quienes somos Yassline Tour',
      'empresa transporte Marruecos',
      'historia Yassline Tour',
      'servicio transporte turístico Marruecos',
    ],
    url: '/sobre-nosotros',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': `${baseUrl}/sobre-nosotros#aboutpage`,
      mainEntity: {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: 'Yassline Tour',
        description: 'Empresa de transporte turístico premium en Marruecos con flota Mercedes-Benz',
        foundingDate: '2014',
        numberOfEmployees: {
          '@type': 'QuantitativeValue',
          value: '10-50',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Morocco',
        },
      },
    },
  });

  const values = [
    {
      icon: Shield,
      title: t('about.values.trust.title'),
      description: t('about.values.trust.description'),
    },
    {
      icon: Award,
      title: t('about.values.quality.title'),
      description: t('about.values.quality.description'),
    },
    {
      icon: Users,
      title: t('about.values.service.title'),
      description: t('about.values.service.description'),
    },
    {
      icon: Heart,
      title: t('about.values.passion.title'),
      description: t('about.values.passion.description'),
    },
  ];

  const features = [
    {
      icon: CheckCircle2,
      text: t('about.features.fleet'),
    },
    {
      icon: CheckCircle2,
      text: t('about.features.drivers'),
    },
    {
      icon: CheckCircle2,
      text: t('about.features.experience'),
    },
    {
      icon: CheckCircle2,
      text: t('about.features.support'),
    },
    {
      icon: CheckCircle2,
      text: t('about.features.flexibility'),
    },
    {
      icon: CheckCircle2,
      text: t('about.features.safety'),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <StructuredData
        type="Organization"
        data={{
          '@type': 'Organization',
          name: 'Yassline Tour',
          description: 'Empresa de transporte turístico premium en Marruecos con flota Mercedes-Benz',
          foundingDate: '2014',
          numberOfEmployees: {
            '@type': 'QuantitativeValue',
            value: '10-50',
          },
          areaServed: {
            '@type': 'Country',
            name: 'Morocco',
          },
        }}
      />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Breadcrumbs
          items={[
            { label: t('nav.home') || 'Inicio', href: '/' },
            { label: t('about.title') || 'Sobre Nosotros', href: '/sobre-nosotros' },
          ]}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--yass-black)] via-[var(--yass-black-soft)] to-[var(--yass-gold)]">
          <div className="absolute inset-0 bg-[url('/img/Marrakech-cityf.jpg')] opacity-10 bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>
        
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4">
            <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
              ✨ {t('about.badge')}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            {t('about.title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('about.ourStory.title')}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  {t('about.ourStory.paragraph1')}
                </p>
                <p>
                  {t('about.ourStory.paragraph2')}
                </p>
                <p>
                  {t('about.ourStory.paragraph3')}
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/img/Marrakech-cityf.jpg"
                alt={t('about.ourStory.imageAlt')}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.values.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[var(--yass-gold)]/20 group"
                >
                  <div className="bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">
              <Image
                src="/img/Marrakech-cityf.jpg"
                alt={t('about.features.imageAlt')}
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('about.features.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t('about.features.subtitle')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <IconComponent className="h-6 w-6 text-[var(--yass-gold)] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('about.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t('about.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="bg-white text-[var(--yass-gold)] px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              {t('about.cta.contact')}
            </Link>
            <Link
              href="/circuitos"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200"
            >
              {t('about.cta.explore')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
