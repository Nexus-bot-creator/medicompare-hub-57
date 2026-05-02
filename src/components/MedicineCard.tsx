import { useState, useEffect, useRef } from "react";
import { Heart, Bell, ExternalLink, ShoppingCart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import type { Medicine, PharmacyPrice } from "@/lib/mock-data";
import { getLowestPrice, getSavingsPercent, isOnlinePharmacy } from "@/lib/mock-data";

interface Props {
  medicine: Medicine;
  index?: number;
  sortBy?: "low" | "high";
}

const MedicineCard = ({ medicine, index = 0, sortBy = "low" }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const lowest = getLowestPrice(medicine.prices);
  const [customPrice, setCustomPrice] = useState(Math.round(lowest.price * 0.9));

  // Pincode-conflict confirmation
  const [pendingPrice, setPendingPrice] = useState<PharmacyPrice | null>(null);
  const [conflictPincode, setConflictPincode] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const { toggleWishlist, isInWishlist, addPriceAlert, addToCart, forceReplaceCart } = useApp();
  const navigate = useNavigate();
  const savings = getSavingsPercent(medicine.prices);
  const inWishlist = isInWishlist(medicine.id);

  const sortedPrices = [...medicine.prices].sort((a, b) =>
    sortBy === "low" ? a.price - b.price : b.price - a.price
  );

  const handleWishlist = () => {
    toggleWishlist(medicine.id);
    toast.success(inWishlist ? "Removed from Wishlist" : "Added to Wishlist!");
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPriceAlert({
      id: `alert-${medicine.id}`,
      medicineId: medicine.id,
      targetPrice: customPrice,
      currentPrice: lowest.price,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      status: "active",
    });
    setIsAlertOpen(false);
    toast.success("Price Alert Set!", {
      description: `We'll notify you when ${medicine.name} drops below ₹${customPrice}`,
    });
  };

  const handleBuyOnline = (p: PharmacyPrice) => {
    if (p.url && p.url !== "#") {
      window.open(p.url, "_blank", "noopener,noreferrer");
    } else {
      toast.info(`Redirecting to ${p.pharmacy}…`, { description: "External link not configured (demo)." });
    }
  };

  const doAddToCart = (p: PharmacyPrice) => {
    const result = addToCart({
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      pharmacy: p.pharmacy,
      pincode: p.pincode,
      area: p.area,
      price: p.price,
    });
    if (result.ok === true) {
      toast.success("Added to cart", { description: `${medicine.name} from ${p.pharmacy}` });
    } else {
      setPendingPrice(p);
      setConflictPincode(result.existingPincode);
    }
  };

  const handlePrimary = () => {
    if (!lowest.inStock) return;
    if (isOnlinePharmacy(lowest.pharmacy)) handleBuyOnline(lowest);
    else doAddToCart(lowest);
  };

  const primaryIsOnline = isOnlinePharmacy(lowest.pharmacy);

  return (
    <>
      <div
        ref={ref}
        className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ transitionDelay: `${(index % 6) * 100}ms` }}
      >
        <Card className="group overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 cursor-pointer" onClick={() => navigate(`/medicine/${medicine.id}`)}>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-base truncate hover:text-primary transition-colors">{medicine.name}</h3>
                <p className="text-sm text-muted-foreground">{medicine.dosage} · {medicine.form}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{medicine.manufacturer}</p>
                {medicine.salt && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 bg-muted/50 inline-block px-2 py-0.5 rounded border border-border/50">
                    Contains: <span className="font-medium text-foreground/80">{medicine.salt}</span>
                  </p>
                )}
              </div>
              {savings > 0 && (
                <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs shrink-0">
                  Save {savings}%
                </Badge>
              )}
            </div>

            {/* Price table */}
            <div className="space-y-1.5 mb-4">
              {sortedPrices.map((p) => {
                const isLowest = p.price === lowest.price && p.inStock;
                const online = isOnlinePharmacy(p.pharmacy);
                return (
                  <div key={p.pharmacy} className={`flex items-center justify-between text-sm px-2.5 py-1.5 rounded-md transition-colors ${isLowest ? "bg-accent" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <span className={`block truncate ${!p.inStock ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {p.pharmacy}
                        {!online && (
                          <span className="ml-1.5 text-[9px] uppercase tracking-wide bg-primary/10 text-primary px-1 py-0.5 rounded">
                            Local
                          </span>
                        )}
                      </span>
                      <span className="block text-[10px] text-muted-foreground truncate">
                        {p.area} · {p.pincode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!p.inStock && <span className="text-xs text-destructive">Out of stock</span>}
                      <span className={`font-semibold ${isLowest ? "text-primary" : "text-foreground"}`}>
                        ₹{p.price}
                      </span>
                      {p.inStock && !online && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-primary hover:bg-primary/10"
                          onClick={(e) => { e.stopPropagation(); doAddToCart(p); }}
                          aria-label={`Add ${medicine.name} from ${p.pharmacy} to cart`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-sm h-9"
                disabled={!lowest.inStock}
                onClick={handlePrimary}
              >
                {primaryIsOnline ? (
                  <><ExternalLink className="h-3.5 w-3.5" /> Buy Now</>
                ) : (
                  <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`rounded-lg h-9 w-9 shrink-0 ${inWishlist ? "text-destructive border-destructive/30 bg-destructive/5" : ""}`}
                onClick={handleWishlist}
              >
                <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
              </Button>

              <Button variant="outline" size="icon" className="rounded-lg h-9 w-9 shrink-0" onClick={() => setIsAlertOpen(true)}>
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Alert Popup */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Set Price Alert</DialogTitle>
            <DialogDescription>
              Get notified when the price of {medicine.name} drops.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAlertSubmit} className="space-y-4 mt-2">
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg text-sm">
              <span className="text-muted-foreground">Current Lowest Price:</span>
              <span className="font-semibold text-foreground">₹{lowest.price}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`target-${medicine.id}`}>Your Target Price (₹)</Label>
              <Input
                id={`target-${medicine.id}`}
                type="number"
                min="1"
                max={lowest.price > 1 ? lowest.price - 1 : 1}
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                required
                className="rounded-lg text-lg"
              />
            </div>
            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button type="button" variant="ghost" className="rounded-lg" onClick={() => setIsAlertOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                Set Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pincode conflict prompt */}
      <AlertDialog open={!!pendingPrice} onOpenChange={(open) => { if (!open) setPendingPrice(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Switch delivery pincode?</AlertDialogTitle>
            <AlertDialogDescription>
              Your cart already has items from pincode <strong>{conflictPincode}</strong>. Local
              pharmacies can only ship within a single pincode. Clear your cart and add this item
              from <strong>{pendingPrice?.pincode}</strong> instead?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Keep current cart</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                if (!pendingPrice) return;
                forceReplaceCart({
                  medicineId: medicine.id,
                  medicineName: medicine.name,
                  dosage: medicine.dosage,
                  pharmacy: pendingPrice.pharmacy,
                  pincode: pendingPrice.pincode,
                  area: pendingPrice.area,
                  price: pendingPrice.price,
                });
                toast.success("Cart cleared and item added", { description: `${medicine.name} from ${pendingPrice.pharmacy}` });
                setPendingPrice(null);
              }}
            >
              Clear & Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MedicineCard;
