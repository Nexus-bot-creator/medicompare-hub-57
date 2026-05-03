import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/contexts/AppContext";
// 🛠️ NEW: Added Mail icon for the header!
import { LayoutDashboard, LogOut, MapPin, Phone, Pencil, AlertTriangle, Home, Mail } from "lucide-react";
import { toast } from "sonner";

const initialsOf = (name?: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
};

const ProfileMenu = () => {
  const { userProfile, isProfileLoading, logout, setEditProfileOpen } = useApp();

  const pincodeMissing = !userProfile?.default_pincode || !/^\d{6}$/.test(userProfile.default_pincode);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Open profile menu"
          className="group relative rounded-full ring-1 ring-border/60 hover:ring-primary/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Avatar className="h-9 w-9 transition-transform duration-200 group-hover:scale-105">
            <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.name ?? "Profile"} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {initialsOf(userProfile?.name)}
            </AvatarFallback>
          </Avatar>
          {pincodeMissing && !isProfileLoading && (
            <span
              aria-label="Pincode required"
              className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-background"
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(92vw,22rem)] p-0 rounded-2xl border border-white/40 dark:border-white/10 shadow-2xl bg-[#D9F3F0]/90 dark:bg-[#132A27]/95 backdrop-blur-2xl backdrop-saturate-200 ring-1 ring-white/20 overflow-hidden animate-in fade-in-0 zoom-in-95"
      >
        {/* 🛠️ UPDATED HEADER: Now shows Avatar, Name, and Email! */}
        <div className="p-5 border-b border-border/40 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
          {isProfileLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-background shadow-sm">
                <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.name ?? "Profile"} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                  {initialsOf(userProfile?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground text-base truncate">{userProfile?.name || "Unnamed user"}</p>
                <p className="text-xs truncate flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="font-medium">{userProfile?.email || "Email not set"}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 🛠️ UPDATED DETAILS: Better spacing and a multi-line address block */}
        <div className="p-3 space-y-1">
          {isProfileLoading ? (
            <div className="p-2 space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : (
            <>
              <DetailRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={userProfile?.phone || "Not set"}
                muted={!userProfile?.phone}
              />
              <DetailRow
                icon={<MapPin className="h-4 w-4" />}
                label="Default Pincode"
                value={userProfile?.default_pincode || "Required"}
                muted={!userProfile?.default_pincode}
                warning={pincodeMissing}
              />
              
              {pincodeMissing && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2.5 mx-2 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Pincode is required for accurate local pricing.</span>
                </div>
              )}

              {/* 🛠️ NEW: A dedicated, vertical block for the address so it fits perfectly */}
              <div className="flex flex-col gap-1.5 rounded-xl px-3 py-3 mx-1 mt-1 bg-white/40 dark:bg-black/20 transition-colors">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide font-medium">
                  <Home className="h-4 w-4 text-[#188B7F] dark:text-[#17CFBC]" />
                  <span className="text-hero-gradient">Delivery Address</span>
                </div>
                <p className={`text-sm pl-6 leading-relaxed ${!userProfile?.default_address ? "text-muted-foreground italic" : "text-foreground font-medium"}`}>
                  {userProfile?.default_address || "No default address set. Add one during checkout."}
                </p>
              </div>
            </>
          )}
        </div>

        {/* 🛠️ UPDATED ACTIONS: Cleaner buttons */}
        <div className="p-3 pt-1 border-t border-border/40 bg-muted/20">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg gap-3 h-10 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setEditProfileOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
          <Link to="/dashboard" className="block mt-1">
            <Button variant="ghost" className="w-full justify-start rounded-lg gap-3 h-10 hover:bg-primary/10 hover:text-primary transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              My Dashboard
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start rounded-lg gap-3 h-10 mt-1 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Sub-component for single-line details (Phone, Pincode)
const DetailRow = ({
  icon,
  label,
  value,
  muted,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
  warning?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 mx-1 hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide font-medium">
      <span className="text-[#188B7F] dark:text-[#17CFBC]">{icon}</span>
      <span className="text-hero-gradient">{label}</span>
    </div>
    <span
      className={`text-sm font-semibold truncate max-w-[50%] text-right ${
        warning ? "text-destructive" : muted ? "text-muted-foreground font-normal" : "text-foreground"
      }`}
    >
      {value}
    </span>
  </div>
);

export default ProfileMenu;