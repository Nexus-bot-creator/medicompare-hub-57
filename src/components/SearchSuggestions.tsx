import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Pill, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const popularSearches = ["Paracetamol", "Vitamin D3", "Cetirizine", "Amoxicillin"];
const categories = ["Pain Relief", "Antibiotics", "Diabetes", "Heart Health", "Allergy", "Vitamins"];

interface Props {
  query: string;
  onSelect: (value: string) => void;
  visible: boolean;
}

const SearchSuggestions = ({ query, onSelect, visible }: Props) => {
  const navigate = useNavigate();
  const { userProfile } = useApp(); // Used to get accurate local pricing!
  
  const [matchedMedicines, setMatchedMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const q = query.toLowerCase().trim();

  // 🚀 The Debounced API Fetch
  useEffect(() => {
    if (!q) {
      setMatchedMedicines([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        let url = `${import.meta.env.VITE_API_URL}/api/medicines/search/?q=${encodeURIComponent(q)}`;
        
        // If they have a pincode saved, pass it so the "from ₹XX" price is completely accurate!
        if (userProfile?.default_pincode) {
          url += `&pincode=${userProfile.default_pincode}`;
        }
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setMatchedMedicines(data.slice(0, 5)); // Show max 5 suggestions
        }
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Waits 300ms after the user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [q, userProfile?.default_pincode]);

  if (!visible) return null;

  const matchedCategories = q
    ? categories.filter((c) => c.toLowerCase().includes(q))
    : [];

  const handleMedicineClick = (id: string) => {
    navigate(`/medicine/${id}`);
  };

  const handleSearchClick = (term: string) => {
    onSelect(term);
  };

  // Helper to calculate the lowest live price
  const getLowestPrice = (prices: any[]) => {
    const valid = prices?.filter((p) => p.inStock) || [];
    if (valid.length === 0) return { price: 0 };
    return valid.reduce((min, curr) => (curr.price < min.price ? curr : min));
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-y-auto max-h-[60vh] z-50 animate-fade-in">
      {/* No query — show popular & categories */}
      {!q && (
        <div className="p-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground px-2 mb-1.5 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Popular Searches
            </p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearchClick(term)}
                  className="px-3 py-1.5 text-sm rounded-full bg-accent text-accent-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground px-2 mb-1.5 flex items-center gap-1">
              <Pill className="h-3 w-3" /> Browse Categories
            </p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSearchClick(cat)}
                  className="px-3 py-1.5 text-sm rounded-full bg-secondary text-secondary-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {q && isLoading && (
        <div className="p-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* No Results state */}
      {q && !isLoading && matchedMedicines.length === 0 && matchedCategories.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No suggestions found. Press Enter to search.
        </div>
      )}

      {/* Category matches */}
      {q && !isLoading && matchedCategories.length > 0 && (
        <div className="px-1 pt-2 pb-1">
          <p className="text-xs font-medium text-muted-foreground px-3 mb-1">Categories</p>
          {matchedCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleSearchClick(cat)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors flex items-center gap-2 text-foreground"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Medicine matches */}
      {q && !isLoading && matchedMedicines.length > 0 && (
        <div className="px-1 pb-2 pt-1">
          <p className="text-xs font-medium text-muted-foreground px-3 mb-1">Medicines</p>
          {matchedMedicines.map((m) => {
            const lowest = getLowestPrice(m.prices);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleMedicineClick(m.id)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors flex items-center justify-between group"
              >
                <div className="flex flex-col">
                <div>
                  <span className="text-foreground font-medium">{m.name}</span>
                  <span className="text-muted-foreground ml-1.5 text-xs">
                    {m.dosage} · {m.form}
                  </span>
                </div>
                {/* 🛠️ NEW: Display the Salt name so users know why this matched! */}
                {m.salt && (
                  <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[200px]">
                    Contains: {m.salt}
                  </span>
                )}
              </div>
                <span className="text-primary font-semibold text-xs">
                  from ₹{lowest.price}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;