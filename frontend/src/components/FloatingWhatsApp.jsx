import React from "react";
import { MessageCircle } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { buildWhatsAppUrl } from "@/lib/format";

export const FloatingWhatsApp = () => {
  const config = useConfig();
  const url = buildWhatsAppUrl(
    config.owner_whatsapp_number,
    "Halo Warung Sayur KenKai 👋, saya ingin bertanya seputar produk."
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      data-testid="floating-whatsapp"
      aria-label="Chat WhatsApp"
      className="fixed z-40 right-4 bottom-20 md:bottom-6 inline-flex items-center justify-center w-14 h-14 rounded-full bg-kk-wa text-white shadow-lg kk-wa-glow hover:scale-105 transition-transform"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};
