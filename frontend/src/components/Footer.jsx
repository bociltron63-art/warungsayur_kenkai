import React from "react";
import { Link } from "react-router-dom";
import { Leaf, MapPin, MessageCircle } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { buildWhatsAppUrl } from "@/lib/format";

export const Footer = () => {
  const config = useConfig();
  const waUrl = buildWhatsAppUrl(
    config.owner_whatsapp_number,
    "Halo Warung Sayur KenKai 👋, saya ingin bertanya."
  );

  return (
    <footer className="bg-stone-900 text-stone-300 mt-16 pb-24 md:pb-0" data-testid="site-footer">
      <div className="kk-container py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-kk-green text-white">
              <Leaf className="w-5 h-5" />
            </span>
            <span className="font-heading font-extrabold text-lg text-white">Warung Sayur KenKai</span>
          </div>
          <p className="text-sm text-stone-400 max-w-sm">
            Belanja sayur segar dan kebutuhan dapur dengan mudah.
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-400">
            <MapPin className="w-4 h-4" /> Bekasi &amp; Tipar Cakung
          </p>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-white mb-3">Menu</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Beranda</Link></li>
            <li><Link to="/produk" className="hover:text-white">Produk</Link></li>
            <li><Link to="/produk#kategori" className="hover:text-white">Kategori</Link></li>
            <li><Link to="/keranjang" className="hover:text-white">Keranjang</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-white mb-3">Hubungi Kami</h4>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="footer-whatsapp"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-kk-wa text-white text-sm font-semibold hover:brightness-105"
          >
            <MessageCircle className="w-4 h-4" /> Chat via WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-stone-800 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Warung Sayur KenKai. Semua hak dilindungi.
      </div>
    </footer>
  );
};
