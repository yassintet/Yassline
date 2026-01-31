"use client";

import { useI18n } from "@/lib/i18n/context";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "212669215611";
const DEFAULT_MESSAGE = "Hola, me gustaría recibir atención al cliente o más información sobre sus servicios.";

export default function WhatsAppChat() {
  const { t } = useI18n();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
  const label = t("contact.whatsapp") || "WhatsApp";
  const ariaLabel = t("contact.whatsappAria") || "Abrir chat de atención al cliente por WhatsApp";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-[#20BD5A] focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
    >
      <MessageCircle className="h-6 w-6 flex-shrink-0" aria-hidden />
      <span className="hidden text-sm font-semibold sm:inline">
        {label}
      </span>
    </a>
  );
}
