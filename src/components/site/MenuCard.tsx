import { Plus, UtensilsCrossed } from "lucide-react";
import type { PublicMenuItem } from "@/lib/cafe.functions";
import { formatBirr } from "@/lib/format";

export function MenuCard({ item, onSelect }: { item: PublicMenuItem; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex w-full items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-md dark:bg-card/30 dark:hover:bg-card/70 dark:hover:border-border/80 cursor-pointer sm:p-5"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
        <div>
          <h3 className="font-sans text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {item.description}
            </p>
          )}
        </div>
        <div className="mt-3.5 flex items-center justify-between pt-1">
          <span className="font-sans text-sm font-semibold tracking-tight text-foreground sm:text-base">
            {formatBirr(item.price)}
          </span>
          {item.available ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
              <Plus className="size-3.5" />
              <span>Add</span>
            </span>
          ) : (
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-destructive">
              Sold out
            </span>
          )}
        </div>
      </div>
      <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-secondary/50 p-2 shadow-2xs dark:bg-muted/20 sm:size-28">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="size-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/40">
            <UtensilsCrossed className="size-6" />
          </div>
        )}
      </div>
    </button>
  );
}
