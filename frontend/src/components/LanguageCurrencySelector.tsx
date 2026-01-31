"use client";

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
];

const currencies = [
  { code: 'MAD' as const, symbol: 'MAD', name: 'Dirham marroquí' },
  { code: 'EUR' as const, symbol: '€', name: 'Euro' },
  { code: 'USD' as const, symbol: '$', name: 'US Dollar' },
  { code: 'GBP' as const, symbol: '£', name: 'British Pound' },
];

export default function LanguageCurrencySelector() {
  const { language, currency, setLanguage, setCurrency } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find(l => l.code === language) || languages[0];
  const currentCurrency = currencies.find(c => c.code === currency) || currencies[1];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-[var(--yass-gold)] hover:shadow-md transition-all duration-300 text-gray-700 font-semibold whitespace-nowrap"
      >
        <Globe className="w-4 h-4 flex-shrink-0" />
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden sm:inline text-sm">{currentLanguage.code.toUpperCase()}</span>
        <span className="hidden md:inline text-gray-400 mx-1">|</span>
        <span className="hidden md:inline font-bold text-sm">{currentCurrency.symbol}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Idioma */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {language === 'es' ? 'Idioma' : language === 'en' ? 'Language' : 'Langue'}
            </h3>
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    language === lang.code
                      ? 'bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="flex-1 text-left font-medium">{lang.name}</span>
                  {language === lang.code && (
                    <span className="text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Moneda */}
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {language === 'es' ? 'Moneda' : language === 'en' ? 'Currency' : 'Devise'}
            </h3>
            <div className="space-y-1">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    currency === curr.code
                      ? 'bg-gradient-to-r from-[var(--yass-black)] to-[var(--yass-gold)] text-white'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="font-bold text-lg w-8 text-left">{curr.symbol}</span>
                  <span className="flex-1 text-left font-medium">{curr.name}</span>
                  {currency === curr.code && (
                    <span className="text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
