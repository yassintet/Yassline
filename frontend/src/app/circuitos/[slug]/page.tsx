"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { circuitsAPI, userAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { 
  Clock, 
  MapPin, 
  ArrowRight, 
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Star,
  Heart
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import BookingForm from "@/components/BookingForm";
import { useI18n } from "@/lib/i18n/context";
import { translateCircuit } from "@/lib/translations/circuitTranslations";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

interface ItineraryItem {
  day: number;
  title: string;
  description: string;
}

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
  itinerary: ItineraryItem[];
  includes: string[];
  active: boolean;
}

export default function CircuitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useI18n();
  
  // Detectar slug inmediatamente (no esperar a useEffect)
  const getInitialSlug = (): string => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const pathSlug = pathname.split('/circuitos/')[1]?.split('/')[0]?.split('?')[0];
      const paramSlug = params?.slug as string;
      const finalSlug = paramSlug || pathSlug || '';
      
      // Filtrar placeholder y valores inválidos
      if (finalSlug && 
          finalSlug !== '__placeholder__' && 
          finalSlug !== 'undefined' && 
          finalSlug !== 'null' &&
          finalSlug.length > 0) {
        return finalSlug;
      }
    }
    
    // Fallback: usar params si está disponible
    const paramSlug = params?.slug as string;
    if (paramSlug && 
        paramSlug !== '__placeholder__' && 
        paramSlug !== 'undefined' && 
        paramSlug !== 'null' &&
        paramSlug.length > 0) {
      return paramSlug;
    }
    
    return '';
  };
  
  // Estado para el slug (inicializado inmediatamente)
  const [currentSlug, setCurrentSlug] = useState<string>(() => getInitialSlug());
  
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // SEO dinámico basado en el circuito
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  const displayCircuit = circuit ? translateCircuit(circuit, language as 'es' | 'en' | 'fr') : null;
  const slugForSEO = currentSlug || '';
  
  useSEO({
    title: displayCircuit 
      ? `${displayCircuit.title} - Circuito Turístico Exclusivo en Marruecos | Reserva Ahora | Yassline Tour` 
      : 'Circuito Turístico en Marruecos | Tours Exclusivos | Yassline Tour',
    description: displayCircuit 
      ? `${displayCircuit.description.substring(0, 155)}... Circuito turístico exclusivo en Marruecos con Yassline Tour. Duración: ${displayCircuit.duration}. Precio desde ${displayCircuit.price} MAD. Reserva ahora.` 
      : 'Descubre circuitos turísticos exclusivos en Marruecos con Yassline Tour. Tours personalizados por las principales ciudades y destinos.',
    keywords: displayCircuit ? [
      `circuito ${displayCircuit.name} Marruecos`,
      `tour ${displayCircuit.name}`,
      `circuito turístico ${displayCircuit.name}`,
      `excursión ${displayCircuit.name}`,
      `viaje ${displayCircuit.name}`,
      'circuitos Marruecos',
      'tours Marruecos',
      'tours exclusivos Marruecos',
      'circuitos personalizados Marruecos',
      'Yassline Tour',
      'reservar circuito Marruecos',
      'tour privado Marruecos',
    ] : [
      'circuitos Marruecos',
      'tours Marruecos',
      'circuitos turísticos Marruecos',
      'tours exclusivos Marruecos',
    ],
    url: `/circuitos/${slugForSEO}`,
    image: displayCircuit?.image || '/img/Marrakech-cityf.jpg',
    structuredData: displayCircuit ? {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      '@id': `${baseUrl}/circuitos/${slugForSEO}#tour`,
      name: displayCircuit.title,
      description: displayCircuit.description,
      provider: {
        '@type': 'TravelAgency',
        name: 'Yassline Tour',
        '@id': `${baseUrl}#travelagency`,
      },
      touristType: 'Tourist',
      duration: displayCircuit.duration,
      itinerary: displayCircuit.itinerary ? {
        '@type': 'ItemList',
        itemListElement: displayCircuit.itinerary.map((item: ItineraryItem, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.title,
          description: item.description,
        })),
      } : undefined,
      offers: {
        '@type': 'Offer',
        price: displayCircuit.price,
        priceCurrency: 'MAD',
        availability: 'https://schema.org/InStock',
        url: `${baseUrl}/circuitos/${slugForSEO}`,
        validFrom: new Date().toISOString(),
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: displayCircuit.price,
          priceCurrency: 'MAD',
          unitText: 'por persona',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '45',
        bestRating: '5',
        worstRating: '1',
      },
    } : undefined,
  });

  // Actualizar slug si cambia la URL o params
  useEffect(() => {
    const newSlug = getInitialSlug();
    if (newSlug && newSlug !== currentSlug) {
      setCurrentSlug(newSlug);
    }
  }, [params?.slug]);
  
  // También escuchar cambios en la URL (por si el usuario navega)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleLocationChange = () => {
        const newSlug = getInitialSlug();
        if (newSlug && newSlug !== currentSlug) {
          setCurrentSlug(newSlug);
        }
      };
      
      // Escuchar eventos de popstate (navegación del navegador)
      window.addEventListener('popstate', handleLocationChange);
      
      return () => {
        window.removeEventListener('popstate', handleLocationChange);
      };
    }
  }, [currentSlug]);
  
  const fetchCircuit = useCallback(async () => {
    const currentSlugValue = currentSlug;
    if (!currentSlugValue || currentSlugValue === '__placeholder__') return;

    try {
      setLoading(true);
      const response = await circuitsAPI.getBySlug(currentSlugValue);
      
      if (response.success && response.data && typeof response.data === 'object' && '_id' in response.data) {
        // Guardar circuito sin traducir (se traducirá en el render según el idioma)
        setCircuit(response.data as Circuit);
        setError("");
      } else {
        setError(response.error || t('circuits.notFound'));
      }
    } catch (err) {
      setError(t('errors.connectionError'));
    } finally {
      setLoading(false);
    }
  }, [currentSlug, t, language]);

  useEffect(() => {
    if (currentSlug && currentSlug.length > 0 && currentSlug !== '__placeholder__') {
      fetchCircuit();
    } else if (typeof window !== 'undefined') {
      // Si no hay slug, intentar detectarlo de nuevo inmediatamente
      const pathSlug = window.location.pathname.split('/circuitos/')[1]?.split('/')[0]?.split('?')[0];
      if (pathSlug && pathSlug.length > 0 && pathSlug !== '__placeholder__' && pathSlug !== currentSlug) {
        setCurrentSlug(pathSlug);
      }
    }
  }, [currentSlug, fetchCircuit]);

  // Cargar estado de favorito
  useEffect(() => {
    if (authUtils.isAuthenticated() && currentSlug) {
      userAPI.getFavorites().then(response => {
        if (response.success && response.data) {
          const favs = Array.isArray(response.data) ? response.data : [];
          const isFav = favs.some((f: any) => f.serviceType === 'circuit' && f.serviceId === currentSlug);
          setIsFavorite(isFav);
        }
      }).catch(() => {});
    }
  }, [currentSlug]);

  // Traducir circuito cuando cambia el idioma
  const translatedCircuit = useMemo(() => {
    if (!circuit) return null;
    return translateCircuit(circuit, language as 'es' | 'en' | 'fr');
  }, [circuit, language]);

  // Memoizar valores calculados
  const priceLabel = useMemo(() => {
    const c = translatedCircuit || circuit;
    return c?.priceLabel || (c ? `${c.price}€ ${t('common.perPerson')}` : '');
  }, [translatedCircuit, circuit?.priceLabel, circuit?.price, t]);

  const handleToggleBookingForm = useCallback(() => {
    setShowBookingForm(prev => !prev);
  }, []);

  const handleScrollToBooking = useCallback(() => {
    const bookingCard = document.querySelector('[data-booking-card]');
    if (bookingCard) {
      bookingCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowBookingForm(true);
    }
  }, []);

  const handleToggleFavorite = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!currentSlug) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Buscar el ID del favorito para eliminarlo
        const favResponse = await userAPI.getFavorites();
        if (favResponse.success && favResponse.data) {
          const favs = Array.isArray(favResponse.data) ? favResponse.data : [];
          const favToRemove = favs.find((f: any) => f.serviceType === 'circuit' && f.serviceId === currentSlug);
          if (favToRemove) {
            await userAPI.removeFavorite(favToRemove._id);
            setIsFavorite(false);
          }
        }
      } else {
        await userAPI.addFavorite('circuit', currentSlug);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
    } finally {
      setFavoriteLoading(false);
    }
  }, [isFavorite, currentSlug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <LoadingState message={t('circuits.loading')} fullScreen={true} />
        <Footer />
      </div>
    );
  }

  if (error || !circuit) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <ErrorState
          title={t('circuits.notFound')}
          message={error || t('circuits.notFoundMessage')}
          showBackButton={true}
          backUrl="/circuitos"
          backLabel={t('circuits.backToCircuits')}
          fullScreen={true}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      {/* Structured Data */}
      {displayCircuit && (
        <StructuredData
          type="TouristTrip"
          data={{
            name: displayCircuit.title,
            description: displayCircuit.description,
            provider: {
              '@type': 'TravelAgency',
              name: 'Yassline Tour',
            },
            duration: displayCircuit.duration,
            offers: {
              '@type': 'Offer',
              price: displayCircuit.price,
              priceCurrency: 'MAD',
            },
          }}
        />
      )}
      
      {/* Breadcrumbs */}
      {displayCircuit && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <Breadcrumbs
            items={[
              { label: t('circuits.title'), href: '/circuitos' },
              { label: displayCircuit.title, href: `/circuitos/${currentSlug}` },
            ]}
          />
        </div>
      )}
      
      <Navbar />

      {/* Hero Section Mejorado */}
      <section className="relative pt-20 pb-16 md:pb-24 overflow-hidden">
        <div className="relative h-[500px] md:h-[600px] w-full">
          <Image
            src={displayCircuit.image || "/img/Marrakech-cityf.jpg"}
            alt={`${displayCircuit.title} - Circuito turístico exclusivo en Marruecos | Yassline Tour`}
            fill
            className="object-cover scale-105"
            priority
          />
          {/* Overlay mejorado con gradientes */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--yass-black)]/20 via-transparent to-[var(--yass-gold)]/20"></div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
          
          {/* Back Button mejorado */}
          <div className="absolute top-6 left-4 md:left-8 z-10">
            <Link
              href="/circuitos"
              className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md text-gray-900 px-5 py-3 rounded-xl font-semibold hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('circuits.backToCircuits')}
            </Link>
          </div>

          {/* Featured Badge y Favorito */}
          <div className="absolute top-6 right-4 md:right-8 z-10 flex items-center gap-3">
            {authUtils.isAuthenticated() && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`p-3 rounded-xl backdrop-blur-md transition-all duration-300 border-2 ${
                  isFavorite 
                    ? 'bg-[var(--yass-gold)] text-white border-white/20 shadow-xl' 
                    : 'bg-white/95 text-gray-700 border-white/20 hover:bg-white'
                }`}
                title={isFavorite ? t('favorites.remove') : t('favorites.add')}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''} ${favoriteLoading ? 'animate-pulse' : ''}`} />
              </button>
            )}
            {displayCircuit.featured && (
              <div className="bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white px-5 py-3 rounded-xl text-sm font-bold shadow-xl flex items-center gap-2 border-2 border-white/20">
                <Star className="w-4 h-4 fill-current" />
                {t('circuits.featured')}
              </div>
            )}
          </div>

          {/* Content mejorado */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white z-10">
            <div className="max-w-5xl mx-auto">
              <div className="mb-4">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                  {t('circuits.premiumBadge')}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-2xl">
                {displayCircuit.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed drop-shadow-lg">
                {displayCircuit.name}
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-semibold">{displayCircuit.duration}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-semibold">{t('circuits.morocco')}</span>
                </div>
                {displayCircuit.itinerary && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-semibold">{displayCircuit.itinerary.length} {t('circuits.days')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Description mejorada */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-12 bg-gradient-to-b from-[var(--yass-black)] to-[var(--yass-gold)] rounded-full"></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('circuits.aboutCircuit')}</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {displayCircuit.description}
                </p>
              </div>

              {/* Itinerary mejorado */}
              {displayCircuit?.itinerary && displayCircuit.itinerary.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-12 bg-gradient-to-b from-[var(--yass-black)] to-[var(--yass-gold)] rounded-full"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('circuits.itinerary')}</h2>
                  </div>
                  <div className="space-y-6">
                    {displayCircuit.itinerary.map((item: ItineraryItem, index: number) => (
                      <div key={index} className="relative pl-12 pb-6">
                        {/* Línea vertical mejorada */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--yass-gold)] via-[var(--yass-gold)] to-transparent rounded-full"></div>
                        
                        {/* Número del día mejorado */}
                        <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] flex items-center justify-center shadow-lg border-4 border-white">
                          <span className="text-white text-sm font-bold">{item.day}</span>
                        </div>
                        
                        {/* Contenido del día mejorado */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-[var(--yass-gold)]/30">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-[var(--yass-gold)]">{t('circuits.day', { day: item.day })}:</span>
                            <span>{item.title}</span>
                          </h3>
                          <p className="text-gray-700 leading-relaxed text-base">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Includes mejorado */}
              {displayCircuit.includes && displayCircuit.includes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-12 bg-gradient-to-b from-[var(--yass-black)] to-[var(--yass-gold)] rounded-full"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('circuits.whatIncludes')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayCircuit.includes.map((item: string, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 hover:shadow-md hover:border-green-300 transition-all duration-300 group"
                      >
                        <div className="bg-green-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                        </div>
                        <span className="text-gray-800 font-medium leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Card mejorado */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 hover:border-[var(--yass-gold)]/30 transition-all duration-300" data-booking-card>
                {/* Precio destacado */}
                <div className="text-center mb-8 pb-6 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('circuits.priceFrom')}</p>
                  <div className="text-5xl font-extrabold bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] bg-clip-text text-transparent mb-2">
                    {displayCircuit.price}€
                  </div>
                  <p className="text-gray-600 font-medium">{priceLabel || t('common.perPerson')}</p>
                </div>

                {/* Información mejorada */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="bg-[var(--yass-gold)] p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">{t('circuits.duration')}</p>
                      <p className="font-semibold text-gray-900">{displayCircuit.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">{t('circuits.destination')}</p>
                      <p className="font-semibold text-gray-900">{t('circuits.morocco')}</p>
                    </div>
                  </div>
                  {circuit.itinerary && (
                    <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="bg-purple-600 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">{t('circuits.days')}</p>
                        <p className="font-semibold text-gray-900">{circuit.itinerary.length} {t('circuits.travelDays')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {!showBookingForm ? (
                  <>
                    <button 
                      onClick={() => setShowBookingForm(true)}
                      className="w-full bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 mb-4"
                    >
                      {t('circuits.bookNow')}
                    </button>

                    <Link
                      href="/contacto"
                      className="w-full bg-white border-2 border-[var(--yass-gold)] text-[var(--yass-gold)] py-3 px-6 rounded-xl font-semibold hover:bg-[var(--yass-gold)] hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {t('circuits.checkAvailability')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <div className="mb-4">
                    <button 
                      onClick={handleToggleBookingForm}
                      className="w-full mb-4 text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {(() => {
                        const backText = t('common.back');
                        // Si la traducción falla, usar fallback según el idioma actual
                        if (backText === 'common.back' || !backText) {
                          return language === 'es' ? 'Volver' : language === 'en' ? 'Back' : 'Retour';
                        }
                        return backText;
                      })()}
                    </button>
                    <BookingForm
                      serviceName={displayCircuit.name}
                      serviceType="custom"
                      serviceId={circuit._id}
                      priceLabel={priceLabel}
                      calculatedPrice={displayCircuit.price}
                    />
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    {t('circuits.haveQuestions')}{" "}
                    <Link href="/contacto" className="text-[var(--yass-gold)] hover:underline font-semibold">
                      {t('contact.title')}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section mejorado */}
      <section className="py-20 bg-gradient-to-r from-[var(--yass-black)] via-[var(--yass-black-soft)] to-[var(--yass-gold)] relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-[var(--yass-gold)] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            {t('circuits.readyForAdventure')}
          </h2>
          <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('circuits.bookNowDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleScrollToBooking}
              className="bg-white text-[var(--yass-gold)] px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 flex items-center justify-center gap-2 border-2 border-transparent hover:border-white/20"
            >
              <Calendar className="w-5 h-5" />
              {t('circuits.bookNow')}
            </button>
            <Link
              href="/circuitos"
              className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-[var(--yass-gold)] transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.05]"
            >
              {t('circuits.viewMoreCircuits')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
