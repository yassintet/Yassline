"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { vehiclesAPI } from "@/lib/api";
import { 
  Car, 
  Users, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { getVehicleIcon } from "@/lib/vehicleIcons";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n/context";
import { translateVehicle } from "@/lib/translations/vehicleTranslations";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";

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

export default function VehiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { t, language } = useI18n();

  // SEO Avanzado para Vehículos
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  
  useSEO({
    title: 'Flota de Vehículos Mercedes-Benz en Marruecos | V-Class, Vito, Sprinter | Yassline Tour',
    description: 'Conoce nuestra flota premium de vehículos Mercedes-Benz en Marruecos: Mercedes V-Class VIP (hasta 7 plazas), Mercedes Vito familiar (hasta 8 plazas) y Mercedes Sprinter para grupos (hasta 19 plazas). Vehículos de lujo con todas las comodidades.',
    keywords: [
      'Mercedes V-Class Marruecos',
      'Mercedes Vito Marruecos',
      'Mercedes Sprinter Marruecos',
      'vehículos lujo Marruecos',
      'flota transporte Marruecos',
      'transporte VIP Marruecos',
      'Mercedes-Benz transporte turístico',
      'vehículos premium Marruecos',
      'transporte ejecutivo Mercedes',
      'alquiler Mercedes V-Class',
      'alquiler Mercedes Vito',
      'alquiler Mercedes Sprinter',
      'vehículos con chofer Marruecos',
      'flota Mercedes Marruecos',
    ],
    url: '/vehiculos',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${baseUrl}/vehiculos#product`,
      name: 'Flota de Vehículos Mercedes-Benz',
      description: 'Flota premium de vehículos Mercedes-Benz para transporte turístico en Marruecos',
      brand: {
        '@type': 'Brand',
        name: 'Mercedes-Benz',
      },
      manufacturer: {
        '@type': 'Organization',
        name: 'Mercedes-Benz',
      },
      category: 'Vehículos de Transporte Turístico',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'MAD',
        availability: 'https://schema.org/InStock',
        offerCount: 3,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '150',
        bestRating: '5',
        worstRating: '1',
      },
    }
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError("");
        console.log('🔄 Fetching vehicles...');
        const response = await vehiclesAPI.getAll();
        console.log('📦 Vehicles response:', response);
        
        if (response.success && response.data) {
          const vehiclesData = Array.isArray(response.data) 
            ? response.data.filter((v: Vehicle) => v.active)
                .map((v: Vehicle) => translateVehicle(v, language as 'es' | 'en' | 'fr'))
            : [];
          console.log('✅ Vehicles loaded:', vehiclesData.length);
          setVehicles(vehiclesData);
          if (vehiclesData.length === 0) {
            setError(t('vehicles.noVehicles'));
          }
        } else {
          console.error('❌ Error loading vehicles:', response.error);
          setError(response.error || t('vehicles.errorLoading'));
        }
      } catch (err) {
        console.error('❌ Exception loading vehicles:', err);
        setError(t('errors.connectionError'));
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [t, language]);

  // Filtrar vehículos por tipo
  const filteredVehicles = filterType === "all" 
    ? vehicles 
    : vehicles.filter(v => v.type === filterType);

  // Obtener tipos únicos para los filtros
  const vehicleTypes = Array.from(new Set(vehicles.map(v => v.type)));

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
    'v-class': 'bg-purple-100 text-purple-700 border-purple-200',
    'vito': 'bg-blue-100 text-blue-700 border-blue-200',
    'sprinter': 'bg-green-100 text-green-700 border-green-200',
    'other': 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <StructuredData
        type="TravelAgency"
        data={{
          name: 'Yassline Tour',
          description: t('vehicles.subtitle')
        }}
      />
      <Navbar />

      {/* Header Section - Mejorado */}
      <section className="relative pt-24 pb-32 md:pb-40 bg-gradient-to-br from-[var(--yass-black)] via-[var(--yass-black-soft)] to-[var(--yass-gold)] overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 pt-28">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/50 to-white/50"></div>
            <span className="text-xs font-bold text-white/95 uppercase tracking-widest bg-white/15 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white/30 shadow-xl">
              {t('home.fleet') || 'Nuestra Flota'}
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent via-white/50 to-white/50"></div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
            <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
              {t('vehicles.title')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-lg">
            {t('vehicles.subtitle')}
          </p>
        </div>
      </section>

      {/* Filters Section - Mejorado */}
      {vehicles.length > 0 && (
        <section className="py-10 bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-200/50 sticky top-20 z-40 backdrop-blur-sm bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 justify-center">
              <span className="text-gray-700 font-semibold text-sm uppercase tracking-wide mr-2">{t('vehicles.filterByType')}</span>
              <button
                onClick={() => setFilterType("all")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  filterType === "all"
                    ? "bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white shadow-lg shadow-[var(--yass-gold)]/30 scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[var(--yass-gold)]/30 shadow-sm"
                }`}
              >
                {t('vehicles.all')}
              </button>
              {vehicleTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    filterType === type
                      ? "bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white shadow-lg shadow-[var(--yass-gold)]/30 scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[var(--yass-gold)]/30 shadow-sm"
                  }`}
                >
                  {getTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vehicles Section - Mejorado */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--yass-gold)]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--yass-gold)]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {loading ? (
            <LoadingState message={t('vehicles.loading')} />
          ) : error ? (
            <ErrorState
              title={t('vehicles.errorLoading')}
              message={error}
            />
          ) : filteredVehicles.length === 0 ? (
            <EmptyState
              icon="car"
              message={
                filterType === "all" 
                  ? t('vehicles.noVehicles')
                  : t('vehicles.noVehiclesType', { type: getTypeLabel(filterType) })
              }
            >
              {filterType !== "all" && (
                <button
                  onClick={() => setFilterType("all")}
                  className="text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-semibold transition-colors"
                >
                  {t('vehicles.viewAllVehicles')}
                </button>
              )}
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100/50 hover:border-[var(--yass-gold)]/30 group"
                >
                  {/* Image mejorada */}
                  <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image
                      src={vehicle.image || "/img/v-class1.jpg"}
                      alt={`${vehicle.name} - Vehículo Mercedes-Benz para transporte turístico premium en Marruecos | Yassline Tour`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {/* Overlay decorativo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--yass-gold)]/0 via-transparent to-[var(--yass-black)]/0 group-hover:from-[var(--yass-gold)]/10 group-hover:to-[var(--yass-black)]/10 transition-all duration-500"></div>
                    <div className="absolute top-5 left-5 z-10">
                      <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border-2 backdrop-blur-md shadow-xl ${
                        typeColors[vehicle.type] || 'bg-white/95 text-gray-700 border-gray-200'
                      }`}>
                        {(() => {
                          const VehicleIcon = getVehicleIcon(vehicle.type);
                          return (
                            <>
                              <VehicleIcon className="w-4 h-4 opacity-90" strokeWidth={2.5} />
                              {getTypeLabel(vehicle.type)}
                            </>
                          );
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Content mejorado */}
                  <div className="p-8 bg-white">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[var(--yass-gold)] transition-colors duration-300">
                      {vehicle.name}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed text-base">
                      {vehicle.description}
                    </p>

                    {/* Capacity Info mejorado */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-sm">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">{vehicle.capacity?.passengers || 0} {t('vehicles.seats')}</span>
                      </div>
                      {vehicle.capacity?.luggage && (
                        <div className="flex items-center gap-3 bg-green-50/50 rounded-xl p-3 border border-green-100">
                          <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg shadow-sm">
                            <Car className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">{vehicle.capacity.luggage}</span>
                        </div>
                      )}
                    </div>

                    {/* Features mejorado */}
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">{t('vehicles.features')}</p>
                        <div className="space-y-2">
                          {vehicle.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                          {vehicle.features.length > 3 && (
                            <p className="text-xs text-gray-500 ml-7 font-medium">
                              {t('vehicles.moreFeatures', { count: vehicle.features.length - 3 })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CTA Button mejorado */}
                    <Link
                      href={`/vehiculos/${vehicle._id}`}
                      prefetch={false}
                      className="w-full bg-gradient-to-r from-[var(--yass-black)] via-[var(--yass-gold)] to-[var(--yass-black)] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-xl hover:shadow-[var(--yass-gold)]/30 hover:scale-[1.02] transition-all duration-500 flex items-center justify-center gap-2 group"
                    >
                      <span>{t('vehicles.requestVehicle')}</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Mejorado */}
      <section className="py-24 bg-gradient-to-r from-[var(--yass-black)] via-[var(--yass-black-soft)] to-[var(--yass-gold)] relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            {t('vehicles.notFindVehicle')}
          </h2>
          <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('vehicles.contactHelp')}
          </p>
          <Link
            href="/contacto"
            prefetch={false}
            className="inline-flex items-center gap-3 bg-white text-[var(--yass-gold)] px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all duration-300 group"
          >
            <span>{t('contact.title')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
