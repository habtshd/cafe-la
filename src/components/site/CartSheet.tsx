import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatBirr } from "@/lib/format";

export function CartSheet() {
  const cart = useCart();
  return (
    <Sheet open={cart.open} onOpenChange={cart.setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your order</SheetTitle>
        </SheetHeader>
        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center text-muted-foreground">
            <p>Your cart is empty.</p>
            <Button variant="outline" asChild onClick={() => cart.setOpen(false)}>
              <Link to="/menu">Browse the menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="-mx-6 flex-1 divide-y overflow-y-auto px-6">
              {cart.lines.map((l) => (
                <li key={l.key} className="py-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-medium">{l.name}</p>
                      <p className="text-sm text-muted-foreground">{formatBirr(l.price)}</p>
                    </div>
                    <p className="font-medium">{formatBirr(l.price * l.quantity)}</p>
                  </div>
                  <input
                    value={l.note ?? ""}
                    onChange={(e) => cart.setNote(l.key, e.target.value)}
                    placeholder="Add a note"
                    maxLength={200}
                    className="mt-2 w-full border-b border-dashed bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="icon" variant="outline" className="size-8" onClick={() => cart.setQty(l.key, l.quantity - 1)} aria-label="Decrease">
                      <Minus />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">{l.quantity}</span>
                    <Button size="icon" variant="outline" className="size-8" onClick={() => cart.setQty(l.key, l.quantity + 1)} aria-label="Increase">
                      <Plus />
                    </Button>
                    <Button size="icon" variant="ghost" className="ml-auto size-8 text-muted-foreground" onClick={() => cart.remove(l.key)} aria-label="Remove">
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4">
              <div className="mb-4 flex justify-between text-base">
                <span>Subtotal</span>
                <span className="font-semibold">{formatBirr(cart.subtotal)}</span>
              </div>
              <Button asChild size="lg" className="w-full" onClick={() => cart.setOpen(false)}>
                <Link to="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
