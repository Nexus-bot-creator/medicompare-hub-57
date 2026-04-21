export interface PharmacyPrice {
  pharmacy: string;
  price: number;
  inStock: boolean;
  url: string;
  /** Pincode where this pharmacy/vendor stocks the medicine */
  pincode: string;
  /** Human-readable area / locality for the pincode */
  area: string;
  /** City for grouping */
  city: string;
  /** Approximate distance in km from the pincode centroid (for nearby sorting) */
  distanceKm: number;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  form: string;
  manufacturer: string;
  category: string;
  prices: PharmacyPrice[];
  image?: string;
}

export interface PriceAlert {
  id: string;
  medicineId: string;
  targetPrice: number;
  currentPrice: number;
  medicineName: string;
  dosage: string;
  status: "active" | "triggered" | "expired";
}

export const pharmacies = ["PharmEasy", "Netmeds", "1mg", "Apollo Pharmacy", "MedPlus"];

/** Supported pincodes mapped to area + city for the location filter */
export interface PincodeInfo {
  pincode: string;
  area: string;
  city: string;
}

export const pincodes: PincodeInfo[] = [
  { pincode: "110001", area: "Connaught Place", city: "New Delhi" },
  { pincode: "110016", area: "Hauz Khas", city: "New Delhi" },
  { pincode: "400001", area: "Fort", city: "Mumbai" },
  { pincode: "400050", area: "Bandra West", city: "Mumbai" },
  { pincode: "560001", area: "MG Road", city: "Bengaluru" },
  { pincode: "560034", area: "Koramangala", city: "Bengaluru" },
  { pincode: "600001", area: "Parrys", city: "Chennai" },
  { pincode: "700001", area: "BBD Bagh", city: "Kolkata" },
];

/** Quick lookup helper */
export const getPincodeInfo = (pincode: string): PincodeInfo | undefined =>
  pincodes.find((p) => p.pincode === pincode);

export const medicines: Medicine[] = [
  {
    id: "1", name: "Paracetamol", dosage: "500mg", form: "Tablet", manufacturer: "Cipla Ltd",
    category: "Pain Relief",
    prices: [
      { pharmacy: "PharmEasy", price: 25, inStock: true, url: "#", pincode: "110001", area: "Connaught Place", city: "New Delhi", distanceKm: 1.2 },
      { pharmacy: "Netmeds", price: 22, inStock: true, url: "#", pincode: "110016", area: "Hauz Khas", city: "New Delhi", distanceKm: 3.5 },
      { pharmacy: "1mg", price: 28, inStock: true, url: "#", pincode: "400050", area: "Bandra West", city: "Mumbai", distanceKm: 0.8 },
    ],
  },
  {
    id: "2", name: "Amoxicillin", dosage: "250mg", form: "Capsule", manufacturer: "Sun Pharma",
    category: "Antibiotics",
    prices: [
      { pharmacy: "PharmEasy", price: 85, inStock: true, url: "#", pincode: "560034", area: "Koramangala", city: "Bengaluru", distanceKm: 2.1 },
      { pharmacy: "Apollo Pharmacy", price: 78, inStock: true, url: "#", pincode: "560001", area: "MG Road", city: "Bengaluru", distanceKm: 1.5 },
      { pharmacy: "MedPlus", price: 92, inStock: false, url: "#", pincode: "600001", area: "Parrys", city: "Chennai", distanceKm: 4.0 },
    ],
  },
  {
    id: "3", name: "Metformin", dosage: "500mg", form: "Tablet", manufacturer: "USV Ltd",
    category: "Diabetes",
    prices: [
      { pharmacy: "Netmeds", price: 45, inStock: true, url: "#", pincode: "400001", area: "Fort", city: "Mumbai", distanceKm: 1.0 },
      { pharmacy: "1mg", price: 42, inStock: true, url: "#", pincode: "400050", area: "Bandra West", city: "Mumbai", distanceKm: 2.7 },
      { pharmacy: "PharmEasy", price: 48, inStock: true, url: "#", pincode: "110001", area: "Connaught Place", city: "New Delhi", distanceKm: 0.6 },
    ],
  },
  {
    id: "4", name: "Atorvastatin", dosage: "10mg", form: "Tablet", manufacturer: "Ranbaxy Labs",
    category: "Heart Health",
    prices: [
      { pharmacy: "Apollo Pharmacy", price: 120, inStock: true, url: "#", pincode: "560001", area: "MG Road", city: "Bengaluru", distanceKm: 1.8 },
      { pharmacy: "Netmeds", price: 105, inStock: true, url: "#", pincode: "700001", area: "BBD Bagh", city: "Kolkata", distanceKm: 2.2 },
      { pharmacy: "MedPlus", price: 115, inStock: true, url: "#", pincode: "110016", area: "Hauz Khas", city: "New Delhi", distanceKm: 3.1 },
    ],
  },
  {
    id: "5", name: "Omeprazole", dosage: "20mg", form: "Capsule", manufacturer: "Dr. Reddy's",
    category: "Gastric",
    prices: [
      { pharmacy: "1mg", price: 55, inStock: true, url: "#", pincode: "560034", area: "Koramangala", city: "Bengaluru", distanceKm: 0.9 },
      { pharmacy: "PharmEasy", price: 60, inStock: true, url: "#", pincode: "400001", area: "Fort", city: "Mumbai", distanceKm: 1.4 },
      { pharmacy: "Netmeds", price: 52, inStock: false, url: "#", pincode: "600001", area: "Parrys", city: "Chennai", distanceKm: 3.6 },
    ],
  },
  {
    id: "6", name: "Cetirizine", dosage: "10mg", form: "Tablet", manufacturer: "Cipla Ltd",
    category: "Allergy",
    prices: [
      { pharmacy: "MedPlus", price: 18, inStock: true, url: "#", pincode: "600001", area: "Parrys", city: "Chennai", distanceKm: 1.1 },
      { pharmacy: "PharmEasy", price: 15, inStock: true, url: "#", pincode: "110001", area: "Connaught Place", city: "New Delhi", distanceKm: 0.7 },
      { pharmacy: "Apollo Pharmacy", price: 20, inStock: true, url: "#", pincode: "560001", area: "MG Road", city: "Bengaluru", distanceKm: 2.4 },
    ],
  },
  {
    id: "7", name: "Azithromycin", dosage: "500mg", form: "Tablet", manufacturer: "Alkem Labs",
    category: "Antibiotics",
    prices: [
      { pharmacy: "Netmeds", price: 95, inStock: true, url: "#", pincode: "700001", area: "BBD Bagh", city: "Kolkata", distanceKm: 1.3 },
      { pharmacy: "1mg", price: 88, inStock: true, url: "#", pincode: "560034", area: "Koramangala", city: "Bengaluru", distanceKm: 2.0 },
      { pharmacy: "PharmEasy", price: 102, inStock: true, url: "#", pincode: "400050", area: "Bandra West", city: "Mumbai", distanceKm: 3.2 },
    ],
  },
  {
    id: "8", name: "Ibuprofen", dosage: "400mg", form: "Tablet", manufacturer: "Abbott India",
    category: "Pain Relief",
    prices: [
      { pharmacy: "Apollo Pharmacy", price: 32, inStock: true, url: "#", pincode: "110016", area: "Hauz Khas", city: "New Delhi", distanceKm: 1.6 },
      { pharmacy: "MedPlus", price: 28, inStock: true, url: "#", pincode: "400001", area: "Fort", city: "Mumbai", distanceKm: 0.9 },
      { pharmacy: "1mg", price: 35, inStock: false, url: "#", pincode: "560001", area: "MG Road", city: "Bengaluru", distanceKm: 4.2 },
    ],
  },
  {
    id: "9", name: "Losartan", dosage: "50mg", form: "Tablet", manufacturer: "Torrent Pharma",
    category: "Heart Health",
    prices: [
      { pharmacy: "PharmEasy", price: 68, inStock: true, url: "#", pincode: "110001", area: "Connaught Place", city: "New Delhi", distanceKm: 1.0 },
      { pharmacy: "Netmeds", price: 62, inStock: true, url: "#", pincode: "400050", area: "Bandra West", city: "Mumbai", distanceKm: 2.5 },
      { pharmacy: "Apollo Pharmacy", price: 72, inStock: true, url: "#", pincode: "700001", area: "BBD Bagh", city: "Kolkata", distanceKm: 1.9 },
    ],
  },
  {
    id: "10", name: "Pantoprazole", dosage: "40mg", form: "Tablet", manufacturer: "Sun Pharma",
    category: "Gastric",
    prices: [
      { pharmacy: "MedPlus", price: 78, inStock: true, url: "#", pincode: "560034", area: "Koramangala", city: "Bengaluru", distanceKm: 1.2 },
      { pharmacy: "1mg", price: 70, inStock: true, url: "#", pincode: "600001", area: "Parrys", city: "Chennai", distanceKm: 2.8 },
      { pharmacy: "Netmeds", price: 75, inStock: true, url: "#", pincode: "110016", area: "Hauz Khas", city: "New Delhi", distanceKm: 1.7 },
    ],
  },
  {
    id: "11", name: "Montelukast", dosage: "10mg", form: "Tablet", manufacturer: "Glenmark",
    category: "Allergy",
    prices: [
      { pharmacy: "PharmEasy", price: 145, inStock: true, url: "#", pincode: "400001", area: "Fort", city: "Mumbai", distanceKm: 0.8 },
      { pharmacy: "Apollo Pharmacy", price: 135, inStock: false, url: "#", pincode: "560001", area: "MG Road", city: "Bengaluru", distanceKm: 3.4 },
      { pharmacy: "1mg", price: 140, inStock: true, url: "#", pincode: "110001", area: "Connaught Place", city: "New Delhi", distanceKm: 1.5 },
    ],
  },
  {
    id: "12", name: "Vitamin D3", dosage: "60000 IU", form: "Capsule", manufacturer: "Cadila Healthcare",
    category: "Vitamins",
    prices: [
      { pharmacy: "Netmeds", price: 115, inStock: true, url: "#", pincode: "700001", area: "BBD Bagh", city: "Kolkata", distanceKm: 1.1 },
      { pharmacy: "MedPlus", price: 108, inStock: true, url: "#", pincode: "560034", area: "Koramangala", city: "Bengaluru", distanceKm: 2.3 },
      { pharmacy: "PharmEasy", price: 120, inStock: true, url: "#", pincode: "110016", area: "Hauz Khas", city: "New Delhi", distanceKm: 1.8 },
    ],
  },
];

export const getLowestPrice = (prices: PharmacyPrice[]) => {
  const inStockPrices = prices.filter((p) => p.inStock);
  if (inStockPrices.length === 0) return prices.reduce((min, p) => (p.price < min.price ? p : min), prices[0]);
  return inStockPrices.reduce((min, p) => (p.price < min.price ? p : min), inStockPrices[0]);
};

export const getHighestPrice = (prices: PharmacyPrice[]) => {
  return prices.reduce((max, p) => (p.price > max.price ? p : max), prices[0]);
};

export const getSavingsPercent = (prices: PharmacyPrice[]) => {
  const lowest = getLowestPrice(prices).price;
  const highest = getHighestPrice(prices).price;
  if (highest === 0) return 0;
  return Math.round(((highest - lowest) / highest) * 100);
};

/** Filter a medicine's prices to only those available at a given pincode */
export const getPricesByPincode = (prices: PharmacyPrice[], pincode: string) =>
  prices.filter((p) => p.pincode === pincode);
