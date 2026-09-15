import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatRupiah, PLACEHOLDER_IMAGE } from "@/lib/format";

const EmptyCart = () => (
  <div className="text-center py-20" data-testid="empty-cart">
    <div className="w-20 h-20 mx-auto rounded-3xl bg-kk-light flex items-center justify-center mb-5">
      <ShoppingBag className="w-10 h-10 text-kk-green" />
    </div>
    <h2 className="font-heading font-bold text-2xl text-stone-900">Keranjang Anda masih kosong.</h2>
    <p className="text-stone-500 mt-2">Yuk pilih sayuran dan kebutuhan dapur favorit Anda.</p>
    <Link
      to="/produk"
      data-testid="start-shopping"
      className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-kk-green text-white font-semibold hover:bg-kk-dark"
    >
      Mulai Belanja <ArrowRight className="w-4 h-4" />
    </Link>
  </div>
);

const Cart = () => {
  const { items, setQuantity, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return <div className="kk-container py-8"><EmptyCart /></div>;
  }

  return (
    <div className="kk-container py-6 sm:py-10">
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-stone-900">Keranjang Belanja</h1>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((it) => (
            <div key={it.id} data-testid={`cart-item-${it.id}`} className="flex gap-3 sm:gap-4 bg-white rounded-2xl border border-border p-3 sm:p-4">
              <img
                src={it.foto || PLACEHOLDER_IMAGE}
                alt={it.nama_produk}
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-stone-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading font-semibold text-stone-900 leading-snug">{it.nama_produk}</h3>
                    <p className="text-sm text-stone-500">{formatRupiah(it.harga)} / {it.satuan}</p>
                  </div>
                  <button
                    data-testid={`cart-remove-${it.id}`}
                    onClick={() => removeItem(it.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-xl border border-border">
                    <button data-testid={`cart-minus-${it.id}`} onClick={() => setQuantity(it.id, it.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:text-kk-green">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span data-testid={`cart-qty-${it.id}`} className="w-14 text-center text-sm font-bold">{it.quantity} {it.satuan}</span>
                    <button data-testid={`cart-plus-${it.id}`} onClick={() => setQuantity(it.id, it.quantity + 1)} disabled={it.quantity >= it.stok} className="w-9 h-9 flex items-center justify-center hover:text-kk-green disabled:opacity-40">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span data-testid={`cart-subtotal-${it.id}`} className="font-heading font-bold text-stone-900">{formatRupiah(it.harga * it.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="font-heading font-bold text-lg text-stone-900">Ringkasan</h3>
            <div className="mt-4 flex items-center justify-between text-stone-600">
              <span>Total Belanja</span>
              <span data-testid="cart-total" className="font-heading font-extrabold text-2xl text-kk-green">{formatRupiah(totalPrice)}</span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              data-testid="checkout-button"
              className="mt-5 w-full py-3.5 rounded-xl bg-kk-green text-white font-semibold hover:bg-kk-dark active:scale-95 transition-all"
            >
              Checkout via WhatsApp
            </button>
            <p className="mt-3 text-xs text-stone-500 text-center" data-testid="cart-fee-note">
              Ongkir & minimal belanja dihitung saat checkout.
            </p>
            <Link to="/produk" className="mt-3 block text-center text-sm font-semibold text-stone-500 hover:text-kk-green">
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
