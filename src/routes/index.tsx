import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductDialog } from "@/components/site/ProductDialog";
import {
  CulinaryBotanicals,
  CulinaryClock,
  LeanCards,
  ReceiptPrinter,
  Studio,
  InternationalShowcase,
  INTERNATIONAL_SHOWCASE_IDS,
} from "@/components/site/Experience";
import { menuQuery, settingsQuery } from "@/lib/queries";
import { DEFAULT_SETTINGS, type PublicMenuItem } from "@/lib/cafe.functions";
import { SIGNATURE_FOODS } from "@/lib/signature-foods";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LaNouvelle Café & Restaurant — International Fine Dining & Bistro in Bole, Addis Ababa" },
      { name: "description", content: "World-class international fine dining, prime Filet Mignon, wood-fired Diavola pizza, grilled Norwegian salmon, and French culinary classics in Bole, Addis Ababa. Order for pickup, delivery or dine-in." },
      { property: "og:title", content: "LaNouvelle Café & Restaurant — International Fine Dining & Bistro" },
      { property: "og:description", content: "World-class international dining and culinary excellence in Bole, Addis Ababa." },
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
  const [selected, setSelected] = useState<PublicMenuItem | null>(null);

  const fallbackItems: PublicMenuItem[] = SIGNATURE_FOODS.map((f) => ({
    id: f.id,
    category_id: f.category,
    name: f.name,
    description: f.description,
    price: f.price,
    available: true,
    featured: true,
    imageUrl: f.image,
  }));

  const allItems = menu?.items?.length ? menu.items : fallbackItems;

  // Exclude dishes already highlighted in InternationalShowcase to ensure unique, non-duplicated cards
  const showcaseIds = new Set(INTERNATIONAL_SHOWCASE_IDS);
  const four = allItems
    .filter((item) => !showcaseIds.has(item.id))
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 4);

  const cafeName = s?.cafe_name || DEFAULT_SETTINGS.cafe_name;
  const hours = s?.opening_hours || DEFAULT_SETTINGS.opening_hours;

  return (
    <SiteShell>
      <Studio name={cafeName} />
      <CulinaryClock hours={hours} />
      <InternationalShowcase />
      <LeanCards items={four} onSelect={setSelected} />
      <CulinaryBotanicals s={s} />
      <ReceiptPrinter cafeName={cafeName} />
      <ProductDialog item={selected} onClose={() => setSelected(null)} />
    </SiteShell>
  );
}
