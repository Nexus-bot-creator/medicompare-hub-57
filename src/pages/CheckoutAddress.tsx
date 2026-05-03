import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { ArrowRight, MapPin, Loader2, CheckCircle2 } from "lucide-react"; // 🛠️ ADDED: CheckCircle2

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
  const { cart, cartPincode, userProfile, setAuthModal } = useApp(); 

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  // 🛠️ NEW: States for fetching saved addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  useEffect(() => {
    if (cart.length === 0) navigate("/cart", { replace: true });
  }, [cart.length, navigate]);

  // 🛠️ NEW: Fetch Saved Addresses from Django on Load
  useEffect(() => {
    const fetchAddresses = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoadingAddresses(false);
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/checkout/addresses/", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSavedAddresses(data);
          
          // Auto-fill the form if they have a default address saved
          const defaultAddress = data.find((addr: any) => addr.is_default);
          if (defaultAddress) {
             setForm(prev => ({
               ...prev,
               fullName: defaultAddress.full_name,
               phone: defaultAddress.phone,
               line1: defaultAddress.address_line_1,
               line2: defaultAddress.address_line_2 || "",
               city: defaultAddress.city,
               state: defaultAddress.state,
               pincode: cartPincode || defaultAddress.pincode, // Prioritize cart pincode
             }));
          }
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [cartPincode]);

  // Existing: Auto-fill City & State based on Pincode
  useEffect(() => {
    const fetchLocation = async () => {
      if (form.pincode.length === 6) {
        setIsFetchingLocation(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
          const data = await res.json();
          
          if (data && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            setForm(f => ({
              ...f,
              city: postOffice.District, 
              state: postOffice.State
            }));
            setErrors(e => ({ ...e, city: undefined, state: undefined }));
          }
        } catch (err) {
          console.error("Failed to fetch location data");
        } finally {
          setIsFetchingLocation(false);
        }
      }
    };

    fetchLocation();
  }, [form.pincode]);

  const set = <K extends keyof AddressForm>(key: K, value: AddressForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Please log in to continue checkout.");
      setAuthModal("login");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        address_line_1: parsed.data.line1,
        address_line_2: parsed.data.line2 || "",
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        is_default: true,
      };

      const res = await fetch("http://127.0.0.1:8000/api/checkout/addresses/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save address to server");

      const data = await res.json();

      sessionStorage.setItem("checkout:address", JSON.stringify(parsed.data));
      sessionStorage.setItem("checkout:address_id", data.id.toString()); 

      navigate("/checkout/payment");
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to save address. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
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

        {/* 🛠️ NEW: UI Notification for loaded address */}
        {!isLoadingAddresses && savedAddresses.length > 0 && (
           <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-sm">
              <CheckCircle2 className="h-4 w-4" /> 
              Loaded your saved default address. You can edit it below if needed.
           </div>
        )}

        <Card className="border border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} maxLength={80} className="rounded-lg" disabled={isLoadingAddresses} />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} className="rounded-lg" disabled={isLoadingAddresses} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" value={form.line1} onChange={(e) => set("line1", e.target.value)} maxLength={120} className="rounded-lg" placeholder="House / flat, street" disabled={isLoadingAddresses} />
                {errors.line1 && <p className="text-xs text-destructive">{errors.line1}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="line2">Address line 2 (optional)</Label>
                <Input id="line2" value={form.line2 || ""} onChange={(e) => set("line2", e.target.value)} maxLength={120} className="rounded-lg" placeholder="Landmark, area" disabled={isLoadingAddresses} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    City {isFetchingLocation && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} maxLength={50} className="rounded-lg" disabled={isLoadingAddresses} />
                  {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="flex items-center gap-2">
                    State {isFetchingLocation && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </Label>
                  <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={50} className="rounded-lg" disabled={isLoadingAddresses} />
                  {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode" inputMode="numeric" maxLength={6}
                    value={form.pincode}
                    onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
                    disabled={!!cartPincode || isLoadingAddresses}
                    className="rounded-lg bg-muted/50"
                  />
                  {errors.pincode && <p className="text-xs text-destructive">{errors.pincode}</p>}
                </div>
              </div>

              <div className="flex justify-between pt-2 gap-2">
                <Button type="button" variant="ghost" className="rounded-lg" onClick={() => navigate("/cart")} disabled={isSubmitting}>
                  Back to cart
                </Button>
                
                <Button type="submit" disabled={isSubmitting || isLoadingAddresses} className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <>Continue to payment <ArrowRight className="h-4 w-4" /></>
                  )}
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