import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

/**
 * Forces the EditProfileModal open whenever a logged-in user is missing a valid pincode.
 * Pincode is mandatory for the price-comparison experience.
 */
const ProfileGuard = () => {
  const { isLoggedIn, userProfile, isProfileLoading, editProfileOpen, setEditProfileOpen } = useApp();

  useEffect(() => {
    if (!isLoggedIn || isProfileLoading || !userProfile) return;
    
    // 🛠️ FIXED: Look for default_pincode instead of pincode!
    const valid = /^\d{6}$/.test(userProfile.default_pincode ?? "");
    
    // Only auto-prompt once per user; if they've dismissed/saved before, don't nag again.
    const dismissedKey = `profilePromptShown:${userProfile.email || userProfile.name || "anon"}`;
    const alreadyShown = typeof window !== "undefined" && localStorage.getItem(dismissedKey) === "true";
    if (!valid && !editProfileOpen && !alreadyShown) {
      setEditProfileOpen(true);
      try { localStorage.setItem(dismissedKey, "true"); } catch { /* ignore */ }
    }
  }, [isLoggedIn, isProfileLoading, userProfile, editProfileOpen, setEditProfileOpen]);

  return null;
};

export default ProfileGuard;