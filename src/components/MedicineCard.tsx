import { Heart, Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import type { Medicine } from "@/lib/mock-data";
import { getLowestPrice, getSavingsPercent } from "@/lib/mock-data";

interface Props {
  medicine: Medicine;
}

const MedicineCard = ({ medicine }: Props) => {
  const { toggleWishlist, isInWishlist, addPriceAlert } = useApp();
  const lowest = getLowestPrice(medicine.prices);
  const savings = getSavingsPercent(medicine.prices);
  const inWishlist = isInWishlist(medicine.id);

  const handleWishlist = () => {
    toggleWishlist(medicine.id);
    toast.success(inWishlist ? "Removed from Wishlist" : "Added to Wishlist!");
  };

  const handleAlert = () => {
    addPriceAlert({
      id: `alert-${medicine.id}`,
      medicineId: medicine.id,
      targetPrice: Math.round(lowest.price * 0.9),
      currentPrice: lowest.price,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      status: "active",
    });
    toast.success("Price Alert Set!", {
      description: `We'll notify you when ${medicine.name} drops below ₹${Math.round(lowest.price * 0.9)}`,
    });
  };

  return (
    <Card className="group overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base truncate">{medicine.name}</h3>
            <p className="text-sm text-muted-foreground">{medicine.dosage} · {medicine.form}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{medicine.manufacturer}</p>
          </div>
          {savings > 0 && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs shrink-0">
              Save {savings}%
            </Badge>
          )}
        </div>

        {/* Price table */}
        <div className="space-y-1.5 mb-4">
          {medicine.prices.map((p) => {
            const isLowest = p.price === lowest.price && p.inStock;
            return (
              <div key={p.pharmacy} className={`flex items-center justify-between text-sm px-2.5 py-1.5 rounded-md transition-colors ${isLowest ? "bg-accent" : ""}`}>
                <span className={`${!p.inStock ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {p.pharmacy}
                </span>
                <div className="flex items-center gap-2">
                  {!p.inStock && <span className="text-xs text-destructive">Out of stock</span>}
                  <span className={`font-semibold ${isLowest ? "text-primary" : "text-foreground"}`}>
                    ₹{p.price}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-sm h-9">
            <ExternalLink className="h-3.5 w-3.5" />
            View Deal
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`rounded-lg h-9 w-9 shrink-0 ${inWishlist ? "text-destructive border-destructive/30 bg-destructive/5" : ""}`}
            onClick={handleWishlist}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" className="rounded-lg h-9 w-9 shrink-0" onClick={handleAlert}>
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;