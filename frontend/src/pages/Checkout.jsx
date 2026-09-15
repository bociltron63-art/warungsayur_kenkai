import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, Store, MapPin, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useConfig } from "@/context/ConfigContext";
import { productService } from "@/services/productService";
import { formatRupiah, buildWhatsAppMessage, buildWhatsAppUrl, PLACEHOLDER_IMAGE } from "@/lib/format";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const config = useConfig();
  const navigate = useNavigate();

  const [form, setForm] = React.useState({ nama: "", whatsapp: "", alamat: "", metode: "diantar", catatan: "" });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (items.length === 0) navigate("/keranjang");
  }, [items.length, navigate]);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.nama.trim()) e.nama = "Nama wajib diisi.";
    if (!/^[0-9]{8,15}$/.test(form.whatsapp.replace(/[^0-9]/g, ""))) e.whatsapp = "Nomor WhatsApp tidak valid.";
    if (form.metode === "diantar" && !form.alamat.trim()) e.alamat = "Alamat lengkap wajib diisi untuk pengantaran.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Mohon lengkapi data pemesanan.");
      return;
    }
    setSubmitting(true);
    try {
      const orderNumber = await productService.getOrderNumber();
      const message = buildWhatsAppMessage({ customer: form, items, total: totalPrice, orderNumber });
      const url = buildWhatsAppUrl(config.owner_whatsapp_number, message);
      toast.success("Pesanan disiapkan! Mengarahkan ke WhatsApp…");
      window.open(url, "_blank");
      clearCart();
      setTimeout(() => navigate("/"), 800);
    } catch {
      toast.error("Gagal membuat nomor pesanan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  const inputCls = (k) =>
    `w-full px-4 py-3 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-kk-light transition ${
      errors[k] ? "border-rose-400" : "border-border focus:border-kk-green"
    }`;

  return (
    <div className="kk-container py-6 sm:py-10">
      <button onClick={() => navigate("/keranjang")} className="inline-flex items-center gap-1.5 text-stone-500 font-semibold text-sm hover:text-kk-green mb-4" data-testid="back-to-cart">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Keranjang
      </button>
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-stone-900">Checkout</h1>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5 sm:p-7">
          <h2 className="font-heading font-bold text-lg text-stone-900">Informasi Customer</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nama</label>
              <input data-testid="checkout-nama" value={form.nama} onChange={(e) => update("nama", e.target.value)} className={inputCls("nama")} placeholder="Nama lengkap" />
              {errors.nama && <p className="text-xs text-rose-600 mt-1">{errors.nama}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nomor WhatsApp</label>
              <input data-testid="checkout-whatsapp" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className={inputCls("whatsapp")} placeholder="0812xxxxxxxx" inputMode="numeric" />
              {errors.whatsapp && <p className="text-xs text-rose-600 mt-1">{errors.whatsapp}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Metode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="method-diantar"
                  onClick={() => update("metode", "diantar")}
                  className={`flex items-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-colors ${
                    form.metode === "diantar" ? "border-kk-green bg-kk-light text-kk-dark" : "border-border text-stone-600"
                  }`}
                >
                  <Truck className="w-4 h-4" /> Diantar
                </button>
                <button
                  type="button"
                  data-testid="method-ambil"
                  onClick={() => update("metode", "ambil")}
                  className={`flex items-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-colors ${
                    form.metode === "ambil" ? "border-kk-green bg-kk-light text-kk-dark" : "border-border text-stone-600"
                  }`}
                >
                  <Store className="w-4 h-4" /> Ambil sendiri
                </button>
              </div>
            </div>

            {form.metode === "diantar" ? (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Alamat Lengkap</label>
                <textarea data-testid="checkout-alamat" value={form.alamat} onChange={(e) => update("alamat", e.target.value)} rows={3} className={inputCls("alamat")} placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan (area Bekasi / Tipar Cakung)" />
                {errors.alamat && <p className="text-xs text-rose-600 mt-1">{errors.alamat}</p>}
              </div>
            ) : (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-kk-light text-kk-dark text-sm" data-testid="pickup-info">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Ambil di:</strong> Warung Sayur KenKai — Bekasi / Tipar Cakung.</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Catatan Pesanan</label>
              <textarea data-testid="checkout-catatan" value={form.catatan} onChange={(e) => update("catatan", e.target.value)} rows={2} className={inputCls("catatan")} placeholder="Contoh: cabai dipisah, kirim sore hari…" />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="font-heading font-bold text-lg text-stone-900">Pesanan Anda</h3>
            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto no-scrollbar">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 items-center">
                  <img src={it.foto || PLACEHOLDER_IMAGE} alt={it.nama_produk} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{it.nama_produk}</p>
                    <p className="text-xs text-stone-500">{it.quantity} {it.satuan} × {formatRupiah(it.harga)}</p>
                  </div>
                  <span className="text-sm font-semibold text-stone-800">{formatRupiah(it.harga * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-stone-600">Total</span>
              <span data-testid="checkout-total" className="font-heading font-extrabold text-2xl text-kk-green">{formatRupiah(totalPrice)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="send-whatsapp-button"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-kk-wa text-white font-semibold hover:brightness-105 active:scale-95 transition-all disabled:opacity-60"
            >
              <MessageCircle className="w-5 h-5" /> {submitting ? "Menyiapkan…" : "Kirim Pesanan ke WhatsApp"}
            </button>
            <Link to="/keranjang" className="mt-3 block text-center text-sm font-semibold text-stone-500 hover:text-kk-green">
              Ubah Keranjang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
