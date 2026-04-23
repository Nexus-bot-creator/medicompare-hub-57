import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/contexts/AppContext";
import { LayoutDashboard, LogOut, MapPin, Phone, Pencil, AlertTriangle } from "lucide-react";
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

  const pincodeMissing = !userProfile?.pincode || !/^\d{6}$/.test(userProfile.pincode);

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
        className="w-[min(92vw,20rem)] p-0 rounded-2xl border border-white/40 dark:border-white/10 shadow-2xl bg-[#D9F3F0]/70 dark:bg-white/5 backdrop-blur-2xl backdrop-saturate-200 ring-1 ring-white/20 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/60 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-t-2xl">
          {isProfileLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 ring-2 ring-primary/30">
                <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.name ?? "Profile"} />
                <AvatarFallback className="bg-primary/15 text-primary font-bold text-lg">
                  {initialsOf(userProfile?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate text-hero-gradient">{userProfile?.name || "Unnamed user"}</p>
                <p className="text-xs truncate flex items-center gap-1">
                  <Phone className="h-3 w-3 shrink-0 text-[#188B7F] dark:text-[#17CFBC]" />
                  <span className="text-hero-gradient font-medium">{userProfile?.phone || "Phone not set"}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-2.5">
          {isProfileLoading ? (
            <>
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </>
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
                value={userProfile?.pincode || "Required"}
                muted={!userProfile?.pincode}
                warning={pincodeMissing}
              />
              {pincodeMissing && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Pincode is required for accurate local pricing.</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start rounded-lg gap-2 hover:bg-primary/5 hover:border-primary/40 transition-colors"
            onClick={() => setEditProfileOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
          <Link to="/dashboard" className="block">
            <Button variant="ghost" className="w-full justify-start rounded-lg gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start rounded-lg gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

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
  <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide font-medium">
      <span className="text-[#188B7F] dark:text-[#17CFBC]">{icon}</span>
      <span className="text-hero-gradient">{label}</span>
    </div>
    <span
      className={`text-sm font-semibold truncate max-w-[55%] text-right ${
        warning ? "text-destructive" : "text-hero-gradient"
      }`}
    >
      {value}
    </span>
  </div>
);

export default ProfileMenu;
