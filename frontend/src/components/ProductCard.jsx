import React from "react";
import { Plus, Minus, ImageOff } from "lucide-react";
import { formatRupiah, PLACEHOLDER_IMAGE } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const ProductCard = ({ product, onOpen }) => {
  const { addItem } = useCart();
  const [qty, setQty] = React.useState(1);
  const outOfStock = product.stok <= 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, qty);
    toast.success(`${product.nama_produk} berhasil ditambahkan ke keranjang`, {
      description: `${qty} ${product.satuan} • ${formatRupiah(product.harga * qty)}`,
    });
    setQty(1);
  };

  return (
    <div
      data-testid={`product-card-${product.id}`}
      onClick={() => onOpen(product)}
      className={`group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col ${
        outOfStock ? "opacity-90" : ""
      }`}
    >
      <div className="relative aspect-square bg-stone-100 overflow-hidden">
        <img
          src={product.foto || PLACEHOLDER_IMAGE}
          alt={product.nama_produk}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? "grayscale" : ""}`}
        />
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-semibold text-stone-600">
          {product.kategori}
        </span>
        {outOfStock ? (
          <span data-testid={`badge-habis-${product.id}`} className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold">
            Habis
          </span>
        ) : (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
            Tersedia
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-heading font-semibold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2">
          {product.nama_produk}
        </h3>
        <div className="mt-1.5 mb-3">
          <span className="font-heading font-extrabold text-kk-green text-base sm:text-lg">
            {formatRupiah(product.harga)}
          </span>
          <span data-testid={`unit-${product.id}`} className="text-stone-500 text-xs sm:text-sm font-semibold"> / {product.satuan}</span>
        </div>

        <div className="mt-auto">
          {outOfStock ? (
            <button
              disabled
              data-testid={`add-disabled-${product.id}`}
              className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-400 text-sm font-semibold cursor-not-allowed"
            >
              Stok Habis
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center rounded-xl border border-border flex-shrink-0">
                <button
                  data-testid={`card-qty-minus-${product.id}`}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-9 flex items-center justify-center text-stone-600 hover:text-kk-green"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-bold" data-testid={`card-qty-${product.id}`}>{qty}</span>
                <button
                  data-testid={`card-qty-plus-${product.id}`}
                  onClick={() => setQty((q) => Math.min(product.stok, q + 1))}
                  className="w-7 h-9 flex items-center justify-center text-stone-600 hover:text-kk-green"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                data-testid={`add-to-cart-${product.id}`}
                onClick={handleAdd}
                className="flex-1 min-w-[104px] inline-flex items-center justify-center gap-1 py-2.5 rounded-xl bg-kk-green text-white text-xs sm:text-sm font-semibold hover:bg-kk-dark active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Keranjang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
