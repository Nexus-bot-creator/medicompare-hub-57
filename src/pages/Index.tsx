import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, Bell, TrendingDown, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim() || "")}`);
  };

  const features = [
  { icon: TrendingDown, title: "Best Prices", desc: "Compare prices across 5+ pharmacies instantly" },
  { icon: Bell, title: "Price Alerts", desc: "Get notified when prices drop to your target" },
  { icon: Shield, title: "Trusted Sources", desc: "Only verified, licensed online pharmacies" }];


  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
            <Pill className="h-3.5 w-3.5" />
            Compare prices from 5+ pharmacies
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-5">
            Find the Best Prices for{" "}
            <span className="text-primary">Your Prescriptions</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Compare prices across top pharmacies, set price alerts, and save on your medical bills.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative flex items-center bg-card border border-border rounded-2xl shadow-lg shadow-primary/5 p-1.5">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a medicine (e.g., Paracetamol)..."
                className="pl-11 pr-4 h-12 border-0 bg-transparent focus-visible:ring-0 text-base" />
              
              <Button type="submit" className="rounded-xl px-6 h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shrink-0">
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6 mx-0 my-[10px]">
            {features.map((f) =>
            <div
              key={f.title}
              className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                    <f.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2026 MediCompare. Compare smarter, save more.
        </div>
      </footer>
    </div>);

};

export default Index;