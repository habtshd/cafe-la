import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { MenuCard } from "@/components/site/MenuCard";
import { ProductDialog } from "@/components/site/ProductDialog";
import { Input } from "@/components/ui/input";
import { menuQuery, settingsQuery } from "@/lib/queries";
import type { PublicMenuItem } from "@/lib/cafe.functions";
import { cn } from "@/lib/utils";

const menuSearchSchema = z.object({
  item: z.string().optional(),
});

export const Route = createFileRoute("/menu")({
  validateSearch: menuSearchSchema,
  head: () => ({
    meta: [
      { title: "Menu — La Nouvelle Café & Restaurant" },
      { name: "description", content: "World-class international menu, artisan wood-fired pizza, prime steaks, seafood, specialty coffee, and handcrafted drinks at La Nouvelle. Order online in a few taps." },
      { property: "og:title", content: "Menu — La Nouvelle Café & Restaurant" },
      { property: "og:description", content: "Browse chef's signature dishes, steaks, pasta, artisan pizza, specialty coffees, mocktails, and international drinks." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(menuQuery), context.queryClient.ensureQueryData(settingsQuery)]),
  component: MenuPage,
});

function MenuPage() {
  const { data: menu } = useSuspenseQuery(menuQuery);
  const { data: s } = useSuspenseQuery(settingsQuery);
  const { item: targetItemId } = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | "all">("all");
  const [selected, setSelected] = useState<PublicMenuItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // When navigated with ?item=<id>, select and highlight the matched food on the menu page (no popup modal)
  useEffect(() => {
    if (!targetItemId || !menu?.items?.length) return () => {};
    const target = targetItemId.trim().toLowerCase();
    const found =
      menu.items.find((i) => i.id.toLowerCase() === target) ||
      menu.items.find((i) => i.name.toLowerCase() === target) ||
      menu.items.find((i) => i.name.toLowerCase().includes(target));

    if (!found) return () => {};

    setCat("all");
    setQ("");
    setSelectedItemId(found.id);
    // Explicitly do NOT open popup window on navigation

    const timer = setTimeout(() => {
      const el = document.getElementById(`dish-${found.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [targetItemId, menu?.items]);

  const matchedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return menu.items.find((i) => i.id === selectedItemId) ?? null;
  }, [selectedItemId, menu.items]);

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
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-display sm:text-5xl">Menu</h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            Artisan wood-fired pizzas, prime steaks, fresh seafood, specialty coffees, mocktails & international drinks.
          </p>
        </div>
        {!s.accepting_orders && (
          <p className="mt-4 rounded-xl border border-border/70 bg-muted/60 px-4 py-3 text-sm text-muted-foreground backdrop-blur-sm">
            Online ordering is paused right now. You can still browse.
          </p>
        )}
        <div className="sticky top-16 z-20 -mx-4 mt-6 border-b border-border/40 bg-background/85 px-4 py-3.5 backdrop-blur-xl transition-all sm:-mx-6 sm:px-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the menu..."
              className="h-11 rounded-full border-border/70 bg-card/70 dark:bg-card/40 pl-10 pr-9 text-sm shadow-xs transition-all placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent/40"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {menu.categories.length > 0 && (
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pt-2.5 pb-0.5 scrollbar-none no-scrollbar sm:-mx-6 sm:px-6">
              {[{ id: "all", name: "All" }, ...menu.categories].map((c) => {
                const isActive = cat === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCat(c.id)}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs scale-[1.02]"
                        : "border border-border/70 bg-card/60 dark:bg-card/40 text-muted-foreground hover:border-border hover:bg-secondary/70 hover:text-foreground",
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {matchedItem && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/10 px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4 text-accent animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Matched Food: <strong className="font-semibold text-accent">{matchedItem.name}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedItemId(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        )}

        {groups.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border/80 p-12 text-center text-muted-foreground">
            {menu.items.length === 0 ? "Our menu is being prepared. Check back soon." : "No items match your search."}
          </p>
        ) : (
          groups.map((g) => (
            <section key={g.id} className="mt-10 sm:mt-12">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-sans text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {g.name}
                  </h2>
                  <span className="rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {g.items.length}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {g.items.map((i) => (
                  <MenuCard
                    key={i.id}
                    item={i}
                    isSelected={selectedItemId === i.id}
                    onSelect={() => {
                      setSelectedItemId(i.id);
                      setSelected(i);
                    }}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      <ProductDialog item={selected} onClose={() => setSelected(null)} />
    </SiteShell>
  );
}
