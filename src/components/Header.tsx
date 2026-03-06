import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Heart, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { isDark, toggleTheme, wishlist, setAuthModal, isLoggedIn } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
      setHeaderSearch("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Medi<span className="text-primary">Compare</span>
          </span>
        </Link>

        {/* Center search - visible after scroll */}
        {scrolled && (
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search medicines..."
                className="pl-9 h-9 rounded-full bg-secondary/80 border-0 focus-visible:ring-primary"
              />
            </div>
          </form>
        )}

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                  {wishlist.length}
                </Badge>
              )}
            </Button>
          </Link>

          {isLoggedIn ? (
            <Link to="/dashboard">
              <Button variant="outline" className="rounded-full px-4 h-9 text-sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Button variant="ghost" className="rounded-full px-4 h-9 text-sm" onClick={() => setAuthModal("login")}>
                Log in
              </Button>
              <Button className="rounded-full px-4 h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setAuthModal("signup")}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border p-4 space-y-3 animate-fade-in">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search medicines..."
                className="pl-9 rounded-full bg-secondary/80 border-0"
              />
            </div>
          </form>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Heart className="h-4 w-4" />
                {wishlist.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                    {wishlist.length}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
          {isLoggedIn ? (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full rounded-full">Dashboard</Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 rounded-full" onClick={() => { setAuthModal("login"); setMobileOpen(false); }}>
                Log in
              </Button>
              <Button className="flex-1 rounded-full bg-primary text-primary-foreground" onClick={() => { setAuthModal("signup"); setMobileOpen(false); }}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;