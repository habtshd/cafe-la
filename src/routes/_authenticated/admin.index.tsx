import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBirr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const today = start.toISOString();
      const [orders, res] = await Promise.all([
        supabase.from("orders").select("status,total").gte("created_at", today),
        supabase.from("reservations").select("id", { count: "exact", head: true }).eq("reservation_date", today.slice(0, 10)).neq("status", "cancelled"),
      ]);
      const o = orders.data ?? [];
      const valid = o.filter((x) => x.status !== "cancelled");
      return {
        count: o.length,
        sales: valid.reduce((s, x) => s + Number(x.total), 0),
        pending: o.filter((x) => x.status === "received").length,
        preparing: o.filter((x) => x.status === "preparing" || x.status === "confirmed").length,
        completed: o.filter((x) => x.status === "completed").length,
        reservations: res.count ?? 0,
      };
    },
  });

  const kpis = data
    ? [
        { k: "Today's orders", v: data.count },
        { k: "Today's sales", v: formatBirr(data.sales) },
        { k: "New (waiting)", v: data.pending },
        { k: "In progress", v: data.preparing },
        { k: "Completed", v: data.completed },
        { k: "Reservations today", v: data.reservations },
      ]
    : [];

  return (
    <div>
      <h1 className="text-3xl">Today</h1>
      {data && data.count === 0 && data.reservations === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">No data available yet.</p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-3">
        {kpis.map((x) => (
          <div key={x.k} className="bg-card p-5">
            <p className="text-xs text-muted-foreground">{x.k}</p>
            <p className="mt-1 font-display text-3xl">{x.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-4 text-sm">
        <Link to="/admin/orders" className="font-semibold text-primary hover:underline">Open orders →</Link>
        <Link to="/admin/menu" className="font-semibold text-primary hover:underline">Edit menu →</Link>
      </div>
    </div>
  );
}
