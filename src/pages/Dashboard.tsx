import { useState, useEffect } from "react";
import { Heart, Bell, Trash2, ArrowDown, Loader2, Search, ShoppingCart, Package, Calendar, Receipt, MapPin, Home, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; 

const Dashboard = () => {
  const { wishlist, toggleWishlist, priceAlerts, removePriceAlert, isLoggedIn, setAuthModal, cart } = useApp();
  const navigate = useNavigate(); 
  
  const [wishlistMedicines, setWishlistMedicines] = useState<any[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // 🛠️ NEW: States for Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  useEffect(() => {
    const fetchWishlistData = async () => {
      if (wishlist.length === 0) {
        setWishlistMedicines([]);
        return;
      }
      setIsLoadingWishlist(true);
      try {
        const promises = wishlist.map(id => 
          fetch(`http://127.0.0.1:8000/api/medicines/${id}/`).then(res => res.ok ? res.json() : null)
        );
        const results = await Promise.all(promises);
        setWishlistMedicines(results.filter(m => m !== null));
      } catch (error) {
        console.error("Failed to fetch wishlist medicines", error);
      } finally {
        setIsLoadingWishlist(false);
      }
    };
    if (isLoggedIn) fetchWishlistData();
  }, [wishlist, isLoggedIn]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      setIsLoadingOrders(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/user/orders/", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setOrders(await res.json());
      } catch (error) {
        toast.error("Failed to load your order history.");
      } finally {
        setIsLoadingOrders(false);
      }
    };
    if (isLoggedIn) fetchOrders();
  }, [isLoggedIn]);

  // 🛠️ NEW: Fetch Addresses
  const fetchAddresses = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setIsLoadingAddresses(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/checkout/addresses/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setAddresses(await res.json());
    } catch (error) {
      toast.error("Failed to load addresses.");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchAddresses();
  }, [isLoggedIn]);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/user/orders/${orderId}/cancel/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Order cancelled successfully");
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling.");
    }
  };

  // 🛠️ NEW: Handle Address Actions
  const handleSetDefaultAddress = async (addressId: number) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/checkout/addresses/${addressId}/`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Default address updated!");
        fetchAddresses(); // Refresh the list
        setTimeout(() => window.location.reload(), 1000); // Reload to update navbar context
      }
    } catch (error) {
      toast.error("Failed to update default address.");
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm("Delete this address permanently?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/checkout/addresses/${addressId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Address deleted.");
        fetchAddresses(); // Refresh the list
      }
    } catch (error) {
      toast.error("Failed to delete address.");
    }
  };

  const getLowestPrice = (prices: any[]) => {
    const valid = prices?.filter((p) => p.inStock) || [];
    if (valid.length === 0) return { price: 0, pharmacy: "Unknown" };
    return valid.reduce((min, curr) => (curr.price < min.price ? curr : min));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
        {/* ... (Keep your existing logged out UI) ... */}
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view your dashboard</h1>
          <p className="text-muted-foreground mb-6">Save medicines, track your orders, and set price alerts.</p>
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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={() => navigate('/cart')} variant="outline" className="gap-2 rounded-lg w-full sm:w-auto">
              <ShoppingCart className="h-4 w-4" /> View Cart{cart.length > 0 ? ` (${cart.length})` : ""}
            </Button>
            <Button onClick={() => navigate('/search')} className="gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto shadow-sm">
              <Search className="h-4 w-4" /> Find More Medicines
            </Button>
          </div>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="rounded-lg mb-6 flex flex-wrap h-auto p-1">
            <TabsTrigger value="orders" className="gap-2 rounded-md py-2">
              <Package className="h-4 w-4" /> Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2 rounded-md py-2">
              <Heart className="h-4 w-4" /> Wishlist ({wishlist.length})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 rounded-md py-2">
              <Bell className="h-4 w-4" /> Price Alerts ({priceAlerts.length})
            </TabsTrigger>
            {/* 🛠️ NEW: Addresses Tab Trigger */}
            <TabsTrigger value="addresses" className="gap-2 rounded-md py-2">
              <MapPin className="h-4 w-4" /> Addresses ({addresses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {/* ... (Keep your existing Orders logic exactly as is) ... */}
            {isLoadingOrders ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl bg-card/50">
                <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="mb-5">You haven't placed any orders yet.</p>
                <Button onClick={() => navigate('/search')} variant="outline" className="gap-2 rounded-lg">
                  <ShoppingCart className="h-4 w-4" /> Start Shopping
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="border border-border overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-3 border-b border-border flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        Order #ORD-{order.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3.5 w-3.5" /> {order.formatted_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {(order.status === 'PENDING' || order.status === 'PAID') && (
                        <Button 
                          variant="ghost" size="sm" 
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Cancel Order
                        </Button>
                      )}
                      <Badge 
                        variant="secondary" 
                        className={
                          order.status === 'PAID' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200" : 
                          order.status === 'CANCELLED' ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-200" : ""
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="p-4 flex justify-between items-center bg-card hover:bg-muted/10 transition-colors">
                          <div className="min-w-0 pr-4">
                            <p className="font-medium text-foreground truncate">{item.medicine_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.dosage} • Supplied by {item.pharmacy_name}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium">₹{item.price_at_purchase}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-muted/10 border-t border-border flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Total Paid</span>
                      <span className="text-lg font-bold text-primary">₹{order.total_amount}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-3">
             {/* ... (Keep your existing Wishlist logic exactly as is) ... */}
             {isLoadingWishlist ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
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
                      <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => { toggleWishlist(m.id.toString()); toast.success("Removed from Wishlist"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3">
            {/* ... (Keep your existing Alerts logic exactly as is) ... */}
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
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { removePriceAlert(alert.id); toast.success("Alert removed"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 🛠️ NEW: Addresses Tab Content */}
          <TabsContent value="addresses" className="space-y-4">
            {isLoadingAddresses ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl bg-card/50">
                <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="mb-5">You haven't saved any addresses yet.</p>
                <Button onClick={() => navigate('/cart')} variant="outline" className="gap-2 rounded-lg">
                  Add one during checkout
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <Card key={addr.id} className={`border relative ${addr.is_default ? 'border-primary shadow-sm bg-primary/5' : 'border-border'}`}>
                    {addr.is_default && (
                      <div className="absolute -top-3 -right-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="h-3 w-3" /> Default
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <Home className={`h-5 w-5 mt-0.5 ${addr.is_default ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <h3 className="font-semibold text-foreground">{addr.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{addr.phone}</p>
                          <p className="text-sm mt-1 text-foreground leading-relaxed">
                            {addr.address_line_1} <br />
                            {addr.address_line_2 && <>{addr.address_line_2}<br/></>}
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-border">
                        {!addr.is_default && (
                          <Button 
                            variant="outline" size="sm" 
                            className="flex-1 rounded-lg border-primary/20 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button 
                          variant="ghost" size="sm" 
                          className={`rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 ${addr.is_default ? 'w-full' : ''}`}
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;