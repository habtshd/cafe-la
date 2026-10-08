import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAdminMetrics } from "@/lib/admin.functions";
import { formatBirr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    refetchInterval: 30_000,
    queryFn: () => getAdminMetrics(),
  });

  const kpis = data
    ? [
        { k: "Active orders", v: data.activeOrders },
        { k: "Today's sales", v: formatBirr(data.sales) },
        { k: "Reservations today", v: data.reservationsCount },
      ]
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Today</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((x) => (
          <div key={x.k} className="rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{x.k}</p>
            <p className="mt-2 font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{x.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-4 text-sm font-semibold">
        <Link to="/admin/orders" className="text-primary hover:underline">Manage orders →</Link>
        <Link to="/admin/menu" className="text-primary hover:underline">Manage menu →</Link>
        <Link to="/admin/reservations" className="text-primary hover:underline">Reservations →</Link>
      </div>
    </div>
  );
}
