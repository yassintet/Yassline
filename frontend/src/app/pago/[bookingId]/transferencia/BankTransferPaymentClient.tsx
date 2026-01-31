"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { paymentsAPI, bookingsAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, Copy, Building2, Check } from "lucide-react";

function getBookingIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(/^\/pago\/([^/]+)/);
  const id = match ? match[1] : null;
  if (id && id !== "placeholder" && /^[a-f0-9]{24}$/i.test(id)) return id;
  return id || null;
}

export default function BankTransferPaymentClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const idFromUrl = getBookingIdFromUrl();
  const bookingId = (idFromUrl ?? params?.bookingId ?? "") as string;
  const paymentId = searchParams?.get("paymentId");

  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAsPaid, setMarkingAsPaid] = useState(false);
  const [reference, setReference] = useState("");
  const [transferDate, setTransferDate] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const bookingResponse = await bookingsAPI.getByIdForPayment(bookingId);
        if (bookingResponse.success && bookingResponse.data) setBooking(bookingResponse.data);
        if (paymentId) {
          const paymentResponse = await paymentsAPI.getById(paymentId);
          if (paymentResponse.success && paymentResponse.data) setPayment(paymentResponse.data);
        }
        const bankResponse = await paymentsAPI.getBankInfo();
        if (bankResponse.success && bankResponse.data) setBankInfo(bankResponse.data);
      } catch (err: any) {
        setError(err.message || "Error al cargar información");
      } finally {
        setLoading(false);
      }
    };
    if (bookingId && bookingId !== "placeholder") loadData();
    else {
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
        reference: reference || undefined,
        transferDate: transferDate || undefined,
      });
      if (response.success) router.push(`/reservas/${bookingId}?paymentMarked=true`);
      else setError(response.error || "Error al marcar como pagado");
    } catch (err: any) {
      setError(err.message || "Error al marcar como pagado");
    } finally {
      setMarkingAsPaid(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

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
            <p className="text-gray-600 mb-6">{error || "No se pudo cargar la información"}</p>
            <button onClick={() => router.push(`/reservas/${bookingId}`)} className="px-6 py-3 bg-[var(--yass-gold)] text-white rounded-lg hover:bg-[var(--yass-gold-light)] transition-colors">
              Volver a Detalles de Reserva
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button onClick={() => router.push(`/reservas/${bookingId}`)} className="flex items-center text-gray-600 hover:text-[var(--yass-gold)] mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a Detalles de Reserva
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transferencia Bancaria</h1>
            <p className="text-gray-600">Reserva: {booking.serviceName || booking.reservationNumber}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de Reserva</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Servicio</p>
                <p className="font-semibold">{booking.serviceName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="font-bold text-xl text-[var(--yass-gold)]">{amount.toLocaleString()} {payment.currency || "MAD"}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <Building2 className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Información Bancaria</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">Realiza la transferencia bancaria a nuestra cuenta con la siguiente información:</p>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Banco</p>
                    <p className="font-semibold text-gray-900">{bankInfo?.bankName || "CIH Bank"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Titular de la Cuenta</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-semibold text-gray-900">{bankInfo?.accountHolder || "Yassline Tour"}</p>
                      <button onClick={() => copyToClipboard(bankInfo?.accountHolder || "Yassline Tour")} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600" title="Copiar">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">IBAN (cuenta para recibir pagos)</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono text-lg font-bold text-gray-900">MA64 2307 2061 8099 9211 0086 0008</p>
                      <button onClick={() => copyToClipboard("MA64 2307 2061 8099 9211 0086 0008")} className="p-2 rounded-lg bg-[var(--yass-gold)]/10 hover:bg-[var(--yass-gold)]/20 text-[var(--yass-gold)]" title="Copiar IBAN">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Código SWIFT</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-lg font-bold text-gray-900">CIHMMAMC</p>
                      <button onClick={() => copyToClipboard("CIHMMAMC")} className="p-2 rounded-lg bg-[var(--yass-gold)]/10 hover:bg-[var(--yass-gold)]/20 text-[var(--yass-gold)]" title="Copiar SWIFT">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Monto a transferir</p>
                    <p className="font-bold text-xl text-[var(--yass-gold)]">{amount.toLocaleString()} {payment.currency || "MAD"}</p>
                  </div>
                  {bankInfo?.suggestedReference && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Referencia sugerida</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-sm text-gray-900">{bankInfo.suggestedReference}</p>
                        <button onClick={() => copyToClipboard(bankInfo.suggestedReference)} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {bankInfo?.bankAddress && (
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-700">Dirección del banco</p>
                  <p className="text-gray-900">{bankInfo.bankAddress}</p>
                </div>
              )}
              <div className="bg-[var(--yass-gold)]/5 border-2 border-[var(--yass-gold)]/20 rounded-xl p-5">
                <p className="text-sm text-gray-800 leading-relaxed">
                  <strong className="font-bold text-gray-900">Confirmación en 48h:</strong> Una vez realizada la transferencia, marca como pagado en esta página. Nuestro equipo revisará el ingreso y te confirmará el pago en un plazo máximo de <strong>48 horas</strong>.
                </p>
              </div>
            </div>
          </div>
          {payment.status === "pending" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmar Transferencia Realizada</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número de referencia (opcional)</label>
                  <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ej: REF-12345" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de transferencia (opcional)</label>
                  <input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] transition-all" />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                <button onClick={handleMarkAsPaid} disabled={markingAsPaid} className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {markingAsPaid ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Procesando...</>) : (<><Check className="w-5 h-5 mr-2" />Confirmar Transferencia Realizada</>)}
                </button>
                <p className="text-xs text-gray-600 text-center bg-gray-50 rounded-xl p-4 border border-gray-200">Confirmación en 48h: al hacer clic en "Confirmar Transferencia Realizada", tu pago se enviará a revisión. Te confirmaremos el pago en un plazo máximo de <strong>48 horas</strong> una vez verificado el ingreso.</p>
              </div>
            </div>
          )}
          {payment.status === "pending_review" && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
                <div>
                  <h3 className="font-bold text-yellow-900">Pago en Revisión</h3>
                  <p className="text-yellow-700">Tu transferencia ha sido marcada como realizada y está siendo revisada por la administración. Recibirás una notificación cuando se confirme el pago (máximo 48 horas).</p>
                </div>
              </div>
            </div>
          )}
          {payment.status === "completed" && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-bold text-green-900">Pago Confirmado</h3>
                  <p className="text-green-700">Tu transferencia ha sido confirmada exitosamente. Tu reserva está confirmada.</p>
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
