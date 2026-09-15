import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Store, LayoutGrid, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const items = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/produk", label: "Produk", icon: Store },
  { to: "/produk#kategori", label: "Kategori", icon: LayoutGrid },
  { to: "/keranjang", label: "Keranjang", icon: ShoppingCart },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  const { totalItems } = useCart();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-border"
      data-testid="bottom-nav"
    >
      <div className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to === "/produk" && pathname.startsWith("/produk"));
          return (
            <Link
              key={label}
              to={to}
              data-testid={`bottomnav-${label.toLowerCase()}`}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                active ? "text-kk-green" : "text-stone-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label === "Keranjang" && totalItems > 0 && (
                <span className="absolute top-1 right-1/4 min-w-[16px] h-4 px-1 rounded-full bg-kk-green text-white text-[9px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
