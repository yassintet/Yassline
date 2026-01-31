"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentMethodSelector, { PaymentMethod } from "@/components/PaymentMethodSelector";
import { paymentsAPI, bookingsAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { authUtils } from "@/lib/auth";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  QrCode,
  Copy,
  ExternalLink
} from "lucide-react";
import Image from "next/image";

// En Hostinger se sirve /pago/placeholder.html para /pago/ID-real; useParams() puede devolver "placeholder".
// Leer siempre el ID real desde la URL del navegador.
function getBookingIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(/^\/pago\/([^/]+)/);
  const id = match ? match[1] : null;
  if (id && id !== "placeholder" && /^[a-f0-9]{24}$/i.test(id)) return id;
  return id || null;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  // Preferir ID de la URL (correcto cuando .htaccess sirve placeholder.html)
  const idFromUrl = getBookingIdFromUrl();
  const bookingId = (idFromUrl ?? params?.bookingId ?? "") as string;

  const [booking, setBooking] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false); // Cambiar a false para mostrar contenido inmediatamente
  const [processing, setProcessing] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [bankTransferData, setBankTransferData] = useState({
    reference: "",
    bankName: "",
    accountNumber: "",
    transferDate: "",
    proofImage: "",
  });
  const [binanceHash, setBinanceHash] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setInitialLoad(false);
      return;
    }
    if (bookingId === 'placeholder') {
      setError('ID de reserva no válido. Usa el enlace que recibiste tras hacer la reserva.');
      setInitialLoad(false);
      return;
    }

    const loadBooking = async () => {
      const apiUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL
        : 'NEXT_PUBLIC_API_URL no definido en build';
      const forPaymentUrl = `${apiUrl}/api/bookings/${bookingId}/for-payment`;
      console.log('[Pago] Cargando reserva:', { bookingId, forPaymentUrl });

      try {
        const [bookingResponse, paymentResponse] = await Promise.all([
          bookingsAPI.getByIdForPayment(bookingId),
          paymentsAPI.getByBooking(bookingId).catch((e) => {
            console.warn('[Pago] getByBooking (opcional):', e?.message || e);
            return { success: false, data: [] };
          })
        ]);

        console.log('[Pago] Respuesta reserva:', {
          success: bookingResponse.success,
          hasData: !!bookingResponse.data,
          error: bookingResponse.error,
        });

        if (bookingResponse.success && bookingResponse.data) {
          setBooking(bookingResponse.data);

          const paymentData = paymentResponse.data as any;
          if (paymentResponse.success && paymentData && Array.isArray(paymentData) && paymentData.length > 0) {
            const existingPayment = paymentData[0];
            setPayment(existingPayment);
            setSelectedMethod(existingPayment.paymentMethod);
            if (existingPayment.status === 'completed') {
              setSuccess(true);
            }
          }
        } else {
          const errMsg = bookingResponse.error || t('booking.notFound') || 'Reserva no encontrada';
          console.error('[Pago] Reserva no cargada:', errMsg, bookingResponse);
          setError(errMsg);
        }
      } catch (err: any) {
        const errMsg = err?.message || 'Error al cargar la reserva. Comprueba tu conexión y que la API esté disponible.';
        console.error('[Pago] Error al cargar:', errMsg, err);
        setError(errMsg);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    loadBooking();
  }, [bookingId, t]);

  const handleCreatePayment = async () => {
    if (!selectedMethod || !booking) return;

    const rawAmount = booking.total ?? booking.calculatedPrice ?? booking.proposedPrice ?? 0;
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount < 0.01) {
      setError('El importe de la reserva no es válido. Contacta con nosotros.');
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const paymentData: any = {
        bookingId,
        paymentMethod: selectedMethod,
        amount,
        currency: 'MAD',
      };

      if (selectedMethod === 'bank_transfer') {
        paymentData.paymentDetails = bankTransferData;
      }

      const response = await paymentsAPI.create(paymentData);

      if (response.success && response.data) {
        const responseData = response.data as any;
        setPayment(responseData.payment);

        if (selectedMethod === 'cash') {
          router.prefetch(`/reservas/${bookingId}?paymentMethod=cash`);
          router.push(`/reservas/${bookingId}?paymentMethod=cash`);
          return;
        }

        const paymentId = responseData.payment?._id ?? (responseData as any).paymentId;
        const base = `/pago/${bookingId}`;
        if (selectedMethod === 'binance') {
          router.push(`${base}/binance?paymentId=${paymentId}`);
        } else if (selectedMethod === 'redotpay') {
          router.push(`${base}/redotpay?paymentId=${paymentId}`);
        } else if (selectedMethod === 'bank_transfer') {
          router.push(`${base}/transferencia?paymentId=${paymentId}`);
        } else if (selectedMethod === 'moneygram') {
          router.push(`${base}/moneygram?paymentId=${paymentId}`);
        }
      } else {
        const errMsg = response.errors?.map((e: { msg?: string }) => e.msg).filter(Boolean).join(', ')
          || response.error
          || response.message
          || 'Error al crear el pago';
        setError(errMsg);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyBinance = async () => {
    if (!payment || !binanceHash) return;

    setProcessing(true);
    setError("");

    try {
      const response = await paymentsAPI.verify(payment._id, {
        transactionHash: binanceHash,
        network: 'BSC',
      });

      if (response.success && response.data) {
        setSuccess(true);
        setPayment(response.data as any);
      } else {
        setError(response.error || 'Error al verificar el pago');
      }
    } catch (err: any) {
      setError(err.message || 'Error al verificar el pago');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías mostrar un toast de confirmación
  };

  // Solo mostrar loading si es la carga inicial y no hay booking
  if (initialLoad && !booking) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--yass-gold)]" />
            <div className="absolute inset-0 border-4 border-[var(--yass-gold)]/20 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Cargando información de pago...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reserva no encontrada</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/mis-reservas')}
              className="px-6 py-3 bg-[var(--yass-gold)] text-white rounded-lg hover:bg-[var(--yass-gold-light)] transition-colors"
            >
              Volver a Mis Reservas
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const amount = booking.total || booking.calculatedPrice || booking.proposedPrice || 0;

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Mejorado */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/reservas/${bookingId}`)}
              className="flex items-center text-gray-600 hover:text-[var(--yass-gold)] mb-6 transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Volver a Detalles de Reserva</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] bg-clip-text text-transparent">
                  {t('payment.title') || 'Método de Pago'}
                </h1>
                <p className="text-lg text-gray-600">
                  Reserva: <span className="font-semibold text-gray-900">{booking.serviceName || booking.reservationNumber}</span>
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-2xl p-6 shadow-xl">
                  <p className="text-white/80 text-sm mb-1">Total a Pagar</p>
                  <p className="text-3xl font-bold text-white">
                    {amount.toLocaleString()} <span className="text-xl">MAD</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de Reserva Mejorado */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-1 h-12 bg-gradient-to-b from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-gray-900">Resumen de Reserva</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Servicio</p>
                <p className="text-lg font-bold text-gray-900">{booking.serviceName}</p>
              </div>
              {booking.fecha && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Fecha</p>
                  <p className="text-lg font-bold text-gray-900">{booking.fecha}</p>
                </div>
              )}
              {booking.hora && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Hora</p>
                  <p className="text-lg font-bold text-gray-900">{booking.hora}</p>
                </div>
              )}
            </div>
            {/* Monto Total en móvil */}
            <div className="md:hidden mt-6 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-xl p-5">
                <p className="text-white/80 text-sm mb-1">Total a Pagar</p>
                <p className="text-3xl font-bold text-white">
                  {amount.toLocaleString()} <span className="text-xl">MAD</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mensajes de éxito/error Mejorados */}
          {success && payment?.status === 'completed' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 rounded-full p-2">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 text-lg mb-1">¡Pago Completado!</h3>
                  <p className="text-green-700">Tu pago ha sido confirmado exitosamente. Tu reserva está confirmada.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 mb-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="bg-red-500 rounded-full p-2">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 text-lg mb-1">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Selector de Método de Pago */}
          {!payment && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onSelectMethod={setSelectedMethod}
                amount={amount}
                currency="MAD"
                loading={processing}
              />

              {selectedMethod && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <button
                    onClick={handleCreatePayment}
                    disabled={processing}
                    className="w-full py-5 bg-gradient-to-r from-[var(--yass-gold)] via-[#FF4D6D] to-[var(--yass-gold-light)] text-white rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                    {processing ? (
                      <span className="flex items-center justify-center relative z-10">
                        <Loader2 className="w-6 h-6 animate-spin mr-3" />
                        <span>{t('payment.processing') || 'Procesando...'}</span>
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center justify-center">
                        <span className="mr-2">💳</span>
                        Pagar {amount.toLocaleString()} MAD
                      </span>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Al continuar, serás redirigido según el método de pago seleccionado
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Detalles según método de pago */}
          {payment && payment.paymentMethod === 'cash' && (
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('payment.cash.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('payment.cash.instructions')}
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>{t('payment.cash.note')}</strong>
                </p>
              </div>
            </div>
          )}

          {payment && payment.paymentMethod === 'bank_transfer' && (
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('payment.bankTransfer.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('payment.bankTransfer.instructions')}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('payment.bankTransfer.reference')}
                  </label>
                  <input
                    type="text"
                    value={bankTransferData.reference}
                    onChange={(e) => setBankTransferData({ ...bankTransferData, reference: e.target.value })}
                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] bg-white"
                    placeholder="Número de referencia de transferencia"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('payment.bankTransfer.bankName')}
                    </label>
                    <input
                      type="text"
                      value={bankTransferData.bankName}
                      onChange={(e) => setBankTransferData({ ...bankTransferData, bankName: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('payment.bankTransfer.transferDate')}
                    </label>
                    <input
                      type="date"
                      value={bankTransferData.transferDate}
                      onChange={(e) => setBankTransferData({ ...bankTransferData, transferDate: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] bg-white"
                    />
                  </div>
                </div>

                {payment.status === 'pending' && (
                  <button
                    onClick={async () => {
                      setProcessing(true);
                      try {
                        const response = await paymentsAPI.confirm(payment._id, {
                          bankTransfer: bankTransferData,
                        });
                        if (response.success && response.data) {
                          setSuccess(true);
                          setPayment(response.data as any);
                        } else {
                          setError(response.error || 'Error al confirmar el pago');
                        }
                      } catch (err: any) {
                        setError(err.message);
                      } finally {
                        setProcessing(false);
                      }
                    }}
                    disabled={processing || !bankTransferData.reference}
                    className="w-full py-3 bg-[var(--yass-gold)] text-white rounded-lg font-semibold hover:bg-[var(--yass-gold-light)] transition-colors disabled:opacity-50"
                  >
                    {processing ? t('payment.processing') : 'Confirmar Pago'}
                  </button>
                )}
              </div>
            </div>
          )}

          {payment && payment.paymentMethod === 'binance' && payment.binance && (
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('payment.binance.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('payment.binance.instructions')}
              </p>

              {payment.binance.qrCode && (
                <div className="mb-6 text-center">
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <QrCode className="w-48 h-48 mx-auto" />
                    {/* Aquí podrías mostrar un QR code real usando una librería */}
                  </div>
                </div>
              )}

              {payment.binance.walletAddress && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('payment.binance.walletAddress')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={payment.binance.walletAddress}
                      readOnly
                      className="flex-1 px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-xl bg-white"
                    />
                    <button
                      onClick={() => copyToClipboard(payment.binance.walletAddress)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {payment.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('payment.binance.transactionHash')}
                    </label>
                    <input
                      type="text"
                      value={binanceHash}
                      onChange={(e) => setBinanceHash(e.target.value)}
                      placeholder={t('payment.binance.enterHash')}
                      className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] bg-white"
                    />
                  </div>
                  <button
                    onClick={handleVerifyBinance}
                    disabled={processing || !binanceHash}
                    className="w-full py-3 bg-[var(--yass-gold)] text-white rounded-lg font-semibold hover:bg-[var(--yass-gold-light)] transition-colors disabled:opacity-50"
                  >
                    {processing ? t('payment.processing') : t('payment.binance.verify')}
                  </button>
                </div>
              )}
            </div>
          )}

          {payment && payment.paymentMethod === 'redotpay' && payment.redotpay && (
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('payment.redotpay.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('payment.redotpay.instructions')}
              </p>
              
              {payment.redotpay.paymentUrl && (
                <a
                  href={payment.redotpay.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-[var(--yass-gold)] text-white rounded-lg font-semibold hover:bg-[var(--yass-gold-light)] transition-colors"
                >
                  <span>{t('payment.redotpay.redirecting')}</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
