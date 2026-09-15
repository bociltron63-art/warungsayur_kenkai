import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, Leaf, MapPin, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const links = [
  { to: "/", label: "Beranda" },
  { to: "/produk", label: "Produk" },
  { to: "/produk#kategori", label: "Kategori" },
  { to: "/#tentang", label: "Tentang Kami" },
];

export const Header = () => {
  const { totalItems } = useCart();
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-border" data-testid="site-header">
      <div className="kk-container flex items-center justify-between h-16 sm:h-20">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="brand-logo">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-kk-green text-white shadow-sm group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-stone-900">Warung Sayur KenKai</span>
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-kk-green">
              <MapPin className="w-3 h-3" /> Bekasi • Tipar Cakung
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                pathname === l.to ? "bg-kk-light text-kk-dark" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/keranjang"
            data-testid="header-cart-button"
            className="relative inline-flex items-center justify-center w-11 h-11 rounded-full bg-kk-light text-kk-dark hover:bg-emerald-100 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span
                data-testid="cart-badge"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-kk-green text-white text-[11px] font-bold flex items-center justify-center"
              >
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-stone-100"
            onClick={() => setOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-white kk-fade-up" data-testid="mobile-menu">
          <div className="kk-container py-3 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 px-2 rounded-lg text-base font-semibold text-stone-700 hover:bg-stone-50"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
