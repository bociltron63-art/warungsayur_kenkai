import React from "react";
import { X, Plus, Minus, Package } from "lucide-react";
import { formatRupiah, PLACEHOLDER_IMAGE } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const ProductDetailModal = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    setQty(1);
  }, [product]);

  if (!product) return null;
  const outOfStock = product.stok <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product, qty);
    toast.success(`${product.nama_produk} berhasil ditambahkan ke keranjang`, {
      description: `${qty} ${product.satuan} • ${formatRupiah(product.harga * qty)}`,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      data-testid="product-detail-modal"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl kk-fade-up max-h-[92vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          data-testid="modal-close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-square bg-stone-100">
            <img
              src={product.foto || PLACEHOLDER_IMAGE}
              alt={product.nama_produk}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
              className={`w-full h-full object-cover ${outOfStock ? "grayscale" : ""}`}
            />
          </div>
          <div className="p-5 sm:p-7 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-kk-green">{product.kategori}</span>
            <h2 className="font-heading font-extrabold text-2xl text-stone-900 mt-1">{product.nama_produk}</h2>
            <div className="mt-2">
              <span className="font-heading font-extrabold text-kk-green text-2xl">{formatRupiah(product.harga)}</span>
              <span className="text-stone-500 font-semibold"> / {product.satuan}</span>
            </div>
            <p className="mt-4 text-sm text-stone-600 leading-relaxed">{product.deskripsi || "-"}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-stone-600">
              <Package className="w-4 h-4 text-kk-green" />
              {outOfStock ? (
                <span className="font-semibold text-rose-600">Stok Habis</span>
              ) : (
                <span data-testid="modal-stock">Stok: {product.stok} {product.satuan}</span>
              )}
            </div>

            {!outOfStock && (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-border">
                  <button data-testid="modal-qty-minus" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center hover:text-kk-green">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span data-testid="modal-qty" className="w-12 text-center font-bold text-lg">{qty}</span>
                  <button data-testid="modal-qty-plus" onClick={() => setQty((q) => Math.min(product.stok, q + 1))} className="w-11 h-11 flex items-center justify-center hover:text-kk-green">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-stone-500">{qty} {product.satuan}</span>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              data-testid="modal-add-to-cart"
              className={`mt-6 w-full py-3.5 rounded-xl text-white font-semibold transition-all active:scale-95 ${
                outOfStock ? "bg-stone-300 cursor-not-allowed" : "bg-kk-green hover:bg-kk-dark"
              }`}
            >
              {outOfStock ? "Stok Habis" : `Tambah ke Keranjang • ${formatRupiah(product.harga * qty)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
