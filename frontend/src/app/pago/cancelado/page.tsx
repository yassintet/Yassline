"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { XCircle, ArrowLeft, Home } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function PagoCanceladoPage() {
  const { t } = useI18n();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--yass-cream)] pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('payment.cancelledTitle') || 'Pago Cancelado'}
              </h1>
              <p className="text-gray-600">
                {t('payment.cancelledMessage') || 'El pago ha sido cancelado. Puedes intentar nuevamente cuando estés listo.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/mis-reservas"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
                {t('payment.backToBookings') || 'Volver a Mis Reservas'}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                <Home className="h-5 w-5" />
                {t('common.home') || 'Inicio'}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
