"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Mail, Phone, Calendar, Clock, Users, DollarSign, FileText, Loader2, Edit2, Save, X, MapPin, Route, Info, AlertCircle } from "lucide-react";
import { authUtils } from "@/lib/auth";
import { bookingsAPI } from "@/lib/api";

export default function BookingDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);
  const [proposedPrice, setProposedPrice] = useState("");

  useEffect(() => {
    if (!authUtils.isAuthenticated() || !authUtils.isAdmin()) {
      router.push('/login');
      return;
    }

    if (id) {
      loadBooking();
    }
  }, [id, router]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await bookingsAPI.getById(id);
      
      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        setError(response.error || "Error al cargar la reserva");
      }
    } catch (err) {
      setError("Error al cargar la reserva");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirm('¿Estás seguro de que quieres confirmar esta reserva? Se enviará un email de confirmación al cliente con la factura.')) {
      return;
    }

    try {
      setConfirming(true);
      setError("");
      const response = await bookingsAPI.confirm(id);
      
      if (response.success) {
        await loadBooking(); // Recargar para ver el estado actualizado
        alert('Reserva confirmada exitosamente. Se ha enviado un email al cliente con la factura.');
      } else {
        setError(response.error || "Error al confirmar la reserva");
      }
    } catch (err) {
      setError("Error al confirmar la reserva");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }

    try {
      setConfirming(true);
      setError("");
      const response = await bookingsAPI.update(id, { status: 'cancelled' });
      
      if (response.success) {
        await loadBooking();
        alert('Reserva cancelada exitosamente.');
      } else {
        setError(response.error || "Error al cancelar la reserva");
      }
    } catch (err) {
      setError("Error al cancelar la reserva");
    } finally {
      setConfirming(false);
    }
  };

  const handleSetPrice = async () => {
    if (!proposedPrice || isNaN(parseFloat(proposedPrice)) || parseFloat(proposedPrice) <= 0) {
      setError("Por favor ingresa un precio válido");
      return;
    }

    try {
      setSavingPrice(true);
      setError("");
      const response = await bookingsAPI.update(id, { 
        proposedPrice: parseFloat(proposedPrice),
        priceStatus: 'pending'
      });
      
      if (response.success) {
        await loadBooking();
        setIsEditingPrice(false);
        setProposedPrice("");
        alert('Precio propuesto establecido exitosamente. El cliente recibirá una notificación.');
      } else {
        setError(response.error || "Error al establecer el precio");
      }
    } catch (err) {
      setError("Error al establecer el precio");
    } finally {
      setSavingPrice(false);
    }
  };

  useEffect(() => {
    if (booking) {
      setProposedPrice(booking.proposedPrice?.toString() || "");
    }
  }, [booking]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF385C]" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <Link href="/admin" className="mt-4 text-[#FF385C] hover:underline">
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        bg: 'bg-gradient-to-r from-yellow-100 to-yellow-50', 
        text: 'text-yellow-800', 
        border: 'border-yellow-300',
        label: '⏳ Pendiente' 
      },
      confirmed: { 
        bg: 'bg-gradient-to-r from-green-100 to-green-50', 
        text: 'text-green-800', 
        border: 'border-green-300',
        label: '✓ Confirmada' 
      },
      cancelled: { 
        bg: 'bg-gradient-to-r from-red-100 to-red-50', 
        text: 'text-red-800', 
        border: 'border-red-300',
        label: '✗ Cancelada' 
      },
      completed: { 
        bg: 'bg-gradient-to-r from-blue-100 to-blue-50', 
        text: 'text-blue-800', 
        border: 'border-blue-300',
        label: '✓ Completada' 
      },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${config.bg} ${config.text} ${config.border} shadow-sm`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Moderno con Gradientes */}
      <header className="bg-gradient-to-r from-white via-gray-50 to-white shadow-xl border-b-2 border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2.5 text-gray-600 hover:text-[#FF385C] hover:bg-gradient-to-br hover:from-[#FF385C]/10 hover:to-[#E01E4F]/10 rounded-xl transition-all duration-300 transform hover:scale-110"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-[#FF385C] to-gray-700 bg-clip-text text-transparent animate-gradient">
                  Detalles de Reserva
                </h1>
                <p className="text-sm text-gray-500 font-mono mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">ID: {booking._id}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(booking.status)}
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {confirming ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Confirmar Reserva
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={confirming}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <XCircle className="h-5 w-5" />
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Cliente - Tarjeta con Sombras y Hover */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:shadow-[#FF385C]/10 transition-all duration-500 transform hover:-translate-y-1">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#FF385C] via-[#E01E4F] to-[#FF385C] p-2 rounded-xl shadow-lg shadow-[#FF385C]/30">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Información del Cliente
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre Completo</p>
                      <p className="text-lg font-bold text-gray-900">{booking.nombre}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-lg font-bold text-gray-900 break-all">{booking.email}</p>
                    </div>
                  </div>
                </div>
                {booking.telefono && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Teléfono</p>
                        <p className="text-lg font-bold text-gray-900">{booking.telefono}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles del Servicio - Tarjeta con Sombras y Hover */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:shadow-[#FF385C]/10 transition-all duration-500 transform hover:-translate-y-1">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#FF385C] via-[#E01E4F] to-[#FF385C] p-2 rounded-xl shadow-lg shadow-[#FF385C]/30">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Detalles del Servicio
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Servicio</p>
                  <p className="text-xl font-bold text-gray-900">{booking.serviceName}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tipo de Servicio</p>
                  <p className="text-xl font-bold text-gray-900 capitalize">{booking.serviceType}</p>
                </div>
                {booking.fecha && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-[#FF385C]" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 ml-8">{booking.fecha}</p>
                  </div>
                )}
                {booking.hora && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-[#FF385C]" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hora</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 ml-8">{booking.hora}</p>
                  </div>
                )}
                {booking.pasajeros && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-[#FF385C]" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Número de Pasajeros</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 ml-8">{booking.pasajeros}</p>
                  </div>
                )}
                {booking.priceLabel && (
                  <div className="bg-gradient-to-br from-[#FF385C]/10 to-[#E01E4F]/10 p-5 rounded-xl border-2 border-[#FF385C]/30">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="h-5 w-5 text-[#FF385C]" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Precio Estimado</p>
                    </div>
                    <p className="text-lg font-bold text-[#FF385C] ml-8">{booking.priceLabel}</p>
                  </div>
                )}
                {booking.calculatedPrice && !booking.proposedPrice && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-300">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Precio Calculado</p>
                    </div>
                    <p className="text-xl font-bold text-blue-900 ml-8">{booking.calculatedPrice.toLocaleString('es-ES')} MAD</p>
                  </div>
                )}
              </div>
              
              {/* Sección de Precio Destacada con Fondo de Gradiente */}
              <div className="border-t-2 border-gradient-to-r from-[#FF385C] to-[#E01E4F] pt-8 mt-8 bg-gradient-to-br from-[#FF385C]/10 via-[#E01E4F]/8 to-[#FF385C]/10 rounded-2xl p-6 shadow-lg shadow-[#FF385C]/10 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3 mb-2">
                      <div className="bg-gradient-to-br from-[#FF385C] via-[#E01E4F] to-[#FF385C] p-2 rounded-xl shadow-lg shadow-[#FF385C]/40 animate-pulse-slow">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-[#FF385C] to-[#E01E4F] bg-clip-text text-transparent">
                        Gestión de Precio
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 ml-12 font-medium">Establece o modifica el precio de esta reserva</p>
                  </div>
                  {!isEditingPrice && booking.status === 'pending' && (
                    <button
                      onClick={() => setIsEditingPrice(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#FF385C] to-[#E01E4F] text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-[#FF385C]/40 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                    >
                      <Edit2 className="h-5 w-5" />
                      {booking.proposedPrice ? 'Modificar Precio' : 'Establecer Precio'}
                    </button>
                  )}
                  {booking.status !== 'pending' && (
                    <div className="px-4 py-2 bg-gray-100 rounded-xl">
                      <p className="text-sm font-semibold text-gray-600">
                        {booking.status === 'confirmed' ? 'Reserva confirmada' : 
                         booking.status === 'cancelled' ? 'Reserva cancelada' : 
                         'Reserva completada'}
                      </p>
                    </div>
                  )}
                </div>
                
                {isEditingPrice ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-[#FF385C]/20 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Precio en Dirhams Marroquíes (MAD)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={proposedPrice}
                              onChange={(e) => setProposedPrice(e.target.value)}
                              placeholder="Ej: 500.00"
                              className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] outline-none transition-all font-semibold"
                              min="0"
                              step="0.01"
                              disabled={savingPrice}
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-lg">MAD</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={handleSetPrice}
                          disabled={savingPrice}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#FF385C] to-[#E01E4F] text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-[#FF385C]/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {savingPrice ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5" />
                              Guardar Precio
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPrice(false);
                            setProposedPrice(booking.proposedPrice?.toString() || "");
                          }}
                          disabled={savingPrice}
                          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 disabled:opacity-50"
                        >
                          <X className="h-5 w-5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {booking.proposedPrice ? (
                        <div className="bg-gradient-to-br from-[#FF385C]/10 to-[#E01E4F]/10 p-6 rounded-2xl border-2 border-[#FF385C]/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-[#FF385C] p-3 rounded-xl">
                                <DollarSign className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Precio Propuesto</p>
                                <p className="text-3xl font-extrabold bg-gradient-to-r from-[#FF385C] to-[#E01E4F] bg-clip-text text-transparent mt-1">
                                  {booking.proposedPrice.toLocaleString('es-ES')} MAD
                                </p>
                              </div>
                            </div>
                            {booking.priceStatus && (
                              <div>
                                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                                  booking.priceStatus === 'accepted' 
                                    ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                                    : booking.priceStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800 border-2 border-red-300'
                                    : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                                }`}>
                                  {booking.priceStatus === 'accepted' 
                                    ? '✓ Aceptado' 
                                    : booking.priceStatus === 'rejected'
                                    ? '✗ Rechazado'
                                    : '⏳ Pendiente de Respuesta'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-400 p-8 rounded-2xl text-center">
                          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-10 w-10 text-yellow-600" />
                          </div>
                          <p className="text-gray-700 font-bold text-lg mb-2">No se ha establecido un precio propuesto aún.</p>
                          {booking.status === 'pending' ? (
                            <p className="text-sm text-gray-600 mt-1">Haz clic en el botón <span className="font-bold text-[#FF385C]">"Establecer Precio"</span> arriba para agregar uno.</p>
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">Esta reserva ya está {booking.status === 'confirmed' ? 'confirmada' : booking.status === 'cancelled' ? 'cancelada' : 'completada'}, por lo que no se puede modificar el precio.</p>
                          )}
                        </div>
                      )}
                      {booking.calculatedPrice && booking.calculatedPrice !== booking.proposedPrice && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Precio calculado automáticamente:</span> {booking.calculatedPrice.toLocaleString('es-ES')} MAD
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Datos Adicionales */}
            {(booking.airportData || booking.customData || booking.routeData || booking.mensaje || booking.details) && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#FF385C] to-[#E01E4F] p-2 rounded-xl">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  Información Adicional
                </h2>
                <div className="space-y-6">
                  {booking.routeData && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Route className="h-6 w-6 text-blue-600" />
                        <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Ruta</p>
                      </div>
                      <div className="flex items-center gap-3 text-lg font-bold text-gray-900">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg">{booking.routeData.from || 'No especificado'}</span>
                        <ArrowLeft className="h-5 w-5 text-blue-600 transform rotate-180" />
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg">{booking.routeData.to || 'No especificado'}</span>
                      </div>
                    </div>
                  )}
                  {booking.mensaje && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                      <p className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Mensaje del Cliente
                      </p>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border border-purple-100">
                        {booking.mensaje || 'Ninguno'}
                      </p>
                    </div>
                  )}
                  {booking.details && (
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200">
                      <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Detalles Adicionales
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{booking.details}</p>
                      </div>
                    </div>
                  )}
                  {booking.airportData && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
                      <p className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Datos del Aeropuerto
                      </p>
                      <pre className="bg-white p-4 rounded-lg border border-amber-100 text-sm overflow-auto font-mono">
                        {JSON.stringify(booking.airportData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {booking.customData && (
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-teal-200">
                      <p className="text-sm font-bold text-teal-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Datos Personalizados
                      </p>
                      <pre className="bg-white p-4 rounded-lg border border-teal-100 text-sm overflow-auto font-mono">
                        {JSON.stringify(booking.customData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información de Reserva */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <div className="bg-gradient-to-br from-[#FF385C] to-[#E01E4F] p-1.5 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Información de Reserva
              </h2>
              <div className="space-y-4">
                {booking.reservationNumber && (
                  <div className="bg-gradient-to-br from-[#FF385C]/10 to-[#E01E4F]/10 p-4 rounded-xl border-2 border-[#FF385C]/30">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Número de Reserva</p>
                    <p className="font-extrabold text-[#FF385C] text-lg font-mono">{booking.reservationNumber}</p>
                  </div>
                )}
                {booking.invoiceNumber && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Número de Factura</p>
                    <p className="font-extrabold text-green-700 text-lg font-mono">{booking.invoiceNumber}</p>
                  </div>
                )}
                {booking.total && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Final</p>
                    <p className="font-extrabold text-blue-700 text-2xl">{booking.total.toLocaleString('es-ES')} MAD</p>
                  </div>
                )}
                <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha de Creación</p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
                    {new Date(booking.createdAt).toLocaleString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {booking.updatedAt && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Última Actualización</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">
                      {new Date(booking.updatedAt).toLocaleString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            {booking.notes && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
                <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Notas Internas
                </h2>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{booking.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
