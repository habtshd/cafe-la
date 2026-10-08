import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatBirr, ORDER_TYPE_LABEL, STATUS_LABEL, type OrderStatus } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/orders")({ component: Orders });

const TABS: OrderStatus[] = ["received", "confirmed", "preparing", "ready", "out_for_delivery", "completed", "cancelled"];

function nextStatus(s: OrderStatus, type: string): OrderStatus | null {
  const flow: Record<string, OrderStatus | null> = {
    received: "confirmed",
    confirmed: "preparing",
    preparing: type === "delivery" ? "out_for_delivery" : "ready",
    ready: "completed",
    out_for_delivery: "completed",
  };
  return flow[s] ?? null;
}

function Orders() {
  const [tab, setTab] = useState<OrderStatus>("received");
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const since = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(item_name,quantity,note)")
        .or(`created_at.gte.${since},status.in.(received,confirmed,preparing,ready,out_for_delivery)`)
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("orders-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (p) => {
        if (p.eventType === "INSERT") toast.success("New order received");
        qc.invalidateQueries({ queryKey: ["admin-orders"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  async function update(id: string, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  const list = orders.filter((o) => o.status === tab);
  return (
    <div>
      <h1 className="text-3xl">Orders</h1>
      <div className="-mx-5 mt-5 flex gap-1 overflow-x-auto border-b px-5 md:mx-0 md:px-0">
        {TABS.map((t) => {
          const n = orders.filter((o) => o.status === t).length;
          return (
            <button key={t} onClick={() => setTab(t)} className={cn("shrink-0 border-b-2 px-3 py-2 text-sm", tab === t ? "border-primary font-semibold" : "border-transparent text-muted-foreground")}>
              {STATUS_LABEL[t]} {n > 0 && <span className="ml-1 rounded-full bg-secondary px-1.5 text-xs">{n}</span>}
            </button>
          );
        })}
      </div>
      {list.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">No orders here.</p>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {list.map((o) => {
            const next = nextStatus(o.status, o.order_type);
            return (
              <div key={o.id} className="rounded-md border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">#{o.order_number} · {ORDER_TYPE_LABEL[o.order_type]}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</p>
                  </div>
                  <p className="font-semibold">{formatBirr(o.total)}</p>
                </div>
                <ul className="mt-3 space-y-0.5 text-sm">
                  {o.order_items.map((i, k) => (
                    <li key={k}>{i.quantity}× {i.item_name}{i.note && <span className="text-muted-foreground"> — {i.note}</span>}</li>
                  ))}
                </ul>
                <div className="mt-3 space-y-0.5 border-t pt-3 text-xs text-muted-foreground">
                  <p className="text-foreground">{o.customer_name} · <a href={`tel:${o.customer_phone}`} className="underline">{o.customer_phone}</a></p>
                  {o.delivery_address && <p>Address: {o.delivery_address}</p>}
                  {o.table_number && <p>Table: {o.table_number}</p>}
                  {o.pickup_time && <p>Pickup: {o.pickup_time}</p>}
                  {o.note && <p>Note: {o.note}</p>}
                </div>
                {(next || (o.status !== "completed" && o.status !== "cancelled")) && (
                  <div className="mt-3 flex gap-2">
                    {next && <Button size="sm" onClick={() => update(o.id, next)}>Mark {STATUS_LABEL[next].toLowerCase()}</Button>}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => confirm("Cancel this order?") && update(o.id, "cancelled")}>Cancel</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
