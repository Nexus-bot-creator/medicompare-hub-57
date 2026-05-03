import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Loader2, Lock, Wallet, Banknote } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

// 🛠️ REQUIRED: Utility function to load the Razorpay checkout script safely
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

type Method = "card" | "upi" | "cod";

const CheckoutPayment = () => {
  const navigate = useNavigate();
  const { cart, clearCart, setAuthModal, userProfile } = useApp();

  const [method, setMethod] = useState<Method>("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [upi, setUpi] = useState("");
  const [processing, setProcessing] = useState(false);

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 199 ? 0 : 29) : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (cart.length === 0) navigate("/cart", { replace: true });
    if (!sessionStorage.getItem("checkout:address_id")) {
      navigate("/checkout/address", { replace: true });
    }
  }, [cart.length, navigate]);

  const validate = (): string | null => {
    if (method === "card") {
      if (!/^\d{12,19}$/.test(card.number.replace(/\s/g, ""))) return "Invalid card number";
      if (card.name.trim().length < 2) return "Enter cardholder name";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return "Expiry must be MM/YY";
      if (!/^\d{3,4}$/.test(card.cvv)) return "Invalid CVV";
    } else if (method === "upi") {
      if (!/^[\w.\-]{2,}@[\w]{2,}$/.test(upi)) return "Invalid UPI ID";
    }
    return null;
  };

  // 🛠️ REQUIRED: Helper function to finalize the order UI state after success
  const finalizeOrder = (dbOrderId: string) => {
    const addressData = JSON.parse(sessionStorage.getItem("checkout:address") || "{}");
    
    sessionStorage.setItem("checkout:order", JSON.stringify({
      orderId: `ORD-${dbOrderId}`, 
      method, 
      total, 
      items: cart, 
      address: addressData, 
      placedAt: new Date().toISOString(),
    }));
    
    sessionStorage.removeItem("checkout:address");
    sessionStorage.removeItem("checkout:address_id");
    clearCart();
    navigate("/checkout/success", { replace: true });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Please log in to finalize your order.");
      setAuthModal("login");
      return;
    }

    const addressId = sessionStorage.getItem("checkout:address_id");
    if (!addressId) {
       toast.error("Delivery address missing. Please enter it again.");
       navigate("/checkout/address");
       return;
    }

    setProcessing(true);

    try {
      // 1. Send the cart to Django to create the 'PENDING' Order
      const payload = {
        address_id: addressId,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        cart_items: cart.map(item => ({
           medicineId: item.medicineId,
           pharmacy: item.pharmacy,
           price: item.price,
           quantity: item.quantity
        }))
      };

      const res = await fetch("http://127.0.0.1:8000/api/checkout/create-order/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create order on server");
      const data = await res.json();
      
      // 2. COD Bypasses Razorpay entirely!
      if (method === "cod") {
        toast.success("Order Placed Successfully!");
        finalizeOrder(data.order_id);
        return; 
      }

      // 3. Online Payments: Load Razorpay Script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your connection.");
        setProcessing(false);
        return;
      }

      // 4. Configure the Razorpay Popup
      const options = {
        key: data.razorpay_key_id, 
        amount: data.amount * 100, 
        currency: data.currency,
        name: "MediPedia",
        description: "Medicine Order",
        order_id: data.razorpay_order_id, 
        
        // 5. 🛠️ THE NEW VERIFICATION HANDLER
        handler: async function (response: any) {
          try {
            // Send the secret signatures to Django to verify
            const verifyRes = await fetch("http://127.0.0.1:8000/api/checkout/verify-payment/", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            // If Django says it's good, finalize the order!
            toast.success("Payment Successful & Verified!");
            finalizeOrder(data.order_id);

          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment captured, but verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        prefill: {
          name: userProfile?.name || "Customer",
          email: userProfile?.email || "customer@example.com",
          contact: userProfile?.phone || "9999999999"
        },
        theme: {
          color: "#059669" // Matches your Emerald Green brand color
        }
      };

      // 6. Open the Razorpay Modal
      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        toast.error("Payment Failed", { description: response.error.description });
        setProcessing(false);
      });

      paymentObject.open();

    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
      setProcessing(false);
    } 
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" /> Payment
        </h1>
        <p className="text-sm text-muted-foreground mb-6">This is a demo gateway — no real charges.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <form onSubmit={handlePay} className="md:col-span-2 space-y-4">
            <Card className="border border-border">
              <CardContent className="p-5">
                <h2 className="font-semibold mb-3">Choose method</h2>
                <RadioGroup value={method} onValueChange={(v) => setMethod(v as Method)} className="grid sm:grid-cols-3 gap-3">
                  <Label htmlFor="m-card" className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer ${method === "card" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem id="m-card" value="card" /><CreditCard className="h-4 w-4" /> Card
                  </Label>
                  <Label htmlFor="m-upi" className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer ${method === "upi" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem id="m-upi" value="upi" /><Wallet className="h-4 w-4" /> UPI
                  </Label>
                  <Label htmlFor="m-cod" className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer ${method === "cod" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem id="m-cod" value="cod" /><Banknote className="h-4 w-4" /> COD
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            {method === "card" && (
              <Card className="border border-border">
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cnum">Card number</Label>
                    <Input id="cnum" inputMode="numeric" maxLength={19} placeholder="4242 4242 4242 4242"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, "") })}
                      className="rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cname">Name on card</Label>
                    <Input id="cname" maxLength={60} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cexp">Expiry (MM/YY)</Label>
                      <Input id="cexp" maxLength={5} placeholder="08/28" value={card.expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                          if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                          setCard({ ...card, expiry: v });
                        }}
                        className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ccvv">CVV</Label>
                      <Input id="ccvv" inputMode="numeric" maxLength={4} value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                        className="rounded-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {method === "upi" && (
              <Card className="border border-border">
                <CardContent className="p-5 space-y-1.5">
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input id="upi" placeholder="name@bank" value={upi} maxLength={64}
                    onChange={(e) => setUpi(e.target.value.trim())} className="rounded-lg" />
                </CardContent>
              </Card>
            )}

            {method === "cod" && (
              <Card className="border border-border">
                <CardContent className="p-5 text-sm text-muted-foreground">
                  Pay in cash when your order arrives. Please keep exact change ready.
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between pt-1 gap-2">
              <Button type="button" variant="ghost" className="rounded-lg" onClick={() => navigate("/checkout/address")}>
                Back
              </Button>
              <Button type="submit" disabled={processing} className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-2 min-w-[160px]">
                {processing ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>) : (<>Pay ₹{total.toFixed(2)}</>)}
              </Button>
            </div>
          </form>

          <Card className="border border-border h-fit md:sticky md:top-24">
            <CardContent className="p-5 space-y-3 text-sm">
              <h2 className="font-semibold">Order Summary</h2>
              <div className="space-y-1">
                {cart.map((c) => (
                  <div key={`${c.medicineId}-${c.pharmacy}`} className="flex justify-between text-muted-foreground">
                    <span className="truncate pr-2">{c.medicineName} × {c.quantity}</span>
                    <span className="text-foreground">₹{(c.price * c.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-2 flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;