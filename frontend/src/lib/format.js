// Formatting & WhatsApp helpers for Warung Sayur KenKai.

export const formatRupiah = (value) => {
  const n = Number(value) || 0;
  return `Rp${n.toLocaleString("id-ID")}`;
};

// Elegant SVG placeholder for products without a `foto`.
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='400' height='400' fill='#ecfdf4'/>
      <g fill='none' stroke='#86c9a3' stroke-width='10' stroke-linecap='round'>
        <path d='M200 120c40 0 70 30 70 80s-30 90-70 90-70-40-70-90 30-80 70-80z'/>
        <path d='M200 120c0-25 18-45 45-50-3 28-20 46-45 50z'/>
      </g>
      <text x='200' y='340' font-family='sans-serif' font-size='22' fill='#15803d' text-anchor='middle'>Warung Sayur KenKai</text>
    </svg>`
  );

// Build the WhatsApp order message. Every line item ALWAYS shows quantity + satuan.
export const buildWhatsAppMessage = ({ customer, items, total, orderNumber }) => {
  const lines = [];
  lines.push("Halo Warung Sayur KenKai 👋");
  lines.push("Saya ingin melakukan pemesanan:");
  lines.push("");
  lines.push("*DATA CUSTOMER*");
  lines.push(`Nama: ${customer.nama}`);
  lines.push(`WhatsApp: ${customer.whatsapp}`);
  if (customer.metode === "ambil") {
    lines.push("Alamat: Ambil sendiri di Warung Sayur KenKai (Bekasi / Tipar Cakung)");
  } else {
    lines.push(`Alamat: ${customer.alamat}`);
  }
  lines.push("");
  lines.push("*PESANAN*");
  items.forEach((it, idx) => {
    const subtotal = it.harga * it.quantity;
    lines.push(`${idx + 1}. ${it.nama_produk}`);
    lines.push(`   Jumlah: ${it.quantity} ${it.satuan}`);
    lines.push(`   Harga: ${formatRupiah(it.harga)} / ${it.satuan}`);
    lines.push(`   Subtotal: ${formatRupiah(subtotal)}`);
  });
  lines.push("--------------------");
  lines.push(`Total: ${formatRupiah(total)}`);
  lines.push("--------------------");
  lines.push("Metode:");
  lines.push(customer.metode === "ambil" ? "Ambil sendiri" : "Diantar");
  lines.push("Catatan:");
  lines.push(customer.catatan ? customer.catatan : "-");
  lines.push("");
  lines.push("Nomor Pesanan:");
  lines.push(orderNumber);
  lines.push("");
  lines.push("Mohon dikonfirmasi ya.");
  lines.push("Terima kasih 🙏");
  return lines.join("\n");
};

export const buildWhatsAppUrl = (number, message) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const CATEGORY_ICONS = {
  Sayuran: "🥬",
  Buah: "🍎",
  "Bumbu Dapur": "🌶️",
  Protein: "🥩",
  Telur: "🥚",
  Sembako: "🧂",
  "Kebutuhan Dapur": "🥫",
  Lainnya: "📦",
};
