"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { paymentsAPI, bookingsAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  Copy,
  Wallet,
  Check
} from "lucide-react";

// En Hostinger se sirve placeholder; leer ID real desde la URL.
function getBookingIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(/^\/pago\/([^/]+)/);
  const id = match ? match[1] : null;
  if (id && id !== "placeholder" && /^[a-f0-9]{24}$/i.test(id)) return id;
  return id || null;
}

export default function BinancePaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const idFromUrl = getBookingIdFromUrl();
  const bookingId = (idFromUrl ?? params?.bookingId ?? "") as string;
  const paymentId = searchParams?.get('paymentId');

  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAsPaid, setMarkingAsPaid] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar reserva
        const bookingResponse = await bookingsAPI.getByIdForPayment(bookingId);
        if (bookingResponse.success && bookingResponse.data) {
          setBooking(bookingResponse.data);
        }

        // Cargar pago
        if (paymentId) {
          const paymentResponse = await paymentsAPI.getById(paymentId);
          if (paymentResponse.success && paymentResponse.data) {
            setPayment(paymentResponse.data);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar información');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId && bookingId !== "placeholder") {
      loadData();
    } else {
      setLoading(false);
      if (!bookingId) setError("ID de reserva no válido");
    }
  }, [bookingId, paymentId]);

  const handleMarkAsPaid = async () => {
    if (!paymentId) return;

    setMarkingAsPaid(true);
    setError("");

    try {
      const response = await paymentsAPI.markAsPaid(paymentId, {
        transactionHash: transactionHash || undefined,
      });

      if (response.success) {
        router.push(`/reservas/${bookingId}?paymentMarked=true`);
      } else {
        setError(response.error || 'Error al marcar como pagado');
      }
    } catch (err: any) {
      setError(err.message || 'Error al marcar como pagado');
    } finally {
      setMarkingAsPaid(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--yass-gold)]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking || !payment) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información'}</p>
            <button
              onClick={() => router.push(`/reservas/${bookingId}`)}
              className="px-6 py-3 bg-[var(--yass-gold)] text-white rounded-lg hover:bg-[var(--yass-gold-light)] transition-colors"
            >
              Volver a Detalles de Reserva
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const amount = booking.total || booking.calculatedPrice || booking.proposedPrice || 0;
  const binanceInfo = payment.binance || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <Navbar />
      
      <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          opacity: 0.1
        }}></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => router.push(`/reservas/${bookingId}`)}
              className="flex items-center text-white/90 hover:text-white mb-6 transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Volver a Detalles de Reserva</span>
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-2xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
                  Pago con Binance Pay
                </h1>
                <p className="text-white/90 text-lg">
                  Reserva: {booking.serviceName || booking.reservationNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100 transform hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Resumen de Reserva</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Servicio</p>
                <p className="text-lg font-bold text-gray-900">{booking.serviceName}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wider mb-2">Monto Total</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {amount.toLocaleString()} {payment.currency || 'MAD'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Instrucciones de Pago Binance Pay</h2>
                <p className="text-gray-600 mt-1">Sigue estos pasos para completar tu transferencia</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg">
                <div className="space-y-5">
                  <div className="p-4 bg-white rounded-xl border border-yellow-100 shadow-sm">
                    <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                      ID de Cuenta Binance
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xl font-bold text-gray-900 break-all">{binanceInfo.accountId || '89150838'}</p>
                      <button
                        onClick={() => copyToClipboard(binanceInfo.accountId || '89150838')}
                        className="flex-shrink-0 p-3 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-600 transition-all duration-200 hover:scale-110 shadow-md"
                        title="Copiar"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {binanceInfo.walletAddress && (
                    <div className="p-4 bg-white rounded-xl border border-yellow-100 shadow-sm">
                      <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                        Dirección de Wallet
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-sm font-bold text-gray-900 break-all">{binanceInfo.walletAddress}</p>
                        <button
                          onClick={() => copyToClipboard(binanceInfo.walletAddress)}
                          className="flex-shrink-0 p-3 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-600 transition-all duration-200 hover:scale-110 shadow-md"
                          title="Copiar"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-yellow-100 shadow-sm">
                      <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Red</p>
                      <p className="text-lg font-bold text-gray-900">{binanceInfo.network || 'BSC'}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-yellow-100 shadow-sm">
                      <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Moneda</p>
                      <p className="text-lg font-bold text-gray-900">{binanceInfo.currency || 'USDT'}</p>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl shadow-lg border-2 border-yellow-300">
                    <p className="text-xs font-bold text-white/90 uppercase tracking-wider mb-2">Monto a Transferir</p>
                    <p className="text-3xl font-extrabold text-white">{amount.toLocaleString()} {payment.currency || 'MAD'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-900 mb-1">Confirmación Instantánea</p>
                    <p className="text-sm text-green-800">
                      Una vez realizado el pago, marca como pagado y nuestro equipo verificará la transacción <strong className="font-bold">inmediatamente</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {payment.status === 'pending' && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Confirmar Pago Realizado</h3>
                  <p className="text-gray-600 mt-1">Completa los datos de tu transacción</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Hash de Transacción <span className="text-gray-400 font-normal normal-case">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      placeholder="Ingresa el hash de tu transacción"
                      className="w-full px-5 py-4 text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-200 bg-white font-mono hover:border-gray-300"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Opcional: Si tienes el hash de la transacción, puedes ingresarlo para facilitar la verificación instantánea.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 shadow-md">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleMarkAsPaid}
                  disabled={markingAsPaid}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 via-orange-600 to-amber-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  {markingAsPaid ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                      <span className="relative z-10">Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6 relative z-10" />
                      <span className="relative z-10">Marcar como Pagado</span>
                    </>
                  )}
                </button>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
                  <p className="text-xs text-blue-800 text-center leading-relaxed">
                    <strong className="font-bold">Confirmación Instantánea:</strong> Al hacer clic en "Marcar como Pagado", tu pago será enviado a revisión. 
                    La administración confirmará el pago <strong className="font-bold">inmediatamente</strong> una vez verificado el ingreso.
                  </p>
                </div>
              </div>
            </div>
          )}

          {payment.status === 'pending_review' && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">Pago en Revisión</h3>
                  <p className="text-yellow-800 leading-relaxed">
                    Tu pago ha sido marcado como realizado y está siendo revisado por la administración. 
                    Recibirás una notificación cuando se confirme el pago <strong className="font-bold">inmediatamente</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {payment.status === 'completed' && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">¡Pago Confirmado!</h3>
                  <p className="text-green-800 leading-relaxed">
                    Tu pago ha sido confirmado exitosamente. Tu reserva está confirmada y lista.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
