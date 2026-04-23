import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const EditProfileModal = () => {
  const { editProfileOpen, setEditProfileOpen, userProfile, updateUserProfile } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState<{ pincode?: string; phone?: string }>({});

  useEffect(() => {
    if (editProfileOpen && userProfile) {
      setName(userProfile.name ?? "");
      setEmail(userProfile.email ?? "");
      setPhone(userProfile.phone ?? "");
      setPincode(userProfile.pincode ?? "");
      setErrors({});
    }
  }, [editProfileOpen, userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!/^\d{6}$/.test(pincode)) nextErrors.pincode = "Pincode must be exactly 6 digits";
    if (phone && !/^\d{10}$/.test(phone)) nextErrors.phone = "Phone must be 10 digits";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    updateUserProfile({ name: name.trim(), email: email.trim(), phone, pincode });
    toast.success("Profile updated");
    setEditProfileOpen(false);
  };

  return (
    <Dialog
      open={editProfileOpen}
      onOpenChange={(open) => setEditProfileOpen(open)}
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
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-lg" />
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
            />
            {errors.pincode && <p id="p-pincode-err" className="text-xs text-destructive">{errors.pincode}</p>}
          </div>

          <Button type="submit" className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
            Save Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
