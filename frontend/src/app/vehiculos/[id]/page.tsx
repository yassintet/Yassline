"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { vehiclesAPI, userAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import { translateVehicle } from "@/lib/translations/vehicleTranslations";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { 
  ArrowLeft,
  Car,
  Users,
  CheckCircle2,
  ArrowRight,
  Heart,
  Calendar,
  Clock,
  MapPin
} from "lucide-react";
import { getVehicleIcon } from "@/lib/vehicleIcons";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

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

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Detectar ID de forma estable
  const getInitialId = (): string => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const pathId = pathname.split('/vehiculos/')[1]?.split('/')[0]?.split('?')[0];
      const paramId = params?.id as string;
      const finalId = paramId || pathId || '';
      
      if (finalId && 
          finalId !== '__placeholder__' && 
          finalId !== 'undefined' && 
          finalId !== 'null' &&
          finalId.length > 0) {
        return finalId;
      }
    }
    
    const paramId = params?.id as string;
    if (paramId && 
        paramId !== '__placeholder__' && 
        paramId !== 'undefined' && 
        paramId !== 'null' &&
        paramId.length > 0) {
      return paramId;
    }
    
    return '';
  };
  
  const [currentId] = useState<string>(() => getInitialId());
  const id = currentId || (params?.id as string) || '';
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    fecha: '',
    hora: '',
    pasajeros: 1,
    origen: '',
    destino: '',
    horas: 1,
  });

  const { t, language } = useI18n();
  
  // SEO dinámico basado en el vehículo
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  const displayVehicle = vehicle ? translateVehicle(vehicle, language as 'es' | 'en' | 'fr') : null;
  
  useSEO({
    title: displayVehicle ? `${displayVehicle.name} - Vehículo Mercedes-Benz en Marruecos | Yassline Tour` : 'Vehículo | Yassline Tour',
    description: displayVehicle ? `${displayVehicle.description.substring(0, 150)}... Alquila este vehículo Mercedes-Benz con chofer profesional en Marruecos.` : 'Flota de vehículos Mercedes-Benz para transporte turístico en Marruecos.',
    keywords: displayVehicle ? [
      `${displayVehicle.name} Marruecos`,
      `Mercedes ${displayVehicle.type} Marruecos`,
      `alquiler ${displayVehicle.name}`,
      'vehículos Mercedes Marruecos',
      'Yassline Tour',
    ] : ['vehículos Marruecos', 'Mercedes Marruecos'],
    url: `/vehiculos/${id}`,
    image: displayVehicle?.image || '/img/v-class1.jpg',
    structuredData: displayVehicle ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${baseUrl}/vehiculos/${id}#product`,
      name: displayVehicle.name,
      description: displayVehicle.description,
      brand: {
        '@type': 'Brand',
        name: 'Mercedes-Benz',
      },
      category: 'Vehículo de Transporte Turístico',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'MAD',
        availability: 'https://schema.org/InStock',
        url: `${baseUrl}/vehiculos/${id}`,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '50',
      },
    } : undefined,
  });

  // Mapeo de tipos a etiquetas traducidas
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'v-class': return t('vehicles.vip');
      case 'vito': return t('vehicles.family');
      case 'sprinter': return t('vehicles.groups');
      case 'other': return t('vehicles.others');
      default: return type.toUpperCase();
    }
  };

  // Colores por tipo
  const typeColors: Record<string, string> = {
    'v-class': 'from-purple-500 to-pink-600',
    'vito': 'from-blue-500 to-indigo-600',
    'sprinter': 'from-green-500 to-emerald-600',
    'other': 'from-gray-500 to-gray-600',
  };

  const fetchVehicle = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await vehiclesAPI.getById(id);
      
      if (response.success && response.data) {
        const vehicleData = response.data as Vehicle;
        setVehicle(vehicleData);
      } else {
        setError(response.error || t('vehicles.errorLoading'));
      }
    } catch (err) {
      setError(t('errors.connectionError'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id && id.length > 0 && id !== '__placeholder__') {
      fetchVehicle();
    }
  }, [id, fetchVehicle]);

  // Cargar favoritos
  useEffect(() => {
    if (authUtils.isAuthenticated() && vehicle) {
      userAPI.getFavorites().then(response => {
        if (response.success && response.data) {
          const favs = Array.isArray(response.data) ? response.data : [];
          const isFav = favs.some((f: any) => f.serviceType === 'vehicle' && f.serviceId === vehicle._id);
          setIsFavorite(isFav);
        }
      }).catch(() => {});
    }
  }, [vehicle]);

  // Cargar datos de búsqueda guardados
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedBookingData = localStorage.getItem('bookingData');
    const savedSearchData = localStorage.getItem('searchFormData');
    
    let searchData: any = {};
    if (savedBookingData) {
      try {
        searchData = JSON.parse(savedBookingData);
      } catch (e) {
        console.error('Error parsing bookingData:', e);
      }
    } else if (savedSearchData) {
      try {
        searchData = JSON.parse(savedSearchData);
      } catch (e) {
        console.error('Error parsing searchFormData:', e);
      }
    }

    if (searchData) {
      setBookingData({
        fecha: searchData.date || '',
        hora: '',
        pasajeros: searchData.passengers || 1,
        origen: searchData.from || '',
        destino: searchData.to || '',
        horas: 1,
      });
    }
  }, []);

  // Manejar toggle de favorito
  const handleToggleFavorite = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    if (!vehicle) return;

    const vehicleId = vehicle._id;
    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        const favResponse = await userAPI.getFavorites();
        if (favResponse.success && favResponse.data) {
          const favs = Array.isArray(favResponse.data) ? favResponse.data : [];
          const favToRemove = favs.find((f: any) => f.serviceType === 'vehicle' && f.serviceId === vehicleId);
          if (favToRemove) {
            await userAPI.removeFavorite(favToRemove._id);
            setIsFavorite(false);
          }
        }
      } else {
        await userAPI.addFavorite('vehicle', vehicleId);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error al manejar favorito:', err);
    } finally {
      setFavoriteLoading(false);
    }
  }, [isFavorite, vehicle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <LoadingState message={t('vehicles.loading')} />
        <Footer />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <ErrorState
          title={t('vehicles.errorLoading')}
          message={error || t('vehicles.notFound')}
        />
        <Footer />
      </div>
    );
  }

  const translatedVehicle = translateVehicle(vehicle, language as 'es' | 'en' | 'fr');
  const colorClass = typeColors[vehicle.type] || 'from-gray-500 to-gray-600';

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      {/* Structured Data */}
      {displayVehicle && (
        <StructuredData
          type="Product"
          data={{
            name: displayVehicle.name,
            description: displayVehicle.description,
            brand: {
              '@type': 'Brand',
              name: 'Mercedes-Benz',
            },
          }}
        />
      )}
      
      {/* Breadcrumbs */}
      {displayVehicle && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <Breadcrumbs
            items={[
              { label: t('nav.home') || 'Inicio', href: '/' },
              { label: t('vehicles.title') || 'Vehículos', href: '/vehiculos' },
              { label: displayVehicle.name, href: `/vehiculos/${id}` },
            ]}
          />
        </div>
      )}
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pb-24">
        <div className="relative h-[300px] md:h-[400px] w-full bg-gradient-to-br from-[var(--yass-black)] to-[var(--yass-gold)]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          
          {/* Back Button y Favorito */}
          <div className="absolute top-6 left-4 md:left-8 z-10 flex items-center gap-3">
            <Link
              href="/vehiculos"
              className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {(() => {
                const backText = t('common.back');
                if (backText === 'common.back' || !backText) {
                  return language === 'es' ? 'Volver' : language === 'en' ? 'Back' : 'Retour';
                }
                return backText;
              })()}
            </Link>
            {authUtils.isAuthenticated() && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`p-3 rounded-xl backdrop-blur-md transition-all duration-300 border-2 ${
                  isFavorite 
                    ? 'bg-[var(--yass-gold)] border-[var(--yass-gold)] text-white shadow-lg' 
                    : 'bg-white/90 border-white/50 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''} ${favoriteLoading ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>

          {/* Vehicle Image */}
          <div className="absolute inset-0">
            <Image
              src={translatedVehicle.image || "/img/v-class1.jpg"}
              alt={translatedVehicle.name}
              fill
              className="object-cover opacity-30"
              priority
            />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end gap-4 mb-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-xl`}>
                  {(() => {
                    const VehicleIcon = getVehicleIcon(vehicle.type);
                    return <VehicleIcon className="w-10 h-10 text-white" strokeWidth={2} />;
                  })()}
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-2 backdrop-blur-md ${
                    typeColors[vehicle.type] 
                      ? `bg-gradient-to-br ${typeColors[vehicle.type]} text-white border-transparent`
                      : 'bg-white/95 text-gray-700 border-gray-200'
                  }`}>
                    {getTypeLabel(vehicle.type)}
                  </span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl">
                {translatedVehicle.name}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl drop-shadow-lg">
                {translatedVehicle.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Vehicle Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Vehicle Image */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
                <div className="relative h-96 w-full">
                  <Image
                    src={translatedVehicle.image || "/img/v-class1.jpg"}
                    alt={translatedVehicle.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Capacity & Features */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{t('vehicles.specifications')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">{t('vehicles.capacity')}</p>
                        <p className="text-2xl font-extrabold text-gray-900">{vehicle.capacity?.passengers || 0} {t('vehicles.seats')}</p>
                      </div>
                    </div>
                  </div>

                  {vehicle.capacity?.luggage && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                          <Car className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">{t('vehicles.luggage')}</p>
                          <p className="text-xl font-extrabold text-gray-900">{vehicle.capacity.luggage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                {translatedVehicle.features && translatedVehicle.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{t('vehicles.features')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {translatedVehicle.features.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingForm
                  serviceName={translatedVehicle.name}
                  serviceType="vehicle"
                  serviceId={vehicle._id}
                  vehicleType={vehicle.type}
                  passengers={bookingData.pasajeros}
                  defaultRoute={{
                    from: bookingData.origen,
                    to: bookingData.destino
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
