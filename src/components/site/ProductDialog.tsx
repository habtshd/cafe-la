import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { formatBirr } from "@/lib/format";
import type { PublicMenuItem } from "@/lib/cafe.functions";

export function ProductDialog({ item, onClose }: { item: PublicMenuItem | null; onClose: () => void }) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  useEffect(() => {
    setQty(1);
    setNote("");
  }, [item?.id]);

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-2xl p-0">
        {item && (
          <>
            {item.imageUrl && (
              <div className="relative flex max-h-72 w-full items-center justify-center overflow-hidden border-b border-border/40 bg-secondary/40 p-6 dark:bg-muted/15">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="max-h-56 w-auto object-contain drop-shadow-md transition-transform duration-300"
                />
              </div>
            )}
            <div className="space-y-4 p-6">
              <div>
                <DialogTitle className="font-sans text-xl font-bold tracking-tight text-foreground sm:text-2xl">{item.name}</DialogTitle>
                <p className="mt-1 font-sans text-lg font-semibold text-foreground">{formatBirr(item.price)}</p>
              </div>
              {item.description && <DialogDescription className="text-sm leading-relaxed text-muted-foreground">{item.description}</DialogDescription>}
              {!item.available ? (
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">Sold out for now.</p>
              ) : (
                <>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Special instructions (optional)" maxLength={200} rows={2} />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md border">
                      <Button size="icon" variant="ghost" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><Minus /></Button>
                      <span className="w-8 text-center font-semibold">{qty}</span>
                      <Button size="icon" variant="ghost" onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label="Increase"><Plus /></Button>
                    </div>
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={() => {
                        cart.add({ itemId: item.id, name: item.name, price: item.price, quantity: qty, note, imageUrl: item.imageUrl });
                        toast.success(`${item.name} added`);
                        onClose();
                      }}
                    >
                      Add · {formatBirr(item.price * qty)}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
