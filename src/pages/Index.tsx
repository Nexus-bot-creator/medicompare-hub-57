import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, Bell, TrendingDown, Pill, ArrowRight, CheckCircle2, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchSuggestions from "@/components/SearchSuggestions";

const FeatureCard = ({ icon: Icon, title, desc, index }: { icon: React.ElementType; title: string; desc: string; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`text-left p-7 rounded-2xl bg-card border border-border hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all duration-500 cursor-pointer group ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
};

const StatItem = ({ value, label, index }: { value: string; label: string; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

const Index = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(query.trim() || "")}`);
  };

  const features = [
    { icon: TrendingDown, title: "Real-Time Price Comparison", desc: "Instantly compare prices across 5+ licensed pharmacies to find the best deal on every medicine." },
    { icon: Bell, title: "Smart Price Alerts", desc: "Set your target price and get notified the moment a pharmacy drops below it. Never overpay again." },
    { icon: Shield, title: "Verified & Trusted", desc: "Every pharmacy in our network is licensed and verified, so you can shop with complete confidence." },
  ];

  const stats = [
    { value: "5+", label: "Partner Pharmacies" },
    { value: "10K+", label: "Medicines Tracked" },
    { value: "₹500+", label: "Avg. Savings/Year" },
    { value: "50K+", label: "Happy Users" },
  ];

  const steps = [
    { num: "01", title: "Search Your Medicine", desc: "Type the name of your prescription or browse by category." },
    { num: "02", title: "Compare Prices Instantly", desc: "See real-time prices from all major online pharmacies side by side." },
    { num: "03", title: "Save & Get Alerts", desc: "Buy at the lowest price or set an alert for future price drops." },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
                <Pill className="h-3.5 w-3.5" />
                Trusted by 50,000+ users
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-foreground leading-[1.15] tracking-tight mb-5">
                Stop Overpaying for{" "}
                <span className="text-primary">Your Medicines</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Compare prices across India's top online pharmacies in seconds. Set smart alerts and never miss a price drop.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-col gap-2.5 mb-8">
                {["Compare 5+ pharmacies instantly", "100% free, no account needed", "Verified & licensed sources only"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate("/search")}
                  className="rounded-xl px-6 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                >
                  Browse All Medicines
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-xl px-6 h-11"
                >
                  How It Works
                </Button>
              </div>
            </div>

            {/* Right — Search */}
            <div className="lg:pl-4">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-primary/5">
                <p className="text-sm font-medium text-muted-foreground mb-3">Search for a medicine</p>
                <form onSubmit={handleSearch}>
                  <div ref={searchRef} className="relative flex items-center bg-background border border-border rounded-xl p-1">
                    <Search className="absolute left-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="e.g., Paracetamol, Vitamin D3..."
                      className="pl-10 pr-4 h-11 border-0 bg-transparent focus-visible:ring-0 text-base"
                    />
                    <Button type="submit" className="rounded-lg px-5 h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shrink-0">
                      Search
                    </Button>

                    <SearchSuggestions
                      query={query}
                      visible={showSuggestions}
                      onSelect={(val) => {
                        setQuery(val);
                        setShowSuggestions(false);
                        navigate(`/search?q=${encodeURIComponent(val)}`);
                      }}
                    />
                  </div>
                </form>

                {/* Quick categories */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Pain Relief", "Diabetes", "Vitamins", "Antibiotics"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(cat)}`)}
                      className="px-3 py-1.5 text-xs rounded-full bg-accent text-accent-foreground hover:bg-primary/15 hover:text-primary transition-colors font-medium"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social proof mini */}
              <div className="flex items-center gap-3 mt-4 px-1">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                      <Users className="h-3 w-3 text-primary" />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">50,000+</span> users saving on medicines
                </div>
                <div className="flex items-center gap-0.5 ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 border-y border-border bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <StatItem key={s.label} value={s.value} label={s.label} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Why Choose MediCompare?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Everything you need to find the best medicine prices, all in one place.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Three simple steps to start saving on your prescriptions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const ref = useRef<HTMLDivElement>(null);
              const [isVisible, setIsVisible] = useState(false);
              useEffect(() => {
                const observer = new IntersectionObserver(
                  ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
                  { threshold: 0.2 }
                );
                if (ref.current) observer.observe(ref.current);
                return () => observer.disconnect();
              }, []);
              return (
                <div
                  key={step.num}
                  ref={ref}
                  className={`relative text-center transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="text-5xl font-extrabold text-primary/10 mb-3">{step.num}</div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Ready to Start Saving?</h2>
          <p className="text-muted-foreground mb-8">Search your first medicine and see how much you could save today.</p>
          <Button
            onClick={() => navigate("/search")}
            className="rounded-xl px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 text-base"
          >
            Compare Prices Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2026 MediCompare. Compare smarter, save more.
        </div>
      </footer>
    </div>
  );
};

export default Index;
