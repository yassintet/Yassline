"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { authUtils } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import LanguageCurrencySelector from "./LanguageCurrencySelector";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import NotificationsDropdown from "./NotificationsDropdown";
import { userAPI } from "@/lib/api";
import { Search, Heart, Bell } from "lucide-react";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const loadNotificationCount = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      setUnreadNotifications(0);
      return;
    }

    try {
      const response = await userAPI.getNotifications({ page: 1, limit: 1, unreadOnly: true });
      if (response.success && response.data) {
        // El backend retorna unreadCount en la respuesta
        const unreadCount = (response.data as any).unreadCount || 0;
        setUnreadNotifications(unreadCount);
      } else if (response.error && (response.error.includes('denegado') || response.error.includes('inválido') || response.error.includes('expirado'))) {
        // Token inválido o expirado - cerrar sesión silenciosamente
        console.warn('Token inválido o expirado, cerrando sesión...');
        authUtils.logout();
        setIsAuthenticated(false);
        setUnreadNotifications(0);
      }
    } catch (err) {
      // Solo loggear errores que no sean de autenticación
      if (err instanceof Error && !err.message.includes('403') && !err.message.includes('Forbidden')) {
        console.error('Error cargando contador de notificaciones:', err);
      }
      // Si es un error 403, el token probablemente expiró
      if (err instanceof Error && (err.message.includes('403') || err.message.includes('Forbidden'))) {
        authUtils.logout();
        setIsAuthenticated(false);
        setUnreadNotifications(0);
      }
    }
  }, []);

  useEffect(() => {
    setIsAuthenticated(authUtils.isAuthenticated());
    setIsAdmin(authUtils.isAdmin());
    
    if (authUtils.isAuthenticated()) {
      loadNotificationCount();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [loadNotificationCount]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--yass-cream)]/98 backdrop-blur-xl shadow-sm border-b border-yass-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo - Izquierda */}
          <div className="flex-shrink-0">
            <Logo href="/" size="md" />
          </div>
          
          {/* Navigation Menu - Centro */}
          <div className="hidden lg:flex items-center flex-1 justify-center gap-1">
            <Link 
              href="/" 
              prefetch={false}
              className="px-4 py-2 text-sm font-semibold text-[var(--yass-black)] hover:text-yass-gold transition-all duration-300 whitespace-nowrap"
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/transporte" 
              prefetch={false}
              className="px-4 py-2 text-sm font-semibold text-[var(--yass-black)] hover:text-yass-gold transition-all duration-300 whitespace-nowrap"
            >
              {t('nav.transport')}
            </Link>
            <Link 
              href="/circuitos" 
              prefetch={false}
              className="px-4 py-2 text-sm font-semibold text-[var(--yass-black)] hover:text-yass-gold transition-all duration-300 whitespace-nowrap"
            >
              {t('nav.circuits')}
            </Link>
            <Link 
              href="/vehiculos" 
              prefetch={false}
              className="px-4 py-2 text-sm font-semibold text-[var(--yass-black)] hover:text-yass-gold transition-all duration-300 whitespace-nowrap"
            >
              {t('nav.vehicles')}
            </Link>
            <Link 
              href="/contacto" 
              prefetch={false}
              className="px-4 py-2 text-sm font-semibold text-[var(--yass-black)] hover:text-yass-gold transition-all duration-300 whitespace-nowrap"
            >
              {t('nav.contact')}
            </Link>
          </div>
          
          {/* Right Side - Derecha */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {/* Language & Currency Selector */}
            <LanguageCurrencySelector />
            
            {/* Notificaciones Dropdown */}
            {isAuthenticated && (
              <NotificationsDropdown 
                unreadCount={unreadNotifications}
                onCountChange={setUnreadNotifications}
              />
            )}
            
            {/* User Menu Dropdown */}
            {isAuthenticated ? (
              <UserMenu isAdmin={isAdmin} />
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className="px-4 py-2 rounded-lg border border-yass-gold/30 bg-white hover:border-yass-gold hover:text-yass-gold hover:bg-yass-gold/5 hover:shadow-sm transition-all duration-200 font-medium text-sm text-[var(--yass-black)] whitespace-nowrap"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button - Mejorado */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageCurrencySelector />
            {/* Notificaciones en móvil */}
            {isAuthenticated && (
              <NotificationsDropdown 
                unreadCount={unreadNotifications}
                onCountChange={setUnreadNotifications}
              />
            )}
            {/* User Menu en móvil */}
            {isAuthenticated && (
              <UserMenu isAdmin={isAdmin} />
            )}
            {!isAuthenticated && (
              <Link
                href="/login"
                prefetch={false}
                className="px-3 py-2 rounded-lg border border-yass-gold/30 bg-white hover:border-yass-gold hover:text-yass-gold text-sm font-medium text-[var(--yass-black)]"
              >
                {t('nav.login')}
              </Link>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--yass-black)] hover:text-yass-gold hover:bg-yass-gold/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Mejorado */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-yass-gold/10 bg-[var(--yass-cream)]/98 backdrop-blur-xl animate-in slide-in-from-top duration-200">
            <div className="px-4 py-6 space-y-1">
              <Link 
                href="/" 
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200"
              >
                {t('nav.home')}
              </Link>
              <Link 
                href="/transporte" 
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200"
              >
                {t('nav.transport')}
              </Link>
              <Link 
                href="/circuitos" 
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200"
              >
                {t('nav.circuits')}
              </Link>
              <Link 
                href="/vehiculos" 
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200"
              >
                {t('nav.vehicles')}
              </Link>
              <Link 
                href="/contacto" 
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200"
              >
                {t('nav.contact')}
              </Link>
              <Link 
                href="/buscar" 
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {t('nav.search')}
              </Link>
              
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>
              
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg bg-[var(--yass-black)] text-[var(--yass-gold-light)] hover:bg-yass-gold hover:text-[var(--yass-black)] hover:shadow-lg transition-all duration-200 font-semibold text-sm text-center"
                  >
                    {t('nav.admin')}
                  </Link>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>
                </>
              )}
              
              {isAuthenticated && (
                <>
                  <Link
                    href="/mis-reservas"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200"
                  >
                    {t('nav.myBookings')}
                  </Link>
                  <Link
                    href="/recompensas"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200"
                  >
                    {t('nav.rewards')}
                  </Link>
                  <Link
                    href="/perfil"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200"
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    href="/favoritos"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    {t('nav.favorites')}
                  </Link>
                  <Link
                    href="/notificaciones"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-[var(--yass-black)] font-medium hover:text-yass-gold hover:bg-yass-gold/5 rounded-lg transition-all duration-200 flex items-center gap-2 relative"
                  >
                    <div className="relative">
                      <Bell className="w-4 h-4" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-yass-gold text-[var(--yass-black)] text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] px-0.5 shadow-sm ring-2 ring-white">
                          {unreadNotifications > 99 ? '99+' : unreadNotifications}
                        </span>
                      )}
                    </div>
                    {t('nav.notifications')}
                  </Link>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>
                  <button
                    onClick={() => {
                      authUtils.logout();
                      setMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-yass-gold/30 bg-white hover:border-yass-gold hover:text-yass-gold hover:bg-yass-gold/5 transition-all duration-200 font-medium text-[var(--yass-black)] text-left"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              )}
              
              {!isAuthenticated && (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>
                  <Link
                    href="/register"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 rounded-lg bg-[var(--yass-black)] text-[var(--yass-gold-light)] hover:bg-yass-gold hover:text-[var(--yass-black)] hover:shadow-lg transition-all duration-200 font-semibold text-sm text-center mb-2"
                  >
                    {t('nav.register')}
                  </Link>
                  <Link
                    href="/login"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 rounded-lg border border-yass-gold/30 bg-white hover:border-yass-gold hover:text-yass-gold hover:bg-yass-gold/5 transition-all duration-200 font-medium text-[var(--yass-black)] text-center"
                  >
                    {t('nav.login')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
