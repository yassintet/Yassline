"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import esTranslations from './translations/es.json';
import enTranslations from './translations/en.json';
import frTranslations from './translations/fr.json';

type Language = 'es' | 'en' | 'fr';
type Currency = 'MAD' | 'EUR' | 'USD' | 'GBP';

interface I18nContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  convertPrice: (priceInMAD: number) => number;
  formatPrice: (priceInMAD: number) => string;
}

const translations = {
  es: esTranslations,
  en: enTranslations,
  fr: frTranslations,
};

// Tasas de cambio aproximadas (se pueden actualizar con una API real como exchangerate-api.com)
// Actualizado: Enero 2026
const exchangeRates: Record<Currency, number> = {
  MAD: 1,      // Base
  EUR: 0.092,  // 1 MAD = 0.092 EUR (aproximado: 1 EUR ≈ 10.87 MAD)
  USD: 0.10,   // 1 MAD = 0.10 USD (aproximado: 1 USD ≈ 10 MAD)
  GBP: 0.078,  // 1 MAD = 0.078 GBP (aproximado: 1 GBP ≈ 12.82 MAD)
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  const [currency, setCurrencyState] = useState<Currency>('EUR');

  // Cargar preferencias del localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    const savedCurrency = localStorage.getItem('currency') as Currency;
    
    if (savedLang && ['es', 'en', 'fr'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    if (savedCurrency && ['MAD', 'EUR', 'USD', 'GBP'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  // Guardar preferencias en localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  // Función de traducción - memoizada para que se actualice cuando cambia el idioma
  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: any = translations[language];
      
      // Buscar en el idioma actual
      for (const k of keys) {
        value = value?.[k];
      }
      
      // Si no se encuentra, buscar en español como fallback
      if (typeof value !== 'string') {
        let fallbackValue: any = translations.es;
        for (const k of keys) {
          fallbackValue = fallbackValue?.[k];
        }
        value = (typeof fallbackValue === 'string' ? fallbackValue : null);
      }
      
      // Si aún no se encuentra, devolver la clave (pero esto no debería pasar)
      if (typeof value !== 'string') {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      
      // Reemplazar parámetros
      if (params && typeof value === 'string') {
        return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
          return params[paramKey]?.toString() || match;
        });
      }
      
      return value;
    };
  }, [language]);

  // Convertir precio de MAD a la moneda seleccionada
  const convertPrice = (priceInMAD: number): number => {
    if (currency === 'MAD') return priceInMAD;
    return priceInMAD * exchangeRates[currency];
  };

  // Formatear precio con símbolo de moneda
  const formatPrice = (priceInMAD: number): string => {
    const converted = convertPrice(priceInMAD);
    const currencySymbols: Record<Currency, string> = {
      MAD: 'MAD',
      EUR: '€',
      USD: '$',
      GBP: '£',
    };
    
    return `${converted.toFixed(2)} ${currencySymbols[currency]}`;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        currency,
        setLanguage,
        setCurrency,
        t,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
