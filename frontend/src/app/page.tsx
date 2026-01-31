"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { circuitsAPI, vehiclesAPI, transportsAPI } from "@/lib/api";
import { calculateDistance, calculateIntercityPrice } from "@/lib/distance";
import { ArrowRight, Clock, Plane, Route, Wrench, MapPin, Users, Building2, ChevronDown, Sparkles, Car, Check, LayoutGrid } from "lucide-react";
import { getVehicleIcon } from "@/lib/vehicleIcons";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n/context";
import { translateVehicle } from "@/lib/translations/vehicleTranslations";
import { translateTransport } from "@/lib/translations/transportTranslations";
import { translateCircuit } from "@/lib/translations/circuitTranslations";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";

interface Circuit {
  _id: string;
  name: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  priceLabel: string;
  image: string;
  slug: string;
  featured: boolean;
}

interface Vehicle {
  _id: string;
  name: string;
  type: string;
  capacity: {
    passengers: number;
    luggage?: string;
  };
  description: string;
  image: string;
  features: string[];
  active: boolean;
}

interface Transport {
  _id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  priceLabel: string;
  active: boolean;
  route?: {
    from: string;
    to: string;
  };
}

// Mapeo de iconos
const iconMap: Record<string, any> = {
  plane: Plane,
  'map-pin': MapPin,
  clock: Clock,
  route: Route,
  car: Car,
  building: Building2,
};

// Colores por tipo de servicio
const colorMap: Record<string, string> = {
  airport: "from-blue-500 to-cyan-500",
  intercity: "from-purple-500 to-pink-500",
  hourly: "from-green-500 to-emerald-500",
  custom: "from-orange-500 to-red-500",
};

// Función helper para traducir tipos de vehículos
const getVehicleTypeLabel = (type: string, t: (key: string) => string): string => {
  switch(type) {
    case 'v-class': return t('vehicles.vip');
    case 'vito': return t('vehicles.family');
    case 'sprinter': return t('vehicles.groups');
    case 'other': return t('vehicles.others');
    default: return type.toUpperCase();
  }
};

// Componentes memoizados para optimización de rendimiento
// Nota: No memoizamos completamente para que se actualice cuando cambian las traducciones
const VehicleCard = ({ vehicle, index, t, language }: { vehicle: Vehicle; index: number; t: (key: string) => string; language: 'es' | 'en' | 'fr' }) => {
  const vehicleTypeColors: Record<string, { gradient: string; bg: string }> = {
    'v-class': { 
      gradient: "from-[var(--yass-gold)] via-[var(--yass-gold-light)] to-[var(--yass-gold)]",
      bg: "from-blue-50 to-cyan-50"
    },
    'vito': { 
      gradient: "from-purple-500 via-pink-500 to-purple-600",
      bg: "from-purple-50 to-pink-50"
    },
    'sprinter': { 
      gradient: "from-green-500 via-emerald-500 to-green-600",
      bg: "from-green-50 to-emerald-50"
    },
    'other': { 
      gradient: "from-orange-500 via-red-500 to-orange-600",
      bg: "from-orange-50 to-red-50"
    },
  };
  const colors = vehicleTypeColors[vehicle.type] || { 
    gradient: "from-gray-500 to-gray-600",
    bg: "from-gray-50 to-gray-100"
  };

  return (
    <Link
      href="/vehiculos"
      prefetch={false}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 border-2 border-yass-cream-dark hover:border-yass-gold/40"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header con imagen y badge */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={vehicle.image || "/img/v-class1.jpg"}
          alt={`${vehicle.name} - Vehículo de transporte turístico premium Mercedes-Benz en Marruecos | Yassline Tour`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay con gradiente */}
        <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient} opacity-0 group-hover:opacity-90 transition-opacity duration-500`}></div>
        
        {/* Badge de tipo de vehículo */}
        <div className="absolute top-6 left-6 z-10">
          <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xl border-2 border-white/30 backdrop-blur-sm`}>
            {(() => {
              const VehicleIcon = getVehicleIcon(vehicle.type);
              return (
                <>
                  <VehicleIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                  {getVehicleTypeLabel(vehicle.type, t)}
                </>
              );
            })()}
          </span>
        </div>
        
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
      
      {/* Contenido */}
      <div className="p-8 bg-gradient-to-br from-white to-gray-50/50">
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold text-[var(--yass-black)] mb-3 group-hover:text-yass-gold transition-colors duration-300">
            {vehicle.name}
          </h3>
          <p className="text-gray-600 leading-relaxed text-base line-clamp-2 min-h-[3rem] mb-4">
            {vehicle.description}
          </p>
        </div>
        
        {/* Características destacadas */}
        <div className={`mb-6 p-5 rounded-2xl bg-gradient-to-br ${colors.bg} border-2 border-transparent group-hover:border-current/20 transition-all duration-300`}>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">{vehicle.capacity?.passengers || 0} {t('vehicles.seats')}</span>
          </li>
          {vehicle.capacity?.luggage && (
              <li className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-xs">📦</span>
                </div>
                <span className="font-semibold text-gray-800">{vehicle.capacity.luggage}</span>
            </li>
          )}
          {vehicle.features && vehicle.features.slice(0, 2).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-xs">✓</span>
                </div>
                <span className="text-gray-800">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
        
        {/* Botón de acción */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
          <span className="text-sm font-semibold text-yass-muted group-hover:text-yass-gold transition-colors">
            {t('common.learnMore')}
          </span>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:shadow-xl group-hover:shadow-yass-gold/30`}>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>
      
      {/* Borde decorativo inferior */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    </Link>
  );
};

VehicleCard.displayName = 'VehicleCard';

const TransportCard = memo(({ transport, t, formatPrice, translatePriceLabel }: { transport: Transport; t: (key: string, params?: any) => string; formatPrice: (price: number) => string; translatePriceLabel: (priceLabel: string) => string }) => {
  const iconMap: Record<string, any> = {
    airport: Plane,
    intercity: Route,
    hourly: Clock,
    custom: Wrench,
  };
  const IconComponent = iconMap[transport.type] || Route;
  
  const colorMap: Record<string, { gradient: string; bg: string; text: string }> = {
    airport: { 
      gradient: "from-blue-500 via-cyan-500 to-blue-600",
      bg: "from-blue-50 to-cyan-50",
      text: "text-blue-700"
    },
    intercity: { 
      gradient: "from-purple-500 via-pink-500 to-purple-600",
      bg: "from-purple-50 to-pink-50",
      text: "text-purple-700"
    },
    hourly: { 
      gradient: "from-green-500 via-emerald-500 to-green-600",
      bg: "from-green-50 to-emerald-50",
      text: "text-green-700"
    },
    custom: { 
      gradient: "from-orange-500 via-red-500 to-orange-600",
      bg: "from-orange-50 to-red-50",
      text: "text-orange-700"
    },
  };
  const colors = colorMap[transport.type] || { 
    gradient: "from-gray-500 to-gray-600",
    bg: "from-gray-50 to-gray-100",
    text: "text-gray-700"
  };

  return (
    <Link
      href={`/transporte/${transport._id}`}
      prefetch={false}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 border-2 border-yass-cream-dark hover:border-yass-gold/40"
    >
      {/* Header con gradiente según tipo de servicio */}
      <div className={`h-32 bg-gradient-to-r ${colors.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-2 border-white/30`}>
            <IconComponent className="w-12 h-12 text-white drop-shadow-lg" />
        </div>
        </div>
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
      
      {/* Contenido */}
      <div className="p-8 bg-gradient-to-br from-white to-gray-50/50">
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold text-[var(--yass-black)] mb-3 group-hover:text-yass-gold transition-colors duration-300">
          {transport.name}
        </h3>
          <p className="text-gray-600 leading-relaxed text-base line-clamp-3 min-h-[4.5rem]">
          {transport.description}
        </p>
        </div>
        
        {/* Precio destacado */}
          {transport.priceLabel && (
          <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-br ${colors.bg} border-2 border-transparent group-hover:border-current/20 transition-all duration-300`}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-600">
              {t('common.price')}
            </p>
            <p className={`text-3xl font-extrabold ${colors.text} bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
              {transport.type === 'hourly' 
                ? t('transport.fromHour', { price: formatPrice(transport.price || 187.5).replace(/\.00/, '') }) 
                : translatePriceLabel(transport.priceLabel)}
            </p>
          </div>
        )}
        
        {/* Botón de acción */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
          <span className="text-sm font-semibold text-gray-600 group-hover:text-[var(--yass-gold)] transition-colors">
            {t('common.learnMore')}
          </span>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-[var(--yass-gold)] group-hover:to-[var(--yass-gold-light)] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:shadow-xl group-hover:shadow-[var(--yass-gold)]/40">
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>
      
      {/* Borde decorativo inferior */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    </Link>
  );
});

TransportCard.displayName = 'TransportCard';

const CircuitCard = ({ circuit, t }: { circuit: Circuit; t: (key: string) => string }) => {
  return (
    <Link key={circuit._id} href={`/circuitos/${circuit.slug}`} prefetch={false}>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 group border-2 border-yass-cream-dark hover:border-yass-gold/40 relative">
        <div className="md:flex">
          {/* Image Side - Ultra Profesional */}
          <div className="md:w-1/2 relative min-h-[500px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <Image
              src={circuit.image || "/img/Marrakech-cityf.jpg"}
              alt={`${circuit.title} - Circuito turístico en Marruecos | Yassline Tour`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Overlay con gradiente mejorado */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--yass-gold)]/90 via-[var(--yass-gold)]/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--yass-black)]/0 via-transparent to-[var(--yass-gold)]/0 group-hover:from-[var(--yass-gold)]/20 group-hover:to-[var(--yass-gold-light)]/20 transition-all duration-500"></div>
            
            {/* Badge destacado */}
            <div className="absolute top-8 left-8 z-10">
              <span className="bg-gradient-to-r from-[var(--yass-gold)] via-[var(--yass-gold-light)] to-[var(--yass-gold)] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xl border-2 border-white/30 backdrop-blur-sm">
                {t('home.featured')}
              </span>
            </div>
            
            {/* Información del circuito */}
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2 border-white/50">
                <p className="text-xl font-extrabold text-gray-900 mb-2">{circuit.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2 font-semibold">
                  <Clock className="w-5 h-5 text-yass-gold" />
                  <span>{circuit.duration}</span>
                </p>
            </div>
          </div>

            {/* Efecto de brillo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </div>

          {/* Content Side - Ultra Profesional */}
          <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50/50">
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-[var(--yass-black)] mb-6 group-hover:text-yass-gold transition-colors duration-300 leading-tight tracking-tight">
                {circuit.title}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg line-clamp-4">
                {circuit.description}
              </p>
            </div>

            {/* Precio destacado */}
            <div className="mb-8 p-6 rounded-2xl bg-yass-gold/10 border-2 border-yass-gold/20">
              <p className="text-xs font-bold uppercase tracking-wider mb-2 text-yass-muted">
                {t('common.price')}
              </p>
              <p className="text-4xl font-extrabold text-yass-gold mb-1">
                  {circuit.priceLabel || `Desde ${circuit.price}€`}
                </p>
              <p className="text-sm text-yass-muted font-semibold">{t('common.perPerson')}</p>
              </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-yass-cream-dark">
              <span className="text-sm font-semibold text-yass-muted group-hover:text-yass-gold transition-colors">
                {t('circuits.viewDetails')}
              </span>
              <div className="w-14 h-14 rounded-xl bg-[var(--yass-black)] text-yass-gold flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:bg-yass-gold group-hover:text-[var(--yass-black)]">
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
        </div>
        </div>
        
        {/* Borde decorativo inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yass-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </Link>
  );
};

CircuitCard.displayName = 'CircuitCard';

export default function Home() {
  const [featuredCircuits, setFeaturedCircuits] = useState<Circuit[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loadingCircuits, setLoadingCircuits] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingTransports, setLoadingTransports] = useState(true);
  const [errorCircuits, setErrorCircuits] = useState("");
  const [errorVehicles, setErrorVehicles] = useState("");
  const [errorTransports, setErrorTransports] = useState("");
  const { t, formatPrice, language } = useI18n();

  // SEO Avanzado
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  
  useSEO({
    title: t('home.title') + ' | Yassline Tour - Transporte Premium Marruecos',
    description: t('home.subtitleDescription') || 'Yassline Tour: Transporte turístico premium en Marruecos con flota Mercedes-Benz (V-Class, Vito, Sprinter). Circuitos exclusivos por Tánger, Chefchaouen, Casablanca, Fez y Marrakech. Traslados aeropuerto 24/7. Reserva tu viaje de lujo ahora.',
    keywords: [
      // Keywords principales
      'transporte turístico Marruecos',
      'transporte lujo Marruecos',
      'Mercedes V-Class Marruecos',
      'circuitos turísticos Marruecos',
      'tours Marruecos',
      'Yassline Tour',
      // Long-tail keywords
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
      // LSI Keywords
      'viajes Marruecos',
      'turismo Marruecos',
      'excursiones Marruecos',
      'traslados Marruecos',
      'transporte VIP Marruecos',
      'chofer privado Marruecos',
    ],
    url: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      '@id': `${baseUrl}#travelagency`,
      name: 'Yassline Tour',
      description: 'Servicios de transporte turístico premium en Marruecos con flota Mercedes-Benz. Circuitos exclusivos, traslados aeropuerto 24/7 y transporte interciudades.',
      url: baseUrl,
      telephone: '+212-669-215-611',
      email: 'info@yassline.com',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'MA',
        addressLocality: 'Marruecos',
        addressRegion: 'Marruecos',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '31.7917',
        longitude: '-7.0926',
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
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios de Transporte Turístico',
        itemListElement: [
          {
            '@type': 'OfferCatalog',
            name: 'Traslados Aeropuerto',
            itemListElement: {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Traslado Aeropuerto Marruecos',
                description: 'Servicio de traslado desde y hacia aeropuertos en Marruecos 24/7',
              },
            },
          },
          {
            '@type': 'OfferCatalog',
            name: 'Circuitos Turísticos',
            itemListElement: {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Circuitos Turísticos Marruecos',
                description: 'Circuitos exclusivos por las principales ciudades de Marruecos',
              },
            },
          },
          {
            '@type': 'OfferCatalog',
            name: 'Transporte Interciudades',
            itemListElement: {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Transporte Interciudades Marruecos',
                description: 'Transporte entre ciudades principales de Marruecos',
              },
            },
          },
        ],
      },
    }
  });
  const [isClient, setIsClient] = useState(false);
  
  // Estado para el formulario de búsqueda
  const [searchForm, setSearchForm] = useState({
    serviceType: '', // 'airport', 'intercity', 'hourly', 'custom', ''
    vehicleType: '', // 'v-class', 'vito', 'sprinter', 'other', ''
    from: '',
    to: '',
    date: '',
    passengers: 1
  });
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchResults, setSearchResults] = useState<Transport[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [calculatedPrices, setCalculatedPrices] = useState<Record<string, number | null>>({});
  const [calculatingPrices, setCalculatingPrices] = useState<Set<string>>(new Set());

  // Cargar datos guardados del localStorage al montar
  useEffect(() => {
    setMounted(true);
    const savedSearchData = localStorage.getItem('searchFormData');
    if (savedSearchData) {
      try {
        const parsed = JSON.parse(savedSearchData);
        setSearchForm(parsed);
      } catch (e) {
        console.error('Error cargando datos guardados:', e);
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    // Obtener circuitos destacados
    try {
      setLoadingCircuits(true);
      setErrorCircuits("");
      const circuitsResponse = await circuitsAPI.getFeatured();
      if (circuitsResponse.success && circuitsResponse.data) {
        const circuitsData = Array.isArray(circuitsResponse.data) 
          ? circuitsResponse.data 
          : [];
        // Mostrar hasta 2 circuitos destacados
        setFeaturedCircuits(circuitsData.slice(0, 2));
      } else {
        setErrorCircuits(circuitsResponse.error || t('home.errorLoadingCircuits'));
      }
    } catch (err) {
      console.error("Error cargando circuitos:", err);
      setErrorCircuits(t('home.errorLoadingCircuits'));
    } finally {
      setLoadingCircuits(false);
    }

    // Obtener vehículos activos
    try {
      setLoadingVehicles(true);
      setErrorVehicles("");
      const vehiclesResponse = await vehiclesAPI.getAll();
      if (vehiclesResponse.success && vehiclesResponse.data) {
        const vehiclesData = Array.isArray(vehiclesResponse.data)
          ? vehiclesResponse.data.filter((v: Vehicle) => v.active)
          : [];
        // Mostrar hasta 3 vehículos
        setVehicles(vehiclesData.slice(0, 3));
      } else {
        setErrorVehicles(vehiclesResponse.error || t('vehicles.errorLoading'));
      }
    } catch (err) {
      console.error("Error cargando vehículos:", err);
      setErrorVehicles(t('vehicles.errorLoading'));
    } finally {
      setLoadingVehicles(false);
    }

    // Obtener servicios de transporte en el orden específico
    try {
      setLoadingTransports(true);
      setErrorTransports("");
      const transportsResponse = await transportsAPI.getAll();
      if (transportsResponse.success && transportsResponse.data) {
        const transportsData = Array.isArray(transportsResponse.data)
          ? transportsResponse.data.filter((t: Transport) => t.active)
              .map((t: Transport) => translateTransport(t, language as 'es' | 'en' | 'fr'))
          : [];
        
        // Ordenar servicios en el orden específico: airport, intercity, hourly, custom
        const serviceOrder = ['airport', 'intercity', 'hourly', 'custom'];
        const orderedServices = serviceOrder
          .map(type => {
            const found = transportsData.find(t => t.type === type);
            if (!found) {
              console.warn(`Servicio de tipo '${type}' no encontrado en la base de datos`);
            }
            return found;
          })
          .filter(Boolean) as Transport[];
        
        setTransports(orderedServices);
      } else {
        setErrorTransports(transportsResponse.error || t('transport.errorLoadingServices'));
      }
    } catch (err) {
      console.error("Error cargando servicios:", err);
      setErrorTransports(t('transport.errorLoadingServices'));
    } finally {
      setLoadingTransports(false);
    }
  }, [t, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Traducir vehículos cuando cambia el idioma
  const translatedVehicles = useMemo(() => {
    if (vehicles.length === 0) return [];
    const translated = vehicles.map(v => {
      const translatedVehicle = translateVehicle(v, language as 'es' | 'en' | 'fr');
      console.log(`🌐 Translating vehicle ${v.type} (${v.name}) to ${language}:`, {
        original: v.description,
        translated: translatedVehicle.description
      });
      return translatedVehicle;
    });
    return translated;
  }, [vehicles, language]);

  // Traducir servicios cuando cambia el idioma
  const translatedTransports = useMemo(() => {
    return transports.map(t => translateTransport(t, language as 'es' | 'en' | 'fr'));
  }, [transports, language]);

  // Traducir circuitos cuando cambia el idioma
  const translatedCircuits = useMemo(() => {
    if (featuredCircuits.length === 0) return [];
    return featuredCircuits.map(c => translateCircuit(c, language as 'es' | 'en' | 'fr'));
  }, [featuredCircuits, language]);


  // Determinar qué campos mostrar según el tipo de servicio
  const shouldShowDestination = useMemo(() => {
    return searchForm.serviceType === 'airport' || searchForm.serviceType === 'intercity' || searchForm.serviceType === '';
  }, [searchForm.serviceType]);

  // Función para traducir priceLabel que contiene claves sin traducir
  const translatePriceLabel = useCallback((priceLabel: string): string => {
    if (!priceLabel) return '';
    
    // Obtener la traducción de "Desde" de forma segura
    const fromText = t('common.from');
    const safeFromText = fromText && fromText !== 'common.from' ? fromText : 'Desde';
    
    // Reemplazar "common.from" si aparece en el priceLabel
    if (priceLabel.includes('common.from')) {
      return priceLabel.replace(/common\.from/gi, safeFromText);
    }
    
    // Si solo contiene "Desde" sin formato específico, asegurar que esté traducido
    if (priceLabel.match(/Desde\s*/i)) {
      return priceLabel.replace(/Desde\s*/i, safeFromText + ' ');
    }
    if (priceLabel.match(/From\s*/i)) {
      return priceLabel.replace(/From\s*/i, safeFromText + ' ');
    }
    if (priceLabel.match(/À partir de\s*/i)) {
      return priceLabel.replace(/À partir de\s*/i, safeFromText + ' ');
    }
    
    return priceLabel;
  }, [t]);

  // Mapeo completo de ciudades a aeropuertos (basado en moroccanAirports)
  const moroccanAirports = useMemo(() => [
    { code: "CMN", name: "Casablanca - Aeropuerto Internacional Mohammed V", city: "Casablanca", cityAliases: ["casablanca", "casa"] },
    { code: "RAK", name: "Marrakech - Aeropuerto Menara", city: "Marrakech", cityAliases: ["marrakech", "marrakesh"] },
    { code: "AGA", name: "Agadir - Aeropuerto Al Massira", city: "Agadir", cityAliases: ["agadir"] },
    { code: "TNG", name: "Tánger - Aeropuerto Ibn Battuta", city: "Tánger", cityAliases: ["tanger", "tánger", "tangier"] },
    { code: "TTU", name: "Tetouan - Aeropuerto Sania Ramel", city: "Tetouan", cityAliases: ["tetouan", "tetuan"] },
    { code: "FEZ", name: "Fez - Aeropuerto Saïss", city: "Fez", cityAliases: ["fez", "fes"] },
    { code: "RBA", name: "Rabat - Aeropuerto Salé", city: "Rabat", cityAliases: ["rabat", "sale", "salé"] },
    { code: "OUD", name: "Oujda - Aeropuerto Angads", city: "Oujda", cityAliases: ["oujda"] },
    { code: "NDR", name: "Nador - Aeropuerto Al Aroui", city: "Nador", cityAliases: ["nador"] },
    { code: "ESU", name: "Essaouira - Aeropuerto Mogador", city: "Essaouira", cityAliases: ["essaouira", "mogador"] },
    { code: "OZZ", name: "Ouarzazate - Aeropuerto", city: "Ouarzazate", cityAliases: ["ouarzazate", "ouarzazat"] },
    { code: "VIL", name: "Dakhla - Aeropuerto", city: "Dakhla", cityAliases: ["dakhla"] },
    { code: "EUN", name: "Laayoune - Aeropuerto Hassan I", city: "Laayoune", cityAliases: ["laayoune", "el aaiún"] },
  ], []);

  // Función para obtener el aeropuerto de una ciudad
  const getAirportForCity = useCallback((city: string): { name: string; city: string } | null => {
    if (!city) return null;
    const cityLower = city.toLowerCase().trim();
    
    // Buscar coincidencias en cityAliases o nombre de ciudad
    const airport = moroccanAirports.find(airport => 
      airport.cityAliases.some(alias => cityLower.includes(alias) || alias.includes(cityLower.split(' ')[0])) ||
      airport.city.toLowerCase().includes(cityLower) ||
      cityLower.includes(airport.city.toLowerCase())
    );
    
    return airport ? { name: airport.name, city: airport.city } : null;
  }, [moroccanAirports]);

  // Función para extraer solo el nombre de la ciudad (sin aeropuerto)
  const extractCityName = useCallback((input: string): string => {
    if (!input) return '';
    
    // Buscar el aeropuerto correspondiente
    const airport = moroccanAirports.find(airport => {
      const inputLower = input.toLowerCase();
      return airport.cityAliases.some(alias => inputLower.includes(alias)) ||
             inputLower.includes(airport.city.toLowerCase()) ||
             airport.name.toLowerCase().includes(inputLower.split(' ')[0]);
    });
    
    // Si se encuentra un aeropuerto, devolver solo el nombre de la ciudad
    if (airport) {
      return airport.city;
    }
    
    // Si no se encuentra, devolver el input original pero limpiado
    // Remover referencias comunes a aeropuerto
    return input
      .replace(/\s*-\s*Aeropuerto.*/i, '')
      .replace(/\s*\([A-Z]{3}\)\s*/g, '')
      .trim();
  }, [moroccanAirports]);

  // Guardar datos de búsqueda en localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('searchFormData', JSON.stringify(searchForm));
    }
  }, [searchForm, mounted]);

  // Asignar aeropuerto automáticamente cuando se escribe una ciudad y el servicio es aeropuerto
  useEffect(() => {
    if (mounted && searchForm.serviceType === 'airport' && searchForm.from) {
      const airport = getAirportForCity(searchForm.from);
      if (airport && !searchForm.from.toLowerCase().includes('aeropuerto')) {
        // No sobrescribir si ya contiene "aeropuerto"
        // Podríamos mostrar una sugerencia en lugar de cambiar automáticamente
      }
    }
  }, [searchForm.from, searchForm.serviceType, mounted, getAirportForCity]);

  // Manejar búsqueda en la misma página
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    setShowResults(false);
    
    try {
      // Obtener todos los transportes
      const transportsResponse = await transportsAPI.getAll();
      
      if (!transportsResponse.success || !transportsResponse.data) {
        setSearchError(t('transport.errorLoadingServices') || 'Error al cargar servicios');
        setIsSearching(false);
        return;
      }

      // Si es servicio personalizado, mostrar mensaje especial en lugar de buscar
      if (searchForm.serviceType === 'custom') {
        setSearchResults([]);
        setShowResults(true);
        setSearchError('');
        setIsSearching(false);
        setTimeout(() => {
          const resultsElement = document.getElementById('search-results');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        return;
      }

      let transportsData = Array.isArray(transportsResponse.data)
        ? transportsResponse.data.filter((t: Transport) => t.active)
            .map((t: Transport) => translateTransport(t, language as 'es' | 'en' | 'fr'))
        : [];

      // Guardar todos los servicios del tipo seleccionado para fallback
      const allServicesOfType = searchForm.serviceType 
        ? transportsData.filter((t: Transport) => t.type === searchForm.serviceType)
        : transportsData;

      // Aplicar filtros de búsqueda (menos restrictivo)
      if (searchForm.serviceType || searchForm.from || (shouldShowDestination && searchForm.to)) {
        transportsData = transportsData.filter((transport: Transport) => {
          // Filtrar por tipo de servicio (obligatorio si está seleccionado)
          const matchesServiceType = !searchForm.serviceType || transport.type === searchForm.serviceType;
          
          if (!matchesServiceType) return false;
          
          // Si solo hay tipo de servicio seleccionado, mostrar todos de ese tipo
          if (searchForm.serviceType && !searchForm.from && (!shouldShowDestination || !searchForm.to)) {
            return true;
          }
          
          // Filtrar por origen (opcional, busca coincidencias parciales)
          const matchesFrom = !searchForm.from || 
            (transport.route?.from && transport.route.from.toLowerCase().includes(searchForm.from.toLowerCase())) ||
            (transport.name && transport.name.toLowerCase().includes(searchForm.from.toLowerCase())) ||
            (transport.description && transport.description.toLowerCase().includes(searchForm.from.toLowerCase()));
          
          // Filtrar por destino (solo si es necesario y está especificado)
          const matchesTo = !shouldShowDestination || !searchForm.to || 
            (transport.route?.to && transport.route.to.toLowerCase().includes(searchForm.to.toLowerCase())) ||
            (transport.name && transport.name.toLowerCase().includes(searchForm.to.toLowerCase())) ||
            (transport.description && transport.description.toLowerCase().includes(searchForm.to.toLowerCase()));
          
          // Si hay origen o destino especificado, al menos uno debe coincidir
          if (searchForm.from || (shouldShowDestination && searchForm.to)) {
            return matchesFrom || matchesTo;
          }
          
          return true;
        });
        
        // Si no hay resultados con los filtros aplicados, mostrar todos los servicios del tipo seleccionado
        if (transportsData.length === 0 && allServicesOfType.length > 0) {
          transportsData = allServicesOfType;
        }
      }

      setSearchResults(transportsData);
      setShowResults(true);
      
      // Limpiar precios calculados anteriores
      setCalculatedPrices({});
      
      // Calcular precios para los resultados si hay datos necesarios
      if (transportsData.length > 0 && searchForm.from && searchForm.vehicleType && searchForm.to &&
          (searchForm.serviceType === 'airport' || searchForm.serviceType === 'intercity')) {
        // Calcular precios para cada transporte
        transportsData.forEach(async (transport) => {
          const transportId = transport._id;
          setCalculatingPrices(prev => new Set(prev).add(transportId));

          try {
            // Para servicio de aeropuerto
            if (transport.type === 'airport') {
              const AIRPORT_SUPPLEMENT = 54; // 5€ en MAD
              const AIRPORT_CITY_PRICE = 435; // 40€ en MAD
              
              // Verificar si es traslado dentro de la misma ciudad (simplificado)
              const fromLower = searchForm.from.toLowerCase();
              const toLower = searchForm.to.toLowerCase();
              
              // Si origen y destino son similares, precio fijo
              if (fromLower.includes(toLower.split(' ')[0]) || toLower.includes(fromLower.split(' ')[0])) {
                setCalculatedPrices(prev => ({ ...prev, [transportId]: AIRPORT_CITY_PRICE }));
              } else {
                // Calcular precio interciudades + suplemento
                const distanceResult = await calculateDistance(
                  searchForm.from,
                  searchForm.to,
                  searchForm.vehicleType as string,
                  searchForm.passengers
                );
                
                if (distanceResult && distanceResult.price) {
                  const finalPrice = distanceResult.price + AIRPORT_SUPPLEMENT;
                  setCalculatedPrices(prev => ({ ...prev, [transportId]: Math.round(finalPrice * 100) / 100 }));
                }
              }
            } 
            // Para servicio interciudades
            else if (transport.type === 'intercity') {
              const AIRPORT_SUPPLEMENT = 54; // 5€ en MAD
              
              // Verificar si alguno de los campos contiene un aeropuerto
              const fromLower = searchForm.from.toLowerCase();
              const toLower = searchForm.to.toLowerCase();
              const fromHasAirport = fromLower.includes('aeropuerto') || 
                moroccanAirports.some(airport => {
                  return (airport.cityAliases.some(alias => fromLower.includes(alias)) ||
                         fromLower.includes(airport.city.toLowerCase())) &&
                         (fromLower.includes('aeropuerto') || fromLower.includes(airport.code.toLowerCase()));
                });
              const toHasAirport = toLower.includes('aeropuerto') ||
                moroccanAirports.some(airport => {
                  return (airport.cityAliases.some(alias => toLower.includes(alias)) ||
                         toLower.includes(airport.city.toLowerCase())) &&
                         (toLower.includes('aeropuerto') || toLower.includes(airport.code.toLowerCase()));
                });
              const hasAirportInRoute = fromHasAirport || toHasAirport;
              
              const distanceResult = await calculateDistance(
                searchForm.from,
                searchForm.to,
                searchForm.vehicleType as string,
                searchForm.passengers
              );
              
              if (distanceResult && distanceResult.price) {
                // Si hay aeropuerto en la ruta, agregar suplemento de aeropuerto
                const finalPrice = hasAirportInRoute 
                  ? distanceResult.price + AIRPORT_SUPPLEMENT 
                  : distanceResult.price;
                setCalculatedPrices(prev => ({ ...prev, [transportId]: Math.round(finalPrice * 100) / 100 }));
              }
            }
          } catch (error) {
            console.error(`Error calculando precio para transporte ${transportId}:`, error);
          } finally {
            setCalculatingPrices(prev => {
              const newSet = new Set(prev);
              newSet.delete(transportId);
              return newSet;
            });
          }
        });
      }
      
      // Scroll suave a los resultados
      setTimeout(() => {
        const resultsElement = document.getElementById('search-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchError(t('transport.errorLoadingServices') || 'Error al realizar la búsqueda');
    } finally {
      setIsSearching(false);
    }
  }, [searchForm, shouldShowDestination, t, language]);

  // Manejar cambios en el formulario
  const handleSearchFormChange = useCallback((field: string, value: string | number) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);


  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.service-dropdown') && !target.closest('.vehicle-dropdown')) {
        setServiceDropdownOpen(false);
        setVehicleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // FAQ Schema para SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué servicios de transporte ofrece Yassline Tour en Marruecos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yassline Tour ofrece transporte turístico premium en Marruecos incluyendo traslados aeropuerto 24/7, circuitos turísticos exclusivos, transporte interciudades y alquiler de vehículos con chofer profesional. Contamos con flota Mercedes-Benz (V-Class, Vito, Sprinter).',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuáles son los tipos de vehículos disponibles?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Disponemos de Mercedes V-Class (VIP, hasta 7 plazas), Mercedes Vito (familiar, hasta 8 plazas) y Mercedes Sprinter (grupos, hasta 19 plazas). Todos nuestros vehículos son de lujo y están equipados con las mejores comodidades.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Ofrecen traslados desde el aeropuerto?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, ofrecemos servicio de traslado aeropuerto 24 horas al día, 7 días a la semana desde y hacia todos los aeropuertos internacionales de Marruecos: Casablanca, Marrakech, Tánger, Fez, Agadir y más.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué circuitos turísticos ofrecen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ofrecemos circuitos exclusivos por las principales ciudades de Marruecos: Tánger, Chefchaouen, Casablanca, Fez, Marrakech, así como tours al desierto, valles y ciudades imperiales. También creamos circuitos personalizados según tus necesidades.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo puedo reservar un servicio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes reservar fácilmente desde nuestra página web usando el motor de búsqueda, contactarnos por teléfono (+212-669-215-611), email (info@yassline.com) o completando el formulario de contacto. Aceptamos pagos en efectivo, transferencia bancaria, Binance Pay, Redotpay y MoneyGram.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Los precios incluyen chofer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, todos nuestros servicios incluyen chofer profesional, vehículo de lujo, seguro de viaje y todos los servicios premium. Los precios son transparentes y sin sorpresas.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      {/* Structured Data - Travel Agency */}
      <StructuredData
        type="TravelAgency"
        data={{
          name: 'Yassline Tour',
          description: 'Servicios de transporte turístico premium en Marruecos con flota Mercedes-Benz',
          url: baseUrl,
          telephone: '+212-669-215-611',
          email: 'info@yassline.com',
        }}
      />
      
      {/* Structured Data - Organization */}
      <StructuredData
        type="Organization"
        data={{}}
      />
      
      {/* Structured Data - WebSite */}
      <StructuredData
        type="WebSite"
        data={{}}
      />
      
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <Navbar />

      {/* Hero Section - Estilo premium negro/dorado */}
      <section className="relative pt-24 pb-40 bg-[var(--yass-black)] overflow-hidden">
        {/* Background Pattern sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212,175,55,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Elementos decorativos dorados */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yass-gold/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yass-gold/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yass-gold/5 rounded-full blur-3xl"></div>
        
        {/* Efecto de ondas decorativas */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              <span className="text-xs font-bold text-white/95 uppercase tracking-widest bg-white/15 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 shadow-xl hover:bg-white/20 transition-all duration-300">
                {t('home.welcome')}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-white/50 to-transparent"></div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--yass-cream)] mb-6 leading-tight tracking-tight drop-shadow-2xl">
              <span className="text-[var(--yass-cream)]">
              {t('home.title')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-yass-gold-pale/95 max-w-3xl mx-auto leading-relaxed font-light mb-4 drop-shadow-lg">
              {t('home.subtitle')}
            </p>
            <p className="text-lg md:text-xl text-yass-gold-pale/85 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitleDescription')}
            </p>
          </div>

          {/* Motor de Búsqueda Premium - Diseño Ultra Moderno */}
          {mounted ? (
            <div className="max-w-7xl mx-auto mt-20 px-4 animate-slide-up">
              <form 
                onSubmit={handleSearch} 
                className="relative bg-white rounded-3xl shadow-2xl overflow-visible border border-white/20 backdrop-blur-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Efecto de gradiente decorativo superior animado */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yass-gold to-transparent"></div>
                
                <div className="p-8">
                  {/* Tipo de Servicio y Tipo de Vehículo - Misma Línea con Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Tipo de Servicio - Dropdown */}
                    <div className="relative service-dropdown">
                      <label className="block text-xs font-semibold text-gray-600 mb-3">
                        {t('transport.selectServiceType')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setServiceDropdownOpen(!serviceDropdownOpen);
                          setVehicleDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-200 text-left"
                      >
                        <div className="flex items-center gap-3">
                          {searchForm.serviceType === '' ? (
                            <>
                              <LayoutGrid className="w-8 h-8 shrink-0 text-gray-400" />
                              <span className="text-sm text-gray-500">{t('transport.allServices')}</span>
                            </>
                          ) : searchForm.serviceType === 'airport' ? (
                            <>
                              <Plane className="w-8 h-8 shrink-0 text-blue-500" />
                              <span className="text-sm text-gray-900">{t('transport.airport')}</span>
                            </>
                          ) : searchForm.serviceType === 'intercity' ? (
                            <>
                              <Route className="w-8 h-8 shrink-0 text-purple-500" />
                              <span className="text-sm text-gray-900">{t('transport.interCity')}</span>
                            </>
                          ) : searchForm.serviceType === 'hourly' ? (
                            <>
                              <Clock className="w-8 h-8 shrink-0 text-green-500" />
                              <span className="text-sm text-gray-900">{t('transport.hourly')}</span>
                            </>
                          ) : (
                            <>
                              <Wrench className="w-8 h-8 shrink-0 text-orange-500" />
                              <span className="text-sm text-gray-900">{t('transport.custom')}</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${serviceDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {serviceDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[320px] overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              handleSearchFormChange('serviceType', '');
                              handleSearchFormChange('to', '');
                              setServiceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 text-left hover:bg-yass-cream-dark transition-colors ${
                              searchForm.serviceType === '' ? 'bg-yass-gold/10' : ''
                            }`}
                          >
                            <LayoutGrid className={`w-8 h-8 shrink-0 ${searchForm.serviceType === '' ? 'text-yass-gold' : 'text-gray-400'}`} />
                            <span className={`text-sm flex-1 ${searchForm.serviceType === '' ? 'text-yass-gold font-medium' : 'text-gray-700'}`}>
                              {t('transport.allServices')}
                            </span>
                            {searchForm.serviceType === '' && <Check className="w-4 h-4 text-yass-gold shrink-0" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSearchFormChange('serviceType', 'airport');
                              handleSearchFormChange('to', '');
                              setServiceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                              searchForm.serviceType === 'airport' ? 'bg-yass-gold/10' : ''
                            }`}
                          >
                            <Plane className={`w-8 h-8 shrink-0 ${searchForm.serviceType === 'airport' ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className={`text-sm flex-1 ${searchForm.serviceType === 'airport' ? 'text-[var(--yass-gold)] font-medium' : 'text-gray-700'}`}>
                              {t('transport.airport')}
                            </span>
                            {searchForm.serviceType === 'airport' && <Check className="w-4 h-4 text-yass-gold shrink-0" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSearchFormChange('serviceType', 'intercity');
                              handleSearchFormChange('to', '');
                              setServiceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                              searchForm.serviceType === 'intercity' ? 'bg-[var(--yass-gold)]/5' : ''
                            }`}
                          >
                            <Route className={`w-8 h-8 shrink-0 ${searchForm.serviceType === 'intercity' ? 'text-purple-500' : 'text-gray-400'}`} />
                            <span className={`text-sm flex-1 ${searchForm.serviceType === 'intercity' ? 'text-yass-gold font-medium' : 'text-gray-700'}`}>
                              {t('transport.interCity')}
                            </span>
                            {searchForm.serviceType === 'intercity' && <Check className="w-4 h-4 text-[var(--yass-gold)] shrink-0" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSearchFormChange('serviceType', 'hourly');
                              handleSearchFormChange('to', '');
                              setServiceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                              searchForm.serviceType === 'hourly' ? 'bg-yass-gold/10' : ''
                            }`}
                          >
                            <Clock className={`w-8 h-8 shrink-0 ${searchForm.serviceType === 'hourly' ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={`text-sm flex-1 ${searchForm.serviceType === 'hourly' ? 'text-[var(--yass-gold)] font-medium' : 'text-gray-700'}`}>
                              {t('transport.hourly')}
                            </span>
                            {searchForm.serviceType === 'hourly' && <Check className="w-4 h-4 text-[var(--yass-gold)] shrink-0" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSearchFormChange('serviceType', 'custom');
                              handleSearchFormChange('to', '');
                              setServiceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                              searchForm.serviceType === 'custom' ? 'bg-yass-gold/10' : ''
                            }`}
                          >
                            <Wrench className={`w-8 h-8 shrink-0 ${searchForm.serviceType === 'custom' ? 'text-orange-500' : 'text-gray-400'}`} />
                            <span className={`text-sm flex-1 ${searchForm.serviceType === 'custom' ? 'text-yass-gold font-medium' : 'text-gray-700'}`}>
                              {t('transport.custom')}
                            </span>
                            {searchForm.serviceType === 'custom' && <Check className="w-4 h-4 text-yass-gold shrink-0" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tipo de Vehículo - Dropdown */}
                    <div className="relative vehicle-dropdown">
                      <label className="block text-xs font-semibold text-gray-600 mb-3">
                        {t('vehicles.selectVehicleType')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setVehicleDropdownOpen(!vehicleDropdownOpen);
                          setServiceDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-200 text-left"
                      >
                        <div className="flex items-center gap-3">
                          {(() => {
                            const vt = searchForm.vehicleType ?? "";
                            const VehicleIcon = getVehicleIcon(vt);
                            const color = vt === "" ? "text-gray-400" : vt === "v-class" ? "text-[var(--yass-gold)]" : vt === "vito" ? "text-purple-500" : vt === "sprinter" ? "text-green-500" : "text-orange-500";
                            const label = vt === "" ? t("vehicles.allVehicles") : vt === "v-class" ? "Mercedes V-Class" : vt === "vito" ? "Mercedes Vito" : vt === "sprinter" ? "Mercedes Sprinter" : t("vehicles.others");
                            return (
                              <>
                                <VehicleIcon className={`w-8 h-8 shrink-0 ${color}`} />
                                <span className={`text-sm ${vt === "" ? "text-gray-500" : "text-gray-900"}`}>{label}</span>
                              </>
                            );
                          })()}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${vehicleDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {vehicleDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[320px] overflow-y-auto">
                          {[
                            { value: "", label: t("vehicles.allVehicles"), color: "text-[var(--yass-gold)]" },
                            { value: "v-class", label: "Mercedes V-Class", color: "text-[var(--yass-gold)]" },
                            { value: "vito", label: "Mercedes Vito", color: "text-purple-500" },
                            { value: "sprinter", label: "Mercedes Sprinter", color: "text-green-500" },
                            { value: "other", label: t("vehicles.others"), color: "text-orange-500" },
                          ].map(({ value, label, color }) => {
                            const VehicleIcon = getVehicleIcon(value);
                            const isSelected = searchForm.vehicleType === value;
                            return (
                              <button
                                key={value || "all"}
                                type="button"
                                onClick={() => {
                                  handleSearchFormChange("vehicleType", value);
                                  setVehicleDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${isSelected ? "bg-[var(--yass-gold)]/5" : ""}`}
                              >
                                <VehicleIcon className={`w-8 h-8 shrink-0 ${isSelected ? color : "text-gray-400"}`} />
                                <span className={`text-sm flex-1 ${isSelected ? "text-[var(--yass-gold)] font-medium" : "text-gray-700"}`}>{label}</span>
                                {isSelected && <Check className="w-4 h-4 text-[var(--yass-gold)]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campos de Búsqueda - Grid Responsivo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Lugar de Recogida */}
                    <div className="relative group">
                      <label htmlFor="search-from" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--yass-gold)]" />
                        <span>{t('common.from')}</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <MapPin className="w-5 h-5 text-[var(--yass-gold)] transition-transform group-hover:scale-110" />
                        </div>
                <input
                          id="search-from"
                  type="text"
                          value={searchForm.from}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleSearchFormChange('from', value);
                          }}
                          onBlur={(e) => {
                            // Al perder el foco, si es servicio aeropuerto y hay una ciudad reconocida, agregar automáticamente el aeropuerto
                            if (searchForm.serviceType === 'airport' && e.target.value) {
                              const airport = getAirportForCity(e.target.value);
                              if (airport && !e.target.value.toLowerCase().includes('aeropuerto')) {
                                // Agregar automáticamente el aeropuerto al campo
                                handleSearchFormChange('from', `${airport.city} - ${airport.name}`);
                              }
                            }
                          }}
                          placeholder={searchForm.serviceType === 'hourly' || searchForm.serviceType === 'custom' ? t('home.searchPlaceholder') : t('home.searchPlaceholder')}
                          className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 text-base font-medium bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-[var(--yass-gold)]/50 focus:border-[var(--yass-gold)] focus:ring-4 focus:ring-[var(--yass-gold)]/20 transition-all duration-300 shadow-sm hover:shadow-md"
                        />
                        {searchForm.serviceType === 'airport' && searchForm.from && (() => {
                          const airport = getAirportForCity(searchForm.from);
                          return airport && !searchForm.from.toLowerCase().includes('aeropuerto') ? (
                            <div className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                              <Plane className="w-3 h-3" />
                              <span>Aeropuerto sugerido: {airport.name}</span>
              </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Destino - Solo visible si es necesario */}
                    {shouldShowDestination && (
                      <div className="relative group transition-all duration-300">
                        <label htmlFor="search-to" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[var(--yass-gold)]" />
                          <span>{t('common.to')}</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                            <MapPin className="w-5 h-5 text-[var(--yass-gold)] transition-transform group-hover:scale-110" />
                          </div>
                          <input
                            id="search-to"
                            type="text"
                            value={searchForm.to}
                            onChange={(e) => handleSearchFormChange('to', e.target.value)}
                            placeholder={t('home.destinationPlaceholder')}
                            className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 text-base font-medium bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-[var(--yass-gold)]/50 focus:border-[var(--yass-gold)] focus:ring-4 focus:ring-[var(--yass-gold)]/20 transition-all duration-300 shadow-sm hover:shadow-md"
                          />
                        </div>
                      </div>
                    )}

              {/* Fecha */}
                    <div className="relative group">
                      <label htmlFor="search-date" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00A859]" />
                        <span>{t('common.date')}</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <Clock className="w-5 h-5 text-[#00A859] transition-transform group-hover:scale-110" />
                        </div>
                <input
                          id="search-date"
                  type="date"
                          value={searchForm.date}
                          onChange={(e) => handleSearchFormChange('date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-12 pr-4 py-4 text-gray-900 text-base font-medium bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-[#00A859]/50 focus:border-[#00A859] focus:ring-4 focus:ring-[#00A859]/20 transition-all duration-300 shadow-sm hover:shadow-md [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                />
              </div>
                    </div>

              {/* Pasajeros */}
                    <div className="relative group">
                      <label htmlFor="search-passengers" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[var(--yass-gold-light)]" />
                        <span>{t('common.passengers')}</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <Users className="w-5 h-5 text-[var(--yass-gold-light)] transition-transform group-hover:scale-110" />
                        </div>
                <input
                          id="search-passengers"
                  type="number"
                          value={searchForm.passengers}
                          onChange={(e) => handleSearchFormChange('passengers', parseInt(e.target.value) || 1)}
                  min="1"
                          max="20"
                          className="w-full pl-12 pr-4 py-4 text-gray-900 text-base font-medium bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-[var(--yass-gold-light)]/50 focus:border-[var(--yass-gold-light)] focus:ring-4 focus:ring-[var(--yass-gold-light)]/20 transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
                    </div>
                  </div>

                  {/* Botón de Búsqueda Premium Mejorado */}
                  <div className="mt-6 flex justify-center">
                    <button 
                      type="submit"
                      disabled={isSearching}
                      className="relative group bg-gradient-to-r from-[var(--yass-gold)] via-[var(--yass-gold-light)] to-[var(--yass-gold)] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-2xl px-12 py-5 font-bold text-lg hover:shadow-[0_25px_50px_-12px_rgba(184,134,11,0.4)] hover:scale-[1.05] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden border-2 border-transparent hover:border-white/30"
                    >
                      {isSearching ? (
                        <>
                          <Clock className="w-6 h-6 animate-spin" />
                          <span>{t('common.loading')}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform group-hover:text-yellow-200" />
                          <span className="relative z-10">{t('common.search')}</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      {/* Efecto de brillo adicional */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          </div>
              </form>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto mt-20 px-4">
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-2xl p-8">
                <div className="flex items-center justify-center py-12">
                  <Clock className="w-6 h-6 animate-spin text-[var(--yass-gold)]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sección de Resultados de Búsqueda */}
      {showResults && (
        <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div id="search-results" className="animate-in fade-in slide-in-from-bottom duration-500">
              {searchError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 font-medium">{searchError}</p>
          </div>
              )}
              
              {!searchError && searchResults.length === 0 && (
                <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
                  {searchForm.serviceType === 'custom' ? (
                    <div className="max-w-2xl mx-auto">
                      <div className="mb-6">
                        <Wrench className="w-16 h-16 text-[var(--yass-gold)] mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {t('transport.customServiceTitle') || 'Servicio Personalizado'}
                        </h3>
                        <p className="text-gray-600 text-lg mb-6">
                          {t('transport.customServiceDescription') || 'Crea tu propio itinerario. Te ayudamos a diseñar el viaje perfecto según tus necesidades.'}
                        </p>
              </div>
                      <div className="bg-gradient-to-br from-[var(--yass-gold)]/10 to-[var(--yass-gold-light)]/10 rounded-xl p-6 mb-6 border border-[var(--yass-gold)]/20">
                        <p className="text-gray-700 mb-4 font-medium">
                          {t('transport.completeFormCustom') || 'Completa el formulario y te enviaremos una cotización personalizada'}
                        </p>
                  <Link
                          href="/transporte/6973a10d6a82ae3ddee35b8b"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                          <span>{t('transport.contactButton') || 'Contactar'}</span>
                          <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-lg font-medium">
                      {t('transport.noServicesAvailable') || 'No se encontraron servicios que coincidan con tu búsqueda'}
                    </p>
                  )}
                </div>
              )}

              {!searchError && searchResults.length > 0 && (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-[var(--yass-gold)]" />
                      <span>{t('transport.searchResults')} ({searchResults.length})</span>
                    </h3>
                    <button
                      onClick={() => setShowResults(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((transport) => {
                      const IconComponent = iconMap[transport.icon] || Route;
                      const colorClass = colorMap[transport.type] || "from-gray-500 to-gray-600";
                      
                      return (
                        <div
                          key={transport._id}
                          className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-[var(--yass-gold)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2"
                        >
                          {/* Header con icono y tipo */}
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} shadow-lg`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                              {transport.type === 'airport' ? t('transport.airport') :
                               transport.type === 'intercity' ? t('transport.interCity') :
                               transport.type === 'hourly' ? t('transport.hourly') :
                               transport.type === 'custom' ? t('transport.custom') :
                               transport.type}
                            </span>
                          </div>

                          {/* Nombre y descripción */}
                          <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--yass-gold)] transition-colors">
                            {transport.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {transport.description}
                          </p>

                          {/* Tipo de vehículo seleccionado */}
                          {searchForm.vehicleType && (() => {
                            const VehicleIcon = getVehicleIcon(searchForm.vehicleType);
                            const label = searchForm.vehicleType === 'v-class' ? 'Mercedes V-Class' : searchForm.vehicleType === 'vito' ? 'Mercedes Vito' : searchForm.vehicleType === 'sprinter' ? 'Mercedes Sprinter' : searchForm.vehicleType;
                            return (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <VehicleIcon className="w-4 h-4 text-[var(--yass-gold)]" />
                                <span className="font-medium">{label}</span>
                              </div>
                            );
                          })()}

                          {/* Ruta - Mostrar la ruta específica de la búsqueda del usuario */}
                          {searchForm.from && searchForm.to ? (
                            <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                              <MapPin className="w-4 h-4 text-[var(--yass-gold)]" />
                              <span className="font-medium">
                                {(() => {
                                  // Extraer solo el nombre de la ciudad del origen
                                  const fromCity = (() => {
                                    const airport = moroccanAirports.find(airport => {
                                      const inputLower = searchForm.from.toLowerCase();
                                      return airport.cityAliases.some(alias => inputLower.includes(alias)) ||
                                             inputLower.includes(airport.city.toLowerCase());
                                    });
                                    return airport ? airport.city : searchForm.from.replace(/\s*-\s*Aeropuerto.*/i, '').trim();
                                  })();
                                  
                                  // Extraer solo el nombre de la ciudad del destino
                                  const toCity = (() => {
                                    const airport = moroccanAirports.find(airport => {
                                      const inputLower = searchForm.to.toLowerCase();
                                      return airport.cityAliases.some(alias => inputLower.includes(alias)) ||
                                             inputLower.includes(airport.city.toLowerCase());
                                    });
                                    return airport ? airport.city : searchForm.to.replace(/\s*-\s*Aeropuerto.*/i, '').trim();
                                  })();
                                  
                                  return `${fromCity} → ${toCity}`;
                                })()}
                              </span>
                            </div>
                          ) : transport.route && (transport.route.from || transport.route.to) ? (
                            <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                              <MapPin className="w-4 h-4 text-[var(--yass-gold)]" />
                              <span className="font-medium">
                                {transport.route.from && transport.route.to 
                                  ? `${transport.route.from} → ${transport.route.to}`
                                  : transport.route.from || transport.route.to}
                              </span>
                            </div>
                          ) : null}

                          {/* Precio */}
                          <div className="mb-4">
                            {calculatingPrices.has(transport._id) ? (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 animate-spin text-[var(--yass-gold)]" />
                                <span className="text-sm text-gray-500">{t('common.calculating') || 'Calculando...'}</span>
                              </div>
                            ) : calculatedPrices[transport._id] !== undefined && calculatedPrices[transport._id] !== null ? (
                              <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] bg-clip-text text-transparent">
                                  {formatPrice(calculatedPrices[transport._id]!)}
                                </span>
                                {(transport.type === 'airport' || transport.type === 'intercity') && calculatedPrices[transport._id] && searchForm.from && searchForm.to && (() => {
                                  const fromLower = searchForm.from.toLowerCase();
                                  const toLower = searchForm.to.toLowerCase();
                                  const fromHasAirport = fromLower.includes('aeropuerto') || 
                                    moroccanAirports.some(airport => {
                                      return (airport.cityAliases.some(alias => fromLower.includes(alias)) ||
                                             fromLower.includes(airport.city.toLowerCase())) &&
                                             (fromLower.includes('aeropuerto') || fromLower.includes(airport.code.toLowerCase()));
                                    });
                                  const toHasAirport = toLower.includes('aeropuerto') ||
                                    moroccanAirports.some(airport => {
                                      return (airport.cityAliases.some(alias => toLower.includes(alias)) ||
                                             toLower.includes(airport.city.toLowerCase())) &&
                                             (toLower.includes('aeropuerto') || toLower.includes(airport.code.toLowerCase()));
                                    });
                                  const hasAirport = fromHasAirport || toHasAirport;
                                  
                                  if (hasAirport) {
                                    // Determinar qué campo tiene el aeropuerto para el mensaje
                                    const airportLocation = fromHasAirport ? 'origen' : 'destino';
                                    return (
                                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                                          <Plane className="w-3 h-3" />
                                          {transport.type === 'airport' 
                                            ? t('transport.airportSupplementInfo') || 'Incluye suplemento de aeropuerto (5€)'
                                            : t('transport.intercityPlusSupplement') || 'Precio interciudades + Suplemento aeropuerto (5€)'}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            ) : (
                              <span className="text-2xl font-bold bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] bg-clip-text text-transparent">
                                {translatePriceLabel(transport.priceLabel || formatPrice(transport.price))}
                              </span>
                            )}
                          </div>

                          {/* Botón de reserva */}
                          <Link
                            href={`/transporte/${transport._id}?from=${encodeURIComponent(searchForm.from || '')}&to=${encodeURIComponent(searchForm.to || '')}&date=${encodeURIComponent(searchForm.date || '')}&passengers=${searchForm.passengers}&serviceType=${searchForm.serviceType}&vehicleType=${searchForm.vehicleType}`}
                            prefetch={false}
                            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <span>{t('transport.consultPrice') || 'Consultar precio'}</span>
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
        </div>
      </section>
      )}

      {/* Our Services Section - Diseño Ultra Profesional */}
      {!showResults && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
          {/* Decorative background elements mejorados */}
          <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[var(--yass-gold)]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--yass-gold)]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[var(--yass-gold)]/3 via-[var(--yass-gold)]/3 to-[#00A859]/3 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
              <span className="text-xs font-bold text-[var(--yass-gold)] uppercase tracking-widest bg-gradient-to-r from-[var(--yass-gold)]/10 via-[var(--yass-gold-light)]/10 to-[var(--yass-gold)]/10 px-6 py-2 rounded-full border-2 border-[var(--yass-gold)]/30 shadow-lg backdrop-blur-sm">
              {t('transport.services')}
            </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-[var(--yass-gold)] to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight animate-gradient">
              {t('transport.ourServices')}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('transport.servicesDescription')}
            </p>
          </div>

          {loadingTransports ? (
            <LoadingState message={t('transport.loadingServices')} />
          ) : errorTransports ? (
            <ErrorState
              title={t('transport.errorLoadingServices')}
              message={errorTransports}
            />
          ) : translatedTransports.length > 0 ? (
            <div className="relative">
              {/* Grid de Servicios - Diseño Profesional */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {translatedTransports.map((transport, index) => (
                <div 
                    key={transport._id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                        <TransportCard 
                          transport={transport} 
                          t={t} 
                          formatPrice={formatPrice} 
                      translatePriceLabel={translatePriceLabel}
                        />
                    </div>
                  ))}
              </div>

              {/* View All Link - Mejorado */}
              <div className="text-center mt-10">
                <Link
                  href="/transporte"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--yass-gold)] via-[var(--yass-gold-light)] to-[var(--yass-gold)] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-[var(--yass-gold)]/50 hover:scale-105 transition-all duration-300 group border-2 border-transparent hover:border-white/30 relative overflow-hidden"
                >
                  <span className="relative z-10">{t('transport.viewAllServices')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="route"
              message={t('transport.noServicesAvailable')}
            />
          )}
                </div>
      </section>
      )}

      {/* Flota Section - Diseño Ultra Profesional */}
      {!showResults && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        {/* Decorative background elements mejorados */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[var(--yass-gold)]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--yass-gold)]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[var(--yass-gold)]/3 via-[var(--yass-gold-light)]/3 to-[#00A859]/3 rounded-full blur-3xl opacity-50"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
              <span className="text-xs font-bold text-[var(--yass-gold)] uppercase tracking-widest bg-gradient-to-r from-[var(--yass-gold)]/10 via-[var(--yass-gold-light)]/10 to-[var(--yass-gold)]/10 px-6 py-2 rounded-full border-2 border-[var(--yass-gold)]/30 shadow-lg backdrop-blur-sm">
                {t('home.fleet')}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-[var(--yass-gold)] to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight animate-gradient">
              {t('vehicles.title')}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('vehicles.subtitle')}
            </p>
          </div>

          {loadingVehicles ? (
            <LoadingState message={t('vehicles.loading')} />
          ) : errorVehicles ? (
            <ErrorState
              title={t('vehicles.errorLoading')}
              message={errorVehicles}
            />
          ) : translatedVehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {translatedVehicles.map((vehicle, index) => (
                  <VehicleCard key={`${vehicle._id}-${language}`} vehicle={vehicle} index={index} t={t} language={language as 'es' | 'en' | 'fr'} />
                ))}
              </div>
              {translatedVehicles.length >= 3 && (
                <div className="text-center mt-10">
                <Link
                    href="/vehiculos"
                    prefetch={false}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--yass-gold)] via-[var(--yass-gold-light)] to-[var(--yass-gold)] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-[var(--yass-gold)]/50 hover:scale-105 transition-all duration-300 group border-2 border-transparent hover:border-white/30 relative overflow-hidden"
                >
                    <span className="relative z-10">{t('vehicles.viewAllVehicles')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Link>
              </div>
              )}
            </>
          ) : (
            <EmptyState
              icon="car"
              message={t('vehicles.noVehicles')}
            />
          )}
        </div>
      </section>
      )}

      {/* Circuitos Section - Diseño Ultra Profesional */}
      {!showResults && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
          {/* Decorative background elements mejorados */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[var(--yass-gold)]/5 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--yass-gold)]/5 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[var(--yass-gold)]/3 via-[var(--yass-gold)]/3 to-[#00A859]/3 rounded-full blur-3xl opacity-50"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
              <span className="text-xs font-bold text-[var(--yass-gold)] uppercase tracking-widest bg-gradient-to-r from-[var(--yass-gold)]/10 via-[var(--yass-gold-light)]/10 to-[var(--yass-gold)]/10 px-6 py-2 rounded-full border-2 border-[var(--yass-gold)]/30 shadow-lg backdrop-blur-sm">
                {t('home.circuits')}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-[var(--yass-gold)] to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight animate-gradient">
              {t('home.unforgettableRoutes')}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('home.discoverRoutes')}
            </p>
          </div>

          {loadingCircuits ? (
            <LoadingState message={t('home.loadingCircuits')} />
          ) : errorCircuits ? (
            <ErrorState
              title={t('home.errorLoadingCircuits')}
              message={errorCircuits}
            />
          ) : translatedCircuits.length > 0 ? (
            <div className="space-y-10">
              {translatedCircuits.map((circuit) => (
                <CircuitCard key={`${circuit._id}-${language}`} circuit={circuit} t={t} />
              ))}
              {translatedCircuits.length >= 2 && (
                <div className="text-center pt-6">
                  <Link
                    href="/circuitos"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--yass-gold)] via-[var(--yass-gold-light)] to-[var(--yass-gold)] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-[var(--yass-gold)]/50 hover:scale-105 transition-all duration-300 group border-2 border-transparent hover:border-white/30 relative overflow-hidden"
                  >
                    <span className="relative z-10">{t('home.viewAllCircuits')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon="map"
              message={t('home.noFeaturedCircuits')}
              showAction={true}
              actionLabel={t('home.viewAllCircuits')}
              actionUrl="/circuitos"
            />
          )}
        </div>
      </section>
      )}

      <Footer />
    </div>
  );
}
