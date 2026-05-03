import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OrderSnapshot {
  orderId: string;
  method: string;
  total: number;
  items: Array<{ medicineName: string; dosage: string; pharmacy: string; quantity: number; price: number }>;
  address: { fullName: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string };
  placedAt: string;
}

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderSnapshot | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("checkout:order");
    if (!raw) { navigate("/", { replace: true }); return; }
    setOrder(JSON.parse(raw));
  }, [navigate]);

  if (!order) return null;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Order Confirmed!</h1>
          <p className="text-muted-foreground mt-1">Thank you. Your order has been placed successfully.</p>
        </div>

        <Card className="border border-border mb-4">
          <CardContent className="p-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono text-foreground">{order.orderId}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="text-foreground uppercase">{order.method}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Paid</span><span className="text-primary font-semibold">₹{order.total.toFixed(2)}</span></div>
          </CardContent>
        </Card>

        <Card className="border border-border mb-4">
          <CardContent className="p-5 space-y-2 text-sm">
            <h2 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Items</h2>
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between border-t border-border pt-2 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <p className="text-foreground truncate">{it.medicineName} <span className="text-muted-foreground">· {it.dosage}</span></p>
                  <p className="text-xs text-muted-foreground">{it.pharmacy} × {it.quantity}</p>
                </div>
                <span className="text-foreground">₹{it.price * it.quantity}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border mb-6">
          <CardContent className="p-5 text-sm">
            <h2 className="font-semibold mb-2">Delivering to</h2>
            <p className="text-foreground">{order.address.fullName}</p>
            <p className="text-muted-foreground">
              {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} - {order.address.pincode}
            </p>
            <p className="text-muted-foreground">Phone: {order.address.phone}</p>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Link to="/"><Button variant="outline" className="rounded-lg gap-2"><Home className="h-4 w-4" /> Home</Button></Link>
          <Link to="/dashboard"><Button className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Go to Dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
