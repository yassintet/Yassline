"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { User, BookOpen, Gift, Heart, LogOut, ChevronDown } from "lucide-react";
import { authUtils } from "@/lib/auth";

interface UserMenuProps {
  isAdmin?: boolean;
}

export default function UserMenu({ isAdmin }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevenir scroll cuando el menú está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = () => {
    authUtils.logout();
    window.location.href = "/";
  };

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="relative z-[10000]" ref={dropdownRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[var(--yass-gold)] hover:bg-gradient-to-r hover:from-[var(--yass-gold)]/5 hover:to-[var(--yass-gold-light)]/5 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
        type="button"
      >
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] flex items-center justify-center shadow-md transition-all duration-200 ${isOpen ? 'ring-2 ring-[var(--yass-gold)] ring-offset-1 scale-105' : ''}`}>
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--yass-gold)]' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden z-[10001]"
          style={{ 
            zIndex: 10001,
            position: 'absolute',
            top: '100%',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div className="p-2">
            {/* Header del menú */}
            <div className="px-4 py-3 mb-2 bg-gradient-to-r from-[var(--yass-gold)]/10 to-[var(--yass-gold-light)]/10 rounded-lg border border-[var(--yass-gold)]/20">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mi Cuenta</p>
              <p className="text-sm font-medium text-gray-900">Menú de Usuario</p>
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                prefetch={false}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white hover:shadow-lg transition-all duration-200 font-semibold text-sm mb-2"
              >
                <span className="text-lg">⚙️</span>
                <span>{t('nav.admin')}</span>
              </Link>
            )}
            
            <Link
              href="/mis-reservas"
              prefetch={false}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium text-sm group"
            >
              <BookOpen className="w-4 h-4 text-[var(--yass-gold)] group-hover:scale-110 transition-transform" />
              <span>{t('nav.myBookings')}</span>
            </Link>
            
            <Link
              href="/recompensas"
              prefetch={false}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium text-sm group"
            >
              <Gift className="w-4 h-4 text-[var(--yass-gold)] group-hover:scale-110 transition-transform" />
              <span>{t('nav.rewards')}</span>
            </Link>
            
            <Link
              href="/perfil"
              prefetch={false}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium text-sm group"
            >
              <User className="w-4 h-4 text-[var(--yass-gold)] group-hover:scale-110 transition-transform" />
              <span>{t('nav.profile')}</span>
            </Link>
            
            <Link
              href="/favoritos"
              prefetch={false}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium text-sm group"
            >
              <Heart className="w-4 h-4 text-[var(--yass-gold)] group-hover:scale-110 transition-transform" />
              <span>{t('nav.favorites')}</span>
            </Link>
            
            <div className="h-px bg-gray-200 my-2"></div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 text-red-600 font-medium text-sm group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
