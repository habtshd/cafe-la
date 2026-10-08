import filetMignonImg from "@/assets/pngtree-filet-mignon-with-red-wine-sauce-png-image_13146442.png";
import fettuccineImg from "@/assets/Creamy Salmon Fettuccine on a Ridged Plate.png";
import grilledSalmonImg from "@/assets/Grilled Salmon.png";
import nilePerchImg from "@/assets/Nile Perch.png";
import diavolaPizzaImg from "@/assets/Diavola-1.png";
import salmonPizzaImg from "@/assets/pngtree-pizza-with-salmon-and-mozzarella-on-the-table-transparent-background-png-image_13756108.png";
import clubSandwichImg from "@/assets/club-sandwich-with-ham-cheese-tomato-on-transparent-background-free-png.webp";
import gardenSaladImg from "@/assets/a-garden-salad-served-in-a-bowl-isolated-against-a-transparent-background-for-crisp-presentation-free-png.webp";
import pizzaSliceImg from "@/assets/delicious-pizza-slice-with-melting-cheese-pepperoni-olives-png.webp";
import layer2Img from "@/assets/Layer 2.png";
import gourmetBurgerImg from "@/assets/4268e9b9d767c719f9a81dbe217bbd7f.png";

export interface SignatureFood {
  id: string;
  name: string;
  subtitle: string;
  cuisine: string;
  category: string;
  description: string;
  price: number;
  image: string;
  mealSlot: "breakfast" | "lunch" | "afternoon" | "dinner" | "latenight";
  timeLabel: string;
  hourRange: string;
  targetHour: number;
  angleDeg: number;
  badges: string[];
  calories?: string;
  prepTime?: string;
}

export const SIGNATURE_FOODS: SignatureFood[] = [
  {
    id: "f1111111-1111-4111-a111-111111111111",
    name: "Pizza Diavola Napoletana",
    subtitle: "Artisan Spicy Salami, San Marzano & Fior di Latte",
    cuisine: "Italian Neapolitan",
    category: "Wood-Fired Pizza",
    description: "Spicy Italian salami, San Marzano tomatoes, Fior di Latte & fresh basil on artisan dough.",
    price: 720,
    image: diavolaPizzaImg,
    mealSlot: "lunch",
    timeLabel: "12:30 PM",
    hourRange: "11:30 – 14:30",
    targetHour: 12.5,
    angleDeg: 0, // Top
    badges: ["Wood-Fired", "Imported Salami", "48h Dough"],
    calories: "780 kcal",
    prepTime: "10 mins",
  },
  {
    id: "f2222222-2222-4222-a222-222222222222",
    name: "Triple-Decker Gourmet Club Sandwich",
    subtitle: "Toasted Brioche, Shaved Ham, Aged Cheddar & Herb Mayo",
    cuisine: "International Bistro",
    category: "Bistro & Sandwiches",
    description: "Toasted brioche, shaved ham, aged cheddar, ripe tomatoes & house herb mayo.",
    price: 460,
    image: clubSandwichImg,
    mealSlot: "afternoon",
    timeLabel: "03:45 PM",
    hourRange: "14:30 – 17:30",
    targetHour: 15.75,
    angleDeg: 85, // Right
    badges: ["House Brioche", "Aged Cheddar", "Freshly Sliced"],
    calories: "520 kcal",
    prepTime: "8 mins",
  },
  {
    id: "f3333333-3333-4333-a333-333333333333",
    name: "Golden Brioche & French Toast Delice",
    subtitle: "Normandy Butter Toast with Wildflower Honey",
    cuisine: "French Patisserie",
    category: "Breakfast & Bakery",
    description: "Caramelized Normandy butter brioche, powdered vanilla sugar & berry preserve.",
    price: 380,
    image: layer2Img,
    mealSlot: "breakfast",
    timeLabel: "08:30 AM",
    hourRange: "07:00 – 11:00",
    targetHour: 8.5,
    angleDeg: 160, // Lower-Right
    badges: ["Baked Daily", "Normandy Butter", "Morning Classic"],
    calories: "410 kcal",
    prepTime: "6 mins",
  },
  {
    id: "f4444444-4444-4444-a444-444444444444",
    name: "Filet Mignon with Red Wine Demi-Glace",
    subtitle: "Prime Tenderloin, Cabernet Reduction & Truffle Herb Butter",
    cuisine: "French Haute Cuisine",
    category: "Continental Grill",
    description: "Prime tenderloin filet, French red wine reduction & compound herb butter.",
    price: 1480,
    image: filetMignonImg,
    mealSlot: "dinner",
    timeLabel: "07:30 PM",
    hourRange: "18:00 – 21:00",
    targetHour: 19.5,
    angleDeg: 220, // Lower-Left
    badges: ["Center-Cut Prime", "Cabernet Glaze", "Chef's Signature"],
    calories: "620 kcal",
    prepTime: "18 mins",
  },
  {
    id: "f5555555-5555-4555-a555-555555555555",
    name: "Pan-Seared Norwegian Grilled Salmon",
    subtitle: "Crispy Herb Skin, Lemon Butter & Asparagus",
    cuisine: "Nordic Coastal",
    category: "Seafood & Grill",
    description: "Crispy herb-crusted salmon, citrus beurre blanc & charred asparagus.",
    price: 1250,
    image: grilledSalmonImg,
    mealSlot: "latenight",
    timeLabel: "09:30 PM",
    hourRange: "21:00 – 23:30",
    targetHour: 21.5,
    angleDeg: 295, // Upper-Left
    badges: ["Fresh Salmon", "Omega-3 Rich", "Citrus Beurre Blanc"],
    calories: "540 kcal",
    prepTime: "14 mins",
  },
  {
    id: "f6666666-6666-4666-a666-666666666666",
    name: "Creamy Salmon Fettuccine",
    subtitle: "Handmade Egg Ribbon Pasta, Flaked Salmon & Dill Cream",
    cuisine: "Italian Artisanal",
    category: "Artisan Pasta",
    description: "Hand-rolled fettuccine, flaked Atlantic salmon, capers, dill cream & parmesan.",
    price: 890,
    image: fettuccineImg,
    mealSlot: "dinner",
    timeLabel: "08:15 PM",
    hourRange: "18:00 – 22:00",
    targetHour: 20.25,
    angleDeg: 245,
    badges: ["Handmade Pasta", "Rich Dill Cream", "Atlantic Salmon"],
    calories: "710 kcal",
    prepTime: "12 mins",
  },
  {
    id: "f7777777-7777-4777-a777-777777777777",
    name: "Pan-Seared Nile Perch Fillet",
    subtitle: "Herb Butter Crust, Roasted Garlic & Fresh Herbs",
    cuisine: "Regional Specialty",
    category: "Seafood & Grill",
    description: "Golden perch fillet, confit cherry tomatoes, garlic purée & lemon herb glaze.",
    price: 950,
    image: nilePerchImg,
    mealSlot: "lunch",
    timeLabel: "01:30 PM",
    hourRange: "12:00 – 15:30",
    targetHour: 13.5,
    angleDeg: 40,
    badges: ["Fresh Catch", "Clarified Butter", "High Protein"],
    calories: "490 kcal",
    prepTime: "12 mins",
  },
  {
    id: "f8888888-8888-4888-a888-488888888888",
    name: "Chef's Signature Gourmet Burger",
    subtitle: "Seared Beef Patty, Melted Cheddar & Brioche",
    cuisine: "American Gourmet",
    category: "International Mains",
    description: "Prime beef patty, melted cheddar, grilled onions & house burger sauce on brioche.",
    price: 840,
    image: gourmetBurgerImg,
    mealSlot: "lunch",
    timeLabel: "12:00 PM",
    hourRange: "11:00 – 15:00",
    targetHour: 12.0,
    angleDeg: 350,
    badges: ["Prime Beef", "Buttered Brioche", "House Relish"],
    calories: "760 kcal",
    prepTime: "12 mins",
  },
  {
    id: "f9999999-9999-4999-a999-499999999999",
    name: "Crisp Mediterranean Garden Salad Bowl",
    subtitle: "Organic Greens, Persian Cucumbers, Cherry Tomatoes & Lemon Vinaigrette",
    cuisine: "Mediterranean Garden",
    category: "Fresh Greens & Salads",
    description: "Mixed crisp greens, cucumbers, cherry tomatoes, kalamata olives, feta & olive oil.",
    price: 420,
    image: gardenSaladImg,
    mealSlot: "breakfast",
    timeLabel: "10:30 AM",
    hourRange: "09:00 – 14:00",
    targetHour: 10.5,
    angleDeg: 315,
    badges: ["Organic Greens", "Kalamata Olives", "Gluten Free"],
    calories: "280 kcal",
    prepTime: "5 mins",
  },
  {
    id: "faaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
    name: "Smoked Salmon & Mozzarella Pizza",
    subtitle: "Cured Salmon, Cream Cheese, Red Onion & Capers",
    cuisine: "Italian Gourmet",
    category: "Wood-Fired Pizza",
    description: "Smoked salmon, mozzarella, mascarpone cream, red onion & capers on crispy crust.",
    price: 780,
    image: salmonPizzaImg,
    mealSlot: "dinner",
    timeLabel: "06:45 PM",
    hourRange: "17:30 – 21:30",
    targetHour: 18.75,
    angleDeg: 200,
    badges: ["Smoked Salmon", "White Base", "Crispy Crust"],
    calories: "730 kcal",
    prepTime: "11 mins",
  },
  {
    id: "fbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
    name: "Wood-Fired Pizza Slice",
    subtitle: "Melting Mozzarella, Pepperoni & Black Olives",
    cuisine: "Italian Street Gourmet",
    category: "Wood-Fired Pizza",
    description: "Crispy artisan slice with bubbling mozzarella, pepperoni cups & black olives.",
    price: 260,
    image: pizzaSliceImg,
    mealSlot: "afternoon",
    timeLabel: "04:30 PM",
    hourRange: "15:00 – 18:00",
    targetHour: 16.5,
    angleDeg: 115,
    badges: ["Quick Slice", "Molten Cheese", "Grab & Go"],
    calories: "320 kcal",
    prepTime: "3 mins",
  },
];
