"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { userAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { 
  Star, 
  TrendingUp, 
  Calendar, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Gift,
  Award
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n/context";

export default function HistorialPuntosPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      if (!authUtils.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const response = await userAPI.getPointsHistory({ page: currentPage, limit });
      if (response.success && response.data) {
        setHistory(Array.isArray(response.data) ? response.data : []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(response.error || t('pointsHistory.error'));
      }
    } catch (err: any) {
      console.error('Error cargando historial:', err);
      setError(err.message || t('pointsHistory.error'));
    } finally {
      setLoading(false);
    }
  }, [router, t, currentPage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      booking_confirmed: t('pointsHistory.reason.booking'),
      reward_redeemed: t('pointsHistory.reason.reward'),
      admin_adjustment: t('pointsHistory.reason.admin'),
      bonus: t('pointsHistory.reason.bonus'),
    };
    return labels[reason] || reason;
  };

  const getReasonIcon = (reason: string) => {
    if (reason === 'booking_confirmed') return Award;
    if (reason === 'reward_redeemed') return Gift;
    return Star;
  };

  if (loading && history.length === 0) {
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

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/perfil" className="inline-flex items-center gap-2 text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] transition-colors mb-4">
              <ArrowLeft className="h-5 w-5" />
              {t('pointsHistory.back')}
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('pointsHistory.title')}</h1>
            <p className="text-gray-600">{t('pointsHistory.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {history.length === 0 ? (
            <EmptyState
              icon="gift"
              title={t('pointsHistory.noHistory')}
              message={t('pointsHistory.noHistoryMessage')}
            />
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {history.map((item, index) => {
                  const ReasonIcon = getReasonIcon(item.reason);
                  return (
                    <div key={index} className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-[var(--yass-gold)]/10 rounded-full p-3">
                            <ReasonIcon className="h-6 w-6 text-[var(--yass-gold)]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                {getReasonLabel(item.reason)}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                item.points > 0 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {item.points > 0 ? '+' : ''}{item.points} {t('pointsHistory.points')}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-gray-600 mb-2">{item.description}</p>
                            )}
                            {item.bookingId && (
                              <p className="text-sm text-gray-500 mb-2">
                                {t('pointsHistory.booking')}: {item.bookingId.serviceName || item.bookingId._id}
                              </p>
                            )}
                            {item.bookingPrice && item.bookingPrice > 0 && (
                              <p className="text-sm text-gray-500">
                                {t('pointsHistory.bookingPrice')}: {item.bookingPrice.toLocaleString()} MAD
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(item.createdAt).toLocaleDateString(
                                  language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES',
                                  { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">{t('pointsHistory.before')}</p>
                          <p className="text-lg font-bold text-gray-700">{item.pointsBefore.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 mt-2 mb-1">{t('pointsHistory.after')}</p>
                          <p className="text-lg font-bold text-[var(--yass-gold)]">{item.pointsAfter.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="text-gray-700">
                    {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
