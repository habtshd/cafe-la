import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, SlidersHorizontal, RotateCcw, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/lib/cart";
import { formatBirr } from "@/lib/format";
import type { PublicMenuItem } from "@/lib/cafe.functions";
import {
  getIngredientsForItem,
  formatCustomizationSummary,
  AMOUNT_CONFIG,
  type IngredientAmount,
} from "@/lib/ingredients";
import { cn } from "@/lib/utils";

export function ProductDialog({
  item,
  onClose,
}: {
  item: PublicMenuItem | null;
  onClose: () => void;
}) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [amounts, setAmounts] = useState<Record<string, IngredientAmount>>({});
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);

  const ingredients = useMemo(() => {
    return item ? getIngredientsForItem(item) : [];
  }, [item?.id, item?.description]);

  // Reset adjustments whenever the item changes
  useEffect(() => {
    setQty(1);
    setNote("");
    setIsIngredientsOpen(false);
    if (ingredients.length > 0) {
      const initial: Record<string, IngredientAmount> = {};
      for (const ing of ingredients) {
        initial[ing.id] = "regular";
      }
      setAmounts(initial);
    } else {
      setAmounts({});
    }
  }, [item?.id, ingredients]);

  const setIngredientAmount = (id: string, amount: IngredientAmount) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: amount,
    }));
  };

  const resetAllIngredients = () => {
    const initial: Record<string, IngredientAmount> = {};
    for (const ing of ingredients) {
      initial[ing.id] = "regular";
    }
    setAmounts(initial);
  };

  const isCustomized = useMemo(() => {
    return Object.values(amounts).some((amt) => amt !== "regular");
  }, [amounts]);

  const customizationText = useMemo(() => {
    return formatCustomizationSummary(amounts, ingredients);
  }, [amounts, ingredients]);

  const handleAddToCart = () => {
    if (!item) return;

    const parts: string[] = [];
    if (customizationText) {
      parts.push(`Customized: ${customizationText}`);
    }
    if (note.trim()) {
      parts.push(`Note: ${note.trim()}`);
    }
    const finalNote = parts.length > 0 ? parts.join(" · ") : undefined;

    cart.add({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: qty,
      note: finalNote,
      imageUrl: item.imageUrl,
    });

    toast.success(
      isCustomized ? `${item.name} added (with custom ingredients)` : `${item.name} added`
    );
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "glass-modal w-[94vw] max-h-[90vh] md:max-h-[85vh] p-0 gap-0 overflow-hidden rounded-3xl border border-border/60 dark:border-white/12 shadow-2xl flex flex-col md:flex-row",
          item?.imageUrl ? "max-w-3xl lg:max-w-4xl" : "max-w-lg"
        )}
      >
        {item && (
          <>
            {/* LEFT COLUMN: Food Focused Showcase (Big on the side) */}
            {item.imageUrl && (
              <div className="relative w-full md:w-[46%] lg:w-[48%] flex items-center justify-center p-6 md:p-8 bg-radial from-amber-500/12 via-black/10 to-transparent dark:from-amber-500/10 dark:via-white/[0.02] dark:to-black/30 border-b md:border-b-0 md:border-r border-border/40 dark:border-white/10 shrink-0">
                <div className="relative w-full h-48 sm:h-56 md:h-72 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-h-44 sm:max-h-52 md:max-h-68 w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-105 select-none"
                  />
                </div>
              </div>
            )}

            {/* RIGHT COLUMN: Minimal Details & Ordering Controls */}
            <div className="flex-1 flex flex-col min-w-0 max-h-[85vh] overflow-hidden">
              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-5 pb-4 space-y-4 scrollbar-none no-scrollbar">
                {/* Title & Price */}
                <div>
                  <div className="flex items-start justify-between gap-3 pr-8">
                    <DialogTitle className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                      {item.name}
                    </DialogTitle>
                    <span className="font-display text-xl sm:text-2xl font-bold text-primary shrink-0">
                      {formatBirr(item.price)}
                    </span>
                  </div>

                  {item.description && (
                    <DialogDescription className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </DialogDescription>
                  )}
                </div>

                {/* SECTION: Ingredients Dropdown (Clean, minimal) */}
                {ingredients.length > 0 && (
                  <div className="rounded-2xl border border-border/60 bg-secondary/25 dark:bg-white/[0.03] overflow-hidden transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => setIsIngredientsOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between p-3 sm:p-3.5 text-left cursor-pointer transition-colors hover:bg-secondary/40 select-none group"
                      aria-expanded={isIngredientsOpen}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid size-7 sm:size-8 place-items-center rounded-lg bg-accent/20 text-accent shrink-0 group-hover:scale-105 transition-transform">
                          <SlidersHorizontal className="size-3.5 sm:size-4" />
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-sans text-xs sm:text-sm font-semibold text-foreground">
                            Ingredients
                          </span>
                          {isCustomized ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent border border-accent/35">
                              Customized
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-normal">
                              ({ingredients.length})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <div
                          className={cn(
                            "grid size-6 sm:size-7 place-items-center rounded-lg bg-secondary/80 text-muted-foreground transition-transform duration-200",
                            isIngredientsOpen && "rotate-180 text-foreground bg-accent/20 text-accent"
                          )}
                        >
                          <ChevronDown className="size-3.5 sm:size-4" />
                        </div>
                      </div>
                    </button>

                    {isIngredientsOpen && (
                      <div className="border-t border-border/50 p-3 sm:p-3.5 space-y-2.5 bg-background/25 dark:bg-black/20 animate-in fade-in-0 duration-150">
                        {isCustomized && (
                          <div className="flex justify-end pb-0.5">
                            <button
                              type="button"
                              onClick={resetAllIngredients}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline cursor-pointer"
                            >
                              <RotateCcw className="size-3" />
                              <span>Reset</span>
                            </button>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          {ingredients.map((ing) => {
                            const currentAmount = amounts[ing.id] ?? "regular";

                            return (
                              <div
                                key={ing.id}
                                className="flex items-center justify-between gap-2.5 rounded-xl border border-border/40 dark:border-white/10 bg-card/70 dark:bg-white/[0.04] p-2 sm:px-3 transition-colors hover:border-accent/30"
                              >
                                <span
                                  className={cn(
                                    "text-xs sm:text-sm font-semibold tracking-tight text-foreground truncate min-w-0 flex-1",
                                    currentAmount === "none" && "line-through text-muted-foreground/60"
                                  )}
                                >
                                  {ing.name}
                                </span>

                                <Select
                                  value={currentAmount}
                                  onValueChange={(val) =>
                                    setIngredientAmount(ing.id, val as IngredientAmount)
                                  }
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "h-8 w-[120px] sm:w-[135px] text-xs font-medium rounded-lg border-border/60 bg-background/80 shrink-0",
                                      currentAmount === "none" && "border-destructive/40 text-destructive",
                                      currentAmount === "extra" && "border-accent/50 text-accent font-semibold",
                                      currentAmount === "light" && "border-amber-500/40 text-amber-600 dark:text-amber-400"
                                    )}
                                    aria-label={`Portion for ${ing.name}`}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[80] glass-modal border-border/60">
                                    <SelectItem value="none">
                                      <span className="text-destructive font-medium">0× None</span>
                                    </SelectItem>
                                    <SelectItem value="light">
                                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                                        ½× Light
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="regular">
                                      <span className="text-foreground">1× Regular</span>
                                    </SelectItem>
                                    <SelectItem value="extra">
                                      <span className="text-accent font-semibold">2× Extra</span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Special Instructions (simplified) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Special Instructions
                  </label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Allergies, preferences (optional)..."
                    maxLength={200}
                    rows={2}
                    className="rounded-xl border-border/70 dark:border-white/10 bg-card/60 dark:bg-black/30 text-xs sm:text-sm placeholder:text-muted-foreground/60 focus-visible:border-accent resize-none"
                  />
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="border-t border-border/50 dark:border-white/10 bg-background/50 dark:bg-black/30 backdrop-blur-xl px-5 sm:px-6 py-3.5 flex items-center gap-3 shrink-0">
                {item.available ? (
                  <>
                    <div className="flex items-center rounded-xl border border-border/80 dark:border-white/10 bg-secondary/50 dark:bg-black/30 p-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-lg cursor-pointer"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-8 text-center font-display text-sm font-semibold">
                        {qty}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-lg cursor-pointer"
                        onClick={() => setQty((q) => Math.min(50, q + 1))}
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>

                    <Button
                      className="flex-1 h-11 rounded-xl shadow-md text-sm font-semibold transition-all duration-200 cursor-pointer"
                      size="lg"
                      onClick={handleAddToCart}
                    >
                      <span>Add to Order · {formatBirr(item.price * qty)}</span>
                    </Button>
                  </>
                ) : (
                  <p className="w-full text-center py-2 text-sm font-medium text-destructive">
                    This dish is currently sold out.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
