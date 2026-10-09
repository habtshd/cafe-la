import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, SlidersHorizontal, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

  const ingredients = useMemo(() => {
    return item ? getIngredientsForItem(item) : [];
  }, [item?.id, item?.description]);

  // Reset adjustments whenever the item changes
  useEffect(() => {
    setQty(1);
    setNote("");
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
      <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
        {item && (
          <>
            {/* Scrollable Container with Food Details & Ingredient Pickers */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-6 pb-4 space-y-6">
              {/* Food Image Banner */}
              {item.imageUrl && (
                <div className="relative flex h-48 sm:h-56 w-full items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-radial from-amber-500/10 via-secondary/40 to-secondary/20 p-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-h-40 sm:max-h-48 w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.2)] transition-transform duration-300"
                  />
                </div>
              )}

              {/* Title, Revealed Price & Description */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DialogTitle className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {item.name}
                    </DialogTitle>
                    {item.category_id && (
                      <span className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-wider text-accent">
                        {item.category_id}
                      </span>
                    )}
                  </div>
                  <span className="font-display text-xl sm:text-2xl font-bold text-primary shrink-0">
                    {formatBirr(item.price)}
                  </span>
                </div>

                {item.description && (
                  <DialogDescription className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </DialogDescription>
                )}
              </div>

              {/* SECTION: Choose Ingredients and Amounts */}
              {ingredients.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid size-7 place-items-center rounded-lg bg-accent/20 text-accent">
                        <SlidersHorizontal className="size-4" />
                      </div>
                      <div>
                        <h4 className="font-sans text-sm font-semibold text-foreground">
                          Choose Ingredients & Amount
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Adjust each ingredient portion to your taste
                        </p>
                      </div>
                    </div>

                    {isCustomized && (
                      <button
                        type="button"
                        onClick={resetAllIngredients}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <RotateCcw className="size-3" />
                        <span>Reset recipe</span>
                      </button>
                    )}
                  </div>

                  {/* List of Ingredients with Amount Selectors */}
                  <div className="space-y-3 pt-1">
                    {ingredients.map((ing) => {
                      const currentAmount = amounts[ing.id] ?? "regular";
                      const config = AMOUNT_CONFIG[currentAmount];

                      return (
                        <div
                          key={ing.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-border/40 bg-card/70 p-3 transition-colors hover:border-accent/30"
                        >
                          <div className="min-w-0 flex items-center justify-between sm:justify-start gap-2">
                            <span
                              className={cn(
                                "text-xs sm:text-sm font-medium tracking-tight text-foreground transition-all truncate",
                                currentAmount === "none" && "line-through text-muted-foreground opacity-60"
                              )}
                            >
                              {ing.name}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                                currentAmount === "none" && "bg-destructive/15 text-destructive",
                                currentAmount === "light" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                                currentAmount === "regular" && "bg-secondary text-muted-foreground",
                                currentAmount === "extra" && "bg-accent/25 text-accent-foreground dark:text-accent font-extrabold"
                              )}
                            >
                              {config.label}
                            </span>
                          </div>

                          {/* 4-Segment Amount Button Group */}
                          <div className="grid grid-cols-4 gap-1 rounded-lg bg-secondary/60 p-1 shrink-0">
                            {(["none", "light", "regular", "extra"] as IngredientAmount[]).map(
                              (amtKey) => {
                                const isSelected = currentAmount === amtKey;
                                const optConfig = AMOUNT_CONFIG[amtKey];

                                return (
                                  <button
                                    key={amtKey}
                                    type="button"
                                    onClick={() => setIngredientAmount(ing.id, amtKey)}
                                    className={cn(
                                      "px-2.5 py-1 text-[11px] rounded-md font-medium transition-all duration-150 cursor-pointer text-center",
                                      isSelected
                                        ? optConfig.activeClass
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                    )}
                                    aria-label={`Set ${ing.name} amount to ${optConfig.label}`}
                                  >
                                    {optConfig.multiplier} {optConfig.shortLabel}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Customization Summary Pill */}
                  {isCustomized && (
                    <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2 text-xs text-foreground">
                      <Sparkles className="size-3.5 text-accent shrink-0 animate-pulse" />
                      <span className="line-clamp-2">
                        <strong className="font-semibold text-accent">Your recipe: </strong>
                        {customizationText}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Special Instructions Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Special Kitchen Instructions (Optional)
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Allergies, cooking temperature, extra crispy, etc."
                  maxLength={200}
                  rows={2}
                  className="rounded-xl border-border/70 bg-card/60 text-xs sm:text-sm placeholder:text-muted-foreground/60 focus-visible:border-accent"
                />
              </div>
            </div>

            {/* Sticky Action Footer: Quantity and Add to Cart */}
            <div className="border-t border-border/60 bg-card/95 backdrop-blur-md px-5 sm:px-6 py-4 flex items-center gap-3">
              {item.available ? (
                <>
                  {/* Dish Quantity Stepper */}
                  <div className="flex items-center rounded-xl border border-border/80 bg-secondary/50 p-1">
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

                  {/* Add to Order Button with Dynamic Quantity Pricing */}
                  <Button
                    className="flex-1 h-11 rounded-xl shadow-md text-sm font-semibold transition-all duration-200"
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
