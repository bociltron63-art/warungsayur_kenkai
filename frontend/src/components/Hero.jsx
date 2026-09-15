import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/format";

const HERO_IMG =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000&h=1000&fit=crop";

export const Hero = ({ categories = [] }) => (
  <section className="kk-container pt-8 sm:pt-12 lg:pt-16">
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className="kk-fade-up">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-kk-light text-kk-dark text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" /> Bekasi • Tipar Cakung
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-stone-900 leading-[1.08] mt-4">
          Sayur Segar &amp; Kebutuhan Dapur, <span className="text-kk-green">Lebih Mudah.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-stone-600 max-w-lg">
          Belanja kebutuhan dapur pilihan Anda dengan mudah dari Warung Sayur KenKai.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/produk"
            data-testid="hero-cta"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-kk-green text-white font-semibold hover:bg-kk-dark hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
          >
            Belanja Sekarang <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/produk#kategori"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border border-border text-stone-800 font-semibold hover:bg-stone-50"
          >
            Lihat Kategori
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
          {[
            { icon: Sparkles, label: "100% Segar" },
            { icon: Truck, label: "Diantar Cepat" },
            { icon: ShieldCheck, label: "Kualitas Terjamin" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-start gap-1.5 p-3 rounded-2xl bg-white border border-border">
              <Icon className="w-5 h-5 text-kk-green" />
              <span className="text-xs font-semibold text-stone-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative kk-fade-up">
        <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] lg:aspect-square">
          <img src={HERO_IMG} alt="Sayuran segar Warung Sayur KenKai" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto no-scrollbar py-1" data-testid="hero-category-chips">
            {categories.map((c) => (
              <Link
                key={c}
                to={`/produk?kategori=${encodeURIComponent(c)}`}
                data-testid={`hero-chip-${c}`}
                className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-stone-800 hover:bg-white transition-colors"
              >
                {CATEGORY_ICONS[c] || "📦"} {c}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
