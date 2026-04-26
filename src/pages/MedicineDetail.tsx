import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Bell, ExternalLink, Star, TrendingDown, Package, Info, MapPin, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const MedicineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toggleWishlist, isInWishlist, addPriceAlert, userProfile } = useApp();

  // --- Dynamic State ---
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // State for the "Find Locally" feature
  const [searchInput, setSearchInput] = useState(""); 
  const [activePincode, setActivePincode] = useState("");

  // --- Auto-fill Smart Profile Pincode ---
  useEffect(() => {
    if (userProfile?.default_pincode && !activePincode) {
      setSearchInput(userProfile.default_pincode);
      setActivePincode(userProfile.default_pincode);
    }
  }, [userProfile, activePincode]);

  // --- Fetch Data from Django ---
  useEffect(() => {
    const fetchMedicine = async () => {
      setLoading(true);
      setError(false);
      try {
        let url = `http://127.0.0.1:8000/api/medicines/${id}/`;
        if (activePincode) {
          url += `?pincode=${activePincode}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setMedicine(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id, activePincode]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Medicine Not Found</h2>
          <p className="text-muted-foreground mb-4">We couldn't find the details for this medicine.</p>
          <Link to="/search"><Button variant="outline">Back to Search</Button></Link>
        </div>
      </div>
    );
  }

  // --- Calculations ---
  const inWishlist = isInWishlist(medicine.id.toString());
  const validPrices = medicine.prices.filter((p: any) => p.inStock);
  const lowestPriceObj = validPrices.length > 0 
    ? validPrices.reduce((prev: any, curr: any) => prev.price < curr.price ? prev : curr) 
    : medicine.prices[0];
  
  const lowestPrice = lowestPriceObj?.price || 0;
  const lowestPharmacy = lowestPriceObj?.pharmacy || "Unknown";

  const highestPrice = Math.max(...medicine.prices.map((p: any) => p.price));
  const savings = highestPrice > lowestPrice ? Math.round(((highestPrice - lowestPrice) / highestPrice) * 100) : 0;

  const sideEffectsList = medicine.side_effects ? medicine.side_effects.split(",").map((s: string) => s.trim()) : ["No data available"];
  const warningsList = medicine.warnings ? medicine.warnings.split(",").map((w: string) => w.trim()) : ["No data available"];

  const comparisonData = medicine.prices.map((p: any) => ({
    pharmacy: p.pharmacy.length > 10 ? p.pharmacy.slice(0, 10) + "…" : p.pharmacy,
    price: p.price,
    fill: p.price === lowestPrice && p.inStock ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
  }));

  const chartConfig = {
    price: { label: "Price (₹)", color: "hsl(var(--primary))" },
  };

  const handleWishlist = () => {
    toggleWishlist(medicine.id.toString());
    toast.success(inWishlist ? "Removed from Wishlist" : "Added to Wishlist!");
  };

  const handleAlert = () => {
    addPriceAlert({
      id: `alert-${medicine.id}`,
      medicineId: medicine.id.toString(),
      targetPrice: Math.round(lowestPrice * 0.9),
      currentPrice: lowestPrice,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      status: "active",
    });
    toast.success("Price Alert Set!", {
      description: `We'll notify you when ${medicine.name} drops below ₹${Math.round(lowestPrice * 0.9)}`,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : i < rating ? "fill-yellow-400/50 text-yellow-400" : "text-muted-foreground/30"}`} />
    ));
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pt-4">
          <Link to="/search" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to results
          </Link>
          <span>/</span>
          <span className="text-foreground">{medicine.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground">{medicine.name}</h1>
                      {savings > 0 && (
                        <Badge className="bg-accent text-accent-foreground">Save {savings}%</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{medicine.dosage} · {medicine.form} · {medicine.manufacturer}</p>
                    <Badge variant="outline" className="mt-2">{medicine.category}</Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" /> Live Price Comparison
                </h3>
                
                {medicine.prices.length === 0 ? (
                   <div className="p-4 text-center bg-muted/50 rounded-xl text-muted-foreground">
                     No pharmacies found matching this pincode.
                   </div>
                ) : (
                  <div className="space-y-2">
                    {medicine.prices.map((p: any) => {
                      const isLowest = p.price === lowestPrice && p.inStock;
                      return (
                        <div key={p.pharmacy} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${isLowest ? "bg-accent border border-primary/20" : "bg-muted/50"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${p.inStock ? "bg-green-500" : "bg-destructive"}`} />
                            <div>
                              <span className={`font-medium ${!p.inStock ? "text-muted-foreground line-through" : "text-foreground"}`}>{p.pharmacy}</span>
                              {isLowest && <Badge className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0">BEST</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!p.inStock && <span className="text-xs text-destructive">Out of stock</span>}
                            <span className={`text-lg font-bold ${isLowest ? "text-primary" : "text-foreground"}`}>₹{p.price}</span>
                            {p.inStock && (
                              <Button size="sm" variant={isLowest ? "default" : "outline"} className="rounded-lg gap-1 h-8 text-xs">
                                <ExternalLink className="h-3 w-3" /> Buy
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border border-border">
              <CardContent className="p-5">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Lowest Price</p>
                  <p className="text-4xl font-extrabold text-primary">₹{lowestPrice}</p>
                  <p className="text-sm text-muted-foreground">at {lowestPharmacy}</p>
                </div>
                <div className="space-y-2">
                  <Button className="w-full rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <ExternalLink className="h-4 w-4" /> View Best Deal
                  </Button>
                  <Button variant="outline" className={`w-full rounded-xl gap-2 ${inWishlist ? "text-destructive border-destructive/30 bg-destructive/5" : ""}`} onClick={handleWishlist}>
                    <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
                    {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl gap-2" onClick={handleAlert}>
                    <Bell className="h-4 w-4" /> Set Price Alert
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-5">
                <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" /> Quick Facts
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="text-foreground font-medium">{medicine.category}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Form</span><span className="text-foreground font-medium">{medicine.form}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Dosage</span><span className="text-foreground font-medium">{medicine.dosage}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Manufacturer</span><span className="text-foreground font-medium">{medicine.manufacturer}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Available at</span><span className="text-foreground font-medium">{medicine.prices.filter((p:any) => p.inStock).length} pharmacies</span></div>
                </div>
              </CardContent>
            </Card>

            {/* FULLY ALIGNED "FIND LOCALLY" CARD */}
            <Card className="border border-border">
              <CardContent className="p-5">
                <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Find Locally
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Check local vendor availability by pincode:</p>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. 110001" 
                        className="h-9 text-sm" 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                      <Button variant="secondary" className="h-9 px-3 shrink-0" onClick={() => {
                        setActivePincode(searchInput);
                        toast.success(`Searching vendors for ${searchInput}...`);
                      }}>Check</Button>
                    </div>

                    {userProfile?.default_pincode && activePincode === userProfile.default_pincode && (
                      <p className="text-[10px] text-primary font-medium mt-1">✨ Using saved home location</p>
                    )}
                  </div>
                  
                  {/* The OR divider */}
                  <div className="relative pt-1 pb-1">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                  </div>

                  {/* Button Stack matching the Sidebar */}
                  <div className="space-y-2">
                    {userProfile?.default_pincode && activePincode !== userProfile.default_pincode && (
                      <Button 
                        variant="outline" 
                        className="w-full h-8 text-xs gap-1 border-primary/20 text-primary hover:bg-primary/5"
                        onClick={() => {
                          setSearchInput(userProfile.default_pincode);
                          setActivePincode(userProfile.default_pincode);
                          toast.success("Applied saved home location");
                        }}
                      >
                        <Home className="h-3 w-3" />
                        Use Default ({userProfile.default_pincode})
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-8 text-xs gap-1"
                      onClick={() => {
                        if ("geolocation" in navigator) {
                          navigator.geolocation.getCurrentPosition(
                            () => {
                              setSearchInput("Current Location");
                              setActivePincode("Current Location");
                              toast.success("Using current location");
                            },
                            () => toast.error("Location access denied")
                          );
                        }
                      }}
                    >
                      <MapPin className="h-3 w-3" />
                      Use My Location
                    </Button>
                  </div>

                  {activePincode && (
                    <Button variant="ghost" className="w-full h-8 text-xs text-destructive mt-2" onClick={() => {
                        setSearchInput("");
                        setActivePincode("");
                    }}>
                        Clear Filter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="bg-muted rounded-xl p-1 h-auto flex flex-wrap">
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background px-4 py-2">Price History</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-background px-4 py-2">Pharmacy Logistics</TabsTrigger>
            <TabsTrigger value="dosage" className="rounded-lg data-[state=active]:bg-background px-4 py-2">Medical Info</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">7-Month Price Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[280px] w-full">
                    <LineChart data={medicine.price_history[0]?.history || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Current Price Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[280px] w-full">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="pharmacy" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="price" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicine.prices.map((p: any) => (
                <Card key={p.pharmacy} className="border border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{p.pharmacy}</h4>
                      <Badge variant="outline" className="text-xs">{p.inStock ? "In Stock" : "Out of Stock"}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      {renderStars(p.rating)}
                      <span className="text-sm font-semibold text-foreground ml-1">{p.rating}</span>
                      <span className="text-xs text-muted-foreground">({p.review_count.toLocaleString()})</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="text-foreground font-medium">{p.delivery_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Returns</span>
                        <span className="text-foreground font-medium">{p.return_policy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="text-foreground font-bold">₹{p.price}</span>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Trust Score</p>
                      <Progress value={p.rating * 20} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dosage">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" /> Usage & Indications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {medicine.usage || "No usage information available."}
                  </p>
                  <Separator className="my-4" />
                  <h4 className="font-semibold text-foreground text-sm mb-2">How to Take</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {medicine.how_to_take || "Consult your physician."}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Common Side Effects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {sideEffectsList.map((effect: string) => (
                        <li key={effect} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                          {effect}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-border border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-base text-destructive">⚠️ Warnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {warningsList.map((warning: string) => (
                        <li key={warning} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 mt-1.5" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MedicineDetail;