import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Bell, ExternalLink, Star, TrendingDown, Package, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { medicines, getLowestPrice, getHighestPrice, getSavingsPercent } from "@/lib/mock-data";

const generatePriceHistory = (basePrice: number, pharmacy: string) => {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  return months.map((month, i) => ({
    month,
    price: Math.round(basePrice * (0.85 + Math.random() * 0.3)),
  }));
};

const pharmacyReviews: Record<string, { rating: number; count: number; delivery: string; returns: string }> = {
  PharmEasy: { rating: 4.3, count: 12400, delivery: "1-2 days", returns: "7-day return" },
  Netmeds: { rating: 4.1, count: 9800, delivery: "2-3 days", returns: "10-day return" },
  "1mg": { rating: 4.5, count: 15200, delivery: "1-3 days", returns: "7-day return" },
  "Apollo Pharmacy": { rating: 4.4, count: 11300, delivery: "Same day", returns: "5-day return" },
  MedPlus: { rating: 3.9, count: 7600, delivery: "2-4 days", returns: "7-day return" },
};

const dosageInfo: Record<string, { usage: string; sideEffects: string[]; warnings: string[]; howToTake: string }> = {
  Paracetamol: { usage: "Used for mild to moderate pain relief and fever reduction. Commonly prescribed for headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.", sideEffects: ["Nausea", "Allergic skin rash", "Liver damage (overdose)"], warnings: ["Do not exceed 4g per day", "Avoid with alcohol", "Consult doctor if pregnant"], howToTake: "Take with or without food. Swallow whole with water. Space doses at least 4 hours apart." },
  Amoxicillin: { usage: "A penicillin-type antibiotic used to treat bacterial infections including ear, nose, throat, urinary tract, and skin infections.", sideEffects: ["Diarrhea", "Nausea", "Skin rash", "Vomiting"], warnings: ["Complete the full course", "Inform doctor of penicillin allergy", "May reduce effectiveness of oral contraceptives"], howToTake: "Take at evenly spaced intervals. Can be taken with or without food. Complete the entire prescribed course." },
  Metformin: { usage: "First-line medication for Type 2 diabetes. Helps control blood sugar levels by improving insulin sensitivity and reducing glucose production.", sideEffects: ["Nausea", "Diarrhea", "Stomach upset", "Metallic taste"], warnings: ["Monitor kidney function", "Avoid excessive alcohol", "Inform doctor before surgery or contrast dye procedures"], howToTake: "Take with meals to reduce stomach upset. Swallow whole; do not crush extended-release tablets." },
};

const getDefaultDosageInfo = (name: string) => ({
  usage: `${name} is prescribed for its specific therapeutic effects. Consult your doctor or pharmacist for detailed usage information tailored to your condition.`,
  sideEffects: ["Nausea", "Headache", "Dizziness", "Allergic reactions (rare)"],
  warnings: ["Follow prescribed dosage", "Consult doctor if symptoms persist", "Inform doctor of other medications"],
  howToTake: "Take as directed by your physician. Read the patient information leaflet before starting.",
});

const MedicineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toggleWishlist, isInWishlist, addPriceAlert } = useApp();

  const medicine = medicines.find((m) => m.id === id);
  if (!medicine) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Medicine Not Found</h2>
          <Link to="/search"><Button variant="outline">Back to Search</Button></Link>
        </div>
      </div>
    );
  }

  const lowest = getLowestPrice(medicine.prices);
  const highest = getHighestPrice(medicine.prices);
  const savings = getSavingsPercent(medicine.prices);
  const inWishlist = isInWishlist(medicine.id);
  const info = dosageInfo[medicine.name] || getDefaultDosageInfo(medicine.name);

  const priceHistoryData = medicine.prices.map((p) => ({
    pharmacy: p.pharmacy,
    history: generatePriceHistory(p.price, p.pharmacy),
  }));

  const comparisonData = medicine.prices.map((p) => ({
    pharmacy: p.pharmacy.length > 10 ? p.pharmacy.slice(0, 10) + "…" : p.pharmacy,
    price: p.price,
    fill: p.price === lowest.price && p.inStock ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
  }));

  const chartConfig = {
    price: { label: "Price (₹)", color: "hsl(var(--primary))" },
  };

  const handleWishlist = () => {
    toggleWishlist(medicine.id);
    toast.success(inWishlist ? "Removed from Wishlist" : "Added to Wishlist!");
  };

  const handleAlert = () => {
    addPriceAlert({
      id: `alert-${medicine.id}`,
      medicineId: medicine.id,
      targetPrice: Math.round(lowest.price * 0.9),
      currentPrice: lowest.price,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      status: "active",
    });
    toast.success("Price Alert Set!", {
      description: `We'll notify you when ${medicine.name} drops below ₹${Math.round(lowest.price * 0.9)}`,
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pt-4">
          <Link to="/search" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to results
          </Link>
          <span>/</span>
          <span className="text-foreground">{medicine.name}</span>
        </div>

        {/* Top section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Medicine Info */}
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

                {/* Price comparison table */}
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" /> Price Comparison
                </h3>
                <div className="space-y-2">
                  {medicine.prices.map((p) => {
                    const isLowest = p.price === lowest.price && p.inStock;
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
              </CardContent>
            </Card>
          </div>

          {/* Action sidebar */}
          <div className="space-y-4">
            <Card className="border border-border">
              <CardContent className="p-5">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Lowest Price</p>
                  <p className="text-4xl font-extrabold text-primary">₹{lowest.price}</p>
                  <p className="text-sm text-muted-foreground">at {lowest.pharmacy}</p>
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
                  <div className="flex justify-between"><span className="text-muted-foreground">Available at</span><span className="text-foreground font-medium">{medicine.prices.filter(p => p.inStock).length} pharmacies</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs section */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="bg-muted rounded-xl p-1 h-auto">
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background px-4 py-2">Price History</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-background px-4 py-2">Pharmacy Reviews</TabsTrigger>
            <TabsTrigger value="dosage" className="rounded-lg data-[state=active]:bg-background px-4 py-2">Dosage Info</TabsTrigger>
          </TabsList>

          {/* Price History */}
          <TabsContent value="history">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Line chart */}
              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">7-Month Price Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[280px] w-full">
                    <LineChart data={priceHistoryData[0]?.history || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Bar chart comparison */}
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

          {/* Pharmacy Reviews */}
          <TabsContent value="reviews">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicine.prices.map((p) => {
                const review = pharmacyReviews[p.pharmacy];
                if (!review) return null;
                return (
                  <Card key={p.pharmacy} className="border border-border">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground">{p.pharmacy}</h4>
                        <Badge variant="outline" className="text-xs">{p.inStock ? "In Stock" : "Out of Stock"}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mb-3">
                        {renderStars(review.rating)}
                        <span className="text-sm font-semibold text-foreground ml-1">{review.rating}</span>
                        <span className="text-xs text-muted-foreground">({review.count.toLocaleString()})</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery</span>
                          <span className="text-foreground font-medium">{review.delivery}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Returns</span>
                          <span className="text-foreground font-medium">{review.returns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price</span>
                          <span className="text-foreground font-bold">₹{p.price}</span>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Trust Score</p>
                        <Progress value={review.rating * 20} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Dosage Info */}
          <TabsContent value="dosage">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" /> Usage & Indications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{info.usage}</p>
                  <Separator className="my-4" />
                  <h4 className="font-semibold text-foreground text-sm mb-2">How to Take</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{info.howToTake}</p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Common Side Effects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {info.sideEffects.map((effect) => (
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
                      {info.warnings.map((warning) => (
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
