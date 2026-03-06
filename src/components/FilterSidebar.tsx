import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { pharmacies } from "@/lib/mock-data";

interface Filters {
  sortBy: "low" | "high";
  inStockOnly: boolean;
  selectedPharmacies: string[];
  priceRange: [number, number];
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

      <Accordion type="multiple" defaultValue={["sort", "stock", "pharmacy", "price"]} className="space-y-1">
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