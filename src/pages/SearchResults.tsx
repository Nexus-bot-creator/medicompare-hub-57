import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MedicineCard from "@/components/MedicineCard";
import FilterSidebar from "@/components/FilterSidebar";
import { medicines, getLowestPrice, pharmacies } from "@/lib/mock-data";

interface Filters {
  sortBy: "low" | "high";
  inStockOnly: boolean;
  selectedPharmacies: string[];
  priceRange: [number, number];
  location?: string;
}

const defaultFilters: Filters = {
  sortBy: "low",
  inStockOnly: false,
  selectedPharmacies: [...pharmacies],
  priceRange: [0, 200],
  location: "",
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const pincodeFilter = (filters.location || "").trim();
    let result = medicines.filter((m) => {
      const q = query.toLowerCase();
      if (q && !m.name.toLowerCase().includes(q) && !m.category.toLowerCase().includes(q)) return false;

      const lowestPrice = getLowestPrice(m.prices).price;
      if (lowestPrice < filters.priceRange[0] || lowestPrice > filters.priceRange[1]) return false;

      if (filters.inStockOnly && !m.prices.some((p) => p.inStock)) return false;

      if (filters.selectedPharmacies.length < pharmacies.length) {
        const hasSelectedPharmacy = m.prices.some((p) => filters.selectedPharmacies.includes(p.pharmacy));
        if (!hasSelectedPharmacy) return false;
      }

      // Pincode filter — only show medicines available at the entered pincode
      if (/^\d{6}$/.test(pincodeFilter)) {
        if (!m.prices.some((p) => p.pincode === pincodeFilter)) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      const aPrice = getLowestPrice(a.prices).price;
      const bPrice = getLowestPrice(b.prices).price;
      return filters.sortBy === "low" ? aPrice - bPrice : bPrice - aPrice;
    });

    return result;
  }, [query, filters]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {query ? `Results for "${query}"` : "All Medicines"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} medicines found</p>
          </div>

          {/* Mobile filter trigger */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden gap-2 rounded-lg">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-6">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterSidebar filters={filters} onChange={setFilters} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20">
              <FilterSidebar filters={filters} onChange={setFilters} />
              <Button
                variant="ghost"
                className="mt-3 text-xs text-muted-foreground w-full"
                onClick={() => setFilters(defaultFilters)}
              >
                <X className="h-3 w-3 mr-1" /> Reset Filters
              </Button>
            </div>
          </aside>

          {/* Results grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">No medicines found matching your criteria.</p>
                <Button variant="outline" className="mt-4 rounded-lg" onClick={() => setFilters(defaultFilters)}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((m, i) => (
                  <MedicineCard key={m.id} medicine={m} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;