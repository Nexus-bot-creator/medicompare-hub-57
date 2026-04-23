import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MedicineCard from "@/components/MedicineCard";
import FilterSidebar from "@/components/FilterSidebar";
// Notice we removed 'medicines' from this import, but kept the types/helpers!
import { getLowestPrice, pharmacies, type Medicine } from "@/lib/mock-data"; 

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

  // --- NEW: React State for Django Data ---
  const [liveMedicines, setLiveMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW: The Bridge to Django ---
  useEffect(() => {
    const fetchMedicines = async () => {
      setIsLoading(true);
      try {
        let url = `http://127.0.0.1:8000/api/medicines/search/?q=${query}`;
        
        // If user typed a valid 6-digit pincode, send it to Django!
        const pincode = (filters.location || "").trim();
        if (/^\d{6}$/.test(pincode)) {
          url += `&pincode=${pincode}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();
        setLiveMedicines(data);
      } catch (error) {
        console.error("Error fetching from Django:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the fetch so it doesn't spam the server on every keystroke
    const timeoutId = setTimeout(() => fetchMedicines(), 300);
    return () => clearTimeout(timeoutId);
  }, [query, filters.location]); // Re-run when search bar or pincode changes

  // --- UPDATED: Client-side filtering ---
  const filtered = useMemo(() => {
    // We filter the liveMedicines now, not the mock data!
    let result = liveMedicines.filter((m) => {
      // Note: We removed the search query and pincode filters from here 
      // because our Django backend is already handling that perfectly!

      // 1. Price Range Filter
      const lowestPrice = getLowestPrice(m.prices).price;
      if (lowestPrice < filters.priceRange[0] || lowestPrice > filters.priceRange[1]) return false;

      // 2. In Stock Filter
      if (filters.inStockOnly && !m.prices.some((p) => p.inStock)) return false;

      // 3. Pharmacy Filter
      if (filters.selectedPharmacies.length < pharmacies.length) {
        const hasSelectedPharmacy = m.prices.some((p) => filters.selectedPharmacies.includes(p.pharmacy));
        if (!hasSelectedPharmacy) return false;
      }

      return true;
    });

    // 4. Sorting Logic
    result.sort((a, b) => {
      const aPrice = getLowestPrice(a.prices).price;
      const bPrice = getLowestPrice(b.prices).price;
      return filters.sortBy === "low" ? aPrice - bPrice : bPrice - aPrice;
    });

    return result;
  }, [liveMedicines, filters]); // Re-run when live data or filters change

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {query ? `Results for "${query}"` : "All Medicines"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "Searching..." : `${filtered.length} medicines found`}
            </p>
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
            {isLoading ? (
               // Loading State
               <div className="flex justify-center items-center py-20">
                 <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground">Fetching live data from PharmaPoint...</p>
                 </div>
               </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">No medicines found matching your criteria.</p>
                <Button variant="outline" className="mt-4 rounded-lg" onClick={() => setFilters(defaultFilters)}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((m, i) => (
                  <MedicineCard key={m.id} medicine={m} index={i} sortBy={filters.sortBy} />
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