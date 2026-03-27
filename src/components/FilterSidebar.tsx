import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { pharmacies } from "@/lib/mock-data";

interface Filters {
  sortBy: "low" | "high";
  inStockOnly: boolean;
  selectedPharmacies: string[];
  priceRange: [number, number];
  location?: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FilterSidebar = ({ filters, onChange }: Props) => {
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  return (
    <div className="space-y-1">
      <h2 className="font-semibold text-foreground text-sm px-1 mb-3">Filters</h2>

      <Accordion type="multiple" defaultValue={["location", "sort", "stock", "pharmacy", "price"]} className="space-y-1">
        <AccordionItem value="location" className="border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Local Vendors</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Find by Pincode</Label>
              <Input 
                placeholder="Enter pincode (e.g. 110001)" 
                value={filters.location || ""}
                onChange={(e) => update({ location: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-8 text-xs gap-1"
              onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    // In a real app we'd reverse geocode here, for now mock:
                    () => update({ location: "Current Location" }),
                    () => update({ location: "" })
                  );
                }
              }}
            >
              <MapPin className="h-3 w-3" />
              Use My Location
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort" className="border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Sort By</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            {[
              { value: "low" as const, label: "Price: Low to High" },
              { value: "high" as const, label: "Price: High to Low" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                <input
                  type="radio"
                  name="sortBy"
                  checked={filters.sortBy === opt.value}
                  onChange={() => update({ sortBy: opt.value })}
                  className="accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stock" className="border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Availability</AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={filters.inStockOnly}
                onCheckedChange={(v) => update({ inStockOnly: v })}
                id="in-stock"
              />
              <Label htmlFor="in-stock" className="text-sm">In Stock Only</Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pharmacy" className="border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Pharmacies</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            {pharmacies.map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={filters.selectedPharmacies.includes(p)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...filters.selectedPharmacies, p]
                      : filters.selectedPharmacies.filter((x) => x !== p);
                    update({ selectedPharmacies: next });
                  }}
                />
                <span className="text-foreground">{p}</span>
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Price Range</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <Slider
              min={0}
              max={200}
              step={5}
              value={filters.priceRange}
              onValueChange={(v) => update({ priceRange: v as [number, number] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹{filters.priceRange[0]}</span>
              <span>₹{filters.priceRange[1]}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterSidebar;