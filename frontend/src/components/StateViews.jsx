import React from "react";
import { AlertTriangle, RefreshCw, PackageOpen } from "lucide-react";

export const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl border border-border overflow-hidden">
    <div className="aspect-square kk-skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 rounded kk-skeleton" />
      <div className="h-4 w-1/2 rounded kk-skeleton" />
      <div className="h-9 w-full rounded-xl kk-skeleton" />
    </div>
  </div>
);

export const ErrorState = ({ onRetry }) => (
  <div className="text-center py-16 max-w-md mx-auto" data-testid="error-state">
    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
      <AlertTriangle className="w-8 h-8 text-amber-500" />
    </div>
    <h3 className="font-heading font-bold text-xl text-stone-900">Maaf, katalog sedang diperbarui.</h3>
    <p className="text-stone-500 mt-2">Silakan coba beberapa saat lagi.</p>
    <button
      onClick={onRetry}
      data-testid="retry-button"
      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kk-green text-white font-semibold hover:bg-kk-dark"
    >
      <RefreshCw className="w-4 h-4" /> Coba Lagi
    </button>
  </div>
);

export const EmptyResults = ({ message = "Produk tidak ditemukan." }) => (
  <div className="text-center py-16" data-testid="empty-results">
    <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
      <PackageOpen className="w-8 h-8 text-stone-400" />
    </div>
    <p className="text-stone-500 font-medium">{message}</p>
  </div>
);
