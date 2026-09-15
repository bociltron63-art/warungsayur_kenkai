# PRD — Warung Sayur KenKai (Online Grocery Store)

## Original problem statement
Modern online grocery web app "Warung Sayur KenKai" (area: Bekasi & Tipar Cakung) selling sayuran, buah, bumbu dapur, telur, protein, sembako, kebutuhan dapur. Flow: Browse → Search → Product → Add to Cart → Checkout → WhatsApp. No account, no login, no payment gateway. Google Sheets = single source of truth for products. Checkout generates a WhatsApp click-to-chat deep link to the owner. CRITICAL: field `satuan` must persist end-to-end and appear on every WhatsApp line item.

## User choices
- Google Sheets access: public sheet via backend CSV export (GOOGLE_SHEET_CSV_URL), no credentials.
- Data: mock catalog first (bundled in product_service.MOCK_CSV); owner fills real sheet later.
- Owner WhatsApp: placeholder `62XXXXXXXXXXX`, single config value (OWNER_WHATSAPP_NUMBER).
- Extras: core flow + PWA (installable).

## Architecture
- Backend: FastAPI. `product_service.py` fetches/parses/validates/caches products (mock CSV when sheet URL empty). Endpoints: `/api/config`, `/api/products`, `/api/categories`, `/api/products/{id}`, `POST /api/order-number` (KKN-YYYYMMDD-XXX via Mongo daily counter). No product DB (Sheets is master).
- Frontend: React + Tailwind + shadcn-style, react-router, react-query, sonner toasts. CartContext (localStorage), ConfigContext. Pages: Home, Products, Cart, Checkout. Components: Header, Footer, BottomNav, FloatingWhatsApp, Hero, ProductCard, ProductDetailModal, StateViews. WhatsApp message built in `lib/format.js`.
- PWA: manifest.json + icons + mobile viewport + theme color.

## Implemented (2026-06)
- Full catalog from Google-Sheets-shaped mock (13 active, 1 inactive filtered, 1 out-of-stock "Habis" + disabled).
- Search (nama/sku/kategori), category chips, availability filter, sorting (terbaru/harga asc-desc/nama A-Z).
- Product detail modal with satuan-aware quantity selector.
- Cart with satuan-aware qty, subtotal, total, edit/remove, empty state.
- Checkout form with validation, diantar/ambil toggle, order number, WhatsApp deep link.
- WhatsApp message: per-item `Jumlah: <qty> <satuan>` / `Harga: Rp.. / <satuan>` / `Subtotal` (satuan preserved; forbidden `N x Rp..` never used).
- Responsive mobile-first, bottom nav, floating WhatsApp, skeletons/error/empty/toast states, SEO meta, PWA.
- Tested end-to-end: backend 100%, frontend 100% (iteration_1).

## Backlog / remaining
- P1: Connect real Google Sheet (set GOOGLE_SHEET_CSV_URL) + set real OWNER_WHATSAPP_NUMBER.
- P2: Product image per item in sheet; promo/discount; delivery fee/min order; product detail as shareable route.
