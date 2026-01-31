import type { Metadata } from "next";
import "./globals.css";
import I18nProviderWrapper from "@/components/I18nProviderWrapper";
import StructuredData from "@/components/StructuredData";
import WhatsAppChat from "@/components/WhatsAppChat";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com'),
  title: {
    default: "Yassline Tour - Transporte Turístico Premium en Marruecos | Mercedes V-Class | Circuitos y Tours",
    template: "%s | Yassline Tour - Transporte Premium Marruecos"
  },
  description: "Yassline Tour: Transporte turístico premium en Marruecos con flota Mercedes-Benz (V-Class, Vito, Sprinter). Circuitos exclusivos por Tánger, Chefchaouen, Casablanca, Fez y Marrakech. Traslados aeropuerto 24/7. Reserva tu viaje de lujo ahora. Precios competitivos y servicio profesional.",
  keywords: [
    // Keywords principales
    "transporte turístico Marruecos",
    "transporte lujo Marruecos",
    "Mercedes V-Class Marruecos",
    "circuitos turísticos Marruecos",
    "tours Marruecos",
    "Yassline Tour",
    // Long-tail keywords
    "traslado aeropuerto Marruecos 24 horas",
    "transporte privado Marruecos Mercedes",
    "circuitos Tánger Chefchaouen",
    "tours Casablanca Marrakech",
    "transporte interciudades Marruecos",
    "alquiler vehículo con chofer Marruecos",
    "servicio transporte turístico Marruecos",
    "circuitos personalizados Marruecos",
    "tours privados Marruecos",
    "transporte ejecutivo Marruecos",
    // LSI Keywords
    "viajes Marruecos",
    "turismo Marruecos",
    "excursiones Marruecos",
    "traslados Marruecos",
    "transporte VIP Marruecos",
    "chofer privado Marruecos",
    "Mercedes Vito Marruecos",
    "Mercedes Sprinter Marruecos",
    "circuitos norte Marruecos",
    "circuitos sur Marruecos",
    "desierto Marruecos tours",
    "ciudades imperiales Marruecos",
  ],
  authors: [{ name: "Yassline Tour", url: "https://yassline.com" }],
  creator: "Yassline Tour",
  publisher: "Yassline Tour",
  category: "Turismo y Transporte",
  classification: "Servicios de Transporte Turístico",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_US", "fr_FR"],
    url: "/",
    siteName: "Yassline Tour",
    title: "Yassline Tour - Transporte Turístico Premium en Marruecos | Mercedes V-Class",
    description: "Descubre Marruecos con Yassline Tour. Servicios de transporte turístico de lujo con Mercedes V-Class, Vito y Sprinter. Circuitos exclusivos por Tánger, Chefchaouen, Casablanca, Fez y Marrakech. Traslados aeropuerto 24/7.",
    images: [
      {
        url: "/img/v-class1.jpg",
        width: 1200,
        height: 630,
        alt: "Yassline Tour - Flota de vehículos Mercedes-Benz V-Class para transporte turístico premium en Marruecos",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yasslinetour",
    creator: "@yasslinetour",
    title: "Yassline Tour - Transporte Turístico Premium en Marruecos",
    description: "Transporte de lujo con Mercedes-Benz. Circuitos exclusivos y traslados aeropuerto 24/7 en Marruecos.",
    images: {
      url: "/img/v-class1.jpg",
      alt: "Yassline Tour - Mercedes V-Class Marruecos",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
      "en-US": "/en",
      "fr-FR": "/fr",
    },
  },
  other: {
    "geo.region": "MA",
    "geo.placename": "Marruecos",
    "geo.position": "31.7917;-7.0926",
    "ICBM": "31.7917, -7.0926",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  
  // Organization Schema para todas las páginas
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'Yassline Tour',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/img/v-class1.jpg`,
      width: 1200,
      height: 630,
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
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MA',
      addressLocality: 'Marruecos',
    },
    sameAs: [],
  };

  return (
    <html lang="es">
      <head>
        {/* Organization Schema - Global */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Preconnect para mejorar performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href={baseUrl} />
        {/* Manifest para PWA y SEO móvil */}
        <link rel="manifest" href="/manifest.json" />
        {/* Meta tags móviles para SEO */}
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Yassline Tour" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f0f0f" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/img/v-class1.jpg" />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <I18nProviderWrapper>
          {children}
          <WhatsAppChat />
        </I18nProviderWrapper>
      </body>
    </html>
  );
}
