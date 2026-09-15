import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "kenkai_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    if (!product || product.stok <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stok);
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: nextQty } : i));
      }
      const qty = Math.min(quantity, product.stok);
      return [
        ...prev,
        {
          id: product.id,
          sku: product.sku,
          nama_produk: product.nama_produk,
          kategori: product.kategori,
          harga: product.harga,
          satuan: product.satuan,
          foto: product.foto,
          stok: product.stok,
          quantity: qty,
        },
      ];
    });
  };

  const setQuantity = (id, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stok)) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.harga * i.quantity, 0), [items]);

  const value = { items, addItem, setQuantity, removeItem, clearCart, totalItems, totalPrice };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
