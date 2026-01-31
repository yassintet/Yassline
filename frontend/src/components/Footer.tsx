"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-[var(--yass-black)] text-[var(--yass-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" prefetch={false}>
<h3 className="text-2xl font-bold mb-4 text-[var(--yass-gold-light)] hover:text-yass-gold transition-colors duration-300 cursor-pointer tracking-tight">
              Yassline <span className="font-light text-yass-gold-pale/90">Tour</span>
            </h3>
            </Link>
            <p className="text-yass-gold-pale/80 text-sm leading-relaxed">
              {t('footer.brandDescription')}
            </p>
          </div>
          
          {/* Empresa */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[var(--yass-cream)]">{t('footer.company')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/sobre-nosotros" prefetch={false} className="text-yass-gold-pale/80 hover:text-yass-gold transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-yass-gold opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/vehiculos" prefetch={false} className="text-yass-gold-pale/80 hover:text-yass-gold transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-yass-gold opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.ourFleet')}
                </Link>
              </li>
              <li>
                <Link href="/contacto" prefetch={false} className="text-yass-gold-pale/80 hover:text-yass-gold transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-yass-gold opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Servicios */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[var(--yass-cream)]">{t('footer.services')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/circuitos" prefetch={false} className="text-yass-gold-pale/80 hover:text-yass-gold transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-yass-gold opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.circuits')}
                </Link>
              </li>
              <li>
                <Link href="/transporte" prefetch={false} className="text-yass-gold-pale/80 hover:text-yass-gold transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-yass-gold opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.transfers')}
                </Link>
              </li>
              <li>
                <Link href="/vehiculos" prefetch={false} className="text-yass-gold-pale/80 hover:text-yass-gold transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-yass-gold opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.vehicles')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contacto */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[var(--yass-cream)]">{t('footer.contactInfo')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-yass-gold-pale/80 hover:text-yass-gold transition-colors">
                <Phone className="w-5 h-5 text-yass-gold mt-0.5 flex-shrink-0" />
                <a href="tel:+212669215611" className="hover:text-yass-gold transition-colors">+212 669 215 611</a>
              </li>
              <li className="flex items-start gap-3 text-yass-gold-pale/80 hover:text-yass-gold transition-colors">
                <Mail className="w-5 h-5 text-yass-gold mt-0.5 flex-shrink-0" />
                <a href="mailto:info@yassline.com" className="hover:text-yass-gold transition-colors">info@yassline.com</a>
              </li>
              <li className="flex items-start gap-3 text-yass-gold-pale/80">
                <MapPin className="w-5 h-5 text-yass-gold mt-0.5 flex-shrink-0" />
                <span>{t('footer.location')}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-yass-gold/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-yass-gold-pale/70">
              © {new Date().getFullYear()} Yassline Tour. {t('footer.rightsReserved')}
            </p>
            <div className="flex gap-6">
              <Link href="/politica-privacidad" prefetch={false} className="text-yass-gold-pale/80 hover:text-yass-gold transition-colors text-sm">{t('footer.privacyPolicy')}</Link>
              <Link href="/terminos-condiciones" prefetch={false} className="text-yass-gold-pale/80 hover:text-yass-gold transition-colors text-sm">{t('footer.termsConditions')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
