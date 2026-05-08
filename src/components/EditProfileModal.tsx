import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; 

const EditProfileModal = () => {
  const { editProfileOpen, setEditProfileOpen, userProfile, updateUserProfile } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState<{ pincode?: string; phone?: string }>({});
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editProfileOpen && userProfile) {
      setName(userProfile.name ?? "");
      setEmail(userProfile.email ?? "");
      setPhone(userProfile.phone ?? "");
      // 🛠️ FIXED: Reading from default_pincode
      setPincode(userProfile.default_pincode ?? ""); 
      setErrors({});
    }
  }, [editProfileOpen, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation
    const nextErrors: typeof errors = {};
    if (!/^\d{6}$/.test(pincode)) nextErrors.pincode = "Pincode must be exactly 6 digits";
    if (phone && !/^\d{10}$/.test(phone)) nextErrors.phone = "Phone must be 10 digits";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    // 2. Send to Django
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("You must be logged in to update your profile.");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: name.trim(),
          phone_number: phone,      
          default_pincode: pincode  
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save profile to the server.");
      }

      // 3. 🛠️ FIXED: Writing to default_pincode so the AppContext stays synced!
      updateUserProfile({ name: name.trim(), email: email.trim(), phone, default_pincode: pincode });
      toast.success("Profile updated successfully!");
      setEditProfileOpen(false);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={editProfileOpen}
      onOpenChange={(open) => !isLoading && setEditProfileOpen(open)} 
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
          <DialogDescription>
            Keep your details up to date. Pincode is required for accurate local pricing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-lg" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-phone">Phone</Label>
            <Input
              id="p-phone"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit number"
              className="rounded-lg"
              disabled={isLoading}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-pincode">
              Default Pincode <span className="text-destructive">*</span>
            </Label>
            <Input
              id="p-pincode"
              inputMode="numeric"
              required
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="e.g. 110001"
              className="rounded-lg"
              aria-invalid={!!errors.pincode}
              aria-describedby="p-pincode-err"
              disabled={isLoading}
            />
            {errors.pincode && <p id="p-pincode-err" className="text-xs text-destructive">{errors.pincode}</p>}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;