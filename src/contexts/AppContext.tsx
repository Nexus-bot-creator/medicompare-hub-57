import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { PriceAlert } from "@/lib/mock-data";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  pincode: string;
  avatarUrl?: string;
}

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
  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  updateUserProfile: (patch: Partial<UserProfile>) => void;
  isProfileLoading: boolean;
  logout: () => void;
  // Edit profile modal
  editProfileOpen: boolean;
  setEditProfileOpen: (v: boolean) => void;
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("userProfile");
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
    } else {
      localStorage.removeItem("userProfile");
    }
  }, [userProfile]);

  // Simulate fetching profile after login when none exists yet
  useEffect(() => {
    if (isLoggedIn && !userProfile) {
      setIsProfileLoading(true);
      const t = setTimeout(() => {
        setUserProfile({
          name: "Guest User",
          email: "guest@medipedia.app",
          phone: "",
          pincode: "",
        });
        setIsProfileLoading(false);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [isLoggedIn, userProfile]);

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

  const updateUserProfile = useCallback((patch: Partial<UserProfile>) => {
    setUserProfile((prev) =>
      prev ? { ...prev, ...patch } : { name: "", email: "", phone: "", pincode: "", ...patch }
    );
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserProfile(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }, []);

  return (
    <AppContext.Provider
      value={{
        isDark, toggleTheme,
        wishlist, toggleWishlist, isInWishlist,
        priceAlerts, addPriceAlert, removePriceAlert,
        authModal, setAuthModal,
        isLoggedIn, setIsLoggedIn,
        userProfile, setUserProfile, updateUserProfile, isProfileLoading,
        logout,
        editProfileOpen, setEditProfileOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};