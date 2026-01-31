"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { circuitsAPI, userAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { Clock, MapPin, ArrowRight, CheckCircle2, Star, Heart } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n/context";
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

// Componente para circuitos (sin memo para que se actualice con traducciones)
const CircuitCard = ({ circuit, t, isFavorite, onToggleFavorite }: { circuit: Circuit; t: (key: string) => string; isFavorite: boolean; onToggleFavorite: () => void }) => {
  const isAuthenticated = authUtils.isAuthenticated();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      onToggleFavorite();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100/50 hover:border-[var(--yass-gold)]/30 relative">
      <Link
        href={`/circuitos/${circuit.slug}`}
        prefetch={false}
        className="block"
      >
        {/* Image con overlay mejorado */}
        <div className="relative h-80 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <Image
            src={circuit.image || "/img/Marrakech-cityf.jpg"}
            alt={`${circuit.name} - Circuito turístico exclusivo en Marruecos | Yassline Tour`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          
          {/* Overlay decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--yass-gold)]/0 via-transparent to-[var(--yass-black)]/0 group-hover:from-[var(--yass-gold)]/10 group-hover:to-[var(--yass-black)]/10 transition-all duration-500"></div>
          
          {/* Badge destacado mejorado */}
          {circuit.featured && (
            <div className="absolute top-5 right-5 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5 border border-white/20 backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              {t('circuits.featured')}
            </div>
          )}

          {/* Botón de favorito mejorado */}
          {isAuthenticated && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-5 left-5 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 z-20 ${
                isFavorite 
                  ? 'bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white shadow-lg shadow-[var(--yass-gold)]/30' 
                  : 'bg-white/95 text-gray-700 hover:bg-white border border-gray-200'
              }`}
              title={isFavorite ? t('favorites.remove') : t('favorites.add')}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        
        {/* Precio sobre imagen mejorado */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/98 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-2xl border border-white/50">
            <p className="text-3xl font-extrabold bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] bg-clip-text text-transparent">
              {circuit.price}€
            </p>
            <p className="text-xs text-gray-600 font-medium mt-1">{circuit.priceLabel || t('common.perPerson')}</p>
          </div>
        </div>
      </div>

      {/* Content mejorado */}
      <div className="p-8 bg-white">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[var(--yass-gold)] transition-colors duration-300">
          {circuit.name}
        </h3>
        <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed">
          {circuit.description}
        </p>

        {/* Info con iconos más grandes */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="bg-[var(--yass-cream-dark)] p-2 rounded-lg">
              <Clock className="h-5 w-5 text-[var(--yass-gold)]" />
            </div>
            <span className="font-medium">{circuit.duration}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="bg-green-50 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <span className="font-medium">{t('circuits.morocco')}</span>
          </div>
        </div>

        {/* Button mejorado */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-semibold text-[var(--yass-gold)] group-hover:text-[var(--yass-gold-light)] transition-colors">
            {t('circuits.viewDetails')}
          </span>
          <div className="bg-gradient-to-r from-[var(--yass-black)] to-[var(--yass-gold)] p-2 rounded-full group-hover:from-[var(--yass-gold)] group-hover:to-[var(--yass-gold-light)] transition-all duration-300">
            <ArrowRight className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
      </Link>
    </div>
  );
};

CircuitCard.displayName = 'CircuitCard';

export default function CircuitosPage() {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState<Set<string>>(new Set());
  const { t, language } = useI18n();

  // SEO Avanzado para Circuitos
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  
  useSEO({
    title: 'Circuitos Turísticos en Marruecos | Tours Exclusivos Tánger, Chefchaouen, Casablanca | Yassline Tour',
    description: 'Descubre los mejores circuitos turísticos en Marruecos con Yassline Tour. Tours exclusivos por Tánger, Chefchaouen, Casablanca, Fez, Marrakech y más. Circuitos personalizados, ciudades imperiales y desierto. Reserva tu circuito ahora.',
    keywords: [
      'circuitos turísticos Marruecos',
      'tours Marruecos',
      'circuitos Tánger Chefchaouen',
      'tours Casablanca Marrakech',
      'circuitos ciudades imperiales Marruecos',
      'tours desierto Marruecos',
      'circuitos personalizados Marruecos',
      'excursiones Marruecos',
      'viajes Marruecos',
      'tours privados Marruecos',
      'circuitos norte Marruecos',
      'circuitos sur Marruecos',
      'tours Fez',
      'tours Marrakech',
      'circuitos culturales Marruecos',
    ],
    url: '/circuitos',
    image: '/img/Marrakech-cityf.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${baseUrl}/circuitos#service`,
      serviceType: 'Tour Service',
      name: 'Circuitos Turísticos en Marruecos',
      description: 'Circuitos exclusivos y tours personalizados por las principales ciudades y destinos de Marruecos',
      provider: {
        '@type': 'TravelAgency',
        name: 'Yassline Tour',
        '@id': `${baseUrl}#travelagency`,
      },
      areaServed: {
        '@type': 'Country',
        name: 'Morocco',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Circuitos Turísticos',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'TouristTrip',
              name: 'Circuitos por Ciudades Imperiales',
              description: 'Tours por Fez, Marrakech, Meknes y Rabat',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'TouristTrip',
              name: 'Circuitos Norte de Marruecos',
              description: 'Tours por Tánger, Chefchaouen y Tetouan',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'TouristTrip',
              name: 'Circuitos Desierto',
              description: 'Tours al desierto de Merzouga y Erg Chebbi',
            },
          },
        ],
      },
    }
  });

  const fetchCircuits = useCallback(async () => {
    try {
      const response = await circuitsAPI.getAll();
      if (response.success && response.data) {
        // Asegurar que response.data es un array
        const circuitsData = Array.isArray(response.data) ? response.data : [];
        // Guardar circuitos sin traducir (se traducirán en el render según el idioma)
        setCircuits(circuitsData);
      } else {
        setError(response.error || t('circuits.errorLoading'));
      }
    } catch (err) {
      setError(t('errors.connectionError'));
    } finally {
      setLoading(false);
    }
  }, [t, language]);

  useEffect(() => {
    fetchCircuits();
  }, [fetchCircuits]);

  // Cargar favoritos si el usuario está autenticado
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      userAPI.getFavorites().then(response => {
        if (response.success && response.data) {
          const favSet = new Set<string>();
          (Array.isArray(response.data) ? response.data : []).forEach((fav: any) => {
            if (fav.serviceType === 'circuit') {
              favSet.add(fav.serviceId);
            }
          });
          setFavorites(favSet);
        }
      }).catch(() => {});
    }
  }, []);

  // Traducir circuitos cuando cambia el idioma
  const translatedCircuits = useMemo(() => {
    if (circuits.length === 0) return [];
    return circuits.map(c => translateCircuit(c, language as 'es' | 'en' | 'fr'));
  }, [circuits, language]);

  // Manejar toggle de favorito
  const handleToggleFavorite = useCallback(async (circuit: Circuit) => {
    if (!authUtils.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    const circuitSlug = circuit.slug;
    const isFav = favorites.has(circuitSlug);
    
    setFavoritesLoading(prev => new Set(prev).add(circuitSlug));

    try {
      if (isFav) {
        // Buscar el ID del favorito para eliminarlo
        const favResponse = await userAPI.getFavorites();
        if (favResponse.success && favResponse.data) {
          const favs = Array.isArray(favResponse.data) ? favResponse.data : [];
          const favToRemove = favs.find((f: any) => f.serviceType === 'circuit' && f.serviceId === circuitSlug);
          if (favToRemove) {
            await userAPI.removeFavorite(favToRemove._id);
            setFavorites(prev => {
              const newSet = new Set(prev);
              newSet.delete(circuitSlug);
              return newSet;
            });
          }
        }
      } else {
        await userAPI.addFavorite('circuit', circuitSlug);
        setFavorites(prev => new Set(prev).add(circuitSlug));
      }
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
    } finally {
      setFavoritesLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(circuitSlug);
        return newSet;
      });
    }
  }, [favorites]);

  // Memoizar el cálculo de si hay circuitos para evitar re-renders
  const hasCircuits = useMemo(() => translatedCircuits.length > 0, [translatedCircuits.length]);

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <StructuredData
        type="TravelAgency"
        data={{
          name: 'Yassline Tour',
          description: t('circuits.subtitle')
        }}
      />
      <Navbar />

      {/* Header Section - Mejorado */}
      <section className="relative pt-24 pb-32 md:pb-40 overflow-hidden">
        {/* Background con gradiente y decoración mejorado */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--yass-black)] via-[var(--yass-black-soft)] to-[var(--yass-gold)]">
          <div className="absolute inset-0 bg-[url('/img/Marrakech-cityf.jpg')] opacity-10 bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
        </div>
        
        {/* Elementos decorativos mejorados */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-28">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/50"></div>
            <span className="bg-white/15 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 shadow-xl">
              ✨ {t('circuits.premiumBadge')}
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/50"></div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
            <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
              {t('circuits.title')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light mb-6 drop-shadow-lg">
            {t('circuits.subtitle')}
          </p>
          
          {/* Características destacadas mejoradas */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105 shadow-xl">
              <div className="w-10 h-10 rounded-lg bg-[var(--yass-gold)]/20 backdrop-blur-sm flex items-center justify-center border border-[var(--yass-gold)]/30">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold text-base">{t('circuits.uniqueExperiences')}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105 shadow-xl">
              <div className="w-10 h-10 rounded-lg bg-[var(--yass-gold)]/20 backdrop-blur-sm flex items-center justify-center border border-[var(--yass-gold)]/30">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold text-base">{t('circuits.carefullySelectedRoutes')}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105 shadow-xl">
              <div className="w-10 h-10 rounded-lg bg-[var(--yass-gold)]/20 backdrop-blur-sm flex items-center justify-center border border-[var(--yass-gold)]/30">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold text-base">{t('circuits.professionalGuides')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Circuits Section - Mejorado */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--yass-gold)]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--yass-gold)]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {loading ? (
            <LoadingState message={t('circuits.loading')} />
          ) : error ? (
            <ErrorState
              title={t('circuits.errorLoading')}
              message={error}
            />
          ) : translatedCircuits.length === 0 ? (
            <EmptyState
              icon="map"
              message={t('circuits.noCircuits')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {translatedCircuits.map((circuit) => (
                <CircuitCard 
                  key={`${circuit._id}-${language}`} 
                  circuit={circuit} 
                  t={t}
                  isFavorite={favorites.has(circuit.slug)}
                  onToggleFavorite={() => handleToggleFavorite(circuit)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Mejorado */}
      {hasCircuits && (
        <section className="py-24 bg-gradient-to-r from-[var(--yass-black)] via-[var(--yass-black-soft)] to-[var(--yass-gold)] relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              {t('circuits.notFindPerfect')}
            </h2>
            <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('circuits.contactCustom')}
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-3 bg-white text-[var(--yass-gold)] px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all duration-300 group"
            >
              <span>{t('circuits.requestCustom')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
