import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { getOrderByToken } from "@/lib/cafe.functions";
import { formatBirr, ORDER_TYPE_LABEL } from "@/lib/format";
import { OrderJourneyVisualizer, type OrderStageKey } from "@/components/site/OrderJourneyVisualizer";
import { ArrowLeft, Clock, MapPin, Phone, User, UtensilsCrossed } from "lucide-react";

const orderQuery = (token: string) =>
  queryOptions({
    queryKey: ["order", token],
    queryFn: () => getOrderByToken({ data: { token } }),
    refetchInterval: 10_000,
  });

export const Route = createFileRoute("/order/$token")({
  validateSearch: z.object({ new: z.boolean().optional() }),
  head: () => ({
    meta: [
      { title: "Your order — La Nouvelle Cafe" },
      { name: "description", content: "Track your La Nouvelle Cafe order in real time." },
      { property: "og:title", content: "Your order — La Nouvelle Cafe" },
      { property: "og:description", content: "Track the visual status of your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(orderQuery(params.token)),
  component: OrderPage,
});

function mapStatusToStage(status: string): OrderStageKey {
  switch (status) {
    case "received":
      return "taken";
    case "confirmed":
      return "chef";
    case "preparing":
      return "cooking";
    case "ready":
    case "out_for_delivery":
      return "ready";
    case "completed":
      return "delivered";
    default:
      return "taken";
  }
}

function OrderPage() {
  const { token } = Route.useParams();
  const { new: isNew } = Route.useSearch();
  const { data: o } = useSuspenseQuery(orderQuery(token));

  // Store in localStorage for quick access on /orders page
  useEffect(() => {
    if (!o?.order_number) return;
    try {
      const existing = JSON.parse(localStorage.getItem("ln-recent-orders") || "[]");
      const filtered = existing.filter((item: { token: string }) => item.token !== token);
      const updated = [
        {
          orderNumber: o.order_number,
          token,
          createdAt: o.created_at || new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, 8);
      localStorage.setItem("ln-recent-orders", JSON.stringify(updated));
    } catch {}
  }, [o?.order_number, token, o?.created_at]);

  if (!o) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="text-3xl font-display font-bold">Order not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The tracking token may be expired or incorrect.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/orders">All Orders</Link>
            </Button>
            <Button asChild>
              <Link to="/menu">Back to menu</Link>
            </Button>
          </div>
        </div>
      </SiteShell>
    );
  }

  const stage = mapStatusToStage(o.status);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-28 pt-24 space-y-10">
        {/* Top Navigation & Status Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Live Orders</span>
          </Link>

          {isNew && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Order Received Successfully!</span>
            </div>
          )}
        </div>

        {/* Cancelled Notice if status is cancelled */}
        {o.status === "cancelled" && (
          <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-5 text-destructive">
            <p className="font-bold text-base">This order was cancelled.</p>
            <p className="text-xs mt-1">Please contact La Nouvelle hospitality team if you have any questions.</p>
          </div>
        )}

        {/* Visualizer Hero */}
        <OrderJourneyVisualizer
          currentStage={stage}
          orderNumber={o.order_number}
          interactive={true}
        />

        {/* Order Details & Summary Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items & Pricing Breakdown */}
          <div className="lg:col-span-2 rounded-3xl border border-border/70 dark:border-white/10 bg-card/75 backdrop-blur-md p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <UtensilsCrossed className="size-5 text-accent" />
                <h2 className="font-display text-xl font-bold text-foreground">Ordered Items</h2>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {o.order_items.length} {o.order_items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="divide-y divide-border/50 text-sm">
              {o.order_items.map((it, i) => (
                <li key={i} className="flex justify-between items-start gap-4 py-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      <span className="text-accent font-bold mr-1.5">{it.quantity}×</span>
                      {it.item_name}
                    </p>
                    {it.note && (
                      <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-2.5 py-1 inline-block border border-border/40">
                        Note: {it.note}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-foreground shrink-0 font-mono">
                    {formatBirr(Number(it.unit_price) * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{formatBirr(o.subtotal)}</span>
              </div>
              {Number(o.delivery_fee) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-mono">{formatBirr(o.delivery_fee)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-base font-bold text-foreground border-t border-border/40">
                <span>Total Amount</span>
                <span className="font-mono text-accent text-lg">{formatBirr(o.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info Card */}
          <div className="rounded-3xl border border-border/70 dark:border-white/10 bg-card/75 backdrop-blur-md p-6 sm:p-8 shadow-lg space-y-6 h-fit">
            <h3 className="font-display text-lg font-bold text-foreground pb-2 border-b border-border/50">
              Order Information
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{o.customer_name}</p>
                  <p className="text-muted-foreground text-xs capitalize">
                    {(ORDER_TYPE_LABEL as Record<string, string>)[o.order_type] ?? o.order_type}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono text-foreground">{o.customer_phone}</p>
                  <p className="text-muted-foreground text-[11px]">Primary phone contact</p>
                </div>
              </div>

              {o.delivery_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Delivery Destination</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{o.delivery_address}</p>
                  </div>
                </div>
              )}

              {o.pickup_time && (
                <div className="flex items-start gap-3">
                  <Clock className="size-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Pickup Schedule</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{o.pickup_time}</p>
                  </div>
                </div>
              )}

              {o.table_number && (
                <div className="flex items-start gap-3">
                  <UtensilsCrossed className="size-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Dine-in Table</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Table #{o.table_number}</p>
                  </div>
                </div>
              )}

              {o.note && (
                <div className="pt-2 border-t border-border/40">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Chef & Waiter Note</p>
                  <p className="text-xs text-foreground mt-1 italic bg-secondary/40 rounded-xl p-2.5">
                    "{o.note}"
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-secondary/50 p-3.5 text-center text-[11px] text-muted-foreground">
              ⚡ This live tracking board polls automatically every 10 seconds.
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

