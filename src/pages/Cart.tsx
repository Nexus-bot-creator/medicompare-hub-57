import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const Cart = () => {
  const { cart, cartPincode, updateCartQuantity, removeFromCart, clearCart, isLoggedIn, setAuthModal } = useApp();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 199 ? 0 : 29) : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!isLoggedIn) {
      toast.info("Please log in to continue");
      setAuthModal("login");
      return;
    }
    navigate("/checkout/address");
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" /> Your Cart
            </h1>
            {cartPincode && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Delivering to pincode {cartPincode}
              </p>
            )}
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" className="text-muted-foreground" onClick={() => { clearCart(); toast.success("Cart cleared"); }}>
              Clear cart
            </Button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/50">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground mb-5">Your cart is empty.</p>
            <Link to="/search">
              <Button className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Browse Medicines</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item) => (
                <Card key={`${item.medicineId}-${item.pharmacy}`} className="border border-border">
                  <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{item.medicineName}</h3>
                        <Badge variant="secondary" className="text-[10px] uppercase">Local</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.dosage}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.pharmacy} · {item.area} ({item.pincode})
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center border border-border rounded-lg">
                        <Button
                          size="icon" variant="ghost" className="h-8 w-8 rounded-r-none"
                          onClick={() => updateCartQuantity(item.medicineId, item.pharmacy, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        ><Minus className="h-3.5 w-3.5" /></Button>
                        <span className="px-3 text-sm w-10 text-center" aria-label="Quantity">{item.quantity}</span>
                        <Button
                          size="icon" variant="ghost" className="h-8 w-8 rounded-l-none"
                          onClick={() => updateCartQuantity(item.medicineId, item.pharmacy, item.quantity + 1)}
                          aria-label="Increase quantity"
                        ><Plus className="h-3.5 w-3.5" /></Button>
                      </div>
                      <div className="text-right min-w-[72px]">
                        <p className="font-semibold text-foreground">₹{item.price * item.quantity}</p>
                        <p className="text-[11px] text-muted-foreground">₹{item.price} ea</p>
                      </div>
                      <Button
                        size="icon" variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.medicineId, item.pharmacy)}
                        aria-label="Remove item"
                      ><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-border h-fit lg:sticky lg:top-24">
              <CardContent className="p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-foreground">{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span></div>
                  {subtotal < 199 && subtotal > 0 && (
                    <p className="text-[11px] text-muted-foreground">Add ₹{(199 - subtotal).toFixed(2)} more for free delivery.</p>
                  )}
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
                <Button className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={handleCheckout}>
                  Buy Now <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
