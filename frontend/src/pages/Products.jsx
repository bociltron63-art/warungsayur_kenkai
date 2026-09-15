import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { ProductSkeleton, ErrorState, EmptyResults } from "@/components/StateViews";
import { CATEGORY_ICONS } from "@/lib/format";

const SORTS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "harga-asc", label: "Harga Terendah" },
  { value: "harga-desc", label: "Harga Tertinggi" },
  { value: "nama", label: "Nama A-Z" },
];

const Products = () => {
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState(params.get("kategori") || "Semua");
  const [availability, setAvailability] = React.useState("semua");
  const [sort, setSort] = React.useState("terbaru");

  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getProducts,
  });

  React.useEffect(() => {
    const kat = params.get("kategori");
    if (kat) setCategory(kat);
  }, [params]);

  const categories = React.useMemo(() => {
    const seen = [];
    products.forEach((p) => { if (!seen.includes(p.kategori)) seen.push(p.kategori); });
    return ["Semua", ...seen];
  }, [products]);

  const filtered = React.useMemo(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.nama_produk.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.kategori.toLowerCase().includes(q)
      );
    }
    if (category !== "Semua") list = list.filter((p) => p.kategori === category);
    if (availability === "tersedia") list = list.filter((p) => p.stok > 0);
    if (availability === "habis") list = list.filter((p) => p.stok <= 0);

    switch (sort) {
      case "harga-asc": list.sort((a, b) => a.harga - b.harga); break;
      case "harga-desc": list.sort((a, b) => b.harga - a.harga); break;
      case "nama": list.sort((a, b) => a.nama_produk.localeCompare(b.nama_produk)); break;
      default: break;
    }
    return list;
  }, [products, search, category, availability, sort]);

  const updateCategory = (c) => {
    setCategory(c);
    if (c === "Semua") { params.delete("kategori"); setParams(params); }
    else { params.set("kategori", c); setParams(params); }
  };

  return (
    <div className="kk-container py-6 sm:py-10">
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-stone-900">Belanja Produk</h1>
      <p className="text-stone-500 mt-1">Sayur, buah, bumbu, protein & kebutuhan dapur.</p>

      {/* Search */}
      <div className="mt-5 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          data-testid="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari sayur, buah, bumbu, atau kebutuhan dapur…"
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-white outline-none focus:border-kk-green focus:ring-2 focus:ring-kk-light transition"
        />
      </div>

      {/* Category chips */}
      <div id="kategori" className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((c) => (
          <button
            key={c}
            data-testid={`filter-category-${c}`}
            onClick={() => updateCategory(c)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
              category === c ? "bg-kk-green text-white border-kk-green" : "bg-white text-stone-600 border-border hover:border-kk-green"
            }`}
          >
            {c === "Semua" ? "🛒 Semua" : `${CATEGORY_ICONS[c] || "📦"} ${c}`}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-stone-500 text-sm font-semibold">
          <SlidersHorizontal className="w-4 h-4" /> Filter:
        </div>
        <select
          data-testid="filter-availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm font-semibold outline-none focus:border-kk-green"
        >
          <option value="semua">Semua Stok</option>
          <option value="tersedia">Tersedia</option>
          <option value="habis">Habis</option>
        </select>
        <select
          data-testid="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm font-semibold outline-none focus:border-kk-green"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="ml-auto text-sm text-stone-500" data-testid="product-count">{filtered.length} produk</span>
      </div>

      {/* Grid */}
      <div className="mt-6">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyResults message="Tidak ada produk yang cocok dengan pencarian Anda." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} onOpen={setSelected} />)}
          </div>
        )}
      </div>

      {selected && <ProductDetailModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default Products;
