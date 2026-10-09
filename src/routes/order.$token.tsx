import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { getOrderByToken } from "@/lib/cafe.functions";
import { formatBirr, ORDER_TYPE_LABEL, STATUS_LABEL, statusSteps } from "@/lib/format";
import { cn } from "@/lib/utils";

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
      { name: "description", content: "Track your La Nouvelle Cafe order." },
      { property: "og:title", content: "Your order — La Nouvelle Cafe" },
      { property: "og:description", content: "Track the status of your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(orderQuery(params.token)),
  component: OrderPage,
});

function OrderPage() {
  const { token } = Route.useParams();
  const { new: isNew } = Route.useSearch();
  const { data: o } = useSuspenseQuery(orderQuery(token));

  if (!o) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="text-3xl">Order not found</h1>
          <Button asChild className="mt-6"><Link to="/menu">Back to menu</Link></Button>
        </div>
      </SiteShell>
    );
  }
  const steps = statusSteps(o.order_type as "pickup" | "delivery" | "dine_in");
  const current = steps.indexOf(o.status as (typeof steps)[number]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-24">
        {isNew && <p className="eyebrow text-success">Order confirmed</p>}
        <h1 className="mt-2 text-4xl">Order #{o.order_number}</h1>
        <p className="mt-2 text-muted-foreground">
          {(ORDER_TYPE_LABEL as Record<string, string>)[o.order_type] ?? o.order_type} · {o.customer_name} · {o.customer_phone}
        </p>

        <div className="mt-10 rounded-md border bg-card p-6 shadow-soft">
          {o.status === "cancelled" ? (
            <p className="font-semibold text-destructive">This order was cancelled. Please contact the cafe if you have questions.</p>
          ) : (
            <ol className="space-y-4">
              {steps.map((st, i) => {
                const done = i < current || o.status === "completed";
                const active = i === current && o.status !== "completed";
                return (
                  <li key={st} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-full border-2 text-xs",
                        done && "border-success bg-success text-success-foreground",
                        active && "border-primary bg-primary text-primary-foreground",
                        !done && !active && "border-border text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="size-4" /> : i + 1}
                    </span>
                    <span className={cn("text-base", active ? "font-semibold" : !done && "text-muted-foreground")}>{STATUS_LABEL[st]}</span>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="mt-6 text-xs text-muted-foreground">This page updates automatically.</p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl">Items</h2>
          <ul className="mt-3 divide-y text-sm">
            {o.order_items.map((it, i) => (
              <li key={i} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{it.quantity}× {it.item_name}</p>
                  {it.note && <p className="text-xs text-accent mt-0.5">{it.note}</p>}
                </div>
                <span className="font-medium shrink-0">{formatBirr(Number(it.unit_price) * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t pt-3 text-sm">
            {Number(o.delivery_fee) > 0 && <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{formatBirr(o.delivery_fee)}</span></div>}
            <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{formatBirr(o.total)}</span></div>
          </div>
          {o.delivery_address && <p className="mt-4 text-sm"><span className="text-muted-foreground">Deliver to:</span> {o.delivery_address}</p>}
          {o.pickup_time && <p className="mt-1 text-sm"><span className="text-muted-foreground">Pickup at:</span> {o.pickup_time}</p>}
          {o.table_number && <p className="mt-1 text-sm"><span className="text-muted-foreground">Table:</span> {o.table_number}</p>}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">Save this page's link to check your order later.</p>
      </div>
    </SiteShell>
  );
}
