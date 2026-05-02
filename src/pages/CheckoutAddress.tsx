import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { ArrowRight, MapPin } from "lucide-react";

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit phone"),
  line1: z.string().trim().min(4, "House / flat / street").max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(50),
  state: z.string().trim().min(2).max(50),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

type AddressForm = z.infer<typeof addressSchema>;

const CheckoutAddress = () => {
  const navigate = useNavigate();
  const { cart, cartPincode, userProfile } = useApp();

  const [form, setForm] = useState<AddressForm>({
    fullName: userProfile?.name || "",
    phone: userProfile?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: cartPincode || userProfile?.default_pincode || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});

  useEffect(() => {
    if (cart.length === 0) navigate("/cart", { replace: true });
  }, [cart.length, navigate]);

  const set = <K extends keyof AddressForm>(key: K, value: AddressForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof AddressForm, string>> = {};
      parsed.error.issues.forEach((iss) => {
        const k = iss.path[0] as keyof AddressForm;
        if (!fieldErrors[k]) fieldErrors[k] = iss.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (cartPincode && parsed.data.pincode !== cartPincode) {
      toast.error("Pincode mismatch", {
        description: `Local pharmacies in your cart only deliver to ${cartPincode}.`,
      });
      setErrors((e) => ({ ...e, pincode: `Must match cart pincode ${cartPincode}` }));
      return;
    }
    sessionStorage.setItem("checkout:address", JSON.stringify(parsed.data));
    navigate("/checkout/payment");
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" /> Delivery Address
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {cartPincode ? `Delivery is restricted to pincode ${cartPincode}.` : "Enter where to deliver your order."}
        </p>

        <Card className="border border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} maxLength={80} className="rounded-lg" />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} className="rounded-lg" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" value={form.line1} onChange={(e) => set("line1", e.target.value)} maxLength={120} className="rounded-lg" placeholder="House / flat, street" />
                {errors.line1 && <p className="text-xs text-destructive">{errors.line1}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="line2">Address line 2 (optional)</Label>
                <Input id="line2" value={form.line2 || ""} onChange={(e) => set("line2", e.target.value)} maxLength={120} className="rounded-lg" placeholder="Landmark, area" />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} maxLength={50} className="rounded-lg" />
                  {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={50} className="rounded-lg" />
                  {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode" inputMode="numeric" maxLength={6}
                    value={form.pincode}
                    onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
                    disabled={!!cartPincode}
                    className="rounded-lg"
                  />
                  {errors.pincode && <p className="text-xs text-destructive">{errors.pincode}</p>}
                </div>
              </div>

              <div className="flex justify-between pt-2 gap-2">
                <Button type="button" variant="ghost" className="rounded-lg" onClick={() => navigate("/cart")}>
                  Back to cart
                </Button>
                <Button type="submit" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Continue to payment <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutAddress;
