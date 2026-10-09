import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Sparkles, Trash2, UtensilsCrossed } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatBirr } from "@/lib/format";

export function CartSheet() {
  const cart = useCart();

  return (
    <Sheet open={cart.open} onOpenChange={cart.setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <SheetTitle className="font-sans text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Your order
            </SheetTitle>
            {cart.count > 0 && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {cart.count} {cart.count === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </SheetHeader>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground/60">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Your order is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">Add dishes from our menu to get started.</p>
            </div>
            <Button variant="outline" className="mt-2 rounded-xl" asChild onClick={() => cart.setOpen(false)}>
              <Link to="/menu">Browse menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="-mx-6 flex-1 space-y-3 overflow-y-auto px-6 py-4">
              {cart.lines.map((l) => (
                <li
                  key={l.key}
                  className="rounded-2xl border border-border/50 bg-card/50 p-3.5 transition-all hover:bg-card/80 dark:bg-card/30 dark:hover:bg-card/60 sm:p-4"
                >
                  <div className="flex items-start gap-3">
                    {l.imageUrl ? (
                      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-secondary/50 p-1 dark:bg-muted/20">
                        <img
                          src={l.imageUrl}
                          alt={l.name}
                          className="size-full object-contain drop-shadow-xs"
                        />
                      </div>
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-secondary/50 text-muted-foreground/40 dark:bg-muted/20">
                        <UtensilsCrossed className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-sans text-sm font-semibold tracking-tight text-foreground line-clamp-1 sm:text-base">
                          {l.name}
                        </p>
                        <p className="font-sans text-sm font-semibold tracking-tight text-foreground shrink-0">
                          {formatBirr(l.price * l.quantity)}
                        </p>
                      </div>
                      {l.quantity > 1 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatBirr(l.price)} each
                        </p>
                      )}
                      {l.note && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                            <Sparkles className="size-3 shrink-0" />
                            <span className="truncate max-w-[220px]">{l.note}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <input
                      value={l.note ?? ""}
                      onChange={(e) => cart.setNote(l.key, e.target.value)}
                      placeholder="Add note or instruction..."
                      maxLength={200}
                      className="w-full rounded-lg border border-border/40 bg-secondary/40 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary/50 focus:bg-background focus:outline-none"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-1">
                    <div className="flex items-center rounded-lg border border-border/60 bg-secondary/40 p-0.5 dark:bg-card/60">
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-background hover:text-foreground cursor-pointer"
                        onClick={() => cart.setQty(l.key, l.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold text-foreground">
                        {l.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-background hover:text-foreground cursor-pointer"
                        onClick={() => cart.setQty(l.key, l.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      onClick={() => cart.remove(l.key)}
                      aria-label="Remove item"
                      title="Remove"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border/50 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-sans text-lg font-bold tracking-tight text-foreground">
                  {formatBirr(cart.subtotal)}
                </span>
              </div>
              <Button asChild size="lg" className="w-full h-12 rounded-xl text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all" onClick={() => cart.setOpen(false)}>
                <Link to="/checkout" className="flex items-center justify-between px-3">
                  <span>Checkout</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
