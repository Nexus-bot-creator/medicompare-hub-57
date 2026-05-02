import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Loader2, Lock, Wallet, Banknote } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

type Method = "card" | "upi" | "cod";

const CheckoutPayment = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useApp();

  const [method, setMethod] = useState<Method>("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [upi, setUpi] = useState("");
  const [processing, setProcessing] = useState(false);

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 199 ? 0 : 29) : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (cart.length === 0) navigate("/cart", { replace: true });
    if (!sessionStorage.getItem("checkout:address")) navigate("/checkout/address", { replace: true });
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

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setProcessing(true);
    setTimeout(() => {
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const address = JSON.parse(sessionStorage.getItem("checkout:address") || "{}");
      sessionStorage.setItem("checkout:order", JSON.stringify({
        orderId, method, total, items: cart, address, placedAt: new Date().toISOString(),
      }));
      sessionStorage.removeItem("checkout:address");
      clearCart();
      navigate("/checkout/success", { replace: true });
    }, 1400);
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
                {processing ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>) : (<>Pay ₹{total}</>)}
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
                    <span className="text-foreground">₹{c.price * c.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-2 flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total</span><span className="text-primary">₹{total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;
