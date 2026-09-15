import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/CartContext";
import { ConfigProvider } from "@/context/ConfigContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";

function App() {
  return (
    <div className="App min-h-screen flex flex-col">
      <ConfigProvider>
        <CartProvider>
          <BrowserRouter>
            <Header />
            <main className="flex-1 pb-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/produk" element={<Products />} />
                <Route path="/keranjang" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
              </Routes>
            </main>
            <Footer />
            <BottomNav />
            <FloatingWhatsApp />
          </BrowserRouter>
          <Toaster position="top-center" richColors closeButton />
        </CartProvider>
      </ConfigProvider>
    </div>
  );
}

export default App;
