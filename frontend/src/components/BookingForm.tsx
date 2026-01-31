"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, User, Mail, Phone, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { bookingsAPI, userAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";

interface BookingFormProps {
  serviceName: string;
  serviceType: string;
  serviceId?: string;
  defaultRoute?: {
    from?: string;
    to?: string;
  };
  priceLabel?: string;
  vehicleType?: string;
  passengers?: number;
  hours?: number;
  calculatedPrice?: number;
  customData?: {
    description: string;
    vehicleType: string;
    passengers: number;
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    specialRequirements: string;
  };
  airportData?: {
    direction: string;
    airport: string;
    vehicleType: string;
    passengers: number;
    flightDate: string;
    flightTime: string;
    flightNumber: string;
    destination: string;
    luggage: string;
    specialRequirements: string;
  };
}

export default function BookingForm({
  serviceName,
  serviceType,
  serviceId,
  defaultRoute,
  priceLabel,
  vehicleType,
  passengers,
  hours,
  customData,
  airportData,
  calculatedPrice,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fecha: "",
    hora: "",
    pasajeros: "1",
    mensaje: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { t } = useI18n();

  // Verificar autenticación y cargar perfil
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = authUtils.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        setLoadingProfile(true);
        try {
          const response = await userAPI.getProfile();
          if (response.success && response.data?.user) {
            const userEmail = response.data.user.email;
            if (userEmail) {
              setFormData(prev => ({
                ...prev,
                email: userEmail,
              }));
            }
          }
        } catch (err) {
          console.error('Error al cargar perfil:', err);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let message = `
${t('booking.requestReservation')} - ${serviceName}

${t('transport.title')}: ${serviceType}
      `.trim();

      // Si es servicio personalizado, incluir todos los datos
      if (customData) {
        message += `

📋 ${t('booking.customService')}

${t('booking.serviceDescription')}
${customData.description || t('booking.notSpecified3')}

${t('booking.preferredVehicleType')} ${customData.vehicleType || t('booking.notSpecified2')}
${t('booking.numberOfPassengers2')} ${customData.passengers || 1}
${t('booking.origin2')} ${customData.origin || t('booking.notSpecified2')}
${t('booking.destination2')} ${customData.destination || t('booking.notSpecified2')}
${t('booking.startDate2')} ${customData.startDate || formData.fecha || t('booking.notSpecified3')}
${t('booking.endDate2')} ${customData.endDate || t('booking.notSpecified3')}
${t('booking.startTime2')} ${customData.startTime || formData.hora || t('booking.notSpecified3')}
${t('booking.endTime2')} ${customData.endTime || t('booking.notSpecified3')}
${customData.specialRequirements ? `${t('booking.specialRequirements2')} ${customData.specialRequirements}` : ''}
        `;
      } else if (airportData) {
        // Si es servicio de aeropuerto
        const airportName = airportData.airport 
          ? (airportData.airport === "CMN" ? "Casablanca - Aeropuerto Internacional Mohammed V (CMN)"
            : airportData.airport === "RAK" ? "Marrakech - Aeropuerto Menara (RAK)"
            : airportData.airport === "AGA" ? "Agadir - Aeropuerto Al Massira (AGA)"
            : airportData.airport === "TNG" ? "Tánger - Aeropuerto Ibn Battuta (TNG)"
            : airportData.airport === "TTU" ? "Tetouan - Aeropuerto Sania Ramel (TTU)"
            : airportData.airport === "FEZ" ? "Fez - Aeropuerto Saïss (FEZ)"
            : airportData.airport === "RBA" ? "Rabat - Aeropuerto Salé (RBA)"
            : airportData.airport === "OUD" ? "Oujda - Aeropuerto Angads (OUD)"
            : airportData.airport === "NDR" ? "Nador - Aeropuerto Al Aroui (NDR)"
            : airportData.airport === "ESU" ? "Essaouira - Aeropuerto Mogador (ESU)"
            : airportData.airport === "OZZ" ? "Ouarzazate - Aeropuerto (OZZ)"
            : airportData.airport === "VIL" ? "Dakhla - Aeropuerto (VIL)"
            : airportData.airport === "EUN" ? "Laayoune - Aeropuerto Hassan I (EUN)"
            : `Aeropuerto (${airportData.airport})`)
          : "No especificado";
        
        message += `

✈️ ${t('booking.airportTransfer2')}

${t('booking.transferType2')} ${airportData.direction === "from" ? t('booking.fromAirport2') : t('booking.toAirport2')}
${t('booking.airport2')} ${airportName}
${t('booking.vehicleType2')} ${airportData.vehicleType || t('booking.notSpecified2')}
${t('booking.numberOfPassengers3')} ${airportData.passengers || 1}
${t('booking.flightDate2')} ${airportData.flightDate || formData.fecha || t('booking.notSpecified3')}
${t('booking.flightTime2')} ${airportData.flightTime || formData.hora || t('booking.notSpecified3')}
${airportData.flightNumber ? `${t('booking.flightNumber2')} ${airportData.flightNumber}` : ''}
${airportData.direction === "from" ? t('booking.destination3') : t('booking.origin3')}: ${airportData.destination || t('booking.notSpecified2')}
${airportData.luggage ? `${t('booking.luggage2')} ${airportData.luggage}` : ''}
${airportData.specialRequirements ? `${t('booking.specialRequirements3')} ${airportData.specialRequirements}` : ''}
        `;
      } else {
        // Para otros servicios
        message += `
${vehicleType ? `Tipo de Vehículo: ${vehicleType}` : ''}
${hours ? `Horas contratadas: ${hours} hora${hours !== 1 ? 's' : ''}` : ''}
Fecha: ${formData.fecha || "No especificada"}
Hora: ${formData.hora || "No especificada"}
Pasajeros: ${passengers || formData.pasajeros}
${defaultRoute?.from ? `Punto de Recogida: ${defaultRoute.from}` : ''}
${hours ? '' : `Origen: ${defaultRoute?.from || "No especificado"}`}
${hours ? '' : `Destino: ${defaultRoute?.to || "No especificado"}`}
${priceLabel ? `Precio estimado: ${priceLabel}` : ''}
        `;
      }

      message += `

${t('booking.additionalMessage2')}
${formData.mensaje || t('booking.none')}

${t('booking.contactData')}
- ${t('booking.name')} ${formData.nombre}
- ${t('booking.email2')} ${formData.email}
${!isAuthenticated && formData.telefono ? `- ${t('booking.phone2')} ${formData.telefono}` : ''}
      `.trim();

      // Preparar datos de la reserva
      const bookingData: any = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        serviceName: serviceName,
        serviceType: serviceType,
        pasajeros: parseInt(formData.pasajeros) || passengers || 1,
      };

      // Solo incluir teléfono si el usuario no está autenticado o si lo proporciona
      if (!isAuthenticated && formData.telefono && formData.telefono.trim()) {
        bookingData.telefono = formData.telefono.trim();
      }
      
      if (formData.fecha) {
        bookingData.fecha = formData.fecha;
      }
      
      if (formData.hora) {
        bookingData.hora = formData.hora;
      }
      
      if (priceLabel) {
        bookingData.priceLabel = priceLabel;
      }
      
      if (formData.mensaje && formData.mensaje.trim()) {
        bookingData.mensaje = formData.mensaje.trim();
      }
      
      if (message && message.trim()) {
        bookingData.details = message.trim();
      }

      if (serviceId) {
        bookingData.serviceId = serviceId;
      }

      if (calculatedPrice) {
        bookingData.calculatedPrice = calculatedPrice;
      }

      if (customData) {
        bookingData.customData = customData;
        bookingData.routeData = {
          from: customData.origin,
          to: customData.destination,
        };
      }

      if (airportData) {
        bookingData.airportData = airportData;
      }

      if (defaultRoute) {
        bookingData.routeData = {
          from: defaultRoute.from,
          to: defaultRoute.to,
        };
      }

      console.log('📤 Enviando datos de reserva:', bookingData);
      const response = await bookingsAPI.create(bookingData);
      console.log('📥 Respuesta completa del servidor:', JSON.stringify(response, null, 2));
      console.log('📥 Tipo de respuesta:', typeof response);
      console.log('📥 response.success:', response?.success);
      console.log('📥 response.error:', response?.error);
      console.log('📥 response.errors:', response?.errors);
      console.log('📥 response.message:', response?.message);

      if (response && response.success) {
        // Obtener el ID de la reserva creada (backend devuelve data: booking con _id)
        const data = response.data as { _id?: string; id?: string; booking?: { _id?: string } } | undefined;
        const rawId = data?._id ?? data?.id ?? data?.booking?._id;
        const bookingId = rawId != null ? String(rawId) : '';

        if (bookingId) {
          // Redirigir de inmediato a la página de pago
          router.push(`/pago/${bookingId}`);
        } else {
          // Si no hay bookingId, mostrar éxito
          setSuccess(true);
          setFormData({
            nombre: "",
            email: "",
            telefono: "",
            fecha: "",
            hora: "",
            pasajeros: "1",
            mensaje: "",
          });
          setTimeout(() => setSuccess(false), 5000);
        }
      } else {
        // Mostrar error detallado
        let errorMessage = t('booking.errorSending');
        
        if (response) {
          if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
            errorMessage = response.errors.map((e: any) => e.msg || e.message || e.field || '').filter(Boolean).join(', ');
          } else if (response.error) {
            errorMessage = response.error;
          } else if (response.message) {
            errorMessage = response.message;
          }
        }
        
        console.error('❌ Error en reserva - Objeto completo:', response);
        console.error('❌ Error en reserva - String:', JSON.stringify(response));
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('❌ Excepción al crear reserva:', err);
      setError(err.message || t('booking.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('booking.requestReservation')}</h3>
        <p className="text-gray-600">{t('booking.completeForm')}</p>
        {priceLabel && (
          <p className="text-lg font-semibold text-[var(--yass-gold)] mt-2">{priceLabel}</p>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 mb-1">¡Solicitud enviada!</h4>
            <p className="text-sm text-green-700">
              Hemos recibido tu solicitud. Te contactaremos pronto para confirmar los detalles.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 mb-1">{t('common.error')}</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Información Personal */}
        {isAuthenticated ? (
          // Formulario simplificado para usuarios autenticados
          <div>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {t('booking.usingProfileData') || 'Usando datos de tu perfil'}
              </p>
            </div>
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.passengerName') || 'Nombre del Pasajero'} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={loading || loadingProfile}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={t('booking.passengerNamePlaceholder') || 'Nombre completo del pasajero'}
                />
              </div>
            </div>
          </div>
        ) : (
          // Formulario completo para usuarios no autenticados
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('booking.fullName')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={t('booking.fullNamePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('booking.email')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={t('booking.emailPlaceholder')}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.phone')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={t('booking.phonePlaceholder')}
                />
              </div>
            </div>
          </>
        )}

        {/* Detalles del Viaje */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('booking.tripDetails')}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.date')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  disabled={loading || loadingProfile}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="hora" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.time')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="hora"
                  name="hora"
                  type="time"
                  value={formData.hora}
                  onChange={handleChange}
                  required
                  disabled={loading || loadingProfile}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="mt-4">
              <label htmlFor="pasajeros" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.numberOfPassengers')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="pasajeros"
                  name="pasajeros"
                  value={formData.pasajeros}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {[...Array(18)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? t('common.passenger') : t('common.passengers')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje Adicional - Solo para usuarios no autenticados */}
        {!isAuthenticated && (
          <div>
            <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('booking.additionalMessage')}
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                disabled={loading}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                placeholder={t('booking.additionalMessagePlaceholder')}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || success || loadingProfile}
          className="w-full bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--yass-gold)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading || loadingProfile ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {loadingProfile ? (t('booking.loadingProfile') || 'Cargando perfil...') : t('booking.sending')}
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              {t('booking.sent')}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t('booking.sendRequest')}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          {t('booking.acceptContact')}
        </p>
      </form>
    </div>
  );
}
