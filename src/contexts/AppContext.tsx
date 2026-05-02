import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { PriceAlert } from "@/lib/mock-data";

export interface CartItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  pharmacy: string;
  pincode: string;
  area: string;
  price: number;
  quantity: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  default_pincode: string; // <-- FIXED: Renamed to match Django!
  avatarUrl?: string;
}

interface AppContextType {
  isDark: boolean;
  toggleTheme: () => void;
  
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  
  priceAlerts: PriceAlert[];
  addPriceAlert: (alert: PriceAlert) => void;
  removePriceAlert: (id: string) => void;
  
  authModal: "login" | "signup" | null;
  setAuthModal: (modal: "login" | "signup" | null) => void;
  
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  updateUserProfile: (patch: Partial<UserProfile>) => void;
  isProfileLoading: boolean;
  logout: () => void;
  
  editProfileOpen: boolean;
  setEditProfileOpen: (v: boolean) => void;

  // Cart (single-pincode rule)
  cart: CartItem[];
  cartPincode: string | null;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => { ok: true } | { ok: false; reason: "pincode-conflict"; existingPincode: string };
  forceReplaceCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateCartQuantity: (medicineId: string, pharmacy: string, quantity: number) => void;
  removeFromCart: (medicineId: string, pharmacy: string) => void;
  clearCart: () => void;
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
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("cart");
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch { return []; }
  });

  useEffect(() => {
    if (cart.length > 0) localStorage.setItem("cart", JSON.stringify(cart));
    else localStorage.removeItem("cart");
  }, [cart]);

  const cartPincode = cart[0]?.pincode ?? null;

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
      let result: { ok: true } | { ok: false; reason: "pincode-conflict"; existingPincode: string } = { ok: true };
      setCart((prev) => {
        if (prev.length > 0 && prev[0].pincode !== item.pincode) {
          result = { ok: false, reason: "pincode-conflict", existingPincode: prev[0].pincode };
          return prev;
        }
        const existing = prev.find((c) => c.medicineId === item.medicineId && c.pharmacy === item.pharmacy);
        if (existing) {
          return prev.map((c) =>
            c === existing ? { ...c, quantity: c.quantity + quantity } : c
          );
        }
        return [...prev, { ...item, quantity }];
      });
      return result;
    },
    []
  );

  const forceReplaceCart = useCallback((item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setCart([{ ...item, quantity }]);
  }, []);

  const updateCartQuantity = useCallback((medicineId: string, pharmacy: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.medicineId === medicineId && c.pharmacy === pharmacy ? { ...c, quantity } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((medicineId: string, pharmacy: string) => {
    setCart((prev) => prev.filter((c) => !(c.medicineId === medicineId && c.pharmacy === pharmacy)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("access_token");
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (userProfile) localStorage.setItem("userProfile", JSON.stringify(userProfile));
    else localStorage.removeItem("userProfile");
  }, [userProfile]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      setIsProfileLoading(true);
      try {
        const headers = { "Authorization": `Bearer ${token}` };

        // Fetch Profile
        const profileRes = await fetch("http://127.0.0.1:8000/api/auth/profile/", { headers });
        if (profileRes.ok) {
          const data = await profileRes.json();
          setUserProfile({
            name: data.name || "User",
            email: data.email,
            phone: data.phone_number || "",
            default_pincode: data.default_pincode || "", // <-- FIXED: Map directly to default_pincode!
          });
        } else if (profileRes.status === 401) {
          logout();
          return;
        }

        // Fetch Wishlist
        const wishlistRes = await fetch("http://127.0.0.1:8000/api/user/wishlist/", { headers });
        if (wishlistRes.ok) {
          const wlData = await wishlistRes.json();
          setWishlist(wlData);
        }

        // Fetch Price Alerts
        const alertsRes = await fetch("http://127.0.0.1:8000/api/user/alerts/", { headers });
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setPriceAlerts(alertsData);
        }

      } catch (error) {
        console.error("Failed to fetch user data from Django:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn]);

  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);

  const toggleWishlist = useCallback(async (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        await fetch("http://127.0.0.1:8000/api/user/wishlist/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ medicine_id: id })
        });
      } catch (error) {
        console.error("Failed to sync wishlist with server", error);
      }
    }
  }, []);

  const isInWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const addPriceAlert = useCallback(async (alert: PriceAlert) => {
    setPriceAlerts((prev) => [...prev.filter((a) => a.medicineId !== alert.medicineId), alert]);

    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/user/alerts/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            medicineId: alert.medicineId,
            targetPrice: alert.targetPrice
          })
        });
        const data = await res.json();
        
        if (res.ok) {
          setPriceAlerts((prev) => prev.map((a) => a.medicineId === alert.medicineId ? { ...a, id: data.id } : a));
        }
      } catch (error) {
        console.error("Failed to save price alert", error);
      }
    }
  }, []);

  const removePriceAlert = useCallback(async (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
    
    const token = localStorage.getItem("access_token");
    if (token && !id.startsWith("alert-")) {
      try {
        await fetch(`http://127.0.0.1:8000/api/user/alerts/${id}/`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Failed to delete alert", error);
      }
    }
  }, []);

  const updateUserProfile = useCallback((patch: Partial<UserProfile>) => {
    setUserProfile((prev) =>
      prev ? { ...prev, ...patch } : { name: "", email: "", phone: "", default_pincode: "", ...patch } // <-- FIXED fallback!
    );
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setWishlist([]);    
    setPriceAlerts([]); 
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userProfile");
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