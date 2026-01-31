"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { userAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { 
  Bell, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  CheckCheck,
  Gift,
  Award,
  Calendar,
  MessageSquare
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n/context";

export default function NotificacionesPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const limit = 20;

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      if (!authUtils.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const response = await userAPI.getNotifications({ 
        page: currentPage, 
        limit,
        unreadOnly: unreadOnly 
      });
      if (response.success && response.data) {
        setNotifications(Array.isArray(response.data) ? response.data : []);
        setTotalPages((response as any).totalPages || 1);
        setUnreadCount((response as any).unreadCount || 0);
      } else {
        setError(response.error || t('notifications.error'));
      }
    } catch (err: any) {
      console.error('Error cargando notificaciones:', err);
      setError(err.message || t('notifications.error'));
    } finally {
      setLoading(false);
    }
  }, [router, t, currentPage, unreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      const response = await userAPI.markNotificationRead(id);
      if (response.success) {
        await loadNotifications();
      }
    } catch (err: any) {
      console.error('Error marcando notificación:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await userAPI.markAllNotificationsRead();
      if (response.success) {
        await loadNotifications();
      }
    } catch (err: any) {
      console.error('Error marcando todas:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      booking_confirmed: CheckCircle2,
      booking_cancelled: AlertCircle,
      points_earned: Award,
      reward_redeemed: Gift,
      admin_message: MessageSquare,
      system: Bell,
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      booking_confirmed: 'bg-green-100 text-green-700',
      booking_cancelled: 'bg-red-100 text-red-700',
      points_earned: 'bg-yellow-100 text-yellow-700',
      reward_redeemed: 'bg-purple-100 text-purple-700',
      admin_message: 'bg-blue-100 text-blue-700',
      system: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors.system;
  };

  if (loading && notifications.length === 0) {
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
              {t('notifications.back')}
            </Link>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold text-gray-900">{t('notifications.title')}</h1>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-4 py-2 bg-[var(--yass-gold)] text-white rounded-xl font-semibold hover:bg-[var(--yass-gold-light)] transition-colors flex items-center gap-2"
                >
                  <CheckCheck className="h-5 w-5" />
                  {t('notifications.markAllRead')}
                </button>
              )}
            </div>
            <p className="text-gray-600">{t('notifications.subtitle')}</p>
            {unreadCount > 0 && (
              <p className="text-sm text-[var(--yass-gold)] font-semibold mt-2">
                {unreadCount} {t('notifications.unread')}
              </p>
            )}
          </div>

          {/* Filtro */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => {
                  setUnreadOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-5 h-5 text-[var(--yass-gold)] rounded focus:ring-[var(--yass-gold)]"
              />
              <span className="text-gray-700 font-medium">{t('notifications.showUnreadOnly')}</span>
            </label>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {notifications.length === 0 ? (
            <EmptyState 
              icon="alert" 
              title={unreadOnly ? t('notifications.noUnread') : t('notifications.noNotifications')} 
              message={unreadOnly ? t('notifications.noUnreadMessage') : t('notifications.noNotificationsMessage')} 
            />
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {notifications.map((notif) => {
                  const TypeIcon = getTypeIcon(notif.type);
                  return (
                    <div 
                      key={notif._id} 
                      className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
                        notif.read 
                          ? 'border-gray-100 opacity-75' 
                          : 'border-[var(--yass-gold)] bg-[var(--yass-gold)]/5'
                      } hover:shadow-lg cursor-pointer`}
                      onClick={() => !notif.read && handleMarkRead(notif._id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`rounded-full p-3 ${getTypeColor(notif.type)}`}>
                          <TypeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className={`text-lg font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notif.title}
                            </h3>
                            {!notif.read && (
                              <span className="px-2 py-1 bg-[var(--yass-gold)] text-white text-xs font-semibold rounded-full">
                                {t('notifications.new')}
                              </span>
                            )}
                          </div>
                          <p className={`mb-3 ${notif.read ? 'text-gray-600' : 'text-gray-800'}`}>
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(notif.createdAt).toLocaleDateString(
                                language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES',
                                { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                              )}
                            </div>
                            {notif.link && (
                              <Link 
                                href={notif.link}
                                className="text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-semibold"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {t('notifications.view')}
                              </Link>
                            )}
                          </div>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRead(notif._id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={t('notifications.markRead')}
                          >
                            <CheckCircle2 className="h-5 w-5 text-gray-400 hover:text-green-600" />
                          </button>
                        )}
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
