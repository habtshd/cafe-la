import { useState } from "react";
import { Plus, UtensilsCrossed, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { PublicMenuItem } from "@/lib/cafe.functions";
import { formatBirr } from "@/lib/format";

export function MenuCard({ item, onSelect }: { item: PublicMenuItem; onSelect: () => void }) {
  const [showIngredients, setShowIngredients] = useState(false);

  // Split description into individual ingredient pills
  const ingredientsList = item.description
    ? item.description.split(/[,&·•]/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div
      onClick={onSelect}
      className="group relative flex w-full flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/90 via-card/65 to-card/45 p-4 sm:p-5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.55)] cursor-pointer backdrop-blur-sm"
    >
      {/* Specular sheen on card hover */}
      <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-accent/10 via-primary/5 to-transparent" />

      {/* Top: Sold out badge if unavailable */}
      {!item.available && (
        <div className="absolute top-3.5 right-3.5 z-20">
          <span className="rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-destructive backdrop-blur-md">
            Sold out
          </span>
        </div>
      )}

      {/* GLORIFIED FOOD STAGE — ALWAYS 100% VISIBLE, NEVER COVERED */}
      <div className="relative flex h-44 sm:h-52 w-full items-center justify-center py-2 overflow-visible">
        {/* Soft radial warm illumination pedestal behind the dish */}
        <div className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 h-32 rounded-full bg-radial from-amber-500/15 via-accent/10 to-transparent blur-2xl opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:scale-120" />

        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="relative z-10 max-h-40 sm:max-h-48 w-auto object-contain filter drop-shadow-[0_16px_22px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-2 select-none"
          />
        ) : (
          <div className="relative z-10 grid size-28 place-items-center rounded-full border border-border/40 bg-secondary/50 text-muted-foreground/40">
            <UtensilsCrossed className="size-10" />
          </div>
        )}
      </div>

      {/* UNDER THE FOOD: INGREDIENTS BUTTON (NO OVERLAP) */}
      {item.description && (
        <div className="relative z-20 my-2 flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowIngredients(!showIngredients);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
              showIngredients
                ? "bg-accent text-accent-foreground ring-2 ring-accent/30 shadow-sm"
                : "bg-secondary/90 hover:bg-accent/20 hover:text-accent text-foreground/85 border border-border/60"
            }`}
            aria-label="Toggle ingredients"
          >
            <Sparkles className="size-3 text-accent" />
            <span>{showIngredients ? "Hide Ingredients" : "Ingredients"}</span>
            {showIngredients ? (
              <ChevronUp className="size-3 text-accent-foreground" />
            ) : (
              <ChevronDown className="size-3 opacity-60" />
            )}
          </button>
        </div>
      )}

      {/* INGREDIENTS LIST REVEALED UNDER THE BUTTON (ZERO OVERLAP ON FOOD) */}
      {showIngredients && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-20 mb-2 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-secondary/60 dark:bg-muted/40 p-3 border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {ingredientsList.map((ing, idx) => (
            <span
              key={idx}
              className="rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs border border-border/40"
            >
              {ing}
            </span>
          ))}
        </div>
      )}

      {/* MINIMAL & REFINED TEXT */}
      <div className="relative z-10 mt-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-base sm:text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-primary leading-snug">
            {item.name}
          </h3>
          {item.description && !showIngredients && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/75 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Action bar with price and sleek Add pill */}
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-primary">
            {formatBirr(item.price)}
          </span>
          {item.available && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 text-xs font-semibold text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm"
            >
              <Plus className="size-3.5" />
              <span>Add</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
