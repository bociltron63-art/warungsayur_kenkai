import React, { createContext, useContext, useEffect, useState } from "react";
import { productService } from "@/services/productService";

const DEFAULTS = {
  brand: "Warung Sayur KenKai",
  owner_whatsapp_number: "62XXXXXXXXXXX",
  service_areas: ["Bekasi", "Tipar Cakung"],
  delivery_fee: 10000,
  min_order: 25000,
  free_delivery_threshold: 100000,
};

const ConfigContext = createContext(DEFAULTS);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULTS);

  useEffect(() => {
    productService.getConfig().then(setConfig).catch(() => {});
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => useContext(ConfigContext);
