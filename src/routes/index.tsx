import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import {
  CulinaryBotanicals,
  CulinaryClock,
  LeanCards,
  ReceiptPrinter,
  Studio,
  InternationalShowcase,
  INTERNATIONAL_SHOWCASE_IDS,
} from "@/components/site/Experience";
import { InternationalDrinksLounge } from "@/components/site/InternationalDrinksLounge";
import { menuQuery, settingsQuery } from "@/lib/queries";
import { DEFAULT_SETTINGS, type PublicMenuItem } from "@/lib/cafe.functions";
import { SIGNATURE_FOODS } from "@/lib/signature-foods";
import { SIGNATURE_DRINKS } from "@/lib/signature-drinks";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LaNouvelle Café & Restaurant — International Fine Dining, Drinks & Bistro in Bole, Addis Ababa" },
      { name: "description", content: "World-class international fine dining, single-origin Ethiopian coffee, artisan spritzes, prime Filet Mignon, wood-fired Diavola pizza, and French bistro classics in Bole, Addis Ababa." },
      { property: "og:title", content: "LaNouvelle Café & Restaurant — International Fine Dining & Drinks" },
      { property: "og:description", content: "World-class international dining, specialty coffee, handcrafted mocktails and culinary excellence in Bole, Addis Ababa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(settingsQuery), context.queryClient.ensureQueryData(menuQuery)]),
  component: Home,
});

function Home() {
  const { data: s = DEFAULT_SETTINGS } = useQuery(settingsQuery);
  const { data: menu } = useQuery(menuQuery);

  const fallbackItems: PublicMenuItem[] = [
    ...SIGNATURE_FOODS.map((f) => ({
      id: f.id,
      category_id: f.category,
      name: f.name,
      description: f.description,
      price: f.price,
      available: true,
      featured: true,
      imageUrl: f.image,
    })),
    ...SIGNATURE_DRINKS.map((d) => ({
      id: d.id,
      category_id: d.category,
      name: d.name,
      description: d.description,
      price: d.price,
      available: true,
      featured: true,
      imageUrl: d.image,
    })),
  ];

  const allItems = menu?.items?.length ? menu.items : fallbackItems;

  // Exclude dishes already highlighted in InternationalShowcase to ensure unique cards
  const showcaseIds = new Set(INTERNATIONAL_SHOWCASE_IDS);
  const cappuccinoItem = allItems.find((i) => i.id === "d-cappuccino-latte-art");
  const icedCoffeeItem = allItems.find((i) => i.id === "d-layered-iced-coffee");

  const remainingFoods = allItems
    .filter((item) => !showcaseIds.has(item.id) && !item.id.startsWith("d"))
    .sort((a, b) => Number(b.featured) - Number(a.featured));

  const craftedItems = [
    ...remainingFoods,
    ...(cappuccinoItem ? [cappuccinoItem] : []),
    ...(icedCoffeeItem ? [icedCoffeeItem] : []),
  ];

  const cafeName = s?.cafe_name || DEFAULT_SETTINGS.cafe_name;
  const hours = s?.opening_hours || DEFAULT_SETTINGS.opening_hours;

  return (
    <SiteShell>
      <Studio name={cafeName} />
      <CulinaryClock hours={hours} />
      <InternationalShowcase />
      <LeanCards items={craftedItems} />
      <InternationalDrinksLounge />
      <CulinaryBotanicals s={s} />
      <ReceiptPrinter cafeName={cafeName} />
    </SiteShell>
  );
}
