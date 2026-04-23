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
    const valid = /^\d{6}$/.test(userProfile.pincode ?? "");
    if (!valid && !editProfileOpen) {
      setEditProfileOpen(true);
    }
  }, [isLoggedIn, isProfileLoading, userProfile, editProfileOpen, setEditProfileOpen]);

  return null;
};

export default ProfileGuard;
