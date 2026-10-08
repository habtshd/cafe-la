import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductDialog } from "@/components/site/ProductDialog";
import { DriftBeans, LatteClock, LeanCards, PourIntro, ReceiptPrinter, Studio } from "@/components/site/Experience";
import { menuQuery, settingsQuery } from "@/lib/queries";
import type { PublicMenuItem } from "@/lib/cafe.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LaNouvelle Café & Restaurant — Specialty coffee in Bole, Addis Ababa" },
      { name: "description", content: "Specialty coffee and French-inspired food in Bole, Addis Ababa. Order for pickup, delivery or dine-in." },
      { property: "og:title", content: "LaNouvelle Café & Restaurant" },
      { property: "og:description", content: "Specialty coffee and French-inspired food in Bole, Addis Ababa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(settingsQuery), context.queryClient.ensureQueryData(menuQuery)]),
  component: Home,
});

function Home() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const { data: menu } = useSuspenseQuery(menuQuery);
  const [selected, setSelected] = useState<PublicMenuItem | null>(null);
  const four = [...menu.items].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4);

  return (
    <SiteShell>
      <PourIntro />
      <Studio name={s.cafe_name} />
      <LeanCards items={four} onSelect={setSelected} />
      <LatteClock hours={s.opening_hours} />
      <DriftBeans s={s} />
      <ReceiptPrinter cafeName={s.cafe_name} />
      <ProductDialog item={selected} onClose={() => setSelected(null)} />
    </SiteShell>
  );
}
