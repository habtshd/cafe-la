import type { PublicMenuItem } from "./cafe.functions";

export type IngredientAmount = "none" | "light" | "regular" | "extra";

export interface DishIngredient {
  id: string;
  name: string;
  category?: "protein" | "cheese" | "vegetable" | "sauce" | "base" | "spice" | "dairy" | "coffee";
}

export const AMOUNT_CONFIG: Record<
  IngredientAmount,
  {
    label: string;
    shortLabel: string;
    multiplier: string;
    colorClass: string;
    activeClass: string;
  }
> = {
  none: {
    label: "None (Remove)",
    shortLabel: "None",
    multiplier: "0×",
    colorClass: "text-destructive line-through opacity-75",
    activeClass: "bg-destructive/15 text-destructive border-destructive/40 shadow-xs",
  },
  light: {
    label: "Light Portion",
    shortLabel: "Light",
    multiplier: "½×",
    colorClass: "text-amber-600 dark:text-amber-400 font-medium",
    activeClass: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs",
  },
  regular: {
    label: "Regular Recipe",
    shortLabel: "Regular",
    multiplier: "1×",
    colorClass: "text-foreground",
    activeClass: "bg-primary text-primary-foreground font-semibold shadow-xs",
  },
  extra: {
    label: "Extra Portion",
    shortLabel: "Extra",
    multiplier: "2×",
    colorClass: "text-accent font-semibold",
    activeClass: "bg-accent text-accent-foreground font-bold shadow-xs",
  },
};

// Curated high-fidelity ingredients for signature menu items
const SIGNATURE_INGREDIENTS: Record<string, string[]> = {
  // Wood-Fired Pizza
  "f1111111-1111-4111-a111-111111111111": [
    "Spicy Italian Salami",
    "Fior di Latte Mozzarella",
    "San Marzano Tomato Sauce",
    "Fresh Italian Basil",
    "Red Chili Flakes",
    "Artisan 48h Dough",
  ],
  "faaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa": [
    "Smoked Atlantic Salmon",
    "Fior di Latte Mozzarella",
    "Mascarpone Cream Base",
    "Pickled Red Onions",
    "Capers",
    "Fresh Garden Dill",
  ],
  "fbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb": [
    "Wood-Fired Pizza Crust",
    "Melting Mozzarella",
    "Pepperoni Cups",
    "Kalamata Black Olives",
    "San Marzano Herb Sauce",
  ],
  // Steaks & Seafood
  "f4444444-4444-4444-a444-444444444444": [
    "Prime Center-Cut Tenderloin",
    "Cabernet Demi-Glace Sauce",
    "Truffle Compound Butter",
    "Roasted Confit Garlic",
    "Fresh Rosemary Sprig",
    "Sea Salt & Black Peppercorn",
  ],
  "f5555555-5555-4555-a555-555555555555": [
    "Norwegian Atlantic Salmon",
    "Citrus Beurre Blanc Emulsion",
    "Charred Asparagus Spears",
    "Fresh Garden Dill",
    "Lemon Herb Butter",
  ],
  "f7777777-7777-4777-a777-777777777777": [
    "Golden Nile Perch Fillet",
    "Confit Cherry Tomatoes",
    "Clarified Garlic Butter",
    "Lemon Herb Glaze",
    "Fresh Parsley & Thyme",
  ],
  // Pasta & Bistro
  "f6666666-6666-4666-a666-666666666666": [
    "Handmade Egg Fettuccine",
    "Flaked Atlantic Salmon",
    "Rich Dill Cream Sauce",
    "Mediterranean Capers",
    "Aged Parmigiano-Reggiano",
  ],
  "f2222222-2222-4222-a222-222222222222": [
    "Toasted Brioche Bread",
    "Shaved Parisian Ham",
    "Aged Sharp Cheddar",
    "Ripe Vine Tomatoes",
    "Crisp Romaine Lettuce",
    "House Herb Mayonnaise",
  ],
  "f3333333-3333-4333-a333-333333333333": [
    "Normandy Butter Brioche",
    "Wildflower Honey",
    "Powdered Vanilla Sugar",
    "Homemade Berry Preserve",
    "Fresh Wild Berries",
  ],
  "f8888888-8888-4888-a888-488888888888": [
    "Prime Beef Patty",
    "Melted Cheddar Cheese",
    "Caramelized Grilled Onions",
    "Toasted Brioche Bun",
    "House Burger Relish",
    "Crisp Iceberg Lettuce",
  ],
  "f9999999-9999-4999-a999-499999999999": [
    "Organic Mixed Greens",
    "Persian Cucumbers",
    "Sweet Cherry Tomatoes",
    "Kalamata Black Olives",
    "Crumbled Greek Feta",
    "Extra Virgin Olive Oil & Lemon Vinaigrette",
  ],
  // Specialty Coffees & Drinks
  "d-cappuccino-latte-art": [
    "Double Espresso Shot",
    "Steamed Whole Milk",
    "Velvet Microfoam",
    "Cocoa & Cinnamon Dusting",
  ],
  "d-layered-iced-coffee": [
    "Cold Espresso Extraction",
    "Chilled Whole Milk",
    "Pure Ice Cubes",
    "Sweet Caramel Drizzle",
  ],
  "d-amalfi-spritz": [
    "Italian Bitter Citrus Aperitif",
    "Sparkling Mineral Water",
    "Fresh Blood Orange Wheel",
    "Crisp Rosemary Sprig",
    "Ice Cubes",
  ],
  "d-passionfruit-mojito": [
    "Fresh Passionfruit Pulp",
    "Crushed Fresh Mint Leaves",
    "Fresh Lime Wedges",
    "Sparkling Cane Soda",
    "Crushed Ice",
  ],
  "d-spanish-cortado": [
    "Double Ristretto Espresso",
    "Warm Textured Whole Milk",
  ],
  "d-matcha-latte": [
    "Ceremonial Grade Matcha",
    "Steamed Oat Milk",
    "Wild Agave Nectar",
  ],
  "d-chocolate-frappe": [
    "Dark Belgian Cocoa",
    "Whipped Cream",
    "Dark Chocolate Drizzle",
    "Blended Ice",
  ],
  "d-mango-smoothie": [
    "Ripe Mango Purée",
    "Greek Yogurt",
    "Wildflower Honey",
    "Crushed Ice",
  ],
  "d-green-detox": [
    "Baby Spinach & Kale",
    "Green Apple Nectar",
    "Fresh Ginger Root",
    "Lemon Slices",
  ],
  "d-moroccan-mint-tea": [
    "Gunpowder Green Tea",
    "Fresh Spearmint Leaves",
    "Raw Cane Sugar",
  ],
  "d-yirgacheffe-coffee": [
    "Ethiopian Yirgacheffe Beans",
    "Filter Brewed Water",
  ],
};

/**
 * Returns the list of customizable ingredients for any menu item
 */
export function getIngredientsForItem(item: PublicMenuItem): DishIngredient[] {
  // 1. Check known signature item map
  const known = SIGNATURE_INGREDIENTS[item.id];
  if (known && known.length > 0) {
    return known.map((name, idx) => ({
      id: `ing-${idx}-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
    }));
  }

  // 2. Parse from item description if available
  if (item.description && item.description.trim().length > 0) {
    const rawTokens = item.description
      .split(/[,&·•]/)
      .map((s) => s.trim().replace(/^and\s+/i, "").replace(/\.$/, ""))
      .filter((s) => s.length > 1 && !/^(with|served with|on|our|house)\b/i.test(s));

    if (rawTokens.length > 0) {
      return rawTokens.map((name, idx) => ({
        id: `ing-${idx}-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
      }));
    }
  }

  // 3. Fallback based on category
  const cat = (item.category_id || "").toLowerCase();
  if (cat.includes("pizza")) {
    return [
      { id: "ing-dough", name: "Artisan Pizza Dough" },
      { id: "ing-sauce", name: "San Marzano Tomato Sauce" },
      { id: "ing-cheese", name: "Mozzarella Cheese" },
      { id: "ing-basil", name: "Fresh Basil" },
    ];
  }
  if (cat.includes("coffee") || cat.includes("espresso")) {
    return [
      { id: "ing-espresso", name: "Fresh Espresso Shot" },
      { id: "ing-milk", name: "Steamed Milk" },
      { id: "ing-foam", name: "Microfoam" },
    ];
  }
  if (cat.includes("steak") || cat.includes("grill")) {
    return [
      { id: "ing-meat", name: "Prime Cut" },
      { id: "ing-sauce", name: "House Pan Sauce" },
      { id: "ing-herb", name: "Compound Butter & Herbs" },
    ];
  }

  return [
    { id: "ing-main", name: item.name },
    { id: "ing-seasoning", name: "House Seasoning & Dressing" },
  ];
}

/**
 * Builds a clean summary of customer adjustments for orders & tickets
 */
export function formatCustomizationSummary(
  adjustments: Record<string, IngredientAmount>,
  ingredients: DishIngredient[]
): string {
  const parts: string[] = [];

  for (const ing of ingredients) {
    const amt = adjustments[ing.id] ?? "regular";
    if (amt === "none") {
      parts.push(`No ${ing.name}`);
    } else if (amt === "light") {
      parts.push(`Light ${ing.name}`);
    } else if (amt === "extra") {
      parts.push(`Extra ${ing.name}`);
    }
  }

  return parts.join(", ");
}
