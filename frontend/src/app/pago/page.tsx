"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentMethodSelector, { PaymentMethod } from "@/components/PaymentMethodSelector";
import { bookingsAPI } from "@/lib/api";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useI18n } from "@/lib/i18n/context";

function PagoPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!bookingId) {
      setError('ID de reserva no proporcionado');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await bookingsAPI.getByIdForPayment(bookingId);
        if (response.success && response.data) {
          setBooking(response.data);
        } else {
          setError(response.error || 'No se pudo cargar la reserva');
        }
      } catch (err: any) {
        setError(err?.message || 'Error al cargar la reserva');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    // Redirigir a la página de pago específica del método
    const methodMap: Record<PaymentMethod, string> = {
      'cash': 'efectivo',
      'bank_transfer': 'transferencia',
      'binance': 'binance',
      'redotpay': 'redotpay',
      'moneygram': 'moneygram'
    };
    router.push(`/pago/${bookingId}/${methodMap[method]}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--yass-cream)] pt-24 pb-16">
          <div className="container mx-auto px-4">
            <LoadingState />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--yass-cream)] pt-24 pb-16">
          <div className="container mx-auto px-4">
            <ErrorState
              message={error || 'Reserva no encontrada'}
            />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const amount = booking.total || booking.calculatedPrice || booking.proposedPrice || 0;
  const customerName = booking.nombre || '';
  const customerEmail = booking.email || '';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--yass-cream)] pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('payment.title') || 'Procesar Pago'}
            </h1>
            <p className="text-gray-600">
              {t('payment.subtitle') || 'Completa el pago para confirmar tu reserva'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('payment.bookingDetails') || 'Detalles de la Reserva'}
            </h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>{t('payment.service') || 'Servicio'}:</strong> {booking.serviceName}</p>
              {booking.reservationNumber && (
                <p><strong>{t('payment.reservationNumber') || 'Número de Reserva'}:</strong> {booking.reservationNumber}</p>
              )}
              {booking.fecha && (
                <p><strong>{t('payment.date') || 'Fecha'}:</strong> {new Date(booking.fecha).toLocaleDateString()}</p>
              )}
              {booking.hora && (
                <p><strong>{t('payment.time') || 'Hora'}:</strong> {booking.hora}</p>
              )}
            </div>
          </div>

          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={handleSelectMethod}
            amount={amount}
            currency="MAD"
            loading={loading}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function PagoPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="min-h-screen bg-[var(--yass-cream)] pt-24 pb-16">
            <div className="container mx-auto px-4">
              <LoadingState />
            </div>
          </div>
          <Footer />
        </>
      }
    >
      <PagoPageContent />
    </Suspense>
  );
}
