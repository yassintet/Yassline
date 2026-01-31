"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { bookingsAPI, paymentsAPI } from "@/lib/api";
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
  Loader2,
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Plane,
  Car,
  Luggage,
  FileText,
  Route,
  Building2,
  Wallet
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useI18n } from "@/lib/i18n/context";

export default function ReservaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useI18n();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [respondingToPrice, setRespondingToPrice] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    fecha: '',
    hora: '',
    pasajeros: 1,
    mensaje: '',
  });

  const bookingId = params?.id as string;

  const loadBooking = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      if (!authUtils.isAuthenticated()) {
        router.push('/login');
        return;
      }

      if (!bookingId) {
        setError(t('bookingDetail.invalidId'));
        return;
      }

      const response = await bookingsAPI.getById(bookingId);
      if (response.success && response.data) {
        const bookingData = response.data as any;
        setBooking(bookingData);
        
        // Cargar información de pago si existe
        if (bookingData.paymentId) {
          setLoadingPayment(true);
          try {
            const paymentResponse = await paymentsAPI.getById(bookingData.paymentId);
            if (paymentResponse.success && paymentResponse.data) {
              setPayment(paymentResponse.data as any);
            }
          } catch (err) {
            console.error('Error cargando pago:', err);
          } finally {
            setLoadingPayment(false);
          }
        } else {
          // Intentar buscar pagos por bookingId
          try {
            const paymentResponse = await paymentsAPI.getByBooking(bookingId);
            if (paymentResponse.success && paymentResponse.data) {
              const paymentData = paymentResponse.data as any;
              if (Array.isArray(paymentData) && paymentData.length > 0) {
                setPayment(paymentData[0]);
              }
            }
          } catch (err) {
            console.error('Error buscando pagos:', err);
          }
        }
      } else {
        setError(response.error || t('bookingDetail.error'));
      }
    } catch (err: any) {
      console.error('Error cargando reserva:', err);
      setError(err.message || t('bookingDetail.error'));
    } finally {
      setLoading(false);
    }
  }, [router, t, bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  // Inicializar formulario cuando se carga la reserva
  useEffect(() => {
    if (booking) {
      setModifyForm({
        fecha: booking.fecha ? new Date(booking.fecha).toISOString().split('T')[0] : '',
        hora: booking.hora || '',
        pasajeros: booking.pasajeros || 1,
        mensaje: booking.mensaje || '',
      });
    }
  }, [booking]);

  const handleCancel = async () => {
    if (!confirm(t('bookingDetail.confirmCancel'))) {
      return;
    }

    try {
      setCancelling(true);
      const response = await bookingsAPI.update(bookingId, { status: 'cancelled' });
      if (response.success) {
        router.push('/mis-reservas');
      } else {
        setError(response.error || t('bookingDetail.cancelError'));
      }
    } catch (err: any) {
      console.error('Error cancelando reserva:', err);
      setError(err.message || t('bookingDetail.cancelError'));
    } finally {
      setCancelling(false);
    }
  };

  const handlePriceResponse = async (accept: boolean) => {
    try {
      setRespondingToPrice(true);
      setError("");
      
      const response = await bookingsAPI.update(bookingId, {
        priceStatus: accept ? 'accepted' : 'rejected'
      });

      if (response.success) {
        await loadBooking(); // Recargar la reserva actualizada
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
      setRespondingToPrice(false);
    }
  };

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setModifying(true);
      setError("");
      
      const updateData: any = {};
      if (modifyForm.fecha) updateData.fecha = modifyForm.fecha;
      if (modifyForm.hora) updateData.hora = modifyForm.hora;
      if (modifyForm.pasajeros) updateData.pasajeros = modifyForm.pasajeros;
      if (modifyForm.mensaje !== undefined) updateData.mensaje = modifyForm.mensaje;

      const response = await bookingsAPI.update(bookingId, updateData);
      if (response.success) {
        setShowModifyModal(false);
        await loadBooking(); // Recargar la reserva actualizada
      } else {
        setError(response.error || t('bookingDetail.modifyError'));
      }
    } catch (err: any) {
      console.error('Error modificando reserva:', err);
      setError(err.message || t('bookingDetail.modifyError'));
    } finally {
      setModifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'confirmed' || status === 'completed') return CheckCircle2;
    if (status === 'cancelled') return XCircle;
    return Clock;
  };

  // Función helper para validar si un valor es válido para mostrar
  const isValidValue = (value: any): boolean => {
    if (!value) return false;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed !== '' && trimmed !== '-' && trimmed !== 'N/A' && trimmed.toLowerCase() !== 'none';
    }
    return true;
  };

  // Función para parsear y estructurar los detalles del booking
  const parseBookingDetails = (booking: any) => {
    const details: any = {
      transferType: null,
      airport: null,
      from: null,
      to: null,
      vehicleType: null,
      passengers: null,
      flightDate: null,
      flightTime: null,
      flightNumber: null,
      destination: null,
      luggage: null,
      message: null,
      routeData: booking.routeData || null,
      airportData: booking.airportData || null,
      customData: booking.customData || null,
    };

    // Parsear detalles del texto si existe
    if (booking.details) {
      const detailsText = booking.details;
      
      // Transfer Type
      const transferMatch = detailsText.match(/Transfer Type:\s*([^\n]+)/i);
      if (transferMatch) details.transferType = transferMatch[1].trim();
      
      // Airport
      const airportMatch = detailsText.match(/Airport:\s*([^\n]+)/i);
      if (airportMatch) details.airport = airportMatch[1].trim();
      
      // From/To
      const fromMatch = detailsText.match(/From\s+Airport[:\s]+([^\n]+)/i) || detailsText.match(/From:\s*([^\n]+)/i);
      const toMatch = detailsText.match(/Destination[:\s]+([^\n]+)/i) || detailsText.match(/To:\s*([^\n]+)/i);
      if (fromMatch && isValidValue(fromMatch[1])) {
        details.from = fromMatch[1].trim();
      }
      if (toMatch && isValidValue(toMatch[1])) {
        details.to = toMatch[1].trim();
      }
      
      // Vehicle Type
      const vehicleMatch = detailsText.match(/Vehicle Type:\s*([^\n]+)/i);
      if (vehicleMatch) details.vehicleType = vehicleMatch[1].trim();
      
      // Passengers
      const passengersMatch = detailsText.match(/Number of Passengers:\s*(\d+)/i);
      if (passengersMatch) details.passengers = passengersMatch[1];
      
      // Flight Date
      const flightDateMatch = detailsText.match(/Flight Date:\s*([^\n]+)/i);
      if (flightDateMatch) details.flightDate = flightDateMatch[1].trim();
      
      // Flight Time
      const flightTimeMatch = detailsText.match(/Flight Time:\s*([^\n]+)/i);
      if (flightTimeMatch) details.flightTime = flightTimeMatch[1].trim();
      
      // Flight Number
      const flightNumberMatch = detailsText.match(/Flight Number:\s*([^\n]+)/i);
      if (flightNumberMatch) details.flightNumber = flightNumberMatch[1].trim();
      
      // Destination
      const destinationMatch = detailsText.match(/Destination[:\s]+([^\n]+)/i);
      if (destinationMatch) details.destination = destinationMatch[1].trim();
      
      // Luggage
      const luggageMatch = detailsText.match(/Luggage:\s*([^\n]+)/i);
      if (luggageMatch) details.luggage = luggageMatch[1].trim();
      
      // Message
      const messageMatch = detailsText.match(/Additional message:\s*([^\n]+)/i);
      if (messageMatch && messageMatch[1].trim().toLowerCase() !== 'none') {
        details.message = messageMatch[1].trim();
      }
    }

    // Usar datos estructurados si existen
    if (booking.routeData) {
      if (isValidValue(booking.routeData.from)) {
        details.from = String(booking.routeData.from).trim();
      }
      if (isValidValue(booking.routeData.to)) {
        details.to = String(booking.routeData.to).trim();
      }
    }
    
    // También verificar si hay datos en customData para servicios personalizados
    if (booking.customData) {
      if (isValidValue(booking.customData.origin)) {
        details.from = String(booking.customData.origin).trim();
      }
      if (isValidValue(booking.customData.destination)) {
        details.to = String(booking.customData.destination).trim();
      }
      if (isValidValue(booking.customData.from)) {
        details.from = String(booking.customData.from).trim();
      }
      if (isValidValue(booking.customData.to)) {
        details.to = String(booking.customData.to).trim();
      }
    }
    
    // Para servicios de tipo vehicle, no mostrar ruta si no hay datos válidos
    if (booking.serviceType === 'vehicle' && !isValidValue(details.from) && !isValidValue(details.to)) {
      details.from = null;
      details.to = null;
    }

    if (booking.airportData) {
      if (booking.airportData.airport) details.airport = booking.airportData.airport;
      if (booking.airportData.flightNumber) details.flightNumber = booking.airportData.flightNumber;
      if (booking.airportData.flightDate) details.flightDate = booking.airportData.flightDate;
      if (booking.airportData.flightTime) details.flightTime = booking.airportData.flightTime;
    }

    if (booking.vehicleType) details.vehicleType = booking.vehicleType;
    if (booking.pasajeros) details.passengers = booking.pasajeros;
    if (booking.mensaje) details.message = booking.mensaje;

    return details;
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

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="pt-32 pb-16">
          <ErrorState message={error} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const StatusIcon = getStatusIcon(booking.status);
  const parsedDetails = parseBookingDetails(booking);

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />
      
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header mejorado */}
          <div className="mb-8">
            <Link href="/mis-reservas" className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--yass-gold)] transition-colors mb-6 group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">{t('bookingDetail.back')}</span>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">{t('bookingDetail.title')}</h1>
                {booking.reservationNumber && (
                  <p className="text-sm text-gray-500 font-medium">
                    {t('bookingDetail.reservationNumber')}: <span className="text-[var(--yass-gold)] font-semibold">{booking.reservationNumber}</span>
                  </p>
                )}
              </div>
              <span className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 flex items-center gap-2 w-fit ${getStatusColor(booking.status)} shadow-sm`}>
                <StatusIcon className="h-4 w-4" />
                {t(`bookingDetail.status.${booking.status}`)}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 shadow-sm">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Detalles del Servicio - Mejorado */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('bookingDetail.serviceDetails')}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre del Servicio */}
                  <div className="md:col-span-2">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('bookingDetail.serviceName')}</p>
                      <p className="text-xl font-bold text-gray-900">{booking.serviceName}</p>
                    </div>
                  </div>

                  {/* Tipo de Servicio */}
                  {booking.serviceType && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('bookingDetail.serviceType')}</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{booking.serviceType}</p>
                    </div>
                  )}

                  {/* Tipo de Vehículo */}
                  {parsedDetails.vehicleType && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Car className="h-4 w-4 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('bookingDetail.vehicleType')}</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{parsedDetails.vehicleType}</p>
                    </div>
                  )}

                  {/* Pasajeros */}
                  {(parsedDetails.passengers || booking.pasajeros) && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('bookingDetail.passengers')}</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{parsedDetails.passengers || booking.pasajeros}</p>
                    </div>
                  )}

                  {/* Ruta - From */}
                  {(() => {
                    const fromValue = parsedDetails.from || parsedDetails.routeData?.from;
                    if (fromValue && fromValue.trim() && fromValue.trim() !== '-' && fromValue.trim() !== 'N/A') {
                      return (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{t('bookingDetail.from')}</p>
                          </div>
                          <p className="text-base font-semibold text-gray-900">{fromValue}</p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Ruta - To / Nombre del Pasajero (para vehículos y servicio por horas) */}
                  {(() => {
                    // Para reservas de vehículos y servicio por horas, mostrar nombre del pasajero en lugar de destino
                    if ((booking.serviceType === 'vehicle' || booking.serviceType === 'hourly') && booking.nombre) {
                      return (
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-green-600" />
                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">{t('bookingDetail.passengerName')}</p>
                          </div>
                          <p className="text-base font-semibold text-gray-900">{booking.nombre}</p>
                        </div>
                      );
                    }
                    
                    // Para otros tipos de servicios, mostrar destino normalmente
                    const toValue = parsedDetails.to || parsedDetails.destination || parsedDetails.routeData?.to;
                    if (toValue && toValue.trim() && toValue.trim() !== '-' && toValue.trim() !== 'N/A') {
                      return (
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">{t('bookingDetail.to')}</p>
                          </div>
                          <p className="text-base font-semibold text-gray-900">{toValue}</p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Aeropuerto */}
                  {parsedDetails.airport && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Plane className="h-4 w-4 text-purple-600" />
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t('bookingDetail.airport')}</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{parsedDetails.airport}</p>
                    </div>
                  )}

                  {/* Fecha de Vuelo */}
                  {parsedDetails.flightDate && (
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">{t('bookingDetail.flightDate')}</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{parsedDetails.flightDate}</p>
                    </div>
                  )}

                  {/* Hora de Vuelo */}
                  {parsedDetails.flightTime && (
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">{t('bookingDetail.flightTime')}</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{parsedDetails.flightTime}</p>
                    </div>
                  )}

                  {/* Número de Vuelo */}
                  {parsedDetails.flightNumber && (
                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Plane className="h-4 w-4 text-cyan-600" />
                        <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">{t('bookingDetail.flightNumber')}</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{parsedDetails.flightNumber}</p>
                    </div>
                  )}

                  {/* Equipaje */}
                  {parsedDetails.luggage && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Luggage className="h-4 w-4 text-amber-600" />
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{t('bookingDetail.luggage')}</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{parsedDetails.luggage}</p>
                    </div>
                  )}

                  {/* Mensaje Adicional */}
                  {parsedDetails.message && (
                    <div className="md:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('bookingDetail.message')}</p>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{parsedDetails.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Contacto - Mejorado */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('bookingDetail.contactInfo')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {booking.nombre && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('bookingDetail.name')}</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{booking.nombre}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('bookingDetail.email')}</p>
                    </div>
                    <a href={`mailto:${booking.email}`} className="text-lg font-semibold text-gray-900 hover:text-[var(--yass-gold)] transition-colors break-all">
                      {booking.email}
                    </a>
                  </div>
                  {booking.telefono && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('bookingDetail.phone')}</p>
                      </div>
                      <a href={`tel:${booking.telefono}`} className="text-lg font-semibold text-gray-900 hover:text-[var(--yass-gold)] transition-colors">
                        {booking.telefono}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas y Horarios - Mejorado */}
              {(booking.fecha || booking.hora) && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('bookingDetail.schedule')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {booking.fecha && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t('bookingDetail.date')}</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(booking.fecha).toLocaleDateString(
                            language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )}
                        </p>
                      </div>
                    )}
                    {booking.hora && (
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-5 border border-indigo-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="h-5 w-5 text-indigo-600" />
                          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">{t('bookingDetail.time')}</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{booking.hora}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Precio - Mejorado */}
              <div className="bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-2xl shadow-xl p-8 border border-[var(--yass-gold)]/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{t('bookingDetail.price')}</h2>
                </div>
                {/* Mostrar precio aceptado si existe */}
                {booking.priceStatus === 'accepted' && (booking.total || booking.calculatedPrice || booking.proposedPrice) ? (
                  <div>
                    <p className="text-4xl font-extrabold text-white mb-1">{(booking.total || booking.calculatedPrice || booking.proposedPrice).toLocaleString()}</p>
                    <p className="text-lg font-medium text-white/90">MAD</p>
                    <p className="text-sm text-white/80 mt-2">✓ Precio aceptado</p>
                  </div>
                ) : booking.proposedPrice && (!booking.priceStatus || booking.priceStatus === 'pending') ? (
                  <div>
                    <p className="text-sm text-white/90 mb-2">{t('bookingDetail.proposedPrice') || 'Precio Propuesto'}</p>
                    <p className="text-4xl font-extrabold text-white mb-1">{booking.proposedPrice.toLocaleString()}</p>
                    <p className="text-lg font-medium text-white/90">MAD</p>
                  </div>
                ) : booking.total ? (
                  <div>
                    <p className="text-4xl font-extrabold text-white mb-1">{booking.total.toLocaleString()}</p>
                    <p className="text-lg font-medium text-white/90">MAD</p>
                  </div>
                ) : booking.calculatedPrice ? (
                  <div>
                    <p className="text-4xl font-extrabold text-white mb-1">{booking.calculatedPrice.toLocaleString()}</p>
                    <p className="text-lg font-medium text-white/90">MAD</p>
                  </div>
                ) : booking.priceLabel ? (
                  <p className="text-2xl font-bold text-white">{booking.priceLabel}</p>
                ) : (
                  <p className="text-lg text-white/80 font-medium">{t('bookingDetail.pricePending')}</p>
                )}
              </div>

              {/* Precio Propuesto - Botones de Aceptar/Rechazar */}
              {booking.proposedPrice && (!booking.priceStatus || booking.priceStatus === 'pending') && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-bold text-gray-900">{t('bookingDetail.priceProposal.title') || 'Precio Propuesto por la Administración'}</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    {t('bookingDetail.priceProposal.message') || 'La administración ha propuesto un precio para tu reserva. Por favor, acepta o rechaza para continuar.'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handlePriceResponse(true)}
                      disabled={respondingToPrice}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {respondingToPrice ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                      {t('bookingDetail.priceProposal.accept') || 'Aceptar Precio'}
                    </button>
                    <button
                      onClick={() => handlePriceResponse(false)}
                      disabled={respondingToPrice}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {respondingToPrice ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      {t('bookingDetail.priceProposal.reject') || 'Rechazar Precio'}
                    </button>
                  </div>
                </div>
              )}

              {/* Estado del Precio (Aceptado/Rechazado) */}
              {booking.proposedPrice && booking.priceStatus && booking.priceStatus !== 'pending' && (
                <div className={`rounded-2xl shadow-lg p-6 border-2 ${
                  booking.priceStatus === 'accepted' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {booking.priceStatus === 'accepted' ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-bold text-green-900">{t('bookingDetail.priceProposal.accepted') || 'Precio Aceptado'}</p>
                          <p className="text-sm text-green-700">{t('bookingDetail.priceProposal.acceptedMessage') || 'Has aceptado el precio propuesto. La reserva será procesada.'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-6 w-6 text-red-600" />
                        <div>
                          <p className="font-bold text-red-900">{t('bookingDetail.priceProposal.rejected') || 'Precio Rechazado'}</p>
                          <p className="text-sm text-red-700">{t('bookingDetail.priceProposal.rejectedMessage') || 'Has rechazado el precio propuesto. Contactaremos contigo para negociar.'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Estado de Pago */}
              {payment && (
                <div className={`rounded-2xl shadow-lg p-6 border-2 ${
                  payment.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : payment.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : payment.status === 'pending_review'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {payment.status === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : payment.status === 'failed' ? (
                        <XCircle className="h-6 w-6 text-red-600" />
                      ) : (
                        <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />
                      )}
                      <div>
                        <p className="font-bold text-gray-900">
                          {payment.status === 'completed' 
                            ? 'Pago Completado' 
                            : payment.status === 'failed'
                            ? 'Pago Fallido'
                            : payment.status === 'pending_review'
                            ? 'Pago en Revisión'
                            : 'Pago Pendiente'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Método: {payment.paymentMethod === 'cash' ? 'Efectivo' : 
                                   payment.paymentMethod === 'bank_transfer' ? 'Transferencia Bancaria' :
                                   payment.paymentMethod === 'binance' ? 'Binance Pay' :
                                   payment.paymentMethod === 'redotpay' ? 'Redotpay' :
                                   payment.paymentMethod === 'moneygram' ? 'MoneyGram' : payment.paymentMethod}
                        </p>
                        {payment.paymentMethod === 'cash' && payment.status === 'pending' && (
                          <p className="text-sm text-green-700 mt-2 font-semibold">
                            💵 Pagarás en efectivo al conductor al momento de la recogida
                          </p>
                        )}
                        {payment.status === 'pending_review' && (
                          <p className="text-sm text-yellow-700 mt-2">
                            Tu pago está siendo revisado por la administración. Recibirás una notificación cuando se confirme.
                          </p>
                        )}
                      </div>
                    </div>
                    {payment.status === 'pending' && payment.paymentMethod !== 'cash' && (
                      <Link
                        href={`/pago/${bookingId}`}
                        className="px-4 py-2 bg-[var(--yass-gold)] text-white rounded-lg font-semibold hover:bg-[var(--yass-gold-light)] transition-colors"
                      >
                        Completar Pago
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones - Mejorado */}
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/50">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t('bookingDetail.actions')}</h2>
                  <div className="space-y-3">
                    {/* Botón de Pago - Solo mostrar si hay precio y no hay pago completado */}
                    {(booking.total || booking.calculatedPrice || booking.proposedPrice) && 
                     (!payment || payment.status !== 'completed') && (
                      <Link
                        href={`/pago/${bookingId}`}
                        className="w-full px-5 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Wallet className="h-5 w-5" />
                        {payment ? 'Ver/Completar Pago' : 'Realizar Pago'}
                      </Link>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => setShowModifyModal(true)}
                        className="w-full px-5 py-3.5 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-5 w-5" />
                        {t('bookingDetail.modify')}
                      </button>
                    )}
                    {booking.status === 'pending' && (
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="w-full px-5 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                      >
                        {cancelling ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {t('bookingDetail.cancelling')}
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-5 w-5" />
                            {t('bookingDetail.cancel')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Información Adicional - Mejorado */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('bookingDetail.additionalInfo')}</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('bookingDetail.createdAt')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(booking.createdAt).toLocaleDateString(
                        language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES',
                        { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                      )}
                    </p>
                  </div>
                  {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('bookingDetail.updatedAt')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.updatedAt).toLocaleDateString(
                          language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES',
                          { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Modificación - Mejorado */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-lg">
                    <Edit className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('bookingDetail.modifyTitle')}</h2>
                </div>
                <button
                  onClick={() => setShowModifyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleModify} className="space-y-6">
                {booking.fecha && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('bookingDetail.date')}
                    </label>
                    <input
                      type="date"
                      value={modifyForm.fecha}
                      onChange={(e) => setModifyForm({ ...modifyForm, fecha: e.target.value })}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all bg-white"
                      required
                    />
                  </div>
                )}

                {booking.hora && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('bookingDetail.time')}
                    </label>
                    <input
                      type="time"
                      value={modifyForm.hora}
                      onChange={(e) => setModifyForm({ ...modifyForm, hora: e.target.value })}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all bg-white"
                      required
                    />
                  </div>
                )}

                {booking.pasajeros && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('bookingDetail.passengers')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={modifyForm.pasajeros}
                      onChange={(e) => setModifyForm({ ...modifyForm, pasajeros: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all bg-white"
                      required
                    />
                  </div>
                )}

                {booking.mensaje !== undefined && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('bookingDetail.message')}
                    </label>
                    <textarea
                      value={modifyForm.mensaje}
                      onChange={(e) => setModifyForm({ ...modifyForm, mensaje: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all resize-none bg-white"
                      placeholder={t('bookingDetail.messagePlaceholder')}
                    />
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModifyModal(false)}
                    className="flex-1 px-5 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={modifying}
                    className="flex-1 px-5 py-3.5 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {modifying ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t('bookingDetail.modifying')}
                      </>
                    ) : (
                      <>
                        <Edit className="h-5 w-5" />
                        {t('bookingDetail.saveChanges')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
