import React, { createContext, useContext, useEffect, useState } from "react";
import { productService } from "@/services/productService";

const ConfigContext = createContext({ brand: "Warung Sayur KenKai", owner_whatsapp_number: "62XXXXXXXXXXX", service_areas: ["Bekasi", "Tipar Cakung"] });

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    brand: "Warung Sayur KenKai",
    owner_whatsapp_number: "62XXXXXXXXXXX",
    service_areas: ["Bekasi", "Tipar Cakung"],
  });

  useEffect(() => {
    productService.getConfig().then(setConfig).catch(() => {});
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => useContext(ConfigContext);
