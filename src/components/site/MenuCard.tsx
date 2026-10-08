import { Coffee } from "lucide-react";
import type { PublicMenuItem } from "@/lib/cafe.functions";
import { formatBirr } from "@/lib/format";

export function MenuCard({ item, onSelect }: { item: PublicMenuItem; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="group flex gap-4 border-b py-5 text-left last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg leading-tight group-hover:text-primary">{item.name}</h3>
          <span className="shrink-0 font-semibold">{formatBirr(item.price)}</span>
        </div>
        {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
        {!item.available && <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-destructive">Sold out</span>}
      </div>
      <div className="size-20 shrink-0 overflow-hidden rounded-md bg-secondary">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" className="size-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/50"><Coffee className="size-6" /></div>
        )}
      </div>
    </button>
  );
}
