/**
 * Configuración SEO centralizada para Yassline Tour
 * Este archivo contiene todas las configuraciones SEO reutilizables
 */

export const SEO_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com',
  siteName: 'Yassline Tour',
  defaultTitle: 'Yassline Tour - Transporte Turístico Premium en Marruecos',
  defaultDescription: 'Yassline Tour: Transporte turístico premium en Marruecos con flota Mercedes-Benz (V-Class, Vito, Sprinter). Circuitos exclusivos, traslados aeropuerto 24/7.',
  contact: {
    phone: '+212-669-215-611',
    email: 'info@yassline.com',
    address: {
      country: 'MA',
      locality: 'Marruecos',
      region: 'Marruecos',
    },
  },
  geo: {
    latitude: '31.7917',
    longitude: '-7.0926',
  },
  social: {
    // Agregar cuando tengas redes sociales
    twitter: '@yasslinetour',
    facebook: '',
    instagram: '',
  },
  keywords: {
    primary: [
      'transporte turístico Marruecos',
      'transporte lujo Marruecos',
      'Mercedes V-Class Marruecos',
      'circuitos turísticos Marruecos',
      'tours Marruecos',
      'Yassline Tour',
    ],
    longTail: [
      'traslado aeropuerto Marruecos 24 horas',
      'transporte privado Marruecos Mercedes',
      'circuitos Tánger Chefchaouen',
      'tours Casablanca Marrakech',
      'transporte interciudades Marruecos',
      'alquiler vehículo con chofer Marruecos',
      'servicio transporte turístico Marruecos',
      'circuitos personalizados Marruecos',
      'tours privados Marruecos',
      'transporte ejecutivo Marruecos',
    ],
    lsi: [
      'viajes Marruecos',
      'turismo Marruecos',
      'excursiones Marruecos',
      'traslados Marruecos',
      'transporte VIP Marruecos',
      'chofer privado Marruecos',
      'Mercedes Vito Marruecos',
      'Mercedes Sprinter Marruecos',
      'circuitos norte Marruecos',
      'circuitos sur Marruecos',
      'desierto Marruecos tours',
      'ciudades imperiales Marruecos',
    ],
  },
};

/**
 * Genera keywords combinadas para SEO
 */
export function generateKeywords(customKeywords: string[] = []): string[] {
  return [
    ...SEO_CONFIG.keywords.primary,
    ...SEO_CONFIG.keywords.longTail,
    ...SEO_CONFIG.keywords.lsi,
    ...customKeywords,
  ];
}

/**
 * Genera structured data básico de Organization
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SEO_CONFIG.baseUrl}#organization`,
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${SEO_CONFIG.baseUrl}/img/v-class1.jpg`,
      width: 1200,
      height: 630,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SEO_CONFIG.contact.phone,
        contactType: 'customer service',
        areaServed: {
          '@type': 'Country',
          name: 'Morocco',
        },
        availableLanguage: ['Spanish', 'English', 'French', 'Arabic'],
      },
      {
        '@type': 'ContactPoint',
        email: SEO_CONFIG.contact.email,
        contactType: 'customer service',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: SEO_CONFIG.contact.address.country,
      addressLocality: SEO_CONFIG.contact.address.locality,
      addressRegion: SEO_CONFIG.contact.address.region,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SEO_CONFIG.geo.latitude,
      longitude: SEO_CONFIG.geo.longitude,
    },
  };
}

/**
 * Genera structured data de TravelAgency
 */
export function getTravelAgencySchema(customData: any = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SEO_CONFIG.baseUrl}#travelagency`,
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    url: SEO_CONFIG.baseUrl,
    telephone: SEO_CONFIG.contact.phone,
    email: SEO_CONFIG.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: SEO_CONFIG.contact.address.country,
      addressLocality: SEO_CONFIG.contact.address.locality,
      addressRegion: SEO_CONFIG.contact.address.region,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SEO_CONFIG.geo.latitude,
      longitude: SEO_CONFIG.geo.longitude,
    },
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Morocco',
    },
    ...customData,
  };
}
