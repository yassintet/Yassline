import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';

export const homeMetadata: Metadata = {
  title: "Inicio - Transporte Turístico Premium en Marruecos",
  description: "Bienvenido a Yassline Tour. Descubre Marruecos con nuestros servicios de transporte turístico de lujo. Flota Mercedes-Benz, circuitos exclusivos y traslados profesionales.",
  openGraph: {
    title: "Yassline Tour - Transporte Turístico Premium en Marruecos",
    description: "Descubre Marruecos con Yassline Tour. Servicios de transporte turístico de lujo con Mercedes V-Class, Vito y Sprinter.",
    url: "/",
    images: [
      {
        url: `${baseUrl}/img/v-class1.jpg`,
        width: 1200,
        height: 630,
        alt: "Yassline Tour - Flota Premium",
      },
    ],
  },
};

export const transportMetadata: Metadata = {
  title: "Transporte - Servicios de Traslado y Transporte en Marruecos",
  description: "Servicios de transporte turístico en Marruecos: traslados al aeropuerto, transporte interurbano, servicio por horas y transporte personalizado. Flota Mercedes-Benz de lujo.",
  keywords: [
    "transporte Marruecos",
    "traslado aeropuerto Marruecos",
    "transporte interurbano Marruecos",
    "servicio transporte por horas",
    "Mercedes transporte Marruecos"
  ],
  openGraph: {
    title: "Transporte Turístico Premium en Marruecos | Yassline Tour",
    description: "Servicios de transporte turístico en Marruecos: traslados al aeropuerto, transporte interurbano, servicio por horas y transporte personalizado.",
    url: "/transporte",
    images: [
      {
        url: `${baseUrl}/img/v-class1.jpg`,
        width: 1200,
        height: 630,
        alt: "Servicios de Transporte Yassline Tour",
      },
    ],
  },
};

export const circuitsMetadata: Metadata = {
  title: "Circuitos Turísticos - Tours y Excursiones por Marruecos",
  description: "Descubre los mejores circuitos turísticos por Marruecos. Tours a Tánger, Chefchaouen, Casablanca, Fez, Marrakech y más. Experiencias únicas con guías profesionales.",
  keywords: [
    "circuitos Marruecos",
    "tours Marruecos",
    "excursiones Marruecos",
    "circuitos Tánger",
    "circuitos Chefchaouen",
    "tours Casablanca",
    "circuitos Fez",
    "tours Marrakech"
  ],
  openGraph: {
    title: "Circuitos Turísticos Premium en Marruecos | Yassline Tour",
    description: "Descubre los mejores circuitos turísticos por Marruecos. Tours a Tánger, Chefchaouen, Casablanca, Fez, Marrakech y más.",
    url: "/circuitos",
    images: [
      {
        url: `${baseUrl}/img/Marrakech-cityf.jpg`,
        width: 1200,
        height: 630,
        alt: "Circuitos Turísticos Yassline Tour",
      },
    ],
  },
};

export const vehiclesMetadata: Metadata = {
  title: "Vehículos - Flota Premium Mercedes-Benz en Marruecos",
  description: "Conoce nuestra flota de vehículos Mercedes-Benz: V-Class VIP, Vito familiar, Sprinter para grupos. Vehículos de lujo con todas las comodidades para tu viaje por Marruecos.",
  keywords: [
    "Mercedes V-Class Marruecos",
    "Mercedes Vito Marruecos",
    "Mercedes Sprinter Marruecos",
    "vehículos lujo Marruecos",
    "flota transporte Marruecos",
    "transporte VIP Marruecos"
  ],
  openGraph: {
    title: "Flota Premium Mercedes-Benz en Marruecos | Yassline Tour",
    description: "Conoce nuestra flota de vehículos Mercedes-Benz: V-Class VIP, Vito familiar, Sprinter para grupos.",
    url: "/vehiculos",
    images: [
      {
        url: `${baseUrl}/img/v-class1.jpg`,
        width: 1200,
        height: 630,
        alt: "Flota Mercedes-Benz Yassline Tour",
      },
    ],
  },
};

export const contactMetadata: Metadata = {
  title: "Contacto - Contáctanos para tu Viaje por Marruecos",
  description: "Contacta con Yassline Tour para reservar tu transporte o circuito turístico en Marruecos. Teléfono, email, WhatsApp. Estamos disponibles 24/7 para ayudarte.",
  keywords: [
    "contacto Yassline Tour",
    "reservar transporte Marruecos",
    "contacto turismo Marruecos",
    "WhatsApp transporte Marruecos"
  ],
  openGraph: {
    title: "Contacta con Yassline Tour | Transporte Turístico Marruecos",
    description: "Contacta con Yassline Tour para reservar tu transporte o circuito turístico en Marruecos. Disponibles 24/7.",
    url: "/contacto",
    images: [
      {
        url: `${baseUrl}/img/Marrakech-cityf.jpg`,
        width: 1200,
        height: 630,
        alt: "Contacto Yassline Tour",
      },
    ],
  },
};
