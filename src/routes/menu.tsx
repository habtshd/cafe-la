import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { MenuCard } from "@/components/site/MenuCard";
import { ProductDialog } from "@/components/site/ProductDialog";
import { Input } from "@/components/ui/input";
import { menuQuery, settingsQuery } from "@/lib/queries";
import type { PublicMenuItem } from "@/lib/cafe.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — La Nouvelle Cafe" },
      { name: "description", content: "Coffee, drinks and food at La Nouvelle Cafe. Order online in a few taps." },
      { property: "og:title", content: "Menu — La Nouvelle Cafe" },
      { property: "og:description", content: "Browse coffee, drinks and food and order online." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(menuQuery), context.queryClient.ensureQueryData(settingsQuery)]),
  component: MenuPage,
});

function MenuPage() {
  const { data: menu } = useSuspenseQuery(menuQuery);
  const { data: s } = useSuspenseQuery(settingsQuery);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | "all">("all");
  const [selected, setSelected] = useState<PublicMenuItem | null>(null);

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const items = menu.items.filter(
      (i) => !term || i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term),
    );
    const cats = [...menu.categories, { id: "__none", name: "Other", sort_order: 999 }];
    return cats
      .filter((c) => cat === "all" || c.id === cat)
      .map((c) => ({ ...c, items: items.filter((i) => (i.category_id ?? "__none") === c.id) }))
      .filter((g) => g.items.length);
  }, [menu, q, cat]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-5 pb-28 pt-12">
        <h1 className="text-4xl sm:text-5xl">Menu</h1>
        {!s.accepting_orders && (
          <p className="mt-4 rounded-md bg-muted px-4 py-3 text-sm">Online ordering is paused right now. You can still browse.</p>
        )}
        <div className="sticky top-16 z-20 -mx-5 mt-6 space-y-3 bg-background/95 px-5 py-3 backdrop-blur">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the menu" className="h-11 pl-9" />
          </div>
          {menu.categories.length > 0 && (
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {[{ id: "all", name: "All" }, ...menu.categories].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
                    cat === c.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {groups.length === 0 ? (
          <p className="mt-10 rounded-md border border-dashed p-10 text-center text-muted-foreground">
            {menu.items.length === 0 ? "Our menu is being prepared. Check back soon." : "No items match your search."}
          </p>
        ) : (
          groups.map((g) => (
            <section key={g.id} className="mt-10">
              <h2 className="border-b-2 border-primary pb-2 text-2xl">{g.name}</h2>
              <div className="flex flex-col">
                {g.items.map((i) => <MenuCard key={i.id} item={i} onSelect={() => setSelected(i)} />)}
              </div>
            </section>
          ))
        )}
      </div>
      <ProductDialog item={selected} onClose={() => setSelected(null)} />
    </SiteShell>
  );
}
