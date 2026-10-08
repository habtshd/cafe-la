import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { settingsQuery } from "@/lib/queries";
import { placeOrder } from "@/lib/cafe.functions";
import { formatBirr, ORDER_TYPE_LABEL, type OrderType } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — La Nouvelle Cafe" },
      { name: "description", content: "Complete your La Nouvelle Cafe order." },
      { property: "og:title", content: "Checkout — La Nouvelle Cafe" },
      { property: "og:description", content: "Complete your order for pickup, delivery or dine-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: Checkout,
});

function Checkout() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const cart = useCart();
  const navigate = useNavigate();
  const submit = useServerFn(placeOrder);
  const types = (["pickup", "delivery", "dine_in"] as OrderType[]).filter(
    (t) => ({ pickup: s.offers_pickup, delivery: s.offers_delivery, dine_in: s.offers_dine_in })[t],
  );
  const [type, setType] = useState<OrderType>(types[0] ?? "pickup");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", table: "", time: "", note: "" });
  const fee = type === "delivery" ? Number(s.delivery_fee) : 0;

  if (cart.lines.length === 0) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="text-3xl">Your cart is empty</h1>
          <Button asChild className="mt-6"><Link to="/menu">Browse the menu</Link></Button>
        </div>
      </SiteShell>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await submit({
        data: {
          customerName: f.name,
          customerPhone: f.phone,
          customerEmail: f.email,
          orderType: type,
          deliveryAddress: f.address,
          tableNumber: f.table,
          pickupTime: f.time,
          note: f.note,
          lines: cart.lines.map((l) => ({ itemId: l.itemId, quantity: l.quantity, note: l.note })),
        },
      });
      cart.clear();
      navigate({ to: "/order/$token", params: { token: res.token }, search: { new: true } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message.replace(/^\[.*?\]\s*/, "") : "Couldn't place order");
    } finally {
      setBusy(false);
    }
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <SiteShell>
      <form onSubmit={onSubmit} className="mx-auto grid max-w-5xl gap-10 px-5 pb-28 pt-12 md:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <h1 className="text-4xl">Checkout</h1>
          {!s.accepting_orders || types.length === 0 ? (
            <p className="rounded-md bg-muted p-4">Online ordering is paused right now. Please try again later.</p>
          ) : (
            <>
              <div>
                <Label className="mb-2 block">How would you like it?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {types.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setType(t)}
                      className={cn("rounded-md border py-3 text-sm font-medium", type === t ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary")}
                    >
                      {ORDER_TYPE_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name"><Input required minLength={2} maxLength={80} value={f.name} onChange={set("name")} autoComplete="name" /></Field>
                <Field label="Phone"><Input required type="tel" minLength={7} maxLength={20} value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="+251 9..." /></Field>
                <Field label="Email (optional)" className="sm:col-span-2"><Input type="email" value={f.email} onChange={set("email")} autoComplete="email" /></Field>
                {type === "delivery" && (
                  <Field label="Delivery address" className="sm:col-span-2"><Textarea required minLength={5} maxLength={300} value={f.address} onChange={set("address")} rows={2} /></Field>
                )}
                {type === "dine_in" && <Field label="Table number (optional)"><Input maxLength={20} value={f.table} onChange={set("table")} /></Field>}
                {type === "pickup" && <Field label="Pickup time (optional)"><Input type="time" value={f.time} onChange={set("time")} /></Field>}
                <Field label="Order note (optional)" className="sm:col-span-2"><Textarea maxLength={500} value={f.note} onChange={set("note")} rows={2} /></Field>
              </div>
              <p className="text-sm text-muted-foreground">Payment is made when you receive your order.</p>
            </>
          )}
        </div>

        <aside className="h-fit rounded-md border bg-card p-6 shadow-soft md:sticky md:top-24">
          <h2 className="text-xl">Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span>{l.quantity}× {l.name}</span>
                <span>{formatBirr(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t pt-4 text-sm">
            <Row k="Subtotal" v={formatBirr(cart.subtotal)} />
            {type === "delivery" && <Row k="Delivery" v={formatBirr(fee)} />}
            <div className="flex justify-between pt-2 text-base font-semibold"><span>Total</span><span>{formatBirr(cart.subtotal + fee)}</span></div>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy || !s.accepting_orders || types.length === 0}>
            {busy ? "Placing order…" : "Place order"}
          </Button>
        </aside>
      </form>
    </SiteShell>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return <div className={cn("space-y-1.5", className)}><Label>{label}</Label>{children}</div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{k}</span><span>{v}</span></div>;
}
