import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Coffee, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNATURE_DRINKS } from "@/lib/signature-drinks";
import type { PublicMenuItem } from "@/lib/cafe.functions";

interface InternationalDrinksLoungeProps {
  onSelect?: (item: PublicMenuItem) => void;
}

export function InternationalDrinksLounge({ onSelect: _onSelect }: InternationalDrinksLoungeProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(SIGNATURE_DRINKS.map((d) => d.category)));
    return ["all", ...cats];
  }, []);

  const filteredDrinks = useMemo(() => {
    if (activeCategory === "all") return SIGNATURE_DRINKS;
    return SIGNATURE_DRINKS.filter((d) => d.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="relative isolate overflow-hidden border-t border-border/80 bg-gradient-to-b from-background via-secondary/20 to-background py-20 sm:py-24 transition-colors">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-12 right-10 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur-sm">
            International Drinks & Barista Lounge
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-display font-medium tracking-tight text-foreground">
            World-Class Drinks & <em className="italic text-accent">Mixology</em>
          </h2>
          <p className="mt-2.5 max-w-xl text-sm sm:text-base text-muted-foreground">
            Specialty coffees, signature mocktails, cold-pressed juices & artisan frappes.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-border/70 bg-card/70 p-1.5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-card/50">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const label =
                cat === "all"
                  ? "All Drinks"
                  : cat === "Specialty Coffee & Espresso Bar"
                  ? "Specialty Coffee"
                  : cat === "Signature Mocktails & Spritzes"
                  ? "Mocktails & Spritzes"
                  : cat === "Cold-Pressed Juices & Wellness"
                  ? "Juices & Wellness"
                  : cat === "Artisanal Teas & Global Infusions"
                  ? "Teas & Infusions"
                  : "Frappes & Shakes";

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs scale-[1.02]"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean, Food-Focused Grid: Pure Focus on the Drink Image & Name, Prices in Menu */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {filteredDrinks.map((drink) => (
            <Link
              key={drink.id}
              to="/menu"
              search={{ item: drink.id }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card/90 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-xl dark:border-white/10 dark:bg-card/70 cursor-pointer backdrop-blur-sm"
            >
              {/* Food Image — 100% unobstructed, crisp, hero of the card */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl bg-secondary/30 dark:bg-secondary/20 flex items-center justify-center">
                <img
                  src={drink.image}
                  alt={drink.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-108 select-none"
                />
              </div>

              {/* Only Name & View in Menu */}
              <div className="mt-3 sm:mt-4 flex flex-1 flex-col justify-between">
                <h3 className="font-display text-base sm:text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                  {drink.name}
                </h3>

                <div className="mt-3 flex items-center justify-end border-t border-border/40 pt-2.5 sm:pt-3">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    View in Menu &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Menu Link */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6 backdrop-blur-md dark:border-white/10 dark:bg-card/40">
          <div className="flex items-center gap-3 text-left">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent">
              <Coffee className="size-5" />
            </div>
            <div>
              <h4 className="font-display text-base font-medium text-foreground">
                Discover the complete café & bistro menu
              </h4>
              <p className="text-xs text-muted-foreground">
                Browse our wood-fired pizzas, prime steaks, fresh seafood and full drink selection.
              </p>
            </div>
          </div>

          <Button asChild size="default" variant="accent" className="shrink-0 gap-1.5 shadow-sm">
            <Link to="/menu">
              <span>View Full Menu</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
