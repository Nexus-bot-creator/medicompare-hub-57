import { useState, useEffect } from "react";
import { Heart, Bell, Trash2, ArrowDown, Loader2, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; 

const Dashboard = () => {
  const { wishlist, toggleWishlist, priceAlerts, removePriceAlert, isLoggedIn, setAuthModal } = useApp();
  const navigate = useNavigate(); 
  
  const [wishlistMedicines, setWishlistMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWishlistData = async () => {
      if (wishlist.length === 0) {
        setWishlistMedicines([]);
        return;
      }

      setIsLoading(true);
      try {
        const promises = wishlist.map(id => 
          fetch(`http://127.0.0.1:8000/api/medicines/${id}/`).then(res => res.ok ? res.json() : null)
        );
        const results = await Promise.all(promises);
        
        setWishlistMedicines(results.filter(m => m !== null));
      } catch (error) {
        console.error("Failed to fetch wishlist medicines", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchWishlistData();
    }
  }, [wishlist, isLoggedIn]);

  const getLowestPrice = (prices: any[]) => {
    const valid = prices?.filter((p) => p.inStock) || [];
    if (valid.length === 0) return { price: 0, pharmacy: "Unknown" };
    return valid.reduce((min, curr) => (curr.price < min.price ? curr : min));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view your dashboard</h1>
          <p className="text-muted-foreground mb-6">Save medicines to your wishlist and set price alerts.</p>
          <Button className="rounded-full px-8 bg-primary text-primary-foreground" onClick={() => setAuthModal("login")}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* 🛠️ UPDATED: Added a persistent header with a Search button! */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => navigate('/cart')}
              variant="outline"
              className="gap-2 rounded-lg w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4" /> View Cart{cart.length > 0 ? ` (${cart.length})` : ""}
            </Button>
            <Button
              onClick={() => navigate('/search')}
              className="gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto shadow-sm"
            >
              <Search className="h-4 w-4" /> Find More Medicines
            </Button>
          </div>
        </div>

        <Tabs defaultValue="wishlist">
          <TabsList className="rounded-lg mb-6">
            <TabsTrigger value="wishlist" className="gap-2 rounded-md">
              <Heart className="h-4 w-4" /> Wishlist ({wishlist.length})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 rounded-md">
              <Bell className="h-4 w-4" /> Price Alerts ({priceAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist" className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : wishlistMedicines.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl bg-card/50">
                <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="mb-5">Your wishlist is empty. Start adding medicines!</p>
                <Button onClick={() => navigate('/search')} variant="outline" className="gap-2 rounded-lg">
                  <Search className="h-4 w-4" /> Browse Medicines
                </Button>
              </div>
            ) : (
              wishlistMedicines.map((m) => {
                const lowest = getLowestPrice(m.prices);
                return (
                  <Card key={m.id} className="border border-border">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground">{m.name}</h3>
                        <p className="text-sm text-muted-foreground">{m.dosage} · {m.form} · {m.manufacturer}</p>
                        <p className="text-sm mt-1">
                          Best price: <span className="font-semibold text-primary">₹{lowest.price}</span>{" "}
                          <span className="text-muted-foreground">at {lowest.pharmacy}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => { toggleWishlist(m.id.toString()); toast.success("Removed from Wishlist"); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3">
            {priceAlerts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl bg-card/50">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="mb-5">No price alerts set yet. Search for medicines and set alerts!</p>
                <Button onClick={() => navigate('/search')} variant="outline" className="gap-2 rounded-lg">
                  <Search className="h-4 w-4" /> Find Medicines
                </Button>
              </div>
            ) : (
              priceAlerts.map((alert) => (
                <Card key={alert.id} className="border border-border">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">{alert.medicineName}</h3>
                      <p className="text-sm text-muted-foreground">{alert.dosage}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-sm">
                        <span>Current: <span className="font-semibold text-foreground">₹{alert.currentPrice}</span></span>
                        <ArrowDown className="h-3 w-3 text-muted-foreground" />
                        <span>Target: <span className="font-semibold text-primary">₹{alert.targetPrice}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={alert.status === "triggered" ? "default" : "secondary"} className={alert.status === "triggered" ? "bg-success text-success-foreground" : ""}>
                        {alert.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { removePriceAlert(alert.id); toast.success("Alert removed"); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;