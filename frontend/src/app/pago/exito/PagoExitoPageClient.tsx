"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import { paymentsAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export default function PagoExitoPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    if (paymentId) {
      const fetchPayment = async () => {
        try {
          const response = await paymentsAPI.getById(paymentId);
          if (response.success && response.data) {
            setPayment(response.data as any);
          }
        } catch (err) {
          console.error("Error cargando pago:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPayment();
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--yass-cream)] pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("payment.successTitle") || "¡Pago Exitoso!"}
              </h1>
              <p className="text-gray-600">
                {t("payment.successMessage") ||
                  "Tu pago ha sido procesado correctamente"}
              </p>
            </div>

            {payment && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <h2 className="font-bold text-gray-900 mb-4">
                  {t("payment.paymentDetails") || "Detalles del Pago"}
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>{t("payment.amount") || "Monto"}:</strong>{" "}
                    {payment.amount} {payment.currency || "MAD"}
                  </p>
                  <p>
                    <strong>{t("payment.method") || "Método"}:</strong>{" "}
                    {payment.paymentMethod}
                  </p>
                  <p>
                    <strong>{t("payment.status") || "Estado"}:</strong>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-sm ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status === "completed"
                        ? t("payment.completed") || "Completado"
                        : t("payment.pending") || "Pendiente"}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {payment?.bookingId && (
                <Link
                  href={`/reservas/${payment.bookingId}`}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  {t("payment.viewBooking") || "Ver Reserva"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              <Link
                href="/mis-reservas"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                {t("payment.myBookings") || "Mis Reservas"}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                <Home className="h-5 w-5" />
                {t("common.home") || "Inicio"}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
