"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { bookingsAPI, pointsAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock as ClockIcon,
  Loader2,
  AlertCircle,
  FileText,
  Star,
  Award,
  Gift,
  ExternalLink,
  Trash2,
  DollarSign
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n/context";

export default function MisReservasPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [points, setPoints] = useState<number | null>(null);
  const [membershipLevel, setMembershipLevel] = useState<string>('bronze');
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [respondingToPrice, setRespondingToPrice] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Verificar autenticación
      if (!authUtils.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const response = await bookingsAPI.getMy({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        serviceType: serviceTypeFilter !== 'all' ? serviceTypeFilter : undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (response.success && response.data) {
        const bookingsData = Array.isArray(response.data) ? response.data : [];
        setBookings(bookingsData);
        setTotalBookings(response.total || bookingsData.length);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(response.error || t('myBookings.error'));
        setBookings([]);
      }
    } catch (err: any) {
      console.error('Error cargando reservas:', err);
      setError(err.message || t('myBookings.error'));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, serviceTypeFilter, dateFromFilter, dateToFilter, sortBy, sortOrder, currentPage, router, t]);

  const loadPoints = useCallback(async () => {
    try {
      setLoadingPoints(true);
      const response = await pointsAPI.getMy();
      if (response.success && response.data) {
        const pointsData = response.data as any;
        setPoints(pointsData.points);
        setMembershipLevel(pointsData.membershipLevel || 'bronze');
      } else if (response.error) {
        console.warn('Error cargando puntos:', response.error);
        // No mostrar error al usuario si es solo un problema de conexión con el backend
        // El error de conexión se maneja silenciosamente para no interrumpir la experiencia
        if (!response.error.includes('conexión') && !response.error.includes('Failed to fetch') && !response.error.includes('NetworkError')) {
          // Solo mostrar errores de autenticación u otros errores importantes
          if (response.error.includes('autenticado') || response.error.includes('token')) {
            // Si no está autenticado, redirigir al login
            router.push('/login');
          }
        }
      }
    } catch (err: any) {
      console.error('Error cargando puntos:', err);
      // Manejar errores de conexión silenciosamente
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        // Solo mostrar errores importantes
        if (err.message.includes('autenticado') || err.message.includes('token')) {
          router.push('/login');
        }
      }
    } finally {
      setLoadingPoints(false);
    }
  }, [router]);

  useEffect(() => {
    loadBookings();
    loadPoints();
  }, [loadBookings, loadPoints]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(t('myBookings.confirmCancel'))) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setError("");
      setCancelSuccess(null);

      const response = await bookingsAPI.delete(bookingId);

      if (response.success) {
        setCancelSuccess(t('myBookings.cancelSuccess'));
        // Recargar las reservas
        await loadBookings();
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setCancelSuccess(null), 3000);
      } else {
        setError(response.error || t('myBookings.cancelError'));
      }
    } catch (err: any) {
      console.error('Error cancelando reserva:', err);
      setError(err.message || t('myBookings.cancelError'));
    } finally {
      setCancellingId(null);
    }
  };

  const handlePriceResponse = async (bookingId: string, accept: boolean) => {
    try {
      setRespondingToPrice(bookingId);
      setError("");
      
      const response = await bookingsAPI.update(bookingId, {
        priceStatus: accept ? 'accepted' : 'rejected'
      });

      if (response.success) {
        await loadBookings();
        alert(accept 
          ? t('myBookings.priceAccepted') || 'Precio aceptado. La reserva será procesada.'
          : t('myBookings.priceRejected') || 'Precio rechazado. Contactaremos contigo para negociar.'
        );
      } else {
        setError(response.error || t('myBookings.priceResponseError') || 'Error al procesar la respuesta');
      }
    } catch (err: any) {
      console.error('Error respondiendo al precio:', err);
      setError(err.message || t('myBookings.priceResponseError') || 'Error al procesar la respuesta');
    } finally {
      setRespondingToPrice(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any; labelKey: string }> = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: ClockIcon,
        labelKey: 'myBookings.status.pending'
      },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle2,
        labelKey: 'myBookings.status.confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        labelKey: 'myBookings.status.cancelled'
      },
      completed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: CheckCircle2,
        labelKey: 'myBookings.status.completed'
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        <Icon className="h-4 w-4" />
        {t(config.labelKey)}
      </span>
    );
  };

  const getServiceTypeColor = (serviceType: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      airport: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
      },
      intercity: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
      },
      hourly: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
      },
      custom: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
      },
      vehicle: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
      },
    };
    return colors[serviceType] || colors.custom;
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center pt-24 pb-12">
          <LoadingState message={t('myBookings.loading')} fullScreen={false} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />

      <div className="min-h-[calc(100vh-160px)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('myBookings.title')}</h1>
            <p className="text-gray-600">
              {t('myBookings.subtitle')}
            </p>
          </div>

          {/* Tarjeta de Puntos y Nivel */}
          {!loadingPoints && points !== null && (
            <div className="mb-6 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Star className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">{t('myBookings.points.label')}</p>
                    <p className="text-3xl font-bold">{points.toLocaleString()} {t('myBookings.points.points')}</p>
                    <p className="text-sm opacity-80 mt-1">≈ {(points * 10).toLocaleString()} MAD</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">{t('myBookings.membership.label')}</p>
                    <p className="text-2xl font-bold capitalize">{t(`myBookings.membership.${membershipLevel}`)}</p>
                  </div>
                </div>
                <Link 
                  href="/recompensas" 
                  className="ml-auto bg-white text-[var(--yass-gold)] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Gift className="h-5 w-5" />
                  {t('myBookings.rewards.view')}
                </Link>
              </div>
              
              {/* Información sobre cómo ganar puntos */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm opacity-90">
                  💡 {t('myBookings.points.howToEarn')}
                </p>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-6 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('myBookings.filters.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('myBookings.filterByStatus')}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all cursor-pointer hover:border-gray-400"
                >
                  <option value="all">{t('myBookings.all')}</option>
                  <option value="pending">{t('myBookings.pending')}</option>
                  <option value="confirmed">{t('myBookings.confirmed')}</option>
                  <option value="completed">{t('myBookings.completed')}</option>
                  <option value="cancelled">{t('myBookings.cancelled')}</option>
                </select>
              </div>

              {/* Filtro por Tipo de Servicio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('myBookings.filters.serviceType')}</label>
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => {
                    setServiceTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all cursor-pointer hover:border-gray-400"
                >
                  <option value="all">{t('myBookings.all')}</option>
                  <option value="airport">{t('myBookings.serviceType.airport')}</option>
                  <option value="intercity">{t('myBookings.serviceType.intercity')}</option>
                  <option value="hourly">{t('myBookings.serviceType.hourly')}</option>
                  <option value="custom">{t('myBookings.serviceType.custom')}</option>
                  <option value="vehicle">
                    {(() => {
                      const translation = t('myBookings.serviceType.vehicle');
                      // Si la traducción devuelve la clave, usar texto por defecto según idioma
                      if (translation === 'myBookings.serviceType.vehicle') {
                        return language === 'es' ? 'Vehículo' : language === 'en' ? 'Vehicle' : 'Véhicule';
                      }
                      return translation;
                    })()}
                  </option>
                </select>
              </div>

              {/* Filtro por Fecha Desde */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('myBookings.filters.dateFrom')}</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => {
                    setDateFromFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all hover:border-gray-400"
                />
              </div>

              {/* Filtro por Fecha Hasta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('myBookings.filters.dateTo')}</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => {
                    setDateToFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  min={dateFromFilter || undefined}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all hover:border-gray-400"
                />
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('myBookings.sort.sortBy')}</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all cursor-pointer hover:border-gray-400"
                >
                  <option value="createdAt">{t('myBookings.sort.createdAt')}</option>
                  <option value="fecha">{t('myBookings.sort.date')}</option>
                  <option value="status">{t('myBookings.sort.status')}</option>
                  <option value="calculatedPrice">{t('myBookings.sort.price')}</option>
                  <option value="serviceName">{t('myBookings.sort.serviceName')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('myBookings.sort.order')}</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as 'asc' | 'desc');
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all cursor-pointer hover:border-gray-400"
                >
                  <option value="desc">{t('myBookings.sort.descending')}</option>
                  <option value="asc">{t('myBookings.sort.ascending')}</option>
                </select>
              </div>
            </div>

            {/* Botón para limpiar filtros */}
            {(statusFilter !== 'all' || serviceTypeFilter !== 'all' || dateFromFilter || dateToFilter || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setServiceTypeFilter('all');
                    setDateFromFilter('');
                    setDateToFilter('');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-[var(--yass-gold)] transition-colors"
                >
                  {t('myBookings.filters.clear')}
                </button>
              </div>
            )}

            {/* Contador de resultados */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              {totalBookings} {totalBookings === 1 ? t('myBookings.reservationFound') : t('myBookings.reservationsFound')}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <EmptyState
              icon="fileText"
              title={t('myBookings.noBookings')}
              message={statusFilter !== 'all' 
                ? `${t('myBookings.noBookingsWithStatus')} "${t(`myBookings.status.${statusFilter}`)}"`
                : t('myBookings.noBookingsMessage')}
            >
              <Link
                href="/transporte"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--yass-gold)] text-white rounded-xl font-semibold hover:bg-[var(--yass-gold-light)] transition-colors"
              >
                {t('myBookings.viewServices')}
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const serviceColors = getServiceTypeColor(booking.serviceType || 'custom');
                return (
                  <div
                    key={booking._id}
                    className={`bg-white rounded-xl shadow-md border-2 ${serviceColors.border} hover:shadow-lg transition-all duration-300 overflow-hidden`}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {booking.serviceName}
                            </h3>
                            {getStatusBadge(booking.status || 'pending')}
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${serviceColors.bg} ${serviceColors.text} mb-2`}>
                            {t(`myBookings.serviceType.${booking.serviceType || 'custom'}`)}
                          </div>
                        </div>
                        {booking.reservationNumber && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">{t('myBookings.reservationNumber')}</p>
                            <p className="text-sm font-bold text-[var(--yass-gold)]">{booking.reservationNumber}</p>
                          </div>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {booking.fecha && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">{t('myBookings.labels.date')}</p>
                              <p className="font-semibold">{booking.fecha}</p>
                            </div>
                          </div>
                        )}
                        {booking.hora && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">{t('myBookings.labels.time')}</p>
                              <p className="font-semibold">{booking.hora}</p>
                            </div>
                          </div>
                        )}
                        {booking.pasajeros && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Users className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">{t('myBookings.labels.passengers')}</p>
                              <p className="font-semibold">{booking.pasajeros}</p>
                            </div>
                          </div>
                        )}
                        {/* Mostrar precio aceptado si existe, sino mostrar precio propuesto si está pendiente, sino mostrar priceLabel */}
                        {booking.priceStatus === 'accepted' && (booking.total || booking.calculatedPrice || booking.proposedPrice) ? (
                          <div className="flex items-center gap-2 text-gray-700">
                            <CreditCard className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-500">{t('myBookings.labels.price') || 'Precio'}</p>
                              <p className="font-bold text-lg text-green-600">{(booking.total || booking.calculatedPrice || booking.proposedPrice).toLocaleString()} MAD</p>
                            </div>
                          </div>
                        ) : booking.proposedPrice && (!booking.priceStatus || booking.priceStatus === 'pending') ? (
                          <div className="flex items-center gap-2 text-gray-700">
                            <DollarSign className="h-5 w-5 text-[var(--yass-gold)]" />
                            <div>
                              <p className="text-xs text-gray-500">{t('myBookings.labels.proposedPrice') || 'Precio Propuesto'}</p>
                              <p className="font-bold text-lg text-[var(--yass-gold)]">{booking.proposedPrice.toLocaleString()} MAD</p>
                            </div>
                          </div>
                        ) : booking.priceLabel ? (
                          <div className="flex items-center gap-2 text-gray-700">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">{t('myBookings.labels.price') || 'Precio'}</p>
                              <p className="font-semibold text-[var(--yass-gold)]">{booking.priceLabel}</p>
                            </div>
                          </div>
                        ) : (booking.total || booking.calculatedPrice) ? (
                          <div className="flex items-center gap-2 text-gray-700">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">{t('myBookings.labels.price') || 'Precio'}</p>
                              <p className="font-semibold text-[var(--yass-gold)]">{(booking.total || booking.calculatedPrice).toLocaleString()} MAD</p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Precio Propuesto para Vehículos y Servicios Personalizados */}
                      {(booking.serviceType === 'vehicle' || booking.serviceType === 'custom') && booking.proposedPrice && (!booking.priceStatus || booking.priceStatus === 'pending') && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                {t('myBookings.priceProposal.title') || 'Precio Propuesto por la Administración'}
                              </h4>
                              <p className="text-sm text-gray-700 mb-3">
                                {t('myBookings.priceProposal.message') || 'La administración ha propuesto un precio para tu reserva. Por favor, acepta o rechaza para continuar.'}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-[var(--yass-gold)]">{booking.proposedPrice} MAD</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handlePriceResponse(booking._id, true)}
                                disabled={respondingToPrice === booking._id}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {respondingToPrice === booking._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                                {t('myBookings.priceProposal.accept') || 'Aceptar'}
                              </button>
                              <button
                                onClick={() => handlePriceResponse(booking._id, false)}
                                disabled={respondingToPrice === booking._id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {respondingToPrice === booking._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                {t('myBookings.priceProposal.reject') || 'Rechazar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Estado del Precio */}
                      {(booking.serviceType === 'vehicle' || booking.serviceType === 'custom') && booking.proposedPrice && booking.priceStatus && booking.priceStatus !== 'pending' && (
                        <div className={`mb-4 p-3 rounded-lg ${
                          booking.priceStatus === 'accepted' 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            {booking.priceStatus === 'accepted' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${
                              booking.priceStatus === 'accepted' ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {booking.priceStatus === 'accepted' 
                                ? t('myBookings.priceProposal.accepted') || 'Precio aceptado'
                                : t('myBookings.priceProposal.rejected') || 'Precio rechazado'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Route Info */}
                      {booking.routeData && (booking.routeData.from || booking.routeData.to) && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              {booking.routeData.from && (
                                <p className="text-sm">
                                  <span className="font-semibold">{t('myBookings.labels.from')}:</span> {booking.routeData.from}
                                </p>
                              )}
                              {booking.routeData.to && (
                                <p className="text-sm">
                                  <span className="font-semibold">{t('myBookings.labels.to')}:</span> {booking.routeData.to}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{booking.email}</span>
                        </div>
                        {booking.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{booking.telefono}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingId === booking._id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('myBookings.cancelling')}
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                {t('myBookings.cancel')}
                              </>
                            )}
                          </button>
                        )}
                        <Link
                          href={`/reservas/${booking._id}`}
                          className="px-4 py-2 bg-[var(--yass-gold)] text-white rounded-xl font-semibold hover:bg-[var(--yass-gold-light)] transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {t('myBookings.viewDetails')}
                        </Link>
                      </div>

                      {/* Created Date */}
                      {booking.createdAt && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            {t('myBookings.reservationMade')} {new Date(booking.createdAt).toLocaleDateString(
                              language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('myBookings.previous')}
              </button>
              <span className="text-sm text-gray-600">
                {t('myBookings.page')} {currentPage} {t('myBookings.of')} {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('myBookings.next')}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
