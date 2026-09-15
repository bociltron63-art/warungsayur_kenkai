import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { ProductSkeleton, ErrorState } from "@/components/StateViews";
import { CATEGORY_ICONS } from "@/lib/format";
import { ArrowRight } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = React.useState(null);
  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getProducts,
  });

  const categories = React.useMemo(() => {
    const seen = [];
    products.forEach((p) => { if (!seen.includes(p.kategori)) seen.push(p.kategori); });
    return seen;
  }, [products]);

  const featured = products.slice(0, 8);

  return (
    <div>
      <Hero categories={categories} />

      {/* Categories */}
      <section id="kategori" className="kk-container py-12 sm:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-stone-900">Kategori Produk</h2>
            <p className="text-stone-500 mt-1">Pilih kategori kebutuhan dapur Anda.</p>
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl kk-skeleton" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <button
                key={c}
                data-testid={`home-category-${c}`}
                onClick={() => navigate(`/produk?kategori=${encodeURIComponent(c)}`)}
                className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-border hover:border-kk-green hover:shadow-md transition-all text-left"
              >
                <span className="text-2xl">{CATEGORY_ICONS[c] || "📦"}</span>
                <span className="font-heading font-semibold text-stone-800 group-hover:text-kk-green">{c}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Featured products */}
      <section className="kk-container pb-4">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-stone-900">Produk Pilihan</h2>
          <button onClick={() => navigate("/produk")} className="inline-flex items-center gap-1 text-kk-green font-semibold text-sm hover:gap-2 transition-all" data-testid="see-all-products">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} onOpen={setSelected} />)}
          </div>
        )}
      </section>

      {/* About */}
      <section id="tentang" className="kk-container py-12 sm:py-16">
        <div className="rounded-3xl bg-white border border-border p-6 sm:p-10 max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-stone-900">Tentang Warung Sayur KenKai</h2>
          <p className="mt-4 text-stone-600 leading-relaxed">
            Warung Sayur KenKai hadir untuk memudahkan kebutuhan belanja sayur dan kebutuhan dapur Anda.
            Kami melayani pelanggan di area Bekasi dan Tipar Cakung dengan proses pemesanan yang praktis melalui WhatsApp.
          </p>
        </div>
      </section>

      {selected && <ProductDetailModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default Home;
