import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { PriceAlert } from "@/lib/mock-data";

interface AppContextType {
  // Theme
  isDark: boolean;
  toggleTheme: () => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  // Price Alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (alert: PriceAlert) => void;
  removePriceAlert: (id: string) => void;
  // Auth modal
  authModal: "login" | "signup" | null;
  setAuthModal: (modal: "login" | "signup" | null) => void;
  // Mock logged in
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isInWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const addPriceAlert = useCallback((alert: PriceAlert) => {
    setPriceAlerts((prev) => [...prev.filter((a) => a.medicineId !== alert.medicineId), alert]);
  }, []);

  const removePriceAlert = useCallback((id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        isDark, toggleTheme,
        wishlist, toggleWishlist, isInWishlist,
        priceAlerts, addPriceAlert, removePriceAlert,
        authModal, setAuthModal,
        isLoggedIn, setIsLoggedIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};