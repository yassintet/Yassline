"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Bell, CheckCircle2, XCircle, Gift, MessageSquare, Loader2 } from "lucide-react";
import { userAPI } from "@/lib/api";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationsDropdownProps {
  unreadCount: number;
  onCountChange?: (count: number) => void;
}

export default function NotificationsDropdown({ unreadCount, onCountChange }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const loadNotifications = useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const response = await userAPI.getNotifications({ page: 1, limit: 10 });
      if (response.success && response.data) {
        const data = response.data as any;
        const notificationsData: Notification[] = Array.isArray(data.notifications) 
          ? data.notifications
          : Array.isArray(data) 
          ? data
          : [];
        setNotifications(notificationsData);
        
        // Actualizar contador
        const unread = notificationsData.filter((n: Notification) => !n.read).length;
        if (onCountChange) {
          onCountChange(unread);
        }
      }
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, onCountChange]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await userAPI.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      // Actualizar contador
      const newUnread = notifications.filter(n => !n.read && n._id !== notificationId).length;
      if (onCountChange) {
        onCountChange(newUnread);
      }
    } catch (err) {
      console.error('Error marcando notificación como leída:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await userAPI.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onCountChange) {
        onCountChange(0);
      }
    } catch (err) {
      console.error('Error marcando todas como leídas:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'booking_cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'points_earned':
        return <Gift className="w-5 h-5 text-yellow-500" />;
      case 'price_proposed':
        return <MessageSquare className="w-5 h-5 text-orange-500" />;
      case 'booking_updated':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'price_accepted':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'price_rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-700 hover:text-[var(--yass-gold)] hover:bg-gray-50 transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px] px-1 shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-lg">{t('nav.notifications')}</h3>
              {notifications.filter(n => !n.read).length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-semibold transition-colors"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-600">
                {unreadCount} {unreadCount === 1 ? 'notificación no leída' : 'notificaciones no leídas'}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 text-[var(--yass-gold)] animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification._id);
                      }
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-semibold text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[var(--yass-gold)] rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <Link
                href="/notificaciones"
                prefetch={false}
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm font-semibold text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] transition-colors"
              >
                Ver todas las notificaciones
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
