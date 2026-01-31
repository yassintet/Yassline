"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { userAPI, circuitsAPI, transportsAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { Heart, Loader2, AlertCircle, Trash2, ArrowLeft, MapPin, Clock } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n/context";

interface FavoriteWithDetails {
  _id: string;
  serviceType: string;
  serviceId: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  priceLabel?: string;
  duration?: string;
  slug?: string;
}

export default function FavoritosPage() {
  const router = useRouter();
  const { t, formatPrice } = useI18n();
  const [favorites, setFavorites] = useState<FavoriteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      if (!authUtils.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const response = await userAPI.getFavorites();
      if (response.success && response.data) {
        const favs = Array.isArray(response.data) ? response.data : [];
        // Cargar detalles de cada favorito
        const favoritesWithDetails: FavoriteWithDetails[] = await Promise.all(
          favs.map(async (fav: any): Promise<FavoriteWithDetails> => {
            try {
              if (fav.serviceType === 'circuit') {
                const circuitResponse = await circuitsAPI.getBySlug(fav.serviceId);
                if (circuitResponse.success && circuitResponse.data) {
                  const circuit: any = circuitResponse.data;
                  return {
                    _id: fav._id,
                    serviceType: fav.serviceType,
                    serviceId: fav.serviceId,
                    name: circuit?.name,
                    title: circuit?.title,
                    description: circuit?.description,
                    image: circuit?.image,
                    price: circuit?.price,
                    priceLabel: circuit?.priceLabel,
                    duration: circuit?.duration,
                    slug: circuit?.slug,
                  };
                }
              } else if (fav.serviceType === 'transport') {
                const transportResponse = await transportsAPI.getById(fav.serviceId);
                if (transportResponse.success && transportResponse.data) {
                  const transport: any = transportResponse.data;
                  return {
                    _id: fav._id,
                    serviceType: fav.serviceType,
                    serviceId: fav.serviceId,
                    name: transport?.name,
                    description: transport?.description,
                    price: transport?.price,
                    priceLabel: transport?.priceLabel,
                  };
                }
              }
              return {
                _id: fav._id,
                serviceType: fav.serviceType,
                serviceId: fav.serviceId,
              };
            } catch (err) {
              console.error(`Error cargando detalles de favorito ${fav._id}:`, err);
              return {
                _id: fav._id,
                serviceType: fav.serviceType,
                serviceId: fav.serviceId,
              };
            }
          })
        );
        setFavorites(favoritesWithDetails);
      } else {
        setError(response.error || t('favorites.error'));
      }
    } catch (err: any) {
      console.error('Error cargando favoritos:', err);
      setError(err.message || t('favorites.error'));
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemove = async (id: string) => {
    try {
      const response = await userAPI.removeFavorite(id);
      if (response.success) {
        await loadFavorites();
      }
    } catch (err: any) {
      console.error('Error eliminando favorito:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="pt-32 pb-16">
          <LoadingState />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/perfil" className="inline-flex items-center gap-2 text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] transition-colors mb-4">
              <ArrowLeft className="h-5 w-5" />
              {t('favorites.back')}
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('favorites.title')}</h1>
            <p className="text-gray-600">{t('favorites.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {favorites.length === 0 ? (
            <EmptyState 
              icon="gift" 
              title={t('favorites.noFavorites')} 
              message={t('favorites.noFavoritesMessage')} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <div key={fav._id} className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100 hover:shadow-lg transition-all group">
                  {/* Imagen */}
                  {fav.image && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={fav.image || "/img/Marrakech-cityf.jpg"}
                        alt={fav.name || fav.title || fav.serviceId}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {t(`favorites.type.${fav.serviceType}`)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemove(fav._id)}
                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                        title={t('favorites.remove')}
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                      {fav.price && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
                            <p className="text-2xl font-bold text-[var(--yass-gold)]">
                              {fav.price}€
                            </p>
                            {fav.priceLabel && (
                              <p className="text-xs text-gray-600">{fav.priceLabel}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Contenido */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--yass-gold)] transition-colors">
                      {fav.name || fav.title || fav.serviceId}
                    </h3>
                    {fav.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                        {fav.description}
                      </p>
                    )}
                    {fav.duration && (
                      <div className="flex items-center gap-2 text-gray-700 mb-3">
                        <Clock className="h-4 w-4 text-[var(--yass-gold)]" />
                        <span className="text-sm font-medium">{fav.duration}</span>
                      </div>
                    )}
                    <Link
                      href={fav.serviceType === 'circuit' ? `/circuitos/${fav.slug || fav.serviceId}` : `/transporte/${fav.serviceId}`}
                      className="inline-flex items-center gap-2 text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-semibold text-sm transition-colors"
                    >
                      {t('favorites.view')}
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
